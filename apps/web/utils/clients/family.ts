import { Logger } from '@peeps/utils'
import apiClient from '@utils/VueApiClient'
import type { FamilySearchResult } from '@peeps/types'

const logger = Logger.instance('FamilyClient', false)

// Use the existing domain type
type FamilySearchParams = {
  query: string
}

export class FamilyClient {
  private static instance: FamilyClient

  static getInstance(): FamilyClient {
    if (!FamilyClient.instance) {
      FamilyClient.instance = new FamilyClient()
    }
    return FamilyClient.instance
  }

  async searchFamilies(params: FamilySearchParams & { pagination: { limit: number; offset?: number } }): Promise<FamilySearchResult[]> {
    try {
      logger.debug('Searching families', params)
      
      const queryParams = new URLSearchParams({
        query: params.query,
        limit: params.pagination.limit.toString(),
        ...(params.pagination.offset && { offset: params.pagination.offset.toString() })
      })
      
      const response = await apiClient.get(`/families/search?${queryParams}`)

      if (response.error) {
        throw new Error(response.error)
      }

      // FamilyService returns PaginatedResponse<{ families: schema.Family; groups: schema.Group }>
      // Extract items array from paginated response
      const paginatedResponse = response.data
      return paginatedResponse?.items || []
    } catch (err) {
      logger.error('Failed to search families', err)
      throw err
    }
  }

  async createFamily(name: string): Promise<any> {
    try {
      logger.debug('Creating family', { name })
      
      const response = await apiClient.post('/families', { name })

      if (response.error) {
        throw new Error(response.error)
      }

      return response.data
    } catch (err) {
      logger.error('Failed to create family', err)
      throw err
    }
  }

  async requestToJoinFamily(familyId: string): Promise<any> {
    try {
      logger.debug('Requesting to join family', { familyId })
      
      const response = await apiClient.post(`/families/${familyId}/join-requests`, {})

      if (response.error) {
        throw new Error(response.error)
      }

      return response.data
    } catch (err) {
      logger.error('Failed to request family join', err)
      throw err
    }
  }
}

// Singleton instance
export const familyClient = FamilyClient.getInstance()
