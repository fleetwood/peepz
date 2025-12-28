import { useMutation } from '@tanstack/react-query'

import { QueryManager } from '../QueryManager'
import { PersonInvalidation, PersonKeys } from './person.invalidation'

type PersonClientDeps<TPerson> = {
  list  : () => Promise<TPerson[]>
  byId  ?: (params: { id: string }) => Promise<TPerson | null>
  create?: (params: { input: unknown }) => Promise<TPerson>
}

type PersonClientHttpConfig = {
  baseUrl         : string
  getAccessToken? : () => Promise<string | null>
  fetchFn?        : typeof fetch
}

export const PersonClient = {
  create<TPerson>(deps: PersonClientDeps<TPerson>) {
    const base = {
      keys        : PersonKeys,
      invalidation: PersonInvalidation,

      useList() {
        return QueryManager.domainQuery({
          ...PersonKeys.list(),
          queryFn  : async () => {
            return deps.list()
          },
        })
      },

      useById(params: { id: string }) {
        if (!deps.byId) {
          throw new Error('PersonClient.useById requires deps.byId')
        }

        return QueryManager.domainQuery({
          ...PersonKeys.detail({ id: params.id }),
          enabled  : Boolean(params.id),
          queryFn  : async () => {
            return deps.byId!({ id: params.id })
          },
        })
      },

      useDetail(params: { id: string }) {
        return base.useById({ id: params.id })
      },

      invalidateList() {
        return PersonInvalidation.invalidateList()
      },

      invalidateDetail(params: { id: string }) {
        return PersonInvalidation.invalidateDetail({ id: params.id })
      },

      useCreate() {
        if (!deps.create) {
          throw new Error('PersonClient.useCreate requires deps.create')
        }

        return useMutation({
          mutationFn: (params: { input: unknown }) => deps.create!(params),
          onSuccess : async () => {
            await PersonInvalidation.invalidateList()
          },
        })
      },
    } as const

    return base
  },

  createHttp<TPerson>(config: PersonClientHttpConfig) {
    const fetchFn = config.fetchFn ?? fetch

    return PersonClient.create<TPerson>({
      async list() {
        const accessToken = await config.getAccessToken?.()
        const res = await fetchFn(`${config.baseUrl}/api/persons`, {
          method : 'GET',
          headers: {
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          },
        })

        if (!res.ok) {
          throw new Error(`PersonClient.createHttp.list failed: ${res.status} ${res.statusText}`)
        }

        return (await res.json()) as TPerson[]
      },

      async byId(params: { id: string }) {
        const accessToken = await config.getAccessToken?.()
        const res = await fetchFn(`${config.baseUrl}/api/persons/${params.id}`, {
          method : 'GET',
          headers: {
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          },
        })

        if (res.status === 404) {
          return null
        }

        if (!res.ok) {
          throw new Error(`PersonClient.createHttp.byId failed: ${res.status} ${res.statusText}`)
        }

        return (await res.json()) as TPerson
      },

      async create(params: { input: unknown }) {
        const accessToken = await config.getAccessToken?.()
        const res = await fetchFn(`${config.baseUrl}/api/persons`, {
          method : 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          },
          body: JSON.stringify(params.input),
        })

        if (!res.ok) {
          throw new Error(`PersonClient.createHttp.create failed: ${res.status} ${res.statusText}`)
        }

        return (await res.json()) as TPerson
      },
    })
  },
} as const
