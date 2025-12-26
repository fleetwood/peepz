import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { v4 as uuid } from 'uuid'
import * as dotenv from 'dotenv'
import { uniqueNamesGenerator, adjectives, colors, names } from 'unique-names-generator'
import { toWords } from 'number-to-words'
import { toRoman } from 'roman-numerals'
// Temporarily comment out the problematic import until we can fix it properly
// Import extract-colors for color extraction
import { extractColors } from 'extract-colors/lib/worker-wrapper'

// Removed duplicate extractColors function - using imageColors instead

export function randNum(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function randItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

export function randArray<T>(arr: T[], min = 0, max?: number): T[] {
  const len = arr.length
  const count = randNum(min, Math.min(max ?? len, len))

  // If we want most of the array, it's faster to shuffle and slice
  if (count > len / 2) {
    return [...arr].sort(() => Math.random() - 0.5).slice(0, count)
  }

  // Otherwise use a Set for uniqueness and better performance
  const selected = new Set<T>()
  while (selected.size < count) {
    selected.add(arr[Math.floor(Math.random() * len)])
  }

  return Array.from(selected)
}

/**
 * Load environment variables for CLI tools
 * Next.js handles env loading for the app, this is only for CLI tools
 */
export function CLI_ENV() {
  // Skip loading from file if we're in Vercel (env vars are injected)
  if (process.env.VERCEL) return

  const env = process.env.NODE_ENV || 'development'
  dotenv.config({ path: `.env.${env}` })
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const ruid = () => uuid()

export const minId = (id?:string) => id?.split('-')[0] ?? 'undefined'

/**
 * Extract error message from unknown error type
 * Useful for handling errors that might not be proper Error objects
 */
export const errMessage = (err: unknown, msg: string = 'Unknown error'): string => {
  if (err instanceof Error) {
    return err.message
  }
  if (typeof err === 'object' && err !== null && 'message' in err) {
    return String(err.message)
  }
  return msg
}

/**
 * Pluralize an English word following common rules
 * Handles:
 * - Words ending in 'y' (city -> cities)
 * - Words ending in 'o' (mango -> mangoes)
 * - Common irregular plurals
 * - Regular 's' suffix
 */
export const pluralize = (word: string, count?: number): string => {
  if (count === 1) return word
  // Handle some common irregular plurals
  const irregulars: Record<string, string> = {
    person: 'people',
    child : 'children',
    foot  : 'feet',
    tooth : 'teeth',
    goose : 'geese',
    mouse : 'mice'
  }

  if (word in irregulars) return irregulars[word]

  // Words ending in 'o' that should end in 'oes'
  const oExceptions = ['mango', 'potato', 'tomato', 'echo', 'hero', 'torpedo']
  if (oExceptions.includes(word)) return word + 'es'

  // Words ending in 'y'
  if (word.endsWith('y')) {
    // If word ends in 'vowel + y', just add 's'
    if (['ay', 'ey', 'oy', 'uy'].some(ending => word.endsWith(ending))) {
      return word + 's'
    }
    // Otherwise, replace 'y' with 'ies'
    return word.slice(0, -1) + 'ies'
  }

  // Words ending in 's', 'sh', 'ch', 'x', 'z' add 'es'
  if (/[sxz]$/.test(word) || /[cs]h$/.test(word)) {
    return word + 'es'
  }

  // Default case: add 's'
  return word + 's'
}

export const oxfordComma = (arr: string[]): string => {
  if (arr.length === 0) return ''
  if (arr.length === 1) return arr[0]
  
  const last = arr.pop()
  return arr.join(', ') + ' and ' + last
}

export const aOrAn = (word: string): string => {
  if (!word) return 'a'
  const firstChar = word.trim().toLowerCase()[0]
  return ((['a', 'e', 'i', 'o', 'u'].includes(firstChar) || firstChar === 'h' && ['hour', 'honor', 'honest', 'heir'].includes(word.toLowerCase())) 
    ? 'an ' 
    : 'a ') + word
}

export const capFirst = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

const formatter = Intl.NumberFormat('en', { notation: 'compact' })

export function numFormat(num: number | string): string {
  const n = typeof num === 'string' ? parseInt(num) : num
  return formatter.format(n)
}

export enum NumberConvert {
  NUM,
  WRD,
  ROM
}

export function numConvert(num: number | string, convert: NumberConvert): string | number {
  // Ensure we're working with a number for conversion
  const numValue = typeof num === 'string' ? parseInt(num, 10) : num

  switch (convert) {
    case NumberConvert.NUM:
      return numValue
    case NumberConvert.WRD:
      return toWords(numValue)
    case NumberConvert.ROM:
      return toRoman(numValue)
    default:
      return numValue
  }
}

export function randName() {
  return uniqueNamesGenerator({
    dictionaries: [adjectives, colors, names],
    separator: ' ',
    style: 'capital',
    length: 3
  })
}

export const defaultGradient = ['hsl(var(--primary))', 'hsl(var(--primary-foreground))']
export async function imageColors(url: string): Promise<{ headerBg: string, headerText: string }> {
  if (!url) return { headerBg: 'hsl(var(--primary))', headerText: 'hsl(var(--primary-foreground))' }
  
  // Skip color extraction for non-Clerk and non-Cloudinary URLs to avoid CORS issues
  const isClerkUrl = url.includes('img.clerk.com') || url.includes('img.clerk.dev')
  const isCloudinaryUrl = url.includes('cloudinary.com') || url.includes('res.cloudinary.com')
  
  if (!isClerkUrl && !isCloudinaryUrl) {
    console.log('Skipping color extraction for non-supported URL:', url)
    return { headerBg: 'hsl(var(--primary))', headerText: 'hsl(var(--primary-foreground))' }
  }

  try {
    console.log('Extracting colors from URL:', url)
    // Extract colors from the image
    const colors = await extractColors(url, {
      pixels: 10000, // Analyze fewer pixels for performance
      distance: 0.2, // Color distance threshold
      saturationDistance: 0.2,
      lightnessDistance: 0.2,
      hueDistance: 0.1,
      crossOrigin: 'anonymous' // Handle CORS issues
    })
    
    // Sort colors by area (most dominant first)
    const sortedColors = [...colors].sort((a, b) => b.area - a.area)
    
    // Get the most dominant color for background
    const bgColor = sortedColors[0]?.hex || 'hsl(var(--primary))'
    
    // Find a contrasting color for text from the extracted colors
    // First, calculate luminance of the background color
    const bgLuminance = sortedColors[0] ? 
      (0.299 * sortedColors[0].red + 0.587 * sortedColors[0].green + 0.114 * sortedColors[0].blue) / 255 : 0.5
    
    // Look for a color that has good contrast with the background
    // Either much darker or much lighter depending on the background brightness
    let textColor = bgLuminance > 0.5 ? 'hsl(var(--foreground))' : 'hsl(var(--background))'
    
    // Try to find a suitable color from the extracted palette
    if (sortedColors.length > 1) {
      // Find colors with sufficient contrast
      const contrastingColors = sortedColors.filter(color => {
        const colorLuminance = (0.299 * color.red + 0.587 * color.green + 0.114 * color.blue) / 255
        // We want opposite luminance (light bg -> dark text, dark bg -> light text)
        // and sufficient difference in luminance for readability
        return (bgLuminance > 0.5 && colorLuminance < 0.3) || (bgLuminance < 0.5 && colorLuminance > 0.7)
      })
      
      if (contrastingColors.length > 0) {
        // Use the most dominant contrasting color
        textColor = contrastingColors[0].hex
      }
    }
    
    return {
      headerBg: bgColor,
      headerText: textColor
    }
  } catch (error) {
    console.error('Error extracting colors from image:', error)
    return { headerBg: 'hsl(var(--primary))', headerText: 'hsl(var(--primary-foreground))' }
  }
}

export * from './util.validation'
export * from './util.drizzle'
export * from './util.array'
export * from './util.chalk'
