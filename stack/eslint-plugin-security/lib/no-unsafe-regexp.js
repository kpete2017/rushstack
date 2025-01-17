"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.noUnsafeRegExp = void 0;
const experimental_utils_1 = require("@typescript-eslint/experimental-utils");
const tree_pattern_1 = require("@rushstack/tree-pattern");
// Matches an expression like this:
//   new RegExp('hello');
//
// Tree:
//   {
//     "type": "NewExpression",
//     "callee": {
//       "type": "Identifier",
//       "name": "RegExp"
//     },
//     "arguments": [
//       {
//         "type": "Literal",
//         "raw": "'\"hello\"'",
//         "value": "\"hello\""
//       }
//     ]
//   }
const newRegExpPattern = new tree_pattern_1.TreePattern({
    type: 'NewExpression',
    callee: {
        type: 'Identifier',
        name: 'RegExp'
    },
    arguments: tree_pattern_1.TreePattern.tag('constructorArgs')
});
const noUnsafeRegExp = {
    meta: {
        type: 'problem',
        messages: {
            'error-unsafe-regexp': 'Regular expressions should be constructed from string constants. Dynamically building strings' +
                ' at runtime may introduce security vulnerabilities, performance concerns, and bugs involving' +
                ' incorrect escaping of special characters.'
        },
        schema: [
            {
                type: 'object',
                additionalProperties: false
            }
        ],
        docs: {
            description: 'Requires regular expressions to be constructed from string constants rather than dynamically' +
                ' building strings at runtime.',
            category: 'Best Practices',
            recommended: 'warn',
            url: 'https://www.npmjs.com/package/@rushstack/eslint-plugin-security'
        }
    },
    create: (context) => {
        return {
            NewExpression: (node) => {
                const captures = {};
                if (newRegExpPattern.match(node, captures) && captures.constructorArgs) {
                    if (captures.constructorArgs.length > 0 &&
                        captures.constructorArgs[0].type !== experimental_utils_1.AST_NODE_TYPES.Literal) {
                        context.report({
                            node,
                            messageId: 'error-unsafe-regexp'
                        });
                    }
                }
            }
        };
    }
};
exports.noUnsafeRegExp = noUnsafeRegExp;
//# sourceMappingURL=no-unsafe-regexp.js.map