import { v4 as uuid } from 'uuid';

/**
 * Generate a random unique identifier
 * @returns A random string ID
 */
export const ruid = () => uuid()

/**
 * Combine class names conditionally
 */
export function cn(...inputs: (string | undefined | null | false)[]): string {
  return inputs.filter(Boolean).join(' ')
}
