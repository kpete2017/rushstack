"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIdentifier = exports.getOrdinalFromIdentifierInternal = exports.getIdentifierInternal = void 0;
// TODO: Allow dynamic override of these values in the input to the minifier
const Constants_1 = require("./Constants");
// Set of ECMAScript reserved keywords (past and present): https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Lexical_grammar
const RESERVED_KEYWORDS = [
    'abstract',
    'arguments',
    'boolean',
    'break',
    'byte',
    'case',
    'catch',
    'char',
    'class',
    'const',
    'continue',
    'debugger',
    'default',
    'delete',
    'do',
    'double',
    'else',
    'enum',
    'export',
    'extends',
    'false',
    'final',
    'finally',
    'float',
    'for',
    'function',
    'get',
    'goto',
    'if',
    'implements',
    'import',
    'in',
    'instanceof',
    'int',
    'interface',
    'let',
    'long',
    'native',
    'new',
    'null',
    'package',
    'private',
    'protected',
    'public',
    'return',
    'set',
    'short',
    'static',
    'super',
    'switch',
    'synchronized',
    'this',
    'throw',
    'throws',
    'transient',
    'true',
    'try',
    'typeof',
    'var',
    'void',
    'volatile',
    'while',
    'with',
    'yield'
];
/**
 * Gets a base54 string suitable for use as a JavaScript identifier, not accounting for reserved keywords
 * @param ordinal The number to convert to a base54 identifier
 */
function getIdentifierInternal(ordinal) {
    let ret = Constants_1.IDENTIFIER_LEADING_DIGITS[ordinal % 54];
    ordinal = (ordinal / 54) | 0; // eslint-disable-line no-bitwise
    while (ordinal > 0) {
        --ordinal;
        ret += Constants_1.IDENTIFIER_TRAILING_DIGITS[ordinal & 0x3f]; // eslint-disable-line no-bitwise
        ordinal >>>= 6; // eslint-disable-line no-bitwise
    }
    return ret;
}
exports.getIdentifierInternal = getIdentifierInternal;
const leadingCharIndex = new Map();
for (let i = 0; i < 64; i++) {
    leadingCharIndex.set(Constants_1.IDENTIFIER_LEADING_DIGITS.charCodeAt(i), i);
}
const trailingCharIndex = new Map();
for (let i = 0; i < 64; i++) {
    trailingCharIndex.set(Constants_1.IDENTIFIER_TRAILING_DIGITS.charCodeAt(i), i);
}
/**
 * Converts an identifier into the ordinal that would produce it, not accounting for reserved keywords
 * Returns NaN if the result would exceed 31 bits
 */
function getOrdinalFromIdentifierInternal(identifier) {
    let ordinal = 0;
    for (let i = identifier.length - 1; i > 0; i--) {
        if (ordinal >= 0x2000000) {
            return NaN;
        }
        ordinal <<= 6; // eslint-disable-line no-bitwise
        ordinal += trailingCharIndex.get(identifier.charCodeAt(i)) + 1;
    }
    if (ordinal >= 0x2000000) {
        return NaN;
    }
    ordinal *= 54;
    ordinal += leadingCharIndex.get(identifier.charCodeAt(0));
    return ordinal;
}
exports.getOrdinalFromIdentifierInternal = getOrdinalFromIdentifierInternal;
/**
 * getIdentifier(n) would otherwise return each of these specified ECMAScript reserved keywords, which are not legal identifiers.
 */
const RESERVED_ORDINALS = (() => {
    const reserved = [];
    for (const keyword of RESERVED_KEYWORDS) {
        const ordinal = getOrdinalFromIdentifierInternal(keyword);
        if (!isNaN(ordinal)) {
            reserved.push(ordinal);
        }
    }
    return reserved.sort((x, y) => x - y);
})();
/**
 * Gets a base54 string suitable for use as a JavaScript identifier, omitting those that are valid ECMAScript keywords
 * Not guaranteed not to collide if `ordinal` >= 100000
 *
 * @param ordinal The number to convert to a base54 identifier
 */
function getIdentifier(ordinal) {
    // Need to skip over reserved keywords
    for (let i = 0, len = RESERVED_ORDINALS.length; i < len && ordinal >= RESERVED_ORDINALS[i]; i++) {
        ++ordinal;
    }
    return getIdentifierInternal(ordinal);
}
exports.getIdentifier = getIdentifier;
//# sourceMappingURL=MinifiedIdentifier.js.map