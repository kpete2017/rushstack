"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.typedefVar = void 0;
const experimental_utils_1 = require("@typescript-eslint/experimental-utils");
const typedefVar = {
    meta: {
        type: 'problem',
        messages: {
            'expected-typedef-named': 'Expected a type annotation.',
            'expected-typedef': 'Expected {{name}} to have a type annotation.'
        },
        schema: [
            {
                type: 'object',
                additionalProperties: false
            }
        ],
        docs: {
            description: 'Supplements the "@typescript-eslint/typedef" rule by relaxing the requirements for local variables',
            category: 'Stylistic Issues',
            recommended: 'error',
            url: 'https://www.npmjs.com/package/@rushstack/eslint-plugin'
        }
    },
    create: (context) => {
        // This rule implements the variableDeclarationIgnoreFunction=true behavior from
        // @typescript-eslint/typedef
        function isVariableDeclarationIgnoreFunction(node) {
            return (node.type === experimental_utils_1.AST_NODE_TYPES.FunctionExpression ||
                node.type === experimental_utils_1.AST_NODE_TYPES.ArrowFunctionExpression);
        }
        function getNodeName(node) {
            return node.type === experimental_utils_1.AST_NODE_TYPES.Identifier ? node.name : undefined;
        }
        return {
            VariableDeclarator(node) {
                if (node.id.typeAnnotation) {
                    // An explicit type declaration was provided
                    return;
                }
                // These are @typescript-eslint/typedef exemptions
                if (node.id.type === experimental_utils_1.AST_NODE_TYPES.ArrayPattern /* ArrayDestructuring */ ||
                    node.id.type === experimental_utils_1.AST_NODE_TYPES.ObjectPattern /* ObjectDestructuring */ ||
                    (node.init && isVariableDeclarationIgnoreFunction(node.init))) {
                    return;
                }
                // Ignore this case:
                //
                //   for (const NODE of thing) { }
                let current = node.parent;
                while (current) {
                    switch (current.type) {
                        case experimental_utils_1.AST_NODE_TYPES.VariableDeclaration:
                            // Keep looking upwards
                            current = current.parent;
                            break;
                        case experimental_utils_1.AST_NODE_TYPES.ForOfStatement:
                        case experimental_utils_1.AST_NODE_TYPES.ForInStatement:
                            // Stop traversing and don't report an error
                            return;
                        default:
                            // Stop traversing
                            current = undefined;
                            break;
                    }
                }
                // Is it a local variable?
                current = node.parent;
                while (current) {
                    switch (current.type) {
                        // function f() {
                        //   const NODE = 123;
                        // }
                        case experimental_utils_1.AST_NODE_TYPES.FunctionDeclaration:
                        // class C {
                        //   public m(): void {
                        //     const NODE = 123;
                        //   }
                        // }
                        case experimental_utils_1.AST_NODE_TYPES.MethodDefinition:
                        // let f = function() {
                        //   const NODE = 123;
                        // }
                        case experimental_utils_1.AST_NODE_TYPES.FunctionExpression:
                        // let f = () => {
                        //   const NODE = 123;
                        // }
                        case experimental_utils_1.AST_NODE_TYPES.ArrowFunctionExpression:
                            // Stop traversing and don't report an error
                            return;
                    }
                    current = current.parent;
                }
                const nodeName = getNodeName(node.id);
                if (nodeName) {
                    context.report({
                        node,
                        messageId: 'expected-typedef-named',
                        data: { name: nodeName }
                    });
                }
                else {
                    context.report({
                        node,
                        messageId: 'expected-typedef'
                    });
                }
            }
        };
    }
};
exports.typedefVar = typedefVar;
//# sourceMappingURL=typedef-var.js.map