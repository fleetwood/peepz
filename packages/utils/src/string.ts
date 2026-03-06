export { cn } from "./classnames";
export { ruid } from "./id";

export const FUNCTION_WORDS = [
     // Articles
    'a', 'an', 'the',
    
    // Common pronouns
    'i', 'me', 'my', 'mine', 'myself',
    'you', 'your', 'yours',
    'he', 'him', 'his', 'himself',
    'she', 'her', 'hers', 'herself',
    'it', 'its', 'itself',
    'we', 'us', 'our', 'ours',
    'they', 'them', 'their', 'theirs',
    'this', 'that', 'these', 'those',
    'who', 'whom', 'whose',
    'what', 'which',
    
    'by', 'for', 'from', 'in',
    'of', 'off', 'on', 'onto', 'out', 'to',   
    // Conjunctions
    'and', 'but', 'or', 'nor', 'so', 'yet',
    'if', 'when',
    
    // Auxiliary verbs
    'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'have', 'has', 'had', 'having',
    'do', 'does', 'did', 'doing',
    'will', 'would', 'shall', 'should',
    'can', 'could', 'may',
    
    // Determiners
    'any', 'each', 'every',
];

/**
 * Removes function words from a string
 *
 * @param text - The text to process
 * @returns The text with function words removed
 */
export const removeFunctionWords = (text: string): string => {
  if (!text) return "";

  // Convert to lowercase for comparison
  const lowerText = text.toLowerCase();

  // Split the text into words
  const words = lowerText.split(/\s+/);

  // Filter out function words
  const filteredWords = words.filter((word) => !FUNCTION_WORDS.includes(word));

  // Safety check: If removing function words would result in an empty string,
  // keep all the original words (for titles like 'Me And Mine')
  if (filteredWords.length === 0 && words.length > 0) {
    // Use all original words
    return text.toLowerCase();
  }

  // Join the words back together
  return filteredWords.join(" ");
};

/**
 * Removes function words and formats a string as a stub
 * This is useful for title similarity checking
 * Example: 'to kill a mockingbird' -> 'kill-mockingbird'
 *
 * @param text - The text to process
 * @returns The formatted stub with function words removed
 */
export const formatStubWithoutFunctionWords = (text: string): string => {
  if (!text || !text.trim()) {
    return "";
  }

  // First remove function words
  const withoutFunctionWords = removeFunctionWords(text);

  // Then apply standard stub formatting
  return formatStub(withoutFunctionWords);
};

/**
 * Creates a URL-friendly slug from a title
 * @param s The title to convert to a slug
 * @returns A clean URL-friendly slug
 * @throws Error if the title cannot be converted to a valid slug
 */
export const formatStub = (s: string): string => {
  if (!s || !s.trim()) {
    return "";
  }

  // Trim whitespace and handle HTML entities
  const decodedString = s
    .trim()
    // Decode HTML entities (like &amp; to &)
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "");

  const stub = decodedString
    .toLowerCase()
    .replace(/[''‛′`]/g, "") // Remove single quotes and variations
    .replace(/["""„‟]/g, "") // Remove double quotes and variations
    // Replace non-Latin characters with approximations
    .replace(/[àáâãäå]/g, "a")
    .replace(/[èéêë]/g, "e")
    .replace(/[ìíîï]/g, "i")
    .replace(/[òóôõö]/g, "o")
    .replace(/[ùúûü]/g, "u")
    .replace(/[ýÿ]/g, "y")
    .replace(/[ñ]/g, "n")
    .replace(/[ç]/g, "c")
    .replace(/[æ]/g, "ae")
    .replace(/[œ]/g, "oe")
    .replace(/[^a-z0-9]+/g, "-") // Replace remaining non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, "") // Trim leading and trailing hyphens
    // Ensure slug has a reasonable length
    .slice(0, 100);

  // Check if we have a valid slug after all processing
  if (!stub) {
    // Return empty string instead of throwing an error
    return "";
  }

  return stub;
};
