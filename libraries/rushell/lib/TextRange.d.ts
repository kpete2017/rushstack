/**
 * Text coordinates represented as a line number and column number.
 *
 * @remarks
 * The first character in a file is considered to be in column 1 of line 1.
 * The location with column 0 and line 0 is used to represent an empty, unspecified,
 * or unknown location.
 */
export interface ITextLocation {
    line: number;
    column: number;
}
/**
 * Efficiently references a range of text from a string buffer.
 */
export declare class TextRange {
    /**
     * Used to represent an empty or unknown range.
     */
    static readonly empty: TextRange;
    /**
     * The starting index into the associated text buffer.
     *
     * @remarks
     * The text range corresponds to the `range.buffer.substring(range.pos, range.end)`.
     */
    readonly pos: number;
    /**
     * The (non-inclusive) ending index for the associated text buffer.
     *
     * @remarks
     * The text range corresponds to the `range.buffer.substring(range.pos, range.end)`.
     */
    readonly end: number;
    /**
     * The string buffer that the `pos` and `end` indexes refer to.
     */
    readonly buffer: string;
    private constructor();
    /**
     * Constructs a TextRange that corresponds to an entire string object.
     */
    static fromString(buffer: string): TextRange;
    /**
     * Constructs a TextRange that corresponds to an entire string object.
     */
    static fromStringRange(buffer: string, pos: number, end: number): TextRange;
    /**
     * Constructs a TextRange that corresponds to a different range of an existing buffer.
     */
    getNewRange(pos: number, end: number): TextRange;
    isEmpty(): boolean;
    /**
     * Returns the smallest TextRange object that encompasses both ranges.  If there is a gap
     * between the two ranges, it will be included in the encompassing range.
     */
    getEncompassingRange(other: TextRange): TextRange;
    /**
     * Returns the range from the associated string buffer.
     */
    toString(): string;
    /**
     * Calculates the line and column number for the specified offset into the buffer.
     *
     * @remarks
     * This is a potentially expensive operation.
     *
     * @param index - an integer offset
     * @param buffer - the buffer
     */
    getLocation(index: number): ITextLocation;
    private _validateBounds;
}
//# sourceMappingURL=TextRange.d.ts.map