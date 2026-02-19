import { text } from 'drizzle-orm/pg-core';
export { ruid } from './string';
/**
 * Create an enum configuration for database schema columns
 */
export function enumValues(enumType) {
    return Object.values(enumType).filter(value => typeof value === 'number');
}
export function enumColumn(name, enumType) {
    return text(name, {
        enum: Object.values(enumType).map(v => v.toString())
    });
}
export function stringToEnum(enumType, value) {
    if (Object.values(enumType).includes(value)) {
        return value;
    }
    if (typeof value !== 'string')
        return undefined;
    const lowerValue = value.toLowerCase();
    for (const enumValue of Object.values(enumType)) {
        if (typeof enumValue === 'string' && enumValue.toLowerCase() === lowerValue) {
            return enumValue;
        }
    }
    for (const key of Object.keys(enumType)) {
        if (key.toLowerCase() === lowerValue) {
            return enumType[key];
        }
    }
    return undefined;
}
export function mergeMetadata(existingMetadata, updateMetadata, specialMergeFields) {
    const existing = (existingMetadata || {});
    const update = (updateMetadata || {});
    const merged = { ...existing, ...update };
    if (specialMergeFields) {
        for (const field of Object.keys(specialMergeFields)) {
            if (existing[field] || update[field]) {
                merged[field] = {
                    ...(existing[field] || {}),
                    ...(update[field] || {})
                };
            }
        }
    }
    return merged;
}
export function enumAbbr(enumType) {
    const skipWords = ['and', 'or', 'of', 'the', 'in', 'on', 'at', 'to'];
    const words = (enumType.enumName ?? 'Unknown')
        .split(/[^a-zA-Z0-9]+/)
        .filter((word) => word.length > 0)
        .filter((word) => !skipWords.includes(word.toLowerCase()));
    if (words.length === 1) {
        const word = words[0];
        return word.length > 1 ? word[0].toUpperCase() + word[1].toLowerCase() : word[0].toUpperCase();
    }
    return words.map((word) => word[0].toUpperCase()).join('');
}
