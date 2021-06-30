"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
const Tokenizer_1 = require("../Tokenizer");
const Parser_1 = require("../Parser");
function escape(s) {
    return s.replace(/\n/g, '[n]').replace(/\r/g, '[r]').replace(/\t/g, '[t]').replace(/\\/g, '[b]');
}
function matchSnapshot(input) {
    const tokenizer = new Tokenizer_1.Tokenizer(input);
    const parser = new Parser_1.Parser(tokenizer);
    const result = parser.parse();
    expect({
        input: escape(tokenizer.input.toString()),
        tree: '\n' + result.getDump()
    }).toMatchSnapshot();
}
function matchErrorSnapshot(input) {
    const tokenizer = new Tokenizer_1.Tokenizer(input);
    const parser = new Parser_1.Parser(tokenizer);
    let error = undefined;
    try {
        parser.parse();
    }
    catch (e) {
        error = e;
    }
    expect({
        input: escape(tokenizer.input.toString()),
        reportedError: error
    }).toMatchSnapshot();
}
test('00: basic inputs', () => {
    matchSnapshot('command arg1 arg2');
});
test('01: basic errors', () => {
    matchErrorSnapshot('@bad');
    matchErrorSnapshot('command @bad');
});
//# sourceMappingURL=Parser.test.js.map