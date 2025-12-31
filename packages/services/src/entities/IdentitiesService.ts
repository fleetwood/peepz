// because I am a kind and generous dark overlord.

import { randomBytes } from 'crypto'

import { and, eq, gt, isNull, sql } from 'drizzle-orm'

import * as schema from '@peeps/db/schema'
import { type Transaction, type WithTx, withTx } from '@peeps/db/client'
import type { EnsureAuthIdentity, ServiceResult } from '@peeps/types'

export class IdentitiesService {
  /**
   * Upserts auth identity rows for a member (provider + providerUserId unique key).
   * 
   * Database Operations (local scope only):
   * - INSERT: auth_identities
   * 
   * External Calls:
   * - {@link sql} (Drizzle excluded.* references)
   * 
   * @param params - { memberId, identities, tx }
   * 
   * DB SCOPE:
   * - calls : 1
   * - tables: 1 (auth_identities)
   * - scope : ✅ CLEAN
   */
  static async upsertAuthIdentities(params: { memberId: string; identities: EnsureAuthIdentity[]; tx?: Transaction }) {
    if (params.identities.length === 0) return

    await params.tx!.insert(schema.authIdentities)
      .values(params.identities.map((i) => ({
        memberId      : params.memberId,
        provider      : i.provider,
        providerUserId: i.providerUserId,
        email         : i.email ?? null,
        rawProfile    : (i.rawProfile ?? {}) as any,
        lastSeenAt    : new Date(),
      })))
      .onConflictDoUpdate({
        target: [schema.authIdentities.provider, schema.authIdentities.providerUserId],
        set   : {
          memberId   : params.memberId,
          email      : sql`excluded.email`,
          rawProfile : sql`excluded.raw_profile`,
          lastSeenAt : new Date(),
          updatedAt  : new Date(),
        },
      })
  }

  /**
   * Creates a short-lived link request that can be redeemed to attach an auth identity to an existing member.
   * 
   * Database Operations (local scope only):
   * - INSERT: auth_identity_link_requests
   * 
   * External Calls:
   * - {@link randomBytes} (generate token)
   * 
   * @param params - { memberId, provider, providerUserId, providerEmail, tx }
   * @returns Link token + expiry
   * 
   * DB SCOPE:
   * - calls : 1
   * - tables: 1 (auth_identity_link_requests)
   * - scope : ✅ CLEAN
   */
  @withTx
  static async startAuthIdentityLink(params: { memberId: string; provider: string; providerUserId: string; providerEmail: string; tx?: Transaction }): Promise<ServiceResult<{ token: string; expiresAt: Date }>> {
    const token = randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 1000 * 60 * 5)

    await params.tx!.insert(schema.authIdentityLinkRequests).values({
      memberId      : params.memberId,
      provider      : params.provider,
      providerUserId: params.providerUserId,
      providerEmail : params.providerEmail,
      token,
      expiresAt,
    })

    return { status: 201, result: { token, expiresAt } }
  }

  /**
   * Confirms (consumes) a link request token and upserts the corresponding auth identity onto the target member.
   * 
   * Database Operations (local scope only):
   * - SELECT: auth_identity_link_requests
   * - UPDATE: auth_identity_link_requests (mark consumed)
   * 
   * External Calls:
   * - {@link IdentitiesService.upsertAuthIdentities} (persist identity after consuming request)
   * - {@link isNull} (guard against double-consume)
   * - {@link gt} (guard against expiry)
   * 
   * @param params - { token, tx }
   * @returns Member id that now owns the identity
   * 
   * DB SCOPE:
   * - calls : 2 (local) + delegated
   * - tables: 1 (local: auth_identity_link_requests)
   * - scope : ✅ CLEAN
   */
  @withTx
  static async confirmAuthIdentityLink(params: WithTx<{ token: string }>): Promise<ServiceResult<{ memberId: string }>> {
    const [req] = await params.tx!
      .select()
      .from(schema.authIdentityLinkRequests)
      .where(eq(schema.authIdentityLinkRequests.token, params.token))
      .limit(1)

    if (!req) return { status: 404, error: 'Link request not found' }
    if (req.consumedAt) return { status: 410, error: 'Link request already used' }
    if (req.expiresAt.getTime() <= Date.now()) return { status: 410, error: 'Link request expired' }

    const consumed = await params.tx!
      .update(schema.authIdentityLinkRequests)
      .set({ consumedAt: new Date(), updatedAt: new Date() })
      .where(and(
        eq(schema.authIdentityLinkRequests.id, req.id),
        isNull(schema.authIdentityLinkRequests.consumedAt),
        gt(schema.authIdentityLinkRequests.expiresAt, new Date()),
      ))
      .returning({ id: schema.authIdentityLinkRequests.id })

    if (consumed.length === 0) return { status: 410, error: 'Link request already used or expired' }

    await IdentitiesService.upsertAuthIdentities({
      memberId   : req.memberId,
      identities : [{ provider: req.provider, providerUserId: req.providerUserId, email: req.providerEmail, rawProfile: {} }],
      tx         : params.tx,
    })

    return { status: 200, result: { memberId: req.memberId } }
  }
}