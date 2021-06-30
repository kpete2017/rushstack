"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextRange = void 0;
/**
 * Efficiently references a range of text from a string buffer.
 */
class TextRange {
    constructor(buffer, pos, end) {
        this.buffer = buffer;
        this.pos = pos;
        this.end = end;
        this._validateBounds();
    }
    /**
     * Constructs a TextRange that corresponds to an entire string object.
     */
    static fromString(buffer) {
        return new TextRange(buffer, 0, buffer.length);
    }
    /**
     * Constructs a TextRange that corresponds to an entire string object.
     */
    static fromStringRange(buffer, pos, end) {
        return new TextRange(buffer, pos, end);
    }
    /**
     * Constructs a TextRange that corresponds to a different range of an existing buffer.
     */
    getNewRange(pos, end) {
        return new TextRange(this.buffer, pos, end);
    }
    isEmpty() {
        return this.pos === this.end;
    }
    /**
     * Returns the smallest TextRange object that encompasses both ranges.  If there is a gap
     * between the two ranges, it will be included in the encompassing range.
     */
    getEncompassingRange(other) {
        let newBuffer = this.buffer;
        // Allow combining TextRange.empty with a TextRange from a different buffer
        if (other.buffer.length > 0) {
            newBuffer = other.buffer;
            if (this.buffer.length > 0) {
                if (this.buffer !== other.buffer) {
                    throw new Error('The ranges cannot be combined because they come from different buffers');
                }
            }
        }
        let newPos = this.pos;
        let newEnd = this.end;
        if (!other.isEmpty()) {
            if (this.isEmpty()) {
                newPos = other.pos;
                newEnd = other.end;
            }
            else {
                // Neither range is empty, so combine them
                newPos = Math.min(other.pos, this.pos);
                newEnd = Math.max(other.end, this.end);
            }
        }
        return new TextRange(newBuffer, newPos, newEnd);
    }
    /**
     * Returns the range from the associated string buffer.
     */
    toString() {
        return this.buffer.substring(this.pos, this.end);
    }
    /**
     * Calculates the line and column number for the specified offset into the buffer.
     *
     * @remarks
     * This is a potentially expensive operation.
     *
     * @param index - an integer offset
     * @param buffer - the buffer
     */
    getLocation(index) {
        if (index < 0 || index > this.buffer.length) {
            // No match
            return { line: 0, column: 0 };
        }
        // TODO: Consider caching or optimizing this somehow
        let line = 1;
        let column = 1;
        let currentIndex = 0;
        while (currentIndex < index) {
            const current = this.buffer[currentIndex];
            ++currentIndex;
            if (current === '\r') {
                // CR
                // Ignore '\r' and assume it will always have an accompanying '\n'
                continue;
            }
            if (current === '\n') {
                // LF
                ++line;
                column = 1;
            }
            else {
                // NOTE: For consistency with the TypeScript compiler, a tab character is assumed
                // to advance by one column
                ++column;
            }
        }
        return { line, column };
    }
    _validateBounds() {
        if (this.pos < 0) {
            throw new Error('TextRange.pos cannot be negative');
        }
        if (this.end < 0) {
            throw new Error('TextRange.end cannot be negative');
        }
        if (this.end < this.pos) {
            throw new Error('TextRange.end cannot be smaller than TextRange.pos');
        }
        if (this.pos > this.buffer.length) {
            throw new Error('TextRange.pos cannot exceed the associated text buffer length');
        }
        if (this.end > this.buffer.length) {
            throw new Error('TextRange.end cannot exceed the associated text buffer length');
        }
        return this;
    }
}
exports.TextRange = TextRange;
/**
 * Used to represent an empty or unknown range.
 */
TextRange.empty = new TextRange('', 0, 0);
//# sourceMappingURL=TextRange.js.map