export { cn } from "./classnames";
export { ruid } from "./id";
export declare const FUNCTION_WORDS: string[];
/**
 * Removes function words from a string
 *
 * @param text - The text to process
 * @returns The text with function words removed
 */
export declare const removeFunctionWords: (text: string) => string;
/**
 * Removes function words and formats a string as a stub
 * This is useful for title similarity checking
 * Example: 'to kill a mockingbird' -> 'kill-mockingbird'
 *
 * @param text - The text to process
 * @returns The formatted stub with function words removed
 */
export declare const formatStubWithoutFunctionWords: (text: string) => string;
/**
 * Creates a URL-friendly slug from a title
 * @param s The title to convert to a slug
 * @returns A clean URL-friendly slug
 * @throws Error if the title cannot be converted to a valid slug
 */
export declare const formatStub: (s: string) => string;
//# sourceMappingURL=string.d.ts.map