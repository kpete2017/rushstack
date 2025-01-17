"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.noNewNullRule = void 0;
const experimental_utils_1 = require("@typescript-eslint/experimental-utils");
const noNewNullRule = {
    meta: {
        type: 'problem',
        messages: {
            'error-new-usage-of-null': 'Usage of "null" is deprecated except when describing legacy APIs; use "undefined" instead'
        },
        schema: [
            {
                type: 'object',
                additionalProperties: false
            }
        ],
        docs: {
            description: 'Prevent usage of JavaScript\'s "null" keyword in new type declarations. To avoid hampering usage' +
                ' of preexisting APIs that require "null", the rule ignores declarations that are local variables,' +
                ' private members, or types that are not exported.',
            category: 'Stylistic Issues',
            recommended: 'error',
            url: 'https://www.npmjs.com/package/@rushstack/eslint-plugin'
        }
    },
    create: (context) => {
        /**
         * Returns true if the accessibility is not explicitly set to private or protected, e.g. class properties, methods.
         */
        function isPubliclyAccessible(node) {
            const accessibility = node === null || node === void 0 ? void 0 : node.accessibility;
            return !(accessibility === 'private' || accessibility === 'protected');
        }
        /**
         * Let's us check the accessibility field of certain types of nodes
         */
        function isAccessible(node) {
            if (!node) {
                return false;
            }
            switch (node.type) {
                case experimental_utils_1.AST_NODE_TYPES.MethodDefinition:
                    return true;
                case experimental_utils_1.AST_NODE_TYPES.ClassProperty:
                    return true;
                case experimental_utils_1.AST_NODE_TYPES.TSIndexSignature:
                    return true;
                case experimental_utils_1.AST_NODE_TYPES.TSParameterProperty:
                    return true;
                default:
                    return false;
            }
        }
        /**
         * Checks if the type declaration is lifted to be exportable to others
         */
        function isDefinitionExportable(node) {
            switch (node === null || node === void 0 ? void 0 : node.type) {
                case undefined: // base case
                    return false;
                case experimental_utils_1.AST_NODE_TYPES.BlockStatement: // we are an inline function, scope is not exportable
                    return false;
                case experimental_utils_1.AST_NODE_TYPES.ExportNamedDeclaration: // our definition is being exported
                    return true;
                case experimental_utils_1.AST_NODE_TYPES.Program: // our definition can be exported
                    return true;
                default:
                    if (isAccessible(node)) {
                        // only fail when class method/constructor is accessible publicly
                        return isPubliclyAccessible(node);
                    }
                    return isDefinitionExportable(node === null || node === void 0 ? void 0 : node.parent);
            }
        }
        /**
         * Returns true if this type definition exposes a null type
         */
        function isNewNull(node) {
            switch (node === null || node === void 0 ? void 0 : node.type) {
                case undefined:
                    return false;
                case experimental_utils_1.AST_NODE_TYPES.TSTypeAnnotation:
                    return isDefinitionExportable(node.parent);
                case experimental_utils_1.AST_NODE_TYPES.TSTypeAliasDeclaration:
                    return isDefinitionExportable(node.parent);
                default:
                    return isNewNull(node === null || node === void 0 ? void 0 : node.parent);
            }
        }
        return {
            TSNullKeyword(node) {
                if (isNewNull(node.parent)) {
                    context.report({ node, messageId: 'error-new-usage-of-null' });
                }
            }
        };
    }
};
exports.noNewNullRule = noNewNullRule;
//# sourceMappingURL=no-new-null.js.map