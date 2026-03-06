import { useMutation, useQuery } from '@tanstack/react-query'

import { clientEnv } from '@peeps/config/env'
import type {
  ClientHttpConfig,
  CreateJoinRequestInput,
  UpdateRelationshipsInput,
  ApproveRequestInput,
  JoinRequest,
  FamilyGovernance,
  OnboardingStep,
} from '@peeps/types'
import { WebRestApi } from '../fetch/WebRestApi'

import { QueryManager } from '../QueryManager'
import { createSupabaseClient } from '../supabase/client'

type CreateJoinRequestResponse = {
  joinRequest: {
    id       : string
    status   : string
    expiresAt: string
  }
}

type GetJoinRequestResponse = {
  joinRequest: JoinRequest
}

type ApproveJoinRequestResponse = {
  joinRequest: {
    id           : string
    status       : string
    confirmations: Array<{ memberId: string; type: string; createdAt: string }>
  }
}

type UpdateRelationshipsResponse = {
  joinRequest: {
    id                  : string
    claimedRelationships: Array<{ targetMemberId: string; type: string }>
  }
}

type ListPendingJoinRequestsResponse = {
  joinRequests: Array<{
    id                  : string
    memberId            : string
    status              : string
    confirmations       : Array<unknown>
    claimedRelationships: Array<unknown>
    expiresAt           : string
    createdAt           : string
  }>
}

type SetGovernanceResponse = {
  governance: {
    model  : string
    config?: Record<string, unknown>
  }
}

type ResolveFamilyResponse = {
  family: {
    groupId       : string
    familyId?     : string
    joinRequestId?: string
    created       : boolean
  }
  onboarding: {
    needsProfile  : boolean
    needsFamily   : boolean
    needsApproval?: boolean
  }
}

type OnboardingClientDeps = {
  createJoinRequest      : (input: CreateJoinRequestInput) => Promise<CreateJoinRequestResponse>
  getJoinRequest         : (requestId: string) => Promise<GetJoinRequestResponse>
  approveJoinRequest     : (requestId: string, input: ApproveRequestInput) => Promise<ApproveJoinRequestResponse>
  updateRelationships    : (requestId: string, input: UpdateRelationshipsInput) => Promise<UpdateRelationshipsResponse>
  listPendingJoinRequests: (groupId: string) => Promise<ListPendingJoinRequestsResponse>
  setGovernance          : (groupId: string, governance: FamilyGovernance) => Promise<SetGovernanceResponse>
  resolveFamily          : () => Promise<ResolveFamilyResponse>
}

type OnboardingClientWebConfig = {
  baseUrl?: string
}

const OnboardingKeys = {
  all            : ['onboarding'] as const,
  joinRequest    : (requestId: string) => [...OnboardingKeys.all, 'joinRequest', requestId] as const,
  pendingRequests: (groupId: string) => [...OnboardingKeys.all, 'pendingRequests', groupId] as const,
  family         : () => [...OnboardingKeys.all, 'family'] as const,
}

const OnboardingInvalidation = {
  joinRequest: (qm: QueryManager, requestId: string) => {
    qm.invalidate({ queryKey: OnboardingKeys.joinRequest(requestId) })
  },
  pendingRequests: (qm: QueryManager, groupId: string) => {
    qm.invalidate({ queryKey: OnboardingKeys.pendingRequests(groupId) })
  },
  family: (qm: QueryManager) => {
    qm.invalidate({ queryKey: OnboardingKeys.family() })
  },
}

export class OnboardingClient {
  private deps: OnboardingClientDeps
  private qm  : QueryManager

  constructor(deps: OnboardingClientDeps, queryManager: QueryManager) {
    this.deps = deps
    this.qm   = queryManager
  }

  useCreateJoinRequest() {
    return useMutation({
      mutationFn: (input: CreateJoinRequestInput) => this.deps.createJoinRequest(input),
      onSuccess : () => {
        OnboardingInvalidation.family(this.qm)
      },
    })
  }

  useGetJoinRequest(requestId: string) {
    return useQuery({
      queryKey: OnboardingKeys.joinRequest(requestId),
      queryFn : () => this.deps.getJoinRequest(requestId),
      enabled : !!requestId,
    })
  }

  useApproveJoinRequest(requestId: string) {
    return useMutation({
      mutationFn: (input: ApproveRequestInput) => this.deps.approveJoinRequest(requestId, input),
      onSuccess : () => {
        OnboardingInvalidation.joinRequest(this.qm, requestId)
      },
    })
  }

  useUpdateRelationships(requestId: string) {
    return useMutation({
      mutationFn: (input: UpdateRelationshipsInput) => this.deps.updateRelationships(requestId, input),
      onSuccess : () => {
        OnboardingInvalidation.joinRequest(this.qm, requestId)
      },
    })
  }

  useListPendingJoinRequests(groupId: string) {
    return useQuery({
      queryKey: OnboardingKeys.pendingRequests(groupId),
      queryFn : () => this.deps.listPendingJoinRequests(groupId),
      enabled : !!groupId,
    })
  }

  useSetGovernance(groupId: string) {
    return useMutation({
      mutationFn: (governance: FamilyGovernance) => this.deps.setGovernance(groupId, governance),
      onSuccess : () => {
        OnboardingInvalidation.family(this.qm)
      },
    })
  }

  useResolveFamily() {
    return useMutation({
      mutationFn: () => this.deps.resolveFamily(),
      onSuccess : () => {
        OnboardingInvalidation.family(this.qm)
      },
    })
  }

    // HTTP transport factory
  createHttp(config: ClientHttpConfig): OnboardingClientDeps {
    return {
      createJoinRequest: async (input) => {
        return WebRestApi.post<CreateJoinRequestResponse>('/join-requests', input)
      },
      getJoinRequest: async (requestId) => {
        return WebRestApi.get<GetJoinRequestResponse>(`/join-requests/${requestId}`)
      },
      approveJoinRequest: async (requestId, input) => {
        return WebRestApi.post<ApproveJoinRequestResponse>(`/join-requests/${requestId}`, input)
      },
      updateRelationships: async (requestId, input) => {
        return WebRestApi.post<UpdateRelationshipsResponse>(`/join-requests/${requestId}/relationships`, input)
      },
      listPendingJoinRequests: async (groupId) => {
        return WebRestApi.get<ListPendingJoinRequestsResponse>(`/families/${groupId}/join-requests`)
      },
      setGovernance: async (groupId, governance) => {
        return WebRestApi.post<SetGovernanceResponse>(`/families/${groupId}/governance`, governance)
      },
      resolveFamily: async () => {
        return WebRestApi.post<ResolveFamilyResponse>('/onboarding/family/resolve')
      },
    }
  }

    // Web/React factory
  static forWeb(config: OnboardingClientWebConfig = {}) {
    const deps = OnboardingClient.createHttp({
      baseUrl: config.baseUrl ?? clientEnv.APP_URL,
    })

    return new OnboardingClient(deps, new QueryManager())
  }
}
