<template>
  <h1 class="text-4xl font-bold font-peeps text-primary">Peeps Vue</h1>

  <div class="flex flex-col gap-4">
    <BoxDialog />
    <LoginDialog />
    <button @click="handleClick">Click me</button>
  </div>
</template>

<script setup lang="ts">
import { Logger } from "@peeps/utils";

const logger = Logger.instance("pages/index");
const { theme, colorTheme, mode, setTheme, setMode } = useLayout();

function handleClick() {
  logger.debug("Button clicked!");
  alert("buytton the fuck clicked");
}
</script>
