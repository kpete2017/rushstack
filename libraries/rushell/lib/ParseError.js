"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParseError = void 0;
/**
 * An Error subclass used to report errors that occur while parsing an input.
 */
class ParseError extends Error {
    constructor(message, range, innerError) {
        super(ParseError._formatMessage(message, range));
        // Boilerplate for extending a system class
        //
        // https://github.com/microsoft/TypeScript-wiki/blob/master/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work
        //
        // IMPORTANT: The prototype must also be set on any classes which extend this one
        this.__proto__ = ParseError.prototype; // eslint-disable-line @typescript-eslint/no-explicit-any
        this.unformattedMessage = message;
        this.range = range;
        this.innerError = innerError;
    }
    /**
     * Generates a line/column prefix.  Example with line=2 and column=5
     * and message="An error occurred":
     * ```
     * "(2,5): An error occurred"
     * ```
     */
    static _formatMessage(message, range) {
        if (!message) {
            message = 'An unknown error occurred';
        }
        if (range.pos !== 0 || range.end !== 0) {
            const location = range.getLocation(range.pos);
            if (location.line) {
                return `(${location.line},${location.column}): ` + message;
            }
        }
        return message;
    }
}
exports.ParseError = ParseError;
//# sourceMappingURL=ParseError.js.map