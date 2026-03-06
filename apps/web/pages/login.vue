<script setup lang="ts">
import { ref } from 'vue'
import { Logger } from '@peeps/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Mail } from 'lucide-vue-next'
import { useCurrentUser } from '@/composables/useCurrentUser'

const logger = Logger.instance('Login', false)
const { auth } = useCurrentUser()

const email         = ref('')
const showEmailLogin = ref(false)
const status        = ref<string | null>(null)

async function signInWithEmail() {
  status.value = null
  try {
    await auth.emailSignIn({ email: email.value })
    status.value = 'Check your email!'
  } catch (err) {
    status.value = err instanceof Error ? err.message : String(err)
  }
}

async function signInWithGoogle() {
  status.value = null
  try {
    await auth.googleSignIn()
  } catch (err) {
    logger.error('Google sign-in error', err)
    status.value = err instanceof Error ? err.message : String(err)
  }
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center">
    <div class="w-full max-w-sm space-y-6 p-6">
      <div class="text-center">
        <h1 class="text-2xl font-bold">Sign in to Peeps</h1>
        <p class="text-muted-foreground">Choose a method to continue</p>
      </div>

      <div class="flex justify-center gap-4">
        <Button
          variant="outline"
          class="h-12 w-12 rounded-full"
          @click="signInWithGoogle"
        >
          <svg class="size-6" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.73 1.22 9.23 3.62l6.9-6.9C36.1 2.55 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.99 6.2C12.44 13.15 17.74 9.5 24 9.5z" />
            <path fill="#4285F4" d="M46.1 24.55c0-1.65-.15-3.23-.43-4.76H24v9.02h12.4c-.54 2.91-2.2 5.38-4.68 7.03l7.2 5.59c4.2-3.88 6.58-9.59 6.58-16.88z" />
            <path fill="#FBBC05" d="M10.55 28.07c-.5-1.48-.79-3.06-.79-4.67 0-1.62.29-3.2.79-4.68l-7.99-6.2A23.95 23.95 0 0 0 0 23.4c0 3.87.93 7.53 2.56 10.88l7.99-6.21z" />
            <path fill="#34A853" d="M24 48c6.47 0 11.9-2.13 15.87-5.77l-7.2-5.59c-2.01 1.35-4.6 2.15-8.67 2.15-6.26 0-11.56-3.65-13.45-8.92l-7.99 6.21C6.51 42.62 14.62 48 24 48z" />
          </svg>
        </Button>

        <Button
          variant="outline"
          class="h-12 w-12 rounded-full"
          @click="showEmailLogin = !showEmailLogin"
        >
          <Mail class="size-6" />
        </Button>
      </div>

      <div v-if="showEmailLogin" class="space-y-4">
        <div class="space-y-2">
          <label class="text-sm font-medium">Email</label>
          <div class="flex gap-2">
            <Input v-model="email" type="email" placeholder="you@example.com" class="flex-1" />
            <Button @click="signInWithEmail">Send link</Button>
          </div>
        </div>
      </div>

      <div v-if="status" class="rounded-md bg-muted p-3 text-sm text-muted-foreground">
        {{ status }}
      </div>
    </div>
  </div>
</template>
