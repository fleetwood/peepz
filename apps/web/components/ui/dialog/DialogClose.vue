<script setup lang="ts">
import type { DialogCloseProps } from "reka-ui"
import { DialogClose as RekaDialogClose } from "reka-ui"

const props = defineProps<DialogCloseProps>()
</script>

<template>
  <RekaDialogClose v-bind="props">
    <slot />
  </RekaDialogClose>
</template>
