"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
const TreePattern_1 = require("./TreePattern");
const pattern1 = new TreePattern_1.TreePattern({
    a: [
        1,
        2,
        TreePattern_1.TreePattern.tag('branch', {
            b: []
        })
    ]
});
const pattern2 = new TreePattern_1.TreePattern({
    c: TreePattern_1.TreePattern.oneOf([
        123,
        {
            d: 1
        }
    ])
});
describe('TreePattern', () => {
    test('matches using a tag', () => {
        const tree1 = {
            a: [
                1,
                2,
                {
                    b: [],
                    extra: 'hi'
                }
            ],
            b: 123
        };
        const captures = {};
        expect(pattern1.match(tree1, captures)).toBe(true);
        expect(captures.branch).toMatchObject({
            b: [],
            extra: 'hi'
        });
    });
    test('matches alternatives', () => {
        const tree2a = {
            c: 123
        };
        expect(pattern2.match(tree2a)).toBe(true);
        const tree2b = {
            c: { d: 1 }
        };
        expect(pattern2.match(tree2b)).toBe(true);
        const tree2c = {
            c: 321
        };
        expect(pattern2.match(tree2c)).toBe(false);
    });
});
//# sourceMappingURL=TreePattern.test.js.map