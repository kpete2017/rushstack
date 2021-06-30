import { Tokenizer } from './Tokenizer';
import { AstScript } from './AstNode';
export declare class Parser {
    private readonly _tokenizer;
    private _peekedToken;
    constructor(tokenizer: Tokenizer);
    parse(): AstScript;
    private _parseCommand;
    private _parseCompoundWord;
    private _parseText;
    /**
     * Skips any whitespace tokens.  Returns true if any whitespace was actually encountered.
     */
    private _skipWhitespace;
    private _readToken;
    private _peekToken;
}
//# sourceMappingURL=Parser.d.ts.map