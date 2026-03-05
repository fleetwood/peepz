import { WEB_API_PREFIX } from '@peeps/config/constants/queryManager'
import { clientEnv } from '@peeps/config/env'
import { FetchBase } from '@peeps/utils/fetch/FetchBase'

import { SupabaseInstance } from '../supabase/client'

const { API_KEY, APP_URL } = clientEnv

export const WebRestApi = new FetchBase({
  apiKey   : API_KEY,
  apiPrefix: WEB_API_PREFIX,
  baseUrl  : APP_URL,
  getAccessToken: async () => {
    const { data } = await SupabaseInstance.get().auth.getSession()
    return data.session?.access_token ?? null
  },
})
