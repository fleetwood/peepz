// 'server only'

// import { db, members, preferences } from '@/db'
// import { checkAnyBlockBetween } from '@/db/entities/blocks/relations'
// import { notifs } from '@/db/entities/notifs/schema'
// import {
//   Notif,
//   NotifApiOptions,
//   NotifCreateProps,
//   NotifMetadata,
//   NotifSourceType
// } from '@/db/entities/notifs/types'
// import { NotifUtils } from '@/lib/pusher/notif.utils'
// import { pusherService } from '@/lib/pusher/pusher.service'
// import { Logger } from '@/lib/util.logger'
// import { mapToNotifPayload } from '@/lib/util.stripe'
// import { extractMentions } from '@/lib/util.tiptap'
// import { getFullName } from '@/lib/utils.member'
// import dayjs from 'dayjs'
// import { KnockService } from '@/services/KnockService'
// import { CurrentUserService } from '@/services/CurrentUserService'
// import { MemberService } from '@/services/Member/MemberService'
// import { CommentNotifProps, ContentCallbackProps, MentionNotifProps, NotifType, PostNotifProps, StripeNotifProps } from '@/types/notif'
// import { CommentNotifications, MentionNotifications, StripeNotifications } from '@/types/notifs/Notifs'
// import { QueryDomainEnum, QuerySubdomainEnum } from '@/types/queryManager'
// import { and, asc, desc, eq, gte, inArray, lt } from 'drizzle-orm'
// import { DigestMemberNotifs } from './Crons/Cron.DigestService'
// import { MemberStatusEnum } from '@/db/entities/members/enums'
// import { Member } from '@/db/entities/members/types'

// type UpsertNotifProps = {
//   userId: string
//   validatedData: NotifCreateProps & { targetUserId: string }
// }

// const logger = Logger.instance('NotifService', false)
// export class NotifService {
//   /**
//    * Creates a notification for a target user.
//    *
//    * Responsibilities:
//    * - Enforces block rules between actor and recipient.
//    * - Applies recipient notification preferences (email/push) unless the notif is flagged `admin`.
//    * - Groups (upserts) notifications by `(userId, type, sourceId)` for unread notifs.
//    * - Triggers downstream delivery pipelines (Knock + Pusher) after persistence.
//    *
//    * Database Operations:
//    * - None
//    *
//    * External Calls:
//    * - {@link checkAnyBlockBetween} (block rules)
//    * - {@link CurrentUserService.preferences} (preference check)
//    * - {@link NotifService.groupOrCreateNotif} (persistence; delegated)
//    * - {@link KnockService.triggerNotif} (delivery; delegated)
//    * - {@link pusherService.triggerNotif} (delivery; delegated)
//    *
//    * @param props.userId - Actor id (sender).
//    * @param props.validatedData - Notification payload including `targetUserId`.
//    * @param props.contentCallback - Optional callback to compute `title` / `message` and grouping metadata.
//    * @returns The created/updated notif row or `null` when blocked or fully filtered by preferences.
//    *
//    * FLAG: method >50 lines
//    *
//    * DB SCOPE:
//    * - calls: 0 (delegates DB work)
//    * - tables: 0
//    * - scope: ✅ clean
//    */
//   static async create(props: UpsertNotifProps & ContentCallbackProps): Promise<Notif | null> {
//     const { userId: actorId, validatedData } = props
//     logger.debug('create', { actorId, type: validatedData.type, sourceType: validatedData.sourceType })

//     const { targetUserId, ...notifData } = validatedData
//     // if (!actorId || !targetUserId || actorId === targetUserId) return null

//     if (actorId && targetUserId !== actorId) {
//       const blocked = await checkAnyBlockBetween(actorId, targetUserId)
//       if (blocked) {
//         return null
//       }
//     }

//     if (!validatedData.deliveryMethods.includes('admin')) {
//       const prefs = await CurrentUserService.preferences(targetUserId)
//       const emailAllowed = prefs?.emailNotifications ?? true
//       const pushAllowed = prefs?.pushNotifications  ?? true

//       validatedData.deliveryMethods = validatedData.deliveryMethods.filter(m =>
//         m === 'email'
//           ? emailAllowed
//           : m === 'push'
//             ? pushAllowed
//             : true
//       )

//       if (validatedData.deliveryMethods.length === 0) {
//         return null
//       }
//     }

//     const notif = await this.groupOrCreateNotif(props)
//     await KnockService.triggerNotif({ notif, actorId, targetUserId })

//     // 2. Trigger Pusher events for real-time updates
//     await pusherService.triggerNotif({
//       logger,
//       notif,
//       targetUserId,
//       NotifUtils,
//       QueryDomain: QueryDomainEnum
//     })

//     logger.debug('create Complete', { notifId: notif.id })

//     return notif as Notif
//   }

//   /**
//    * Normalizes notification content and grouping metadata.
//    *
//    * - Ensures `metadata.group` exists and contains the actor.
//    * - If `contentCallback` is present, uses it to compute `title` and `message`.
//    * - Ensures `validatedData.metadata.group` matches the computed `metadata.group`.
//    *
//    * Database Operations:
//    * - None
//    *
//    * External Calls:
//    * - None
//    *
//    * @param props - Create/upsert props.
//    * @param metadata - Existing metadata (from current notif) or synthesized metadata.
//    * @returns The mutated `validatedData` object.
//    *
//    * DB SCOPE:
//    * - calls: 0
//    * - tables: 0
//    * - scope: ✅ clean
//    */
//   private static async processNotifContent(
//     props: UpsertNotifProps & ContentCallbackProps,
//     metadata: NotifMetadata
//   ) {
//     const { userId: actorId, validatedData } = props
//     const { targetUserId } = validatedData

//     // Ensure metadata.group exists
//     if (!metadata.group) {
//       metadata.group = []
//     }

//     if (!metadata.group.includes(actorId)) {
//       metadata.group.push(actorId)
//     }

//     // Generate content if callback provided
//     if (props.contentCallback) {
//       const { title, message } = await props.contentCallback({
//         sourceType : validatedData.type as NotifSourceType,
//         sourceId   : validatedData.sourceId,
//         actorId    : actorId,
//         recipientId: targetUserId,
//         group      : metadata.group
//       })

//       // Update the title and message
//       validatedData.title = title
//       validatedData.message = message
//     }

//     // Update only the group in metadata
//     if (!validatedData.metadata) {
//       validatedData.metadata = { group: metadata.group } as NotifMetadata
//     } else {
//       validatedData.metadata.group = metadata.group
//     }

//     // Return the updated validatedData
//     return validatedData
//   }

//   /**
//    * Performs notif grouping/upsert:
//    * - If an unread notif already exists for `(targetUserId, type, sourceId)`, updates it.
//    * - Otherwise inserts a new notif.
//    *
//    * Database Operations:
//    * - SELECT: {@link notifs} (find existing unread notif to group into)
//    *
//    * External Calls:
//    * - {@link NotifService.updateNotif} (delegated persistence)
//    * - {@link NotifService.createNotif} (delegated persistence)
//    *
//    * @param props - Create/upsert props.
//    * @returns The created/updated notif row.
//    *
//    * DB SCOPE:
//    * - calls: 1
//    * - tables: 1 (notifs)
//    * - scope: ✅ clean
//    */
//   private static async groupOrCreateNotif(props: UpsertNotifProps & ContentCallbackProps) {
//     logger.debug('groupOrCreateNotif', { props })
//     const { userId: actorId, validatedData } = props
//     const { targetUserId } = validatedData

//     // Check for existing unread notification for grouping
//     const [current] = (await db
//       .select()
//       .from(notifs)
//       .where(
//         and(
//           eq(notifs.userId, targetUserId),
//           eq(notifs.type, validatedData.type),
//           eq(notifs.sourceId, validatedData.sourceId),
//           eq(notifs.read, false)
//         )
//       )
//       .limit(1)) as Notif[]

//     if (current) {
//       return this.updateNotif(current, props)
//     } else {
//       return this.createNotif(props)
//     }
//   }
  
//   /**
//    * Updates an existing notif row in-place.
//    *
//    * Database Operations:
//    * - UPDATE: {@link notifs} (apply updated metadata/title/message)
//    *
//    * External Calls:
//    * - {@link NotifService.processNotifContent} (content normalization)
//    *
//    * @param current - Existing notif row.
//    * @param props - Create/upsert props.
//    * @returns Updated notif row.
//    *
//    * DB SCOPE:
//    * - calls: 1
//    * - tables: 1 (notifs)
//    * - scope: ✅ clean
//    */
//   private static async updateNotif(current: Notif, props: UpsertNotifProps & ContentCallbackProps) {
//     logger.debug('updateNotif', { current, props })
    
//     const metadata: NotifMetadata = current.metadata
//       ? (current.metadata as NotifMetadata)
//       : { group: [], invalidationOptions: [] }

//     const updatedData = await this.processNotifContent(props, metadata)
//     logger.debug('updateNotif updatedData', updatedData)

//     const [updated] = await db
//       .update(notifs)
//       .set(updatedData)
//       .where(eq(notifs.id, current.id))
//       .returning()

//     logger.info('updateNotif RESULT', updated)
//     return updated
//   }

//   /**
//    * Inserts a new notif row.
//    *
//    * Database Operations:
//    * - INSERT: {@link notifs} (persist notif)
//    *
//    * External Calls:
//    * - {@link NotifService.processNotifContent} (content normalization)
//    *
//    * @param props - Create/upsert props.
//    * @returns Created notif row.
//    *
//    * DB SCOPE:
//    * - calls: 1
//    * - tables: 1 (notifs)
//    * - scope: ✅ clean
//    */
//   private static async createNotif(props: UpsertNotifProps & ContentCallbackProps) {
//     logger.info('[2] NOTIF createNotif', { props })
//     const { userId: actorId, validatedData } = props
//     const { targetUserId } = validatedData

//     // Initialize empty metadata if not present
//     const metadata: NotifMetadata = validatedData.metadata || {
//       group: [actorId],
//       invalidationOptions: [{ domain: QueryDomainEnum.NOTIFS }]
//     }

//     // Process content based on callback
//     const updatedData = await this.processNotifContent(props, metadata)
//     logger.debug('createNotif updatedData', updatedData)

//     const [notif] = await db
//       .insert(notifs)
//       .values({ ...updatedData, userId: targetUserId, actorId })
//       .returning()
//     logger.info('createNotif RESULT', notif)
//     return notif
//   }

//   /**
//    * Fetches a user's notifications with optional filters/pagination.
//    *
//    * Database Operations:
//    * - SELECT: {@link notifs} (by userId, optional unread/type filters)
//    *
//    * External Calls:
//    * - None
//    *
//    * @param userId - Target user id.
//    * @param options - Optional {@link NotifApiOptions} subset.
//    * @returns A list of notif rows.
//    *
//    * DB SCOPE:
//    * - calls: 1
//    * - tables: 1 (notifs)
//    * - scope: ✅ clean
//    */
//   static async userNotifs(userId: string, options?: Partial<NotifApiOptions>) {
//     let whereConditions = [eq(notifs.userId, userId)]

//     if (options?.unreadOnly) {
//       whereConditions.push(eq(notifs.read, false))
//     }

//     // Add type filter if specified
//     if (options?.type) {
//       const types = Array.isArray(options.type) ? options.type : [options.type]
//       if (types.length > 0) {
//         whereConditions.push(inArray(notifs.type, types))
//       }
//     }

//     const where = and(...whereConditions)

//     return db
//       .select()
//       .from(notifs)
//       .where(where)
//       .orderBy(desc(notifs.createdAt)) // Order by createdAt in descending order (newest first)
//       .limit(options?.limit ?? 10)
//       .offset(options?.offset ?? 0)
//   }

//   /**
//    * Handles Stripe events by creating a billing notification and pushing real-time updates.
//    *
//    * Database Operations:
//    * - None
//    *
//    * External Calls:
//    * - {@link mapToNotifPayload} (stripe -> notif payload mapping)
//    * - {@link StripeNotifications.billing} (notif factory)
//    * - {@link NotifService.createNotif} (persistence; delegated)
//    * - {@link pusherService.triggerNotif} (delivery; delegated)
//    *
//    * @param props - {@link StripeNotifProps}
//    * @returns void
//    * @throws Error if notification processing fails.
//    *
//    * FLAG: method >50 lines
//    *
//    * DB SCOPE:
//    * - calls: 0 (delegates DB work)
//    * - tables: 0
//    * - scope: ✅ clean
//    */
//   static async processStripe(props: StripeNotifProps): Promise<void> {
//     logger.debug('processStripe', props);
//     const { member } = props;
    
//     try {
//       const type: NotifType = 'billing';
//       const notificationPayload = mapToNotifPayload(props);

//       if (!notificationPayload) {
//         logger.warn('No notification content generated by util for Stripe event', {
//           subscriptionId : props.subscription?.id,
//           invoiceId      : props.invoice?.id,
//           chargeId       : props.charge?.id,
//           customerId     : props.customer?.id,
//           paymentIntentId: props.paymentIntent?.id,
//           eventType      : props.eventType,
//         });
//         return;
//       }

//       const { title, message, sourceId, link } = notificationPayload;

//       logger.debug('processStripe: creating notification', { title, message, sourceId, link, eventType: props.eventType });

//       const event =
//         props.subscription  ? 'subscription_update'
//           : props.invoice       ? 'payment_update'
//             : props.charge        ? 'charge_update'
//               : props.customer      ? 'customer_update'
//                 : props.paymentIntent ? 'payment_intent_update'
//                   : 'unknown_stripe_event'

//       const status =
//         props.subscription?.status
//         || props.invoice?.status
//         || props.charge?.status
//         || (props.customer ? (props.customer.livemode ? 'live' : 'test') : undefined)
//         || props.paymentIntent?.status

//       const groupId =
//         props.subscription?.id
//         || props.invoice?.id
//         || props.charge?.id
//         || props.customer?.id
//         || props.paymentIntent?.id
//         || 'stripe_event'

//       const notif = await NotifService.createNotif(
//         StripeNotifications.billing({
//           memberId : member.id,
//           title,
//           message,
//           sourceId,
//           link,
//           event,
//           status,
//           warning : notificationPayload?.warning,
//           error   : notificationPayload?.error,
//           groupId,
//         }) as UpsertNotifProps
//       );
      
//       await pusherService.triggerNotif({
//         logger,
//         notif,
//         targetUserId: member.id,
//         NotifUtils,
//         QueryDomain: QueryDomainEnum
//       })

//       logger.debug('processStripe complete');
//     } catch (error) {
//       logger.error('processStripe error', { 
//         error: error instanceof Error ? error.message : String(error),
//         props
//       });
//       // Re-throw to allow the caller to handle the error if needed
//       throw error;
//     }
//   }

//   /**
//    * Parses content for mentions and sends mention notifications to each mentioned user.
//    *
//    * Database Operations:
//    * - None
//    *
//    * External Calls:
//    * - {@link extractMentions} (mention parsing)
//    * - {@link MemberService.findById} (mentioner lookup; delegated)
//    * - {@link MentionNotifications.create} (notif factory)
//    * - {@link NotifService.create} (persistence/delivery; delegated)
//    *
//    * @param props - {@link MentionNotifProps}
//    * @returns void
//    *
//    * FLAG: method >50 lines
//    *
//    * DB SCOPE:
//    * - calls: 0 (delegates DB work)
//    * - tables: 0
//    * - scope: ✅ clean
//    */
//   static async processMentions(props: MentionNotifProps): Promise<void> {
//     const { userId, sourceId, sourceType, content, link, contextMessage } = props
    
//     // Extract mentions from the content
//     const mentions = extractMentions(content, sourceId)
//     logger.debug('processMentions', { sourceType, link, sourceId })
    
//     if (!mentions.length) return
    
//     // Get the user who created the mention
//     const mentioner = await MemberService.findById(userId)
    
//     // Send notifications to mentioned users
//     for (const mentionedUserId of mentions) {
//       // Skip if the mentioned user is the creator
//       if (mentionedUserId === userId) continue
      
//       const notifProps = MentionNotifications.create({
//         userId,
//         mentionedUserId,
//         sourceId,
//         sourceType,
//         link,
//         message: `${getFullName(mentioner)} mentioned you ${contextMessage || ''}`.trim()
//       }) as UpsertNotifProps & ContentCallbackProps

//       await NotifService.create(notifProps)
//     }
//   }

//   /**
//    * Sends a notification to the post author when someone comments.
//    *
//    * Database Operations:
//    * - None
//    *
//    * External Calls:
//    * - {@link MemberService.findById} (commenter lookup; delegated)
//    * - {@link CommentNotifications.create} (notif factory)
//    * - {@link NotifService.create} (persistence/delivery; delegated)
//    *
//    * @param params.userId - Commenter id.
//    * @param params.targetUserId - Post author id.
//    * @param params.postId - Post id.
//    * @param params.commentId - Comment id.
//    * @returns void
//    *
//    * DB SCOPE:
//    * - calls: 0 (delegates DB work)
//    * - tables: 0
//    * - scope: ✅ clean
//    */
//   static async sendCommentNotification({
//     userId,
//     targetUserId,
//     postId,
//     commentId
//   }: {
//     userId: string       // ID of the commenter
//     targetUserId?: string // ID of the post author
//     postId: string       // ID of the post
//     commentId: string    // ID of the comment
//   }): Promise<void> {
//     // Skip if the commenter is the post author
//     if (!targetUserId || userId === targetUserId) return
    
//     const commenter = await MemberService.findById(userId)
//     logger.debug('sendCommentNotification', { userId, targetUserId })

//     const notifProps = CommentNotifications.create({
//       userId,
//       targetUserId,
//       postId,
//       commentId,
//       message: `${getFullName(commenter)} commented on your post`
//     }) as UpsertNotifProps & ContentCallbackProps

//     await NotifService.create(notifProps)
//   }

//   /**
//    * Processes a new post by sending mention notifications for any @mentions in the post content.
//    *
//    * Database Operations:
//    * - None
//    *
//    * External Calls:
//    * - {@link NotifService.processMentions} (delegated)
//    *
//    * @param props - {@link PostNotifProps}
//    * @returns void
//    *
//    * DB SCOPE:
//    * - calls: 0
//    * - tables: 0
//    * - scope: ✅ clean
//    */
//   static async processPost(props: PostNotifProps): Promise<void> {
//     const { userId, postId, content } = props
//     logger.debug('processPost', { userId, postId })
    
//     // Process mentions in the post
//     await NotifService.processMentions({
//       userId,
//       content,
//       sourceId      : postId,
//       sourceType    : 'post',
//       link          : `?postLink=${postId}`,
//       contextMessage: 'in a post'
//     })
//   }

//   /**
//    * Processes a new comment by:
//    * - sending mention notifications for comment content, then
//    * - sending a comment notification to the post author.
//    *
//    * Database Operations:
//    * - None
//    *
//    * External Calls:
//    * - {@link NotifService.processMentions} (delegated)
//    * - {@link NotifService.sendCommentNotification} (delegated)
//    *
//    * @param props - {@link CommentNotifProps}
//    * @returns void
//    *
//    * DB SCOPE:
//    * - calls: 0
//    * - tables: 0
//    * - scope: ✅ clean
//    */
//   static async processComment(props: CommentNotifProps): Promise<void> {
//     const { userId, postId, commentId, content, authorId } = props
//     logger.debug('processComment', { userId, postId, commentId })
    
//     // First, process any mentions in the comment
//     await NotifService.processMentions({
//       userId,
//       content,
//       sourceId      : postId,
//       sourceType    : 'comment',
//       contextMessage: 'in a comment'
//     })
    
//     await NotifService.sendCommentNotification({
//       userId,
//       targetUserId: authorId,
//       postId,
//       commentId
//     })
//   }

//   /**
//    * Marks notifications as read for a user.
//    *
//    * Supports:
//    * - Mark all unread notifs as read.
//    * - Mark a specific set of notif ids as read.
//    *
//    * Database Operations:
//    * - *?UPDATE: {@link notifs} (mark all unread as read)*
//    * - *?UPDATE: {@link notifs} (mark selected ids as read; inside transaction)*
//    *
//    * External Calls:
//    * - None
//    *
//    * @param params.userId - User id.
//    * @param params.validatedData - Id list(s) or `{ all: true }`.
//    * @returns Updated notif rows.
//    *
//    * DB SCOPE:
//    * - calls: 1 (or 1 in transaction)
//    * - tables: 1 (notifs)
//    * - scope: ✅ clean
//    */
//   static async markAsRead({
//     userId,
//     validatedData
//   }: {
//     userId: string
//     validatedData: { ids?: string[]; all?: boolean } | Array<{ ids?: string[]; all?: boolean }>
//   }) {
//     logger.debug('markAsRead', { userId, validatedData })
//     const items = Array.isArray(validatedData) ? validatedData : [validatedData]
//     // If any item requests all, mark all as read for the user
//     if (items.some(item => item.all)) {
//       return db
//         .update(notifs)
//         .set({ read: true, readAt: new Date() })
//         .where(and(eq(notifs.userId, userId), eq(notifs.read, false)))
//         .returning()
//     }
//     // Merge all ids from all objects
//     const allIds = items.flatMap(item => item.ids || [])
//     if (!allIds.length) return []
//     const result = await db.transaction(async trx => {
//       const result = await trx
//         .update(notifs)
//         .set({ read: true, readAt: new Date() })
//         .where(and(eq(notifs.userId, userId), inArray(notifs.id, allIds)))
//         .returning()
//       return result
//     })
//     return result
//   }

//   /**
//    * Builds a per-member notification digest for a specific calendar day.
//    *
//    * Notes:
//    * - Defaults to **yesterday** (calendar day) when `date` is not provided.
//    * - Excludes members who have opted out of email digests (`preferences.emailNotifications = true`).
//    * - When `memberId` is provided, returns an array of length 0 or 1.
//    *
//    * Database Operations:
//    * - SELECT: {@link members} (digest recipients)
//    * - SELECT: {@link preferences} (email notification opt-in filter)
//    * - *?SELECT: {@link notifs} (left joined; day-window notifications)*
//    *
//    * External Calls:
//    * - {@link dayjs} (date math)
//    *
//    * @param params.date - Any date within the target day to digest; defaults to yesterday.
//    * @param params.memberId - Optional member filter.
//    * @returns Digest rows grouped by member id.
//    *
//    * DB SCOPE:
//    * - calls: 1
//    * - tables: 3 (members, preferences, notifs)
//    * - scope: ✅ clean
//    */
//   static async getMemberDigest({ date, memberId }: { date?: Date, memberId?: string } = {}): Promise<DigestMemberNotifs[]> {
//     const startBase = date
//       ? dayjs(date)
//       : dayjs(new Date()).subtract(1, 'day')

//     const start = startBase.startOf('day').toDate()
//     const end   = startBase.startOf('day').add(1, 'day').toDate()

//     const rows = await db
//       .select({ member: members, notif: notifs })
//       .from(members)
//       .innerJoin(preferences, eq(preferences.id, members.id))
//       .leftJoin(notifs, and(
//         eq(notifs.userId, members.id),
//         gte(notifs.createdAt, start),
//         lt(notifs.createdAt, end),
//       ))
//       .where(eq(preferences.emailNotifications, true))
//       .orderBy(asc(members.id), asc(notifs.createdAt))

//     const byUserId = new Map<string, DigestMemberNotifs>()
//     for (const row of rows) {
//       const member = row.member as Member
//       const current = byUserId.get(member.id) ?? { member, notifs: [] as Notif[] }
//       if (row.notif) {
//         current.notifs.push(row.notif as Notif)
//       }
//       byUserId.set(member.id, current)
//     }
//     const result = [...byUserId.values()]
//     logger.debug('getMemberDigest', date, memberId, start, end, rows, result)

//     return result
//   }
// }
