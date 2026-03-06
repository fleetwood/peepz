import { ref, computed, watch } from 'vue'
import { Logger } from '@peeps/utils'
import { familyClient } from '@utils/clients/family'
import type { FamilySearchResult } from '@peeps/types'

// TODO: Move FamilySearchParams to packages/types if not already there
interface FamilySearchParams {
  query: string
  pagination: {
    limit: number
    offset?: number
  }
}

const logger = Logger.instance('useFamilySearch', false)

export function useFamilySearch() {
  const query = ref('')
  const debouncedQuery = ref('')
  const data = ref<FamilySearchResult[]>([])
  const isLoading = ref(false)
  const isFetching = ref(false)
  const error = ref<string | null>(null)

  // Debounce query to prevent API calls on every keystroke
  let debounceTimer: NodeJS.Timeout | null = null

  watch(query, (newValue) => {
    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }
    debounceTimer = setTimeout(() => {
      debouncedQuery.value = newValue
    }, 300) // 300ms debounce
  })

  // Watch debounced query and trigger search
  watch(debouncedQuery, async (newValue) => {
    if (!newValue.trim()) {
      data.value = []
      return
    }

    await searchFamilies(newValue)
  })

  const searchFamilies = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      data.value = []
      return
    }

    isFetching.value = true
    error.value = null

    try {
      logger.debug('Searching families', { query: searchQuery })
      
      const results = await familyClient.searchFamilies({
        query: searchQuery,
        pagination: { limit: 10 }
      })

      data.value = results
      logger.debug('Family search results', { count: results.length })
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      logger.error('Failed to search families', err)
      error.value = message
      data.value = []
    } finally {
      isFetching.value = false
    }
  }

  const createFamily = async (name: string) => {
    if (!name.trim()) {
      throw new Error('Family name is required')
    }

    isLoading.value = true
    error.value = null

    try {
      logger.debug('Creating family', { name })
      
      const result = await familyClient.createFamily(name.trim())
      
      // Refresh search results after creating
      await searchFamilies(query.value)
      
      return result
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      logger.error('Failed to create family', err)
      error.value = message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const requestToJoinFamily = async (familyId: string) => {
    isLoading.value = true
    error.value = null

    try {
      logger.debug('Requesting to join family', { familyId })
      
      const result = await familyClient.requestToJoinFamily(familyId)
      
      return result
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      logger.error('Failed to request family join', err)
      error.value = message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Cleanup debounce timer on unmount
  const cleanup = () => {
    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }
  }

  return {
    // Reactive state
    query,
    debouncedQuery,
    data: computed(() => data.value),
    isLoading: computed(() => isLoading.value),
    isFetching: computed(() => isFetching.value),
    error: computed(() => error.value),
    
    // Methods
    searchFamilies,
    createFamily,
    requestToJoinFamily,
    cleanup
  }
}
