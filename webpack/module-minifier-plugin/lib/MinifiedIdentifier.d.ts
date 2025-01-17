/**
 * Gets a base54 string suitable for use as a JavaScript identifier, not accounting for reserved keywords
 * @param ordinal The number to convert to a base54 identifier
 */
export declare function getIdentifierInternal(ordinal: number): string;
/**
 * Converts an identifier into the ordinal that would produce it, not accounting for reserved keywords
 * Returns NaN if the result would exceed 31 bits
 */
export declare function getOrdinalFromIdentifierInternal(identifier: string): number;
/**
 * Gets a base54 string suitable for use as a JavaScript identifier, omitting those that are valid ECMAScript keywords
 * Not guaranteed not to collide if `ordinal` >= 100000
 *
 * @param ordinal The number to convert to a base54 identifier
 */
export declare function getIdentifier(ordinal: number): string;
//# sourceMappingURL=MinifiedIdentifier.d.ts.map