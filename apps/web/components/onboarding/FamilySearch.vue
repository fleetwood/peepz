<script setup lang="ts">
import { Search, Plus } from "lucide-vue-next"
import { Logger } from "@peeps/utils"
import { useRouter } from "vue-router"
import { useFamilySearch } from "@composables/useFamilySearch"

const logger = Logger.instance('FamilySearch', false)
const router = useRouter()

const {
  query,
  data,
  isLoading,
  isFetching,
  error,
  createFamily,
  requestToJoinFamily,
  cleanup
} = useFamilySearch()

const selectingGroupId = ref<string | null>(null)

const handleSelectFamily = async (family: any) => {
  logger.debug('handleSelectFamily called', { family })
  
  if (!family?.groups?.id) {
    logger.error('Family data is missing groups.id', { family })
    return
  }
  
  selectingGroupId.value = family.groups.id
  try {
    await requestToJoinFamily(family.groups.id)
    logger.debug('Successfully requested to join family', { familyId: family.groups.id })
    // TODO: Show success message or navigate
  } catch (err) {
    logger.error('Failed to join family', err)
    // TODO: Show error message
  } finally {
    selectingGroupId.value = null
  }
}

const handleCreate = async () => {
  const name = query.value.trim()
  if (!name) return
  
  try {
    await createFamily(name)
    logger.debug('Successfully created family', { name })
    // TODO: Show success message or navigate to family
  } catch (err) {
    logger.error('Failed to create family', err)
    // TODO: Show error message
  }
}

onUnmounted(() => {
  cleanup()
})
</script>

<template>
  <div class="space-y-4">
    <!-- Search Input -->
    <div class="relative">
      <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
      <Input
        placeholder="Search for a family..."
        v-model="query"
        class="pl-10"
      />
      <div 
        v-if="isLoading || isFetching" 
        class="absolute right-3 top-1/2 transform -translate-y-1/2"
      >
        <div class="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    </div>

    <!-- Family Search Results -->
    <div 
      v-for="family in (data || [])" 
      :key="family?.groups?.id || Math.random()"
      class="border rounded-lg p-4 hover:bg-accent cursor-pointer transition-colors"
      @click="handleSelectFamily(family)"
    >
      <div class="flex items-start justify-between">
        <div class="space-y-2">
          <h3 class="font-medium">{{ family?.groups?.name || 'Unknown Family' }}</h3>
          <p 
            v-if="family?.groups?.description" 
            class="text-sm text-muted-foreground line-clamp-2"
          >
            {{ family.groups.description }}
          </p>
          <div class="flex items-center gap-2">
            <span class="text-xs px-2 py-1 bg-secondary text-secondary-foreground rounded">
              {{ family?.groups?.privacyLevel || 'Unknown' }}
            </span>
            <span class="text-xs px-2 py-1 border rounded">
              {{ family?.groups?.governanceModel || 'Unknown' }}
            </span>
          </div>
        </div>
        <Button variant="ghost" size="sm" :disabled="selectingGroupId === family?.groups?.id">
          {{ selectingGroupId === family?.groups?.id ? "Selecting..." : "Select" }}
        </Button>
      </div>
    </div>

    <!-- Create Family Option -->
    <div v-if="query.trim().length > 0" class="border rounded-lg p-4 hover:bg-accent cursor-pointer transition-colors">
      <div class="flex items-start justify-between">
        <div class="flex items-center gap-3">
          <Plus class="h-10 w-10 text-primary" />
          <div>
            <h5 class="font-medium">Create a new family</h5>
            <p class="text-sm text-muted-foreground">
              Start a new family group and invite members
            </p>
          </div>
        </div>
        <Button variant="ghost" size="sm" @click="handleCreate">
          <Plus class="h-4 w-4 mr-2" />
          Create {{ query.trim() }}
        </Button>
      </div>
    </div>
  </div>
</template>
