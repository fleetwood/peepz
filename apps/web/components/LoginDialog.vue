<script setup lang="ts">
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useCurrentUser } from '@/composables/useCurrentUser'
import { Logger } from '@peeps/utils'
import { ref } from 'vue'
import { GoogleIcon, EmailIcon, LogoutIcon } from '@/components/ui/icons'

const props = defineProps<{
  buttonText?: string
  buttonClass?: string
}>()

const logger = Logger.instance('LoginDialog')
const { auth, user } = useCurrentUser()

const email = ref('')
const showEmailLogin = ref(false)
const status = ref<string | null>(null)

async function signInWithEmail() {
  status.value = null
  try {
    const result = await auth.signIn({ provider: 'email', params: { email: email.value } })
    status.value = typeof result === 'string' ? result : 'Check your email!'
  } catch (err) {
    status.value = err instanceof Error ? err.message : String(err)
  }
}

async function signInWithGoogle() {
  status.value = null
  logger.debug('Google sign-in clicked')
  try {
    await auth.signIn({ provider: 'google' })
    logger.info('Google sign-in succeeded')
  } catch (err) {
    logger.error('Google sign-in error', err)
    status.value = err instanceof Error ? err.message : String(err)
  }
}
</script>

<template>
  <Dialog>
    <DialogTrigger>
      <Button class="buttonClass" type="button">
        {{ user? buttonText || 'Log out' : 'Log in' }}
      </Button>
    </DialogTrigger>

    <DialogContent class="sm:max-w-sm">
      <DialogHeader>
        <DialogTitle>
          <div class="text-primary">
            {{ user ? "Log out" : "Sign In"}}
          </div>
        </DialogTitle>
        <DialogDescription class="text-secondary">
          {{ user ? "See you next time!" : "Choose your login provider" }}
        </DialogDescription>
      </DialogHeader>

      <div v-if="!user" class="grid gap-4">
        <div class="flex justify-center gap-4">
          <Button
            variant="ghost"
            class="!h-12 !w-12 !rounded-full text-primary hover:text-primary-foreground"
            @click="signInWithGoogle"
          >
          <GoogleIcon class="size-6" />
          </Button>

          <Button
            variant="ghost"
            class="!h-12 !w-12 !rounded-full text-primary hover:text-primary-foreground"
            @click="showEmailLogin = !showEmailLogin"
          >
            <EmailIcon class="size-6" />
          </Button>
        </div>

        <div v-if="showEmailLogin" class="space-y-2">
          <label class="text-sm font-medium">Email</label>
          <div class="flex gap-2">
            <Input v-model="email" type="email" placeholder="you@example.com" class="flex-1" />
            <Button @click="signInWithEmail">Send link</Button>
          </div>
        </div>

        <div v-if="status" class="rounded-md bg-muted p-3 text-sm text-muted-foreground">
          {{ status }}
        </div>
      </div>

      <div v-else class="grid gap-4">
        <div class="flex justify-center gap-4">
          <Button
            variant="ghost"
            class="!h-12 !w-12 !rounded-full text-primary hover:text-primary-foreground"
            @click="auth.signOut()"
          >
            <LogoutIcon class="size-6" />
          </Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>
