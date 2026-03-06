import { QueryDomainEnum, QuerySubdomainEnum } from '@peeps/types'
import type { ListNotificationsQuery } from '@peeps/types'
import type {
  NotificationListParams,
  NotificationUnreadCountParams,
  NotificationPreferencesParams,
} from '@peeps/types'
import { QueryManager } from '../QueryManager'

export class NotificationKeys {
  static list({ unreadOnly, limit, cursor }: ListNotificationsQuery) {
    return {
      domain   : QueryDomainEnum.NOTIFS,
      subdomain: QuerySubdomainEnum.LIST,
      params   : { unreadOnly, limit, cursor } satisfies ListNotificationsQuery,
    }
  }

  static unreadCount({ memberId }: NotificationUnreadCountParams) {
    return {
      domain   : QueryDomainEnum.NOTIFS,
      subdomain: QuerySubdomainEnum.DETAIL,
      params   : { memberId, key: 'unread-count' } satisfies NotificationUnreadCountParams & { key: string },
    }
  }

  static preferences({ memberId }: NotificationPreferencesParams) {
    return {
      domain   : QueryDomainEnum.NOTIFS,
      subdomain: QuerySubdomainEnum.DETAIL,
      params   : { memberId, key: 'preferences' } satisfies NotificationPreferencesParams & { key: string },
    }
  }
}

export class NotificationInvalidation {
  static invalidateAll() {
    return QueryManager.invalidate({
      domain   : QueryDomainEnum.NOTIFS,
      subdomain: QuerySubdomainEnum.LIST,
    })
  }

  static invalidateList(params: NotificationListParams) {
    return QueryManager.invalidate(NotificationKeys.list(params.filters))
  }

  static invalidateUnreadCount({ memberId }: NotificationUnreadCountParams) {
    return QueryManager.invalidate(NotificationKeys.unreadCount({ memberId }))
  }

  static invalidatePreferences({ memberId }: NotificationPreferencesParams) {
    return QueryManager.invalidate(NotificationKeys.preferences({ memberId }))
  }

  static refetchAll() {
    return QueryManager.refetch({
      domain   : QueryDomainEnum.NOTIFS,
      subdomain: QuerySubdomainEnum.LIST,
    })
  }

  static refetchList(params: NotificationListParams) {
    return QueryManager.refetch(NotificationKeys.list(params.filters))
  }

  static refetchUnreadCount({ memberId }: NotificationUnreadCountParams) {
    return QueryManager.refetch(NotificationKeys.unreadCount({ memberId }))
  }

  static refetchPreferences({ memberId }: NotificationPreferencesParams) {
    return QueryManager.refetch(NotificationKeys.preferences({ memberId }))
  }
}
