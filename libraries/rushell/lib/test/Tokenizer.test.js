"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
const Tokenizer_1 = require("../Tokenizer");
function escape(s) {
    return s.replace(/\n/g, '[n]').replace(/\r/g, '[r]').replace(/\t/g, '[t]').replace(/\\/g, '[b]');
}
function tokenize(input) {
    const tokenizer = new Tokenizer_1.Tokenizer(input);
    return tokenizer.readTokens();
}
function matchSnapshot(input) {
    const tokenizer = new Tokenizer_1.Tokenizer(input);
    const reportedTokens = tokenizer.readTokens().map((token) => {
        return {
            kind: Tokenizer_1.TokenKind[token.kind],
            value: escape(token.toString())
        };
    });
    expect({
        input: escape(tokenizer.input.toString()),
        tokens: reportedTokens
    }).toMatchSnapshot();
}
test('00: empty inputs', () => {
    matchSnapshot('');
    matchSnapshot('\r\n');
});
test('01: white space tokens', () => {
    matchSnapshot(' \t abc   \r\ndef  \n  ghi\n\r  ');
});
test('02: text with escapes', () => {
    matchSnapshot(' ab+56\\>qrst(abc\\))');
    expect(() => tokenize('Unterminated: \\')).toThrowError();
});
test('03: The && operator', () => {
    matchSnapshot('&&abc&&cde&&');
    matchSnapshot('a&b');
    matchSnapshot('&&');
    matchSnapshot('&');
});
test('04: dollar variables', () => {
    matchSnapshot('$abc123.456');
    matchSnapshot('$ab$_90');
    expect(() => tokenize('$')).toThrowError();
    expect(() => tokenize('${abc}')).toThrowError();
});
test('05: double-quoted strings', () => {
    matchSnapshot('what "is" is');
    matchSnapshot('what"is"is');
    matchSnapshot('what"is\\""is');
    matchSnapshot('no C-style escapes: "\\t\\r\\n"');
    expect(() => tokenize('Unterminated: "')).toThrowError();
    expect(() => tokenize('Unterminated: "abc')).toThrowError();
    expect(() => tokenize('Unterminated: "abc\\')).toThrowError();
});
//# sourceMappingURL=Tokenizer.test.js.map