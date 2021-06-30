"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
const TextRange_1 = require("../TextRange");
function escape(s) {
    return s.replace(/\n/g, '[n]').replace(/\r/g, '[r]').replace(/\t/g, '[t]');
}
function matchSnapshot(textRange) {
    for (let i = -1; i <= textRange.end + 1; ++i) {
        // Show the current character
        const c = escape(textRange.buffer.substr(Math.max(i, 0), 1))
            .replace(/\n/g, '[n]')
            .replace(/\r/g, '[r]');
        // Show the next 10 characters of context
        const context = escape(textRange.buffer.substr(Math.max(i, 0), 10));
        expect({
            c: c,
            context: context,
            i: i,
            location: textRange.getLocation(i)
        }).toMatchSnapshot();
    }
}
test('construction scenarios', () => {
    const buffer = '0123456789';
    const textRange = TextRange_1.TextRange.fromString(buffer);
    expect(textRange.toString()).toEqual(buffer);
    const subRange = textRange.getNewRange(3, 6);
    expect(subRange).toMatchSnapshot('subRange');
});
test('getLocation() basic', () => {
    const textRange = TextRange_1.TextRange.fromString([
        'L1',
        'L2',
        '',
        'L4',
        'L5+CR\rL5+CRLF\r\nL6+LFCR\n\rL7'
    ].join('\n'));
    matchSnapshot(textRange);
});
test('getLocation() empty string', () => {
    const textRange = TextRange_1.TextRange.fromString('');
    matchSnapshot(textRange);
});
test('getLocation() CR string', () => {
    const textRange = TextRange_1.TextRange.fromString('\r');
    matchSnapshot(textRange);
});
test('getLocation() LF string', () => {
    const textRange = TextRange_1.TextRange.fromString('\n');
    matchSnapshot(textRange);
});
test('getLocation() tab characters', () => {
    // Tab character advances by only one column
    const textRange = TextRange_1.TextRange.fromString('1\t3');
    matchSnapshot(textRange);
});
//# sourceMappingURL=TextRange.test.js.map