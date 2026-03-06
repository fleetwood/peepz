<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import apiClient from '@utils/VueApiClient'
import { useCurrentUser } from '@composables/useCurrentUser'

const route = useRoute()
const router = useRouter()
const { fetchCurrentUser } = useCurrentUser()

onMounted(async () => {
  console.log('Auth callback page loaded')
  console.log('URL params:', route.query)
  console.log('URL hash:', route.hash)
  
  try {
    // Extract tokens from URL params first (for API callback flow)
    let accessToken = route.query.access_token as string
    let refreshToken = route.query.refresh_token as string
    
    // If no tokens in query params, check hash fragment (for direct OAuth redirect)
    if (!accessToken && route.hash) {
      console.log('No token in query params, checking hash fragment')
      const hashParams = new URLSearchParams(route.hash.substring(1))
      accessToken = hashParams.get('access_token') as string
      refreshToken = hashParams.get('refresh_token') as string
    }
    
    if (accessToken) {
      console.log('Found access token, storing and ensuring member exists')
      
      // Store tokens in localStorage FIRST so ApiClient can use them
      if (typeof window !== 'undefined') {
        localStorage.setItem('supabase_access_token', accessToken)
        if (refreshToken) {
          localStorage.setItem('supabase_refresh_token', refreshToken)
        }
      }
      
      // Ensure member exists in database (creates if new user)
      const response = await apiClient.post<any>('/auth/ensure-member', {})
      
      console.log('Full API response:', response)
      
      if (response.error) {
        console.error('Member creation failed:', response.error)
        router.push('/login?error=member_creation_failed')
        return
      }
      
      console.log('Member ensured, user:', response.data)
      
      // Fetch user to update composable
      await fetchCurrentUser()
      
      // Redirect to home page
      router.push('/')
    } else {
      console.error('No access token found in callback')
      router.push('/login?error=no_token')
    }
  } catch (error) {
    console.error('Error handling auth callback:', error)
    router.push('/login?error=callback_failed')
  }
})
</script>

<template>
  <div class="flex items-center justify-center min-h-screen">
    <div class="text-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p class="text-gray-600">Completing sign-in...</p>
    </div>
  </div>
</template>
