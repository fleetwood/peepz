/**
 * Types for the Fuse.js integration
 */
/**
 * Options for similarity checking
 */
export type FuseSimilarityOptions = {
    /**
     * Array of keys to search on
     */
    keys: string[];
    /**
     * Threshold for similarity (0-1). Higher = more strict.
     * Default: 0.85 (85% similarity required)
     */
    threshold?: number;
    /**
     * Whether to include score in results
     * Default: true
     */
    includeScore?: boolean;
    /**
     * Whether to log performance warnings
     * Default: true
     */
    logPerformance?: boolean;
    /**
     * Threshold in ms for performance warnings
     * Default: 100
     */
    performanceThreshold?: number;
    /**
     * Whether to detect character substitution tricks (e.g., 'p3rmun1t10ns')
     * Default: true
     */
    detectCharacterSubstitution?: boolean;
    /**
     * Whether to enable direct Levenshtein distance comparison between normalized titles
     * This catches similar titles that might be missed by the Fuse.js algorithm
     * Uses the main threshold for comparison
     * Default: false
     */
    enableDirectComparison?: boolean;
};
/**
 * Result of a similarity check
 */
export type FuseSimilarityResult<T> = {
    /**
     * Whether a similar item was found
     */
    isSimilar: boolean;
    /**
     * The matching item if found
     */
    match?: T;
    /**
     * Similarity score (0-1) if found
     */
    score?: number;
    /**
     * Duration of the operation in ms
     */
    duration: number;
    /**
     * Number of items checked
     */
    count: number;
    /**
     * Whether a character substitution was detected
     * (e.g., 'p3rmun1t10ns' vs 'permunitions')
     */
    substitutionDetected?: boolean;
    /**
     * Whether the match was found using direct Levenshtein comparison
     * rather than the Fuse.js algorithm
     */
    directComparisonMatch?: boolean;
};
/**
 * Options for search
 */
export type FuseSearchOptions = {
    /**
     * Array of keys to search on
     */
    keys: string[];
    /**
     * Maximum number of results to return
     * Default: 10
     */
    limit?: number;
    /**
     * Threshold for similarity (0-1). Higher = more strict.
     * Default: 0.7 (70% similarity required)
     */
    threshold?: number;
    /**
     * Whether to log performance warnings
     * Default: true
     */
    logPerformance?: boolean;
    /**
     * Threshold in ms for performance warnings
     * Default: 100
     */
    performanceThreshold?: number;
};
/**
 * Result of a search operation
 */
export type FuseSearchResult<T> = {
    /**
     * Array of search results
     */
    results: Array<{
        item: T;
        score?: number;
    }>;
    /**
     * Duration of the operation in ms
     */
    duration: number;
    /**
     * Number of items searched
     */
    count: number;
};
//# sourceMappingURL=index.d.ts.map