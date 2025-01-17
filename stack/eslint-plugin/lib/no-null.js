"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.noNullRule = void 0;
const noNullRule = {
    meta: {
        type: 'problem',
        messages: {
            'error-usage-of-null': 'Usage of "null" is deprecated except when received from legacy APIs; use "undefined" instead'
        },
        schema: [],
        docs: {
            description: 'Prevent usage of JavaScript\'s "null" keyword',
            category: 'Stylistic Issues',
            recommended: 'error',
            url: 'https://www.npmjs.com/package/@rushstack/eslint-plugin'
        }
    },
    create: (context) => {
        return {
            Literal: function (node) {
                // Is it a "null" literal?
                if (node.value === null) {
                    // Does the "null" appear in a comparison such as "if (x === null)"?
                    let isComparison = false;
                    if (node.parent && node.parent.type === 'BinaryExpression') {
                        const operator = node.parent.operator;
                        isComparison = operator === '!==' || operator === '===' || operator === '!=' || operator === '==';
                    }
                    if (!isComparison) {
                        context.report({ node, messageId: 'error-usage-of-null' });
                    }
                }
            }
        };
    }
};
exports.noNullRule = noNullRule;
//# sourceMappingURL=no-null.js.map