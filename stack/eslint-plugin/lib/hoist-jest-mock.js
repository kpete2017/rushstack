"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hoistJestMock = void 0;
const experimental_utils_1 = require("@typescript-eslint/experimental-utils");
const hoistJestMockPatterns = __importStar(require("./hoistJestMockPatterns"));
// Jest APIs that need to be hoisted
// Based on HOIST_METHODS from ts-jest
const HOIST_METHODS = ['mock', 'unmock', 'enableAutomock', 'disableAutomock', 'deepUnmock'];
const hoistJestMock = {
    meta: {
        type: 'problem',
        messages: {
            'error-unhoisted-jest-mock': "Jest's module mocking APIs must be called before regular imports. Move this call so that it precedes" +
                ' the import found on line {{importLine}}.'
        },
        schema: [
            {
                type: 'object',
                additionalProperties: false
            }
        ],
        docs: {
            description: 'Require Jest module mocking APIs to be called before other modules are imported.' +
                ' Jest module mocking APIs such as "jest.mock(\'./example\')" must be called before the associated module' +
                ' is imported, otherwise they will have no effect. Transpilers such as ts-jest and babel-jest automatically' +
                ' "hoist" these calls, however this can produce counterintuitive results. Instead, the hoist-jest-mocks' +
                ' lint rule requires developers to manually hoist these calls. For technical background, please read the' +
                ' Jest documentation here: https://jestjs.io/docs/en/es6-class-mocks',
            category: 'Possible Errors',
            recommended: 'error',
            url: 'https://www.npmjs.com/package/@rushstack/eslint-plugin'
        }
    },
    create: (context) => {
        // Returns true for a statement such as "jest.mock()" that needs to precede
        // module imports (i.e. be "hoisted").
        function isHoistableJestCall(node) {
            if (node === undefined) {
                return false;
            }
            const captures = {};
            if (hoistJestMockPatterns.jestCallExpression.match(node, captures)) {
                if (captures.methodName && HOIST_METHODS.indexOf(captures.methodName) >= 0) {
                    return true;
                }
            }
            // Recurse into some common expression-combining syntaxes
            switch (node.type) {
                case experimental_utils_1.AST_NODE_TYPES.CallExpression:
                    return isHoistableJestCall(node.callee);
                case experimental_utils_1.AST_NODE_TYPES.MemberExpression:
                    return isHoistableJestCall(node.object);
                case experimental_utils_1.AST_NODE_TYPES.LogicalExpression:
                    return isHoistableJestCall(node.left) || isHoistableJestCall(node.right);
            }
            return false;
        }
        // Given part of an expression, walk upwards in the tree and find the containing statement
        function findOuterStatement(node) {
            let current = node;
            while (current.parent) {
                switch (current.parent.type) {
                    // Statements are always found inside a block:
                    case experimental_utils_1.AST_NODE_TYPES.Program:
                    case experimental_utils_1.AST_NODE_TYPES.BlockStatement:
                    case experimental_utils_1.AST_NODE_TYPES.TSModuleBlock:
                        return current;
                }
                current = current.parent;
            }
            return node;
        }
        // This tracks the first require() or import expression that we found in the file.
        let firstImportNode = undefined;
        // Avoid reporting more than one error for a given statement.
        // Example: jest.mock('a').mock('b');
        const reportedStatements = new Set();
        return {
            CallExpression: (node) => {
                if (firstImportNode === undefined) {
                    // EXAMPLE:  const x = require('x')
                    if (hoistJestMockPatterns.requireCallExpression.match(node)) {
                        firstImportNode = node;
                    }
                }
                if (firstImportNode) {
                    // EXAMPLE:  jest.mock()
                    if (isHoistableJestCall(node)) {
                        const outerStatement = findOuterStatement(node);
                        if (!reportedStatements.has(outerStatement)) {
                            reportedStatements.add(outerStatement);
                            context.report({
                                node,
                                messageId: 'error-unhoisted-jest-mock',
                                data: { importLine: firstImportNode.loc.start.line }
                            });
                        }
                    }
                }
            },
            ImportExpression: (node) => {
                if (firstImportNode === undefined) {
                    // EXAMPLE:  const x = import('x');
                    if (hoistJestMockPatterns.importExpression.match(node)) {
                        firstImportNode = node;
                    }
                }
            },
            ImportDeclaration: (node) => {
                if (firstImportNode === undefined) {
                    // EXAMPLE:  import { X } from "Y";
                    // IGNORE:   import type { X } from "Y";
                    if (node.importKind !== 'type') {
                        firstImportNode = node;
                    }
                }
            },
            ExportDeclaration: (node) => {
                if (firstImportNode === undefined) {
                    // EXAMPLE: export * from "Y";
                    // IGNORE:  export type { Y } from "Y";
                    if (node.exportKind !== 'type') {
                        firstImportNode = node;
                    }
                }
            },
            TSImportEqualsDeclaration: (node) => {
                if (firstImportNode === undefined) {
                    // EXAMPLE:  import x = require("x");
                    firstImportNode = node;
                }
            }
        };
    }
};
exports.hoistJestMock = hoistJestMock;
//# sourceMappingURL=hoist-jest-mock.js.map