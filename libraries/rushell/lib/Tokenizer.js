"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tokenizer = exports.Token = exports.TokenKind = void 0;
const TextRange_1 = require("./TextRange");
const ParseError_1 = require("./ParseError");
var TokenKind;
(function (TokenKind) {
    // One or more spaces/tabs
    TokenKind[TokenKind["Spaces"] = 0] = "Spaces";
    // A single newline sequence such as CRLF or LF
    TokenKind[TokenKind["NewLine"] = 1] = "NewLine";
    // A general character without any special meaning
    TokenKind[TokenKind["OtherCharacter"] = 2] = "OtherCharacter";
    // A sequence of characters that doesn't contain any symbols with special meaning
    // Characters can be escaped, in which case the Token.text may differ from the
    // Token.range.toString()
    TokenKind[TokenKind["Text"] = 3] = "Text";
    // The "&&" operator, which executes the following command only if the preceding command
    // succeeded (i.e. returned a zero exit code).
    TokenKind[TokenKind["AndIf"] = 4] = "AndIf";
    // A double-quoted string which can do variable expansions
    TokenKind[TokenKind["DoubleQuotedText"] = 5] = "DoubleQuotedText";
    // A dollar sign followed by an environment variable name
    TokenKind[TokenKind["DollarVariable"] = 6] = "DollarVariable";
    // The end of the input string
    TokenKind[TokenKind["EndOfInput"] = 7] = "EndOfInput";
})(TokenKind = exports.TokenKind || (exports.TokenKind = {}));
class Token {
    constructor(kind, range, text) {
        this.kind = kind;
        this.range = range;
        this.text = text === undefined ? this.range.toString() : text;
    }
    toString() {
        return this.text;
    }
}
exports.Token = Token;
const textCharacterRegExp = /[a-z0-9_\\]/i;
const startVariableCharacterRegExp = /[a-z_]/i;
const variableCharacterRegExp = /[a-z0-9_]/i;
class Tokenizer {
    constructor(input) {
        if (typeof input === 'string') {
            this.input = TextRange_1.TextRange.fromString(input);
        }
        else {
            this.input = input;
        }
        this._currentIndex = this.input.pos;
    }
    static _isSpace(c) {
        // You can empirically test whether shell treats a given character as whitespace like this:
        // echo $(echo -e a '\u0009' b)
        // If you get "a b" it means the tab character (Unicode 0009) is being collapsed away.
        // If you get "a   b" then the invisible character is being padded like a normal letter.
        return c === ' ' || c === '\t';
    }
    get currentIndex() {
        return this._currentIndex;
    }
    readToken() {
        const input = this.input;
        const startIndex = this._currentIndex;
        const firstChar = this._peekCharacter();
        // Reached end of input yet?
        if (firstChar === undefined) {
            return new Token(TokenKind.EndOfInput, TextRange_1.TextRange.empty);
        }
        // Is it a sequence of whitespace?
        if (Tokenizer._isSpace(firstChar)) {
            this._readCharacter();
            while (Tokenizer._isSpace(this._peekCharacter())) {
                this._readCharacter();
            }
            return new Token(TokenKind.Spaces, input.getNewRange(startIndex, this._currentIndex));
        }
        // Is it a newline?
        if (firstChar === '\r') {
            this._readCharacter();
            if (this._peekCharacter() === '\n') {
                this._readCharacter();
            }
            return new Token(TokenKind.NewLine, input.getNewRange(startIndex, this._currentIndex));
        }
        else if (firstChar === '\n') {
            this._readCharacter();
            return new Token(TokenKind.NewLine, input.getNewRange(startIndex, this._currentIndex));
        }
        // Is it a double-quoted string?
        if (firstChar === '"') {
            this._readCharacter(); // consume the opening quote
            let text = '';
            let c = this._peekCharacter();
            while (c !== '"') {
                if (c === undefined) {
                    throw new ParseError_1.ParseError('The double-quoted string is missing the ending quote', input.getNewRange(startIndex, this._currentIndex));
                }
                if (c === '\r' || c === '\n') {
                    throw new ParseError_1.ParseError('Newlines are not supported inside strings', input.getNewRange(this._currentIndex, this._currentIndex + 1));
                }
                // NOTE: POSIX says that backslash acts as an escape character inside a double-quoted string
                // ONLY if followed by certain other characters.  For example, yes for "a\$" but no for "a\t".
                // Whereas Dash says yes for "a\t" but no for "a\q".  And then Bash says yes for "a\t".
                // This goes against Rushell's goal of being intuitive:  Nobody should have to memorize a list
                // of alphabet letters that cannot be escaped.  So we just say that backslash is *always* an
                // escape character inside a double-quoted string.
                //
                // NOTE: Dash interprets "\t" as a tab character, but Bash does not.
                if (c === '\\') {
                    this._readCharacter(); // discard the backslash
                    if (this._peekCharacter() === undefined) {
                        throw new ParseError_1.ParseError('A backslash must be followed by another character', input.getNewRange(this._currentIndex, this._currentIndex + 1));
                    }
                    // Add the escaped character
                    text += this._readCharacter();
                }
                else {
                    text += this._readCharacter();
                }
                c = this._peekCharacter();
            }
            this._readCharacter(); // consume the closing quote
            return new Token(TokenKind.DoubleQuotedText, input.getNewRange(startIndex, this._currentIndex), text);
        }
        // Is it a text token?
        if (textCharacterRegExp.test(firstChar)) {
            let text = '';
            let c = firstChar;
            do {
                if (c === '\\') {
                    this._readCharacter(); // discard the backslash
                    if (this._peekCharacter() === undefined) {
                        throw new ParseError_1.ParseError('A backslash must be followed by another character', input.getNewRange(this._currentIndex, this._currentIndex + 1));
                    }
                    // Add the escaped character
                    text += this._readCharacter();
                }
                else {
                    text += this._readCharacter();
                }
                c = this._peekCharacter();
            } while (c && textCharacterRegExp.test(c));
            return new Token(TokenKind.Text, input.getNewRange(startIndex, this._currentIndex), text);
        }
        // Is it a dollar variable?  The valid environment variable names are [A-Z_][A-Z0-9_]*
        if (firstChar === '$') {
            this._readCharacter();
            let name = this._readCharacter() || '';
            if (!startVariableCharacterRegExp.test(name)) {
                throw new ParseError_1.ParseError('The "$" symbol must be followed by a letter or underscore', input.getNewRange(startIndex, this._currentIndex));
            }
            let c = this._peekCharacter();
            while (c && variableCharacterRegExp.test(c)) {
                name += this._readCharacter();
                c = this._peekCharacter();
            }
            return new Token(TokenKind.DollarVariable, input.getNewRange(startIndex, this._currentIndex), name);
        }
        // Is it the "&&" token?
        if (firstChar === '&') {
            if (this._peekCharacterAfter() === '&') {
                this._readCharacter();
                this._readCharacter();
                return new Token(TokenKind.AndIf, input.getNewRange(startIndex, this._currentIndex));
            }
        }
        // Otherwise treat it as an "other" character
        this._readCharacter();
        return new Token(TokenKind.OtherCharacter, input.getNewRange(startIndex, this._currentIndex));
    }
    readTokens() {
        const tokens = [];
        let token = this.readToken();
        while (token.kind !== TokenKind.EndOfInput) {
            tokens.push(token);
            token = this.readToken();
        }
        return tokens;
    }
    /**
     * Retrieve the next character in the input stream.
     * @returns a string of length 1, or undefined if the end of input is reached
     */
    _readCharacter() {
        if (this._currentIndex >= this.input.end) {
            return undefined;
        }
        return this.input.buffer[this._currentIndex++];
    }
    /**
     * Return the next character in the input stream, but don't advance the stream pointer.
     * @returns a string of length 1, or undefined if the end of input is reached
     */
    _peekCharacter() {
        if (this._currentIndex >= this.input.end) {
            return undefined;
        }
        return this.input.buffer[this._currentIndex];
    }
    /**
     * Return the character after the next character in the input stream, but don't advance the stream pointer.
     * @returns a string of length 1, or undefined if the end of input is reached
     */
    _peekCharacterAfter() {
        if (this._currentIndex + 1 >= this.input.end) {
            return undefined;
        }
        return this.input.buffer[this._currentIndex + 1];
    }
}
exports.Tokenizer = Tokenizer;
//# sourceMappingURL=Tokenizer.js.map