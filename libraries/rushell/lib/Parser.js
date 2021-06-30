"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.Parser = void 0;
const ParseError_1 = require("./ParseError");
const Tokenizer_1 = require("./Tokenizer");
const AstNode_1 = require("./AstNode");
class Parser {
    constructor(tokenizer) {
        this._tokenizer = tokenizer;
        this._peekedToken = undefined;
    }
    parse() {
        const script = new AstNode_1.AstScript();
        const startingToken = this._peekToken();
        const astCommand = this._parseCommand();
        if (!astCommand) {
            throw new ParseError_1.ParseError('Expecting a command', startingToken.range);
        }
        const nextToken = this._peekToken();
        if (nextToken.kind !== Tokenizer_1.TokenKind.EndOfInput) {
            throw new ParseError_1.ParseError(`Unexpected token: ${Tokenizer_1.TokenKind[nextToken.kind]}`, nextToken.range);
        }
        script.body = astCommand;
        return script;
    }
    _parseCommand() {
        this._skipWhitespace();
        const startingToken = this._peekToken();
        const command = new AstNode_1.AstCommand();
        command.commandPath = this._parseCompoundWord();
        if (!command.commandPath) {
            throw new ParseError_1.ParseError('Expecting a command path', startingToken.range);
        }
        while (this._skipWhitespace()) {
            const compoundWord = this._parseCompoundWord();
            if (!compoundWord) {
                break;
            }
            command.arguments.push(compoundWord);
        }
        return command;
    }
    _parseCompoundWord() {
        const compoundWord = new AstNode_1.AstCompoundWord();
        for (;;) {
            const node = this._parseText();
            if (!node) {
                break;
            }
            compoundWord.parts.push(node);
        }
        if (compoundWord.parts.length === 0) {
            // We didn't parse a word
            return undefined;
        }
        return compoundWord;
    }
    _parseText() {
        const token = this._peekToken();
        if (token.kind === Tokenizer_1.TokenKind.Text) {
            this._readToken();
            const astText = new AstNode_1.AstText();
            astText.token = token;
            astText.range = token.range;
            return astText;
        }
        return undefined;
    }
    /**
     * Skips any whitespace tokens.  Returns true if any whitespace was actually encountered.
     */
    _skipWhitespace() {
        let sawWhitespace = false;
        while (this._peekToken().kind === Tokenizer_1.TokenKind.Spaces) {
            this._readToken();
            sawWhitespace = true;
        }
        if (this._peekToken().kind === Tokenizer_1.TokenKind.EndOfInput) {
            sawWhitespace = true;
        }
        return sawWhitespace;
    }
    _readToken() {
        if (this._peekedToken) {
            const token = this._peekedToken;
            this._peekedToken = undefined;
            return token;
        }
        else {
            return this._tokenizer.readToken();
        }
    }
    _peekToken() {
        if (!this._peekedToken) {
            this._peekedToken = this._tokenizer.readToken();
        }
        return this._peekedToken;
    }
}
exports.Parser = Parser;
//# sourceMappingURL=Parser.js.map