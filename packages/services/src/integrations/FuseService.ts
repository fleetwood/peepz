'server only'

import { FuseSearchOptions, FuseSearchResult, FuseSimilarityOptions, FuseSimilarityResult } from '@peeps/types'
import { formatStub, Logger, removeFunctionWords } from '@peeps/utils'
import type { IFuseOptions } from 'fuse.js'
import Fuse from 'fuse.js'
import { performance } from 'perf_hooks'

const logger = Logger.instance('FuseService', false) // Enable debug logging

/**
 * Service for fuzzy searching and string similarity using Fuse.js
 */
/**
 * Normalizes a string for comparison by removing common character substitutions
 * @param str String to normalize
 * @returns Normalized string
 */
function normalizeForComparison(str: string): string {
  if (!str) return '';
  
  // Convert to lowercase
  let result = str.toLowerCase();
  
  // Replace common character substitutions
  const substitutions: Record<string, string> = {
    '0': 'o',
    '1': 'i',
    '3': 'e',
    '4': 'a',
    '5': 's',
    '6': 'g',
    '7': 't',
    '8': 'b',
    '9': 'g',
    '@': 'a',
    '$': 's',
    '!': 'i'
  };
  
  // Apply substitutions
  for (const [char, replacement] of Object.entries(substitutions)) {
    result = result.replace(new RegExp(char, 'g'), replacement);
  }
  
  return result;
}

/**
 * Calculates the Levenshtein distance between two strings
 * @param str1 First string
 * @param str2 Second string
 * @returns Edit distance
 */
function levenshteinDistance(str1: string, str2: string): number {
  const m = str1.length;
  const n = str2.length;
  
  // Create a matrix of size (m+1) x (n+1)
  const dp: number[][] = Array(m + 1)
    .fill(null)
    .map(() => Array(n + 1).fill(0));
  
  // Initialize the matrix
  for (let i = 0; i <= m; i++) {
    dp[i][0] = i;
  }
  
  for (let j = 0; j <= n; j++) {
    dp[0][j] = j;
  }
  
  // Fill the matrix
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1, // deletion
        dp[i][j - 1] + 1, // insertion
        dp[i - 1][j - 1] + cost // substitution
      );
    }
  }
  
  return dp[m][n];
}

/**
 * Calculates the percentage of character match between two strings.
 * This is a simple character-based similarity metric that can supplement Fuse.js scores,
 * especially for detecting minor variations or spoofing attempts.
 * It uses normalizeForComparison and levenshteinDistance internally.
 *
 * @param str1 First string
 * @param str2 Second string
 * @returns Similarity percentage (0-1)
 */
export function calculateMatchPercentage(str1: string, str2: string): number {
  // Handle edge cases
  if (!str1 && !str2) return 1; // Both empty/null/undefined
  if (!str1 || !str2) return 0; // One empty/null/undefined

  const s1 = String(str1); // Ensure they are strings
  const s2 = String(str2);

  // Use the longer string as the denominator for percentage calculation
  const maxLength = Math.max(s1.length, s2.length);
  if (maxLength === 0) return 1; // Both are empty strings

  // Check for character substitution tricks (e.g., 'p3rmun1t10ns' vs 'permunitions')
  const normalizedStr1 = normalizeForComparison(s1);
  const normalizedStr2 = normalizeForComparison(s2);

  // Check similarity of normalized strings to catch multiple substitutions
  const normalizedDistance = levenshteinDistance(normalizedStr1, normalizedStr2);
  const normalizedMaxLength = Math.max(normalizedStr1.length, normalizedStr2.length);
  
  // Handle case where normalized strings might be empty if originals were only substitutable chars
  const normalizedSimilarity = normalizedMaxLength > 0 
    ? 1 - (normalizedDistance / normalizedMaxLength)
    : (normalizedStr1 === normalizedStr2 ? 1 : 0); // If both normalized are empty, they are 100% similar

  // If normalized strings are very similar, they're likely trying to spoof
  // The threshold 0.8 is arbitrary and can be tuned.
  if (normalizedSimilarity >= 0.8) {
    // Return a high similarity score, proportional to how similar the normalized strings are.
    // This helps prioritize matches that are only different by spoofable characters.
    return Math.max(0.8, normalizedSimilarity); 
  }

  // Calculate Levenshtein distance (edit distance) on original (but cast to string) inputs
  const distance = levenshteinDistance(s1, s2);

  // Convert distance to similarity percentage
  return 1 - (distance / maxLength);
}

export class FuseService {
  /**
   * Default options for similarity checking
   */
  static readonly DEFAULT_SIMILARITY_OPTIONS = {
    threshold: 0.85, // Higher = more strict (0.85 = 85% similarity required)
    includeScore: true,
    logPerformance: true,
    performanceThreshold: 100, // ms
    shouldSort: true,
    minMatchCharLength: 2,
    detectCharacterSubstitution: true, // Whether to detect character substitution tricks
    // Note: We use the main threshold for similarity, length filtering, and character substitution detection
  }
  
  /**
   * Default options for search
   */
  static readonly DEFAULT_SEARCH_OPTIONS = {
    threshold: 0.7, // Default to 70% similarity required for search
    includeScore: true,
    logPerformance: true,
    performanceThreshold: 100, // ms
    limit: 10,
    shouldSort: true,
    minMatchCharLength: 2,
    detectCharacterSubstitution: true, // Whether to detect character substitution tricks
    characterSubstitutionThreshold: 0.8, // Threshold for detecting character substitutions (80% similarity)
    lengthRatioThreshold: 0.7 // Minimum length ratio required between strings (70% for search)
  }

  /**
   * Checks if a string is similar to any string in a collection
   * 
   * @param needle - The string to check for similarity
   * @param haystack - Array of strings to check against
   * @param options - Configuration options
   * @returns Object with result and performance metrics
   */
  static checkSimilarity<T>(
    needle: string,
    haystack: T[],
    options: FuseSimilarityOptions
  ): FuseSimilarityResult<T> {
    // Start performance timer
    const startTime = performance.now()
    
    // Merge provided options with defaults
    const {
      threshold = FuseService.DEFAULT_SIMILARITY_OPTIONS.threshold,
      includeScore = FuseService.DEFAULT_SIMILARITY_OPTIONS.includeScore,
      logPerformance = FuseService.DEFAULT_SIMILARITY_OPTIONS.logPerformance,
      performanceThreshold = FuseService.DEFAULT_SIMILARITY_OPTIONS.performanceThreshold
    } = options
    
    // For similarity checking, we'll use a length-based pre-filtering approach
    // First, process the needle (title) by removing function words and formatting as a stub
    const processTitle = (title: string): string => {
      // Remove function words first
      const withoutFunctionWords = removeFunctionWords(title);
      // Then format as a stub
      return formatStub(withoutFunctionWords);
    };
    
    // Process the needle
    const processedNeedle = typeof needle === 'string' ? 
                          processTitle(needle) : 
                          (options.keys.length > 0 && (needle as any)[options.keys[0]]) ? 
                          processTitle(String((needle as any)[options.keys[0]])) : '';
    
    // Get the processed needle length
    const needleLength = processedNeedle.length;
    
    // For example, if needle is 100 chars and threshold is 0.8, we accept 80-120 chars
    let minAcceptableLength = Math.max(Math.floor(needleLength * threshold), needleLength - 3);
    let maxAcceptableLength = Math.min(Math.ceil(needleLength / threshold), needleLength + 3);
    
    // For very short strings, use a strict length comparison
    // This prevents 'perm' from matching 'permunitions'
    if (needleLength < 6) {
      // For short strings, we're much more strict with length differences
      // Allow at most 30% difference for very short strings
      const shortStringThreshold = 0.7; // 70% similarity required for short strings
      const shortMinLength = Math.max(Math.floor(needleLength * shortStringThreshold), needleLength - 1);
      const shortMaxLength = Math.min(Math.ceil(needleLength / shortStringThreshold), needleLength + 1);
      
      // Use the stricter limits for short strings
      minAcceptableLength = shortMinLength;
      maxAcceptableLength = shortMaxLength;
    }
    
    // Process and filter the haystack based on length criteria
    const filteredHaystack = haystack.map(item => {
      // Get the item title
      const itemTitle = typeof item === 'string' ? item : 
                      (options.keys.length > 0 && (item as any).title) ? 
                      String((item as any).title) : '';
      
      // Process the title (remove function words and format as stub)
      const processedTitle = processTitle(itemTitle);
      const itemLength = processedTitle.length;
      
      // Return the original item and its processed version for filtering
      return {
        original: item,
        processed: processedTitle,
        length: itemLength
      };
    })
    // Filter based on length criteria
    .filter(item => {
      return item.length >= minAcceptableLength && item.length <= maxAcceptableLength;
    })
    // Extract the original items for the actual search
    .map(item => item.original);
    
    logger.debug('[FuseService] Length-based pre-filtering', {
      needleLength,
      threshold,
      minAcceptableLength,
      maxAcceptableLength,
      originalCount: haystack.length,
      filteredCount: filteredHaystack.length
    });
    
    // If no items pass the length filter, return no match immediately
    if (filteredHaystack.length === 0) {
      return {
        isSimilar: false,
        duration: performance.now() - startTime,
        count: haystack.length
      };
    }
    
    // Calculate min match length based on threshold and needle length
    // Use Math.max to ensure we have at least 2 characters minimum
    const dynamicMinMatchLength = Math.max(2, Math.floor(needleLength * threshold));
    
    logger.debug('[FuseService] Calculated dynamic minMatchCharLength', {
      needleLength,
      threshold,
      dynamicMinMatchLength
    });
    
    const fuseOptions = {
      keys: options.keys,
      includeScore,
      threshold: 1 - threshold, // Invert threshold for Fuse.js (lower = more strict)
      // Additional Fuse.js options
      shouldSort: FuseService.DEFAULT_SIMILARITY_OPTIONS.shouldSort,
      minMatchCharLength: dynamicMinMatchLength
    } as IFuseOptions<T>
    
    // Use the filtered haystack instead of the original one
    const fuse = new Fuse(filteredHaystack, fuseOptions)
    
    // Perform search using the processed needle
    const results = fuse.search(processedNeedle)
    
    // Measure performance
    const endTime = performance.now()
    const duration = endTime - startTime
    
    // Log performance warning if needed
    if (logPerformance && duration > performanceThreshold) {
      logger.warn('[FuseService] Performance warning', {
        duration: `${duration.toFixed(2)}ms`,
        itemCount: haystack.length,
        threshold
      })
    }
    
    // Check if we found a similar item
    // Since we inverted the threshold for Fuse.js, we need to invert the score comparison
    // Fuse.js returns score where 0 = perfect match, 1 = no match
    // We need to compare: (1 - score) >= threshold
    const hasResults = results.length > 0;
    const rawScore = hasResults ? (results[0].score ?? 0) : 1;
    const adjustedScore = hasResults ? 1 - rawScore : 0;
    let isSimilar = hasResults && adjustedScore >= threshold;
    let bestMatch = hasResults ? results[0].item : undefined;
    let bestScore = adjustedScore;
    
    // Log detailed information about the search results
    logger.debug('[FuseService] Similarity check results', {
      needle: processedNeedle,
      hasResults,
      rawScore,
      adjustedScore,
      threshold,
      isSimilar,
      topResults: results.slice(0, 3).map(r => ({
        item: typeof r.item === 'string' ? r.item : (r.item as any).title || 'Unknown',
        rawScore: r.score,
        adjustedScore: 1 - (r.score ?? 0)
      }))
    });
    
    // Try direct comparison if enabled and no match found via Fuse
    const { enableDirectComparison = false } = options;
    
    if (enableDirectComparison && !isSimilar && haystack.length > 0) {
      // Helper function to normalize a title for direct comparison
      const normalizeTitle = (text: string): string => {
        if (!text) return '';
        
        // Convert to lowercase
        let normalized = text.toLowerCase();
        
        // Remove common punctuation and special characters
        normalized = normalized.replace(/[^a-z0-9\s]/g, '');
        
        // Remove extra spaces
        normalized = normalized.replace(/\s+/g, ' ').trim();
        
        return normalized;
      };
      
      // Normalize the needle (user's title)
      const needleValue = typeof needle === 'string' ? needle : 
                        (options.keys.length > 0 && (needle as any)[options.keys[0]]) ? 
                        String((needle as any)[options.keys[0]]) : '';
      
      const normalizedNeedle = normalizeTitle(needleValue);
      
      // Look for titles that are very similar by direct comparison
      let directMatch: { item: T, similarity: number } | null = null;
      
      for (const item of haystack) {
        // Get the value to compare from the item
        const itemValue = typeof item === 'string' ? item : 
                        (options.keys.length > 0 && (item as any)[options.keys[0]]) ? 
                        String((item as any)[options.keys[0]]) : '';
        
        // Normalize the haystack item
        const normalizedItem = normalizeTitle(itemValue);
        
        // Calculate Levenshtein distance between normalized titles
        const distance = levenshteinDistance(normalizedNeedle, normalizedItem);
        const maxLength = Math.max(normalizedNeedle.length, normalizedItem.length);
        const similarity = maxLength > 0 ? 1 - (distance / maxLength) : 0;
        
        // Log all comparisons with decent similarity (above 0.5) for debugging
        if (similarity > 0.5) {
          logger.debug('[FuseService] Direct comparison details', {
            normalizedNeedle,
            normalizedItem,
            originalItem: itemValue,
            distance,
            maxLength,
            similarity,
            threshold: threshold,
            isMatch: similarity >= threshold
          });
        }
        
        // If similarity is above threshold, consider it a match
        if (similarity >= threshold) {
          logger.debug('[FuseService] Found direct match', {
            needle: normalizedNeedle,
            item: normalizedItem,
            originalItem: itemValue,
            similarity
          });
          
          // Keep track of the best match
          if (!directMatch || similarity > directMatch.similarity) {
            directMatch = {
              item,
              similarity
            };
          }
        }
      }
      
      // If we found a match by direct comparison, override the Fuse result
      if (directMatch) {
        isSimilar = true;
        bestMatch = directMatch.item;
        bestScore = directMatch.similarity;
        
        // Mark as detected by direct comparison
        logger.info('[FuseService] Direct comparison found match', {
          similarity: directMatch.similarity,
          threshold: threshold
        });
      }
    }
    
    // Check for character substitution tricks if enabled
    const { detectCharacterSubstitution = true } = options
    if (detectCharacterSubstitution && results.length > 0 && !isSimilar) {
      // Get the best match
      const bestMatch = results[0].item
      
      // Get the value to compare (using the first key if multiple keys are provided)
      const key = options.keys[0]
      const needleValue = typeof needle === 'string' ? needle : (needle as any)[key]
      const matchValue = typeof bestMatch === 'string' ? bestMatch : (bestMatch as any)[key]
      
      if (needleValue && matchValue) {
        // Skip character substitution check for very short strings (less than 4 chars)
        // This prevents false positives with short titles like 'per'
        if (String(needleValue).length < 4) {
          logger.debug('[FuseService] Skipping character substitution check for short string', {
            needle: needleValue,
            length: String(needleValue).length
          })
        } else {
          // Check if one string is a substring of the other (partial match)
          const needleStr = String(needleValue);
          const matchStr = String(matchValue);
          const isSubstring = 
            needleStr.includes(matchStr) || 
            matchStr.includes(needleStr);
            
          // Calculate length ratio - crucial for preventing partial matches like 'permu' vs 'permunitions'
          const lengthRatio = Math.min(needleStr.length, matchStr.length) / 
                           Math.max(needleStr.length, matchStr.length);
                           
          // If the length ratio is too low, it's definitely not a match
          // For example, 'permu' (5 chars) vs 'permunitions' (11 chars) has ratio of 5/11 = 0.45
          // This is well below our 85% threshold
          const hasInsufficientLengthRatio = lengthRatio < 0.85;
          if (hasInsufficientLengthRatio) {
            logger.debug('[FuseService] Skipping due to insufficient length ratio', {
              needle: needleStr,
              match: matchStr,
              lengthRatio: `${(lengthRatio * 100).toFixed(1)}%`,
              threshold: '85%'
            });
          }
          
          // Only proceed with character substitution check if length ratio is sufficient
          if (!hasInsufficientLengthRatio) {
            // For partial matches, we want to be more strict
            const effectiveThreshold = isSubstring ? 0.95 : threshold
            
            // Normalize strings to detect character substitutions
            const normalizedNeedle = normalizeForComparison(String(needleValue))
            const normalizedMatch = normalizeForComparison(String(matchValue))
            
            // Calculate similarity between normalized strings
            const normalizedDistance = levenshteinDistance(normalizedNeedle, normalizedMatch)
            const normalizedMaxLength = Math.max(normalizedNeedle.length, normalizedMatch.length)
            const normalizedSimilarity = normalizedMaxLength > 0 ? 1 - (normalizedDistance / normalizedMaxLength) : 1
            
            // If normalized strings are very similar, they're likely trying to spoof
            // We already checked the length ratio above, so we don't need to check it again
            if (normalizedSimilarity >= effectiveThreshold) {
              logger.debug('[FuseService] Character substitution detected', {
                original: { needle: needleValue, match: matchValue },
                normalized: { needle: normalizedNeedle, match: normalizedMatch },
                normalizedSimilarity: `${(normalizedSimilarity * 100).toFixed(1)}%`,
                lengthRatio: `${(lengthRatio * 100).toFixed(1)}%`,
                isSubstring
              })
              
              isSimilar = true
            }
          }
        }
      }
    }
    
    // Determine if this is a direct comparison match
    const isDirectComparisonMatch = isSimilar && enableDirectComparison && 
      (results.length === 0 || (results.length > 0 && (1 - (results[0].score ?? 0)) < threshold));
    
    // Determine if this is a character substitution match
    const isSubstitutionMatch = isSimilar && results.length > 0 && (1 - (results[0].score ?? 0)) < threshold;
    
    // Return result with performance metrics
    return {
      isSimilar,
      match: isSimilar ? bestMatch : undefined,
      score: isSimilar ? bestScore : undefined,
      duration,
      count: haystack.length,
      substitutionDetected: isSubstitutionMatch,
      directComparisonMatch: isDirectComparisonMatch
    }
  }
  
  /**
   * Performs a fuzzy search on a collection
   * 
   * @param query - The search query
   * @param collection - Array of items to search
   * @param options - Search configuration options
   * @returns Search results with performance metrics
   */
  static search<T>(
    query: string,
    collection: T[],
    options: FuseSearchOptions
  ): FuseSearchResult<T> {
    // Start performance timer
    const startTime = performance.now()
    
    // Merge provided options with defaults
    const {
      limit = FuseService.DEFAULT_SEARCH_OPTIONS.limit,
      threshold = FuseService.DEFAULT_SEARCH_OPTIONS.threshold,
      logPerformance = FuseService.DEFAULT_SEARCH_OPTIONS.logPerformance,
      performanceThreshold = FuseService.DEFAULT_SEARCH_OPTIONS.performanceThreshold
    } = options
    
    // Configure Fuse
    // Calculate minimum match length based on threshold and average length of collection items
    // For example, with threshold 0.7, a string of length 10 would require at least 7 (70%) characters to match
    
    // Get average length of collection items
    let avgLength = 0;
    if (collection.length > 0) {
      // For string arrays, use string length directly
      if (typeof collection[0] === 'string') {
        const totalLength = collection.reduce((sum, item) => sum + (item as string).length, 0);
        avgLength = totalLength / collection.length;
      } else if (options.keys.length > 0) {
        // For object arrays, use the length of the first key's value if available
        const key = options.keys[0];
        const totalLength = collection.reduce((sum, item) => {
          const value = (item as any)[key];
          return sum + (typeof value === 'string' ? value.length : 0);
        }, 0);
        avgLength = totalLength / collection.length;
      }
    }
    
    // Calculate min match length based on threshold and average length
    // Use Math.max to ensure we have at least 2 characters minimum
    const dynamicMinMatchLength = Math.max(2, Math.floor(avgLength * threshold));
    
    logger.debug('[FuseService] Calculated dynamic minMatchCharLength for search', {
      avgLength,
      threshold,
      dynamicMinMatchLength
    });
    
    const fuseOptions = {
      keys: options.keys,
      includeScore: FuseService.DEFAULT_SEARCH_OPTIONS.includeScore,
      threshold: 1 - threshold, // Invert threshold for Fuse.js (lower = more strict)
      // Additional Fuse.js options
      shouldSort: FuseService.DEFAULT_SEARCH_OPTIONS.shouldSort,
      minMatchCharLength: dynamicMinMatchLength
    } as IFuseOptions<T>
    
    const fuse = new Fuse(collection, fuseOptions)
    
    // Perform search
    const searchResults = fuse.search(query, { limit })
    
    // Measure performance
    const endTime = performance.now()
    const duration = endTime - startTime
    
    // Log performance warning if needed
    if (logPerformance && duration > performanceThreshold) {
      logger.warn('[FuseService] Performance warning', {
        duration: `${duration.toFixed(2)}ms`,
        itemCount: collection.length,
        threshold,
        query
      })
    }
    
    // Format results
    const results = searchResults.map(result => ({
      item: result.item,
      score: result.score
    }))
    
    // Return results with performance metrics
    return {
      results,
      duration,
      count: collection.length
    }
  }

  /**
   * Performs a broad, "contains-like" fuzzy search on a collection.
   * This method sets ignoreLocation: true and findAllMatches: true internally.
   * 
   * @param query - The search query
   * @param collection - Array of items to search
   * @param options - Search configuration options (keys, threshold, limit, etc.)
   * @returns Search results with performance metrics
   */
  static searchBroadly<T>(
    query: string,
    collection: T[],
    options: FuseSearchOptions
  ): FuseSearchResult<T> {
    // Start performance timer
    const startTime = performance.now();

    // Merge provided options with defaults, then override for broad search
    const {
      limit = FuseService.DEFAULT_SEARCH_OPTIONS.limit,
      threshold = FuseService.DEFAULT_SEARCH_OPTIONS.threshold, // User-defined threshold is respected
      logPerformance = FuseService.DEFAULT_SEARCH_OPTIONS.logPerformance,
      performanceThreshold = FuseService.DEFAULT_SEARCH_OPTIONS.performanceThreshold,
      keys // User-defined keys are respected
    } = options;

    // For broad search, minMatchCharLength should be low to catch substrings
    const fuseMinMatchCharLength = 2;
    logger.debug('[FuseService] Using fixed minMatchCharLength for searchBroadly', {
      minMatchCharLength: fuseMinMatchCharLength,
      threshold
    });

    const fuseOptions = {
      ...options, // Spread original options first
      keys,
      includeScore: FuseService.DEFAULT_SEARCH_OPTIONS.includeScore,
      threshold: 1 - threshold, // Invert threshold for Fuse.js
      shouldSort: FuseService.DEFAULT_SEARCH_OPTIONS.shouldSort,
      minMatchCharLength: fuseMinMatchCharLength, // Use fixed low value
      // Crucial overrides for "contains-like" behavior
      ignoreLocation: true,
      findAllMatches: true 
    } as IFuseOptions<T>;

    const fuse = new Fuse(collection, fuseOptions);
    const searchResults = fuse.search(query, { limit });

    const endTime = performance.now();
    const duration = endTime - startTime;

    if (logPerformance && duration > performanceThreshold) {
      logger.warn('[FuseService] Performance warning (searchBroadly)', {
        duration: `${duration.toFixed(2)}ms`,
        itemCount: collection.length,
        threshold,
        query
      });
    }

    const results = searchResults.map(result => ({
      item: result.item,
      score: result.score
    }));

    return {
      results,
      duration,
      count: collection.length
    };
  }
}
