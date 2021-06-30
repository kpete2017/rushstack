import { TextRange } from './TextRange';
/**
 * An Error subclass used to report errors that occur while parsing an input.
 */
export declare class ParseError extends Error {
    /**
     * The text range where the error occurred.
     */
    readonly range: TextRange;
    /**
     * The message string passed to the constructor, before the line/column
     * numbering information was added.
     */
    readonly unformattedMessage: string;
    /**
     * The underlying error, if this error is resulted from an earlier error.
     */
    readonly innerError: Error | undefined;
    constructor(message: string, range: TextRange, innerError?: Error);
    /**
     * Generates a line/column prefix.  Example with line=2 and column=5
     * and message="An error occurred":
     * ```
     * "(2,5): An error occurred"
     * ```
     */
    private static _formatMessage;
}
//# sourceMappingURL=ParseError.d.ts.map