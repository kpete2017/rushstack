"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
const node_core_library_1 = require("@rushstack/node-core-library");
const NormalizeNewlinesTextRewriter_1 = require("../NormalizeNewlinesTextRewriter");
function testCase(input) {
    const matcher = new NormalizeNewlinesTextRewriter_1.NormalizeNewlinesTextRewriter({
        newlineKind: "\n" /* Lf */
    });
    const state = matcher.initialize();
    let result = '';
    for (let i = 0; i < input.length; ++i) {
        result += matcher.process(state, input[i]);
    }
    result += matcher.close(state);
    expect(result).toEqual(node_core_library_1.Text.convertToLf(input));
}
describe('NormalizeNewlinesTextRewriter', () => {
    it('should duplicate Text.convertToLf()', () => {
        testCase('');
        testCase('\n');
        testCase('\r');
        testCase('\n\n');
        testCase('\r\n');
        testCase('\n\r');
        testCase('\r\r');
        testCase('\n\n\n');
        testCase('\r\n\n');
        testCase('\n\r\n');
        testCase('\r\r\n');
        testCase('\n\n\r');
        testCase('\r\n\r');
        testCase('\n\r\r');
        testCase('\r\r\r');
        testCase('\nX\n\r');
        testCase('\rX\r');
        testCase('\r \n');
    });
});
//# sourceMappingURL=NormalizeNewlinesTextRewriter.test.js.map