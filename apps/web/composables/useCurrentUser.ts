import { ref, computed } from 'vue'
import apiClient from '@utils/VueApiClient'
import { type UserDto, type AuthResponse, type UserStatus, UserStatusEnum } from '@peeps/types'

const logger = {
  debug: (message: string, data?: any) => console.log(`[useCurrentUser] ${message}`, data),
  error: (message: string, data?: any) => console.error(`[useCurrentUser] ${message}`, data),
}

const { LOADING, AUTHENTICATED, UNAUTHENTICATED } = UserStatusEnum

const user        = ref<UserDto | null>(null)
const userStatus  = ref<UserStatus>(LOADING)
const loading     = ref(true)
let   fetchingUser = false

async function fetchCurrentUser(): Promise<UserDto | null> {
  if (fetchingUser) return null
  
  fetchingUser = true
  userStatus.value = LOADING
  try {
    logger.debug('Fetching current user from API')
    
    const response = await apiClient.get<UserDto>('/me')
    
    if (response.error) {
      if (response.status !== 401) {
        logger.error('API error', { error: response.error, status: response.status })
      } else {
        logger.debug('User not authenticated (401) - this is expected for unauthenticated users')
      }
      user.value = null
      userStatus.value = UNAUTHENTICATED
      loading.value = false
      return null
    }
    
    logger.debug('Current user fetched successfully', response)
    
    if (response.data) {
      user.value = response.data
      userStatus.value = AUTHENTICATED
    } else {
      user.value = null
      userStatus.value = UNAUTHENTICATED
    }
    
    loading.value = false
    return response.data || null
  } catch (err) {
    logger.error('Failed to fetch current user', err)
    user.value = null
    userStatus.value = UNAUTHENTICATED
    loading.value = false
    return null
  } finally {
    fetchingUser = false
  }
}

export function useCurrentUser() {
  logger.debug('useCurrentUser called', { user: user.value })
  
  // Fetch user on client-side
  if (import.meta.client && !user.value && loading.value) {
    fetchCurrentUser().then(currentUser => {
      logger.debug('Setting user value', { currentUser })
      user.value = currentUser
      loading.value = false
      logger.debug('User value set', { user: user.value })
    }).catch(err => {
      logger.error('Failed to initialize user', err)
      loading.value = false
    })
  }

  const auth = {
    async signOut() {
      try {
        const { public: pub } = useRuntimeConfig()
        await $fetch('/api/auth/signout', {
          baseURL: pub.apiUrl as string,
          method: 'POST',
          credentials: 'include'
        })
        user.value = null
      } catch (err) {
        logger.error('Failed to sign out', err)
      }
    },
    async signIn({ provider, params }: { provider: 'google' | 'email', params?: Record<string, any> }) {
      try {
        const body = { provider, params }
        
        logger.debug('Making sign-in request', { body })
        
        const response = await apiClient.post<AuthResponse, typeof body>('/auth/signin', body)
        
        if (response.error) {
          throw new Error(response.error)
        }
        
        logger.debug('Sign-in response', { response: response.data })
        
        // If response contains a URL, redirect to it for OAuth flow
        if (response.data?.url) {
          logger.debug('Redirecting to OAuth URL', { url: response.data.url })
          window.location.href = response.data.url
          return response.data
        }
        
        if (response.data?.user) {
          user.value = response.data.user
        }
        
        return response.data
      } catch (err) {
        logger.error(`Failed to sign in with ${provider}`, err)
        throw err
      }
    },
  }

  const hasPendingJoinRequests = computed(() => {
  if (!user.value) return false
  return user.value.familyJoinRequests && user.value.familyJoinRequests.length > 0
})

return {
    user                : computed(() => user.value),
    userStatus          : computed(() => userStatus.value),
    userLoading         : computed(() => loading.value),
    needsOnboarding     : computed(() => user.value?.needsOnboarding ?? false),
    hasPendingJoinRequests: hasPendingJoinRequests,
    fetchCurrentUser,
    auth,
  }
}
