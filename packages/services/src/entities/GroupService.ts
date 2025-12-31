import * as schema from '@peeps/db/schema'
import { type WithTx, withTx } from '@peeps/db/client'
import type { ServiceResult } from '@peeps/types'

/**
 * GroupService
 * Handles all business logic for Group entity
 */
export class GroupService {
  @withTx
  static async getById(params: WithTx<{ id: string }>): Promise<ServiceResult<schema.Group | null>> {
    throw new Error('Not implemented')
  }

  static async create(data: any): Promise<ServiceResult<any>> {
    throw new Error('Not implemented')
  }

  static async update(id: string, data: any): Promise<ServiceResult<any>> {
    throw new Error('Not implemented')
  }

  static async delete(id: string): Promise<ServiceResult<void>> {
    throw new Error('Not implemented')
  }
}
