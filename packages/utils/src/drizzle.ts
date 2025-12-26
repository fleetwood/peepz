
import { text } from 'drizzle-orm/pg-core'
export { ruid } from './string'

export type EnumRecord = {
  enumName?: string
}

/**
 * Create an enum configuration for database schema columns
 */
export function enumValues<T extends { [key: string]: string | number }>(
  enumType: T
): Array<T[keyof T]> {
  return Object.values(enumType).filter(value => typeof value === 'number') as Array<T[keyof T]>
}

export function enumColumn<TEnum extends { [key: string]: string | number }>(
  name: string,
  enumType: TEnum
) {
  return text(name, {
    enum: Object.values(enumType).map(v => v.toString()) as [string, ...string[]]
  })
}

export function stringToEnum<TEnum extends { [key: string]: string | number }>(
  enumType: TEnum,
  value: string | TEnum[keyof TEnum]
): TEnum[keyof TEnum] | undefined {
  if (Object.values(enumType).includes(value as any)) {
    return value as TEnum[keyof TEnum]
  }
  if (typeof value !== 'string') return undefined

  const lowerValue = value.toLowerCase()

  for (const enumValue of Object.values(enumType)) {
    if (typeof enumValue === 'string' && enumValue.toLowerCase() === lowerValue) {
      return enumValue as TEnum[keyof TEnum]
    }
  }

  for (const key of Object.keys(enumType)) {
    if (key.toLowerCase() === lowerValue) {
      return enumType[key as keyof TEnum]
    }
  }

  return undefined
}

export function mergeMetadata<T extends Record<string, any>>(
  existingMetadata: unknown,
  updateMetadata: unknown,
  specialMergeFields?: Record<string, boolean>
): Record<string, any> {
  const existing = (existingMetadata || {}) as Record<string, any>
  const update = (updateMetadata || {}) as Record<string, any>

  const merged = { ...existing, ...update }

  if (specialMergeFields) {
    for (const field of Object.keys(specialMergeFields)) {
      if (existing[field] || update[field]) {
        merged[field] = {
          ...(existing[field] || {}),
          ...(update[field] || {})
        }
      }
    }
  }

  return merged
}

export function enumAbbr<TEnum extends EnumRecord>(enumType: TEnum) {
  const skipWords = ['and', 'or', 'of', 'the', 'in', 'on', 'at', 'to']
  const words = (enumType.enumName ?? 'Unknown')
    .split(/[^a-zA-Z0-9]+/)
    .filter((word: string) => word.length > 0)
    .filter((word: string) => !skipWords.includes(word.toLowerCase()))

  if (words.length === 1) {
    const word = words[0]
    return word.length > 1 ? word[0].toUpperCase() + word[1].toLowerCase() : word[0].toUpperCase()
  }

  return words.map((word: string) => word[0].toUpperCase()).join('')
}
