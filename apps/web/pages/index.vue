<template>
  <h1 class="text-4xl font-bold font-peeps text-primary">Peeps Vue</h1>

  <div class="flex flex-col gap-4">
    <Debug 
      v-if="user" 
      label="User Object" 
      :data="user" 
      :logger="logger"
    />
  </div>
</template>

<script setup lang="ts">
import { Logger } from '@peeps/utils';

const logger = Logger.instance("pages/index");
const { user} = useCurrentUser()

</script>
