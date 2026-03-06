<template>
  <h1 class="text-4xl font-bold font-peeps text-primary">Peeps Vue</h1>

  <div class="flex flex-col gap-4">
    <BoxDialog />
    <LoginDialog />
    <button @click="handleClick">Click me</button>
    <div v-if="user" class="p-4 bg-muted rounded-lg">
      <h3 class="font-semibold mb-2">Raw User Object:</h3>
      <pre class="text-xs overflow-auto">{{ JSON.stringify(user, null, 2) }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Logger } from "@peeps/utils";

const logger = Logger.instance("pages/index");
const { theme, colorTheme, mode, setTheme, setMode } = useLayout();
const { user} = useCurrentUser()

function handleClick() {
  logger.debug("Button clicked!");
  alert("buytton the fuck clicked");
}
</script>
