import { TextRange } from './TextRange';
export declare enum TokenKind {
    Spaces = 0,
    NewLine = 1,
    OtherCharacter = 2,
    Text = 3,
    AndIf = 4,
    DoubleQuotedText = 5,
    DollarVariable = 6,
    EndOfInput = 7
}
export declare class Token {
    readonly kind: TokenKind;
    readonly range: TextRange;
    /**
     * The extracted content, which depends on the type:
     *
     * Text: The unescaped content
     * DoubleQuotedText: The unescaped contents inside the quotes.
     * DollarVariable: The variable name without the "$"
     */
    readonly text: string;
    constructor(kind: TokenKind, range: TextRange, text?: string);
    toString(): string;
}
export declare class Tokenizer {
    readonly input: TextRange;
    private _currentIndex;
    constructor(input: TextRange | string);
    private static _isSpace;
    get currentIndex(): number;
    readToken(): Token;
    readTokens(): Token[];
    /**
     * Retrieve the next character in the input stream.
     * @returns a string of length 1, or undefined if the end of input is reached
     */
    private _readCharacter;
    /**
     * Return the next character in the input stream, but don't advance the stream pointer.
     * @returns a string of length 1, or undefined if the end of input is reached
     */
    private _peekCharacter;
    /**
     * Return the character after the next character in the input stream, but don't advance the stream pointer.
     * @returns a string of length 1, or undefined if the end of input is reached
     */
    private _peekCharacterAfter;
}
//# sourceMappingURL=Tokenizer.d.ts.map