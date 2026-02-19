export { ruid } from './string';
export type EnumRecord = {
    enumName?: string;
};
/**
 * Create an enum configuration for database schema columns
 */
export declare function enumValues<T extends {
    [key: string]: string | number;
}>(enumType: T): Array<T[keyof T]>;
export declare function enumColumn<TEnum extends {
    [key: string]: string | number;
}>(name: string, enumType: TEnum): import("drizzle-orm/pg-core").PgTextBuilder<{
    name: string;
    dataType: "string";
    columnType: "PgText";
    data: string;
    enumValues: [string, ...string[]];
    driverParam: string;
}>;
export declare function stringToEnum<TEnum extends {
    [key: string]: string | number;
}>(enumType: TEnum, value: string | TEnum[keyof TEnum]): TEnum[keyof TEnum] | undefined;
export declare function mergeMetadata<T extends Record<string, any>>(existingMetadata: unknown, updateMetadata: unknown, specialMergeFields?: Record<string, boolean>): Record<string, any>;
export declare function enumAbbr<TEnum extends EnumRecord>(enumType: TEnum): string;
//# sourceMappingURL=drizzle.d.ts.map