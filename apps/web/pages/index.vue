<template>
  <h1 class="text-4xl font-bold font-peeps text-primary">Peeps Vue</h1>

  <div class="flex flex-col gap-4">
    <LoginDialog />
    <Debug 
      v-if="user" 
      label="User Object" 
      :data="user" 
      :logger="logger"
    />
  </div>
</template>

<script setup lang="ts">
import { useLayout } from '@/composables/useLayout'
import { useCurrentUser } from '@/composables/useCurrentUser'
import { Logger } from '@peeps/utils'

const logger = Logger.instance("pages/index");
const { theme, colorTheme, mode, setTheme, setMode } = useLayout();
const { user} = useCurrentUser()

</script>
