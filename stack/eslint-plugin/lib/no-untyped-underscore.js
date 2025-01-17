"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.noUntypedUnderscoreRule = void 0;
const noUntypedUnderscoreRule = {
    meta: {
        type: 'problem',
        messages: {
            'error-untyped-underscore': 'This expression appears to access a private member "{{memberName}}"; ' +
                'either remove the underscore prefix or else declare a type for the containing object'
        },
        schema: [],
        docs: {
            description: 'Prevent TypeScript code from accessing legacy JavaScript members' +
                ' whose names have an underscore prefix',
            category: 'Stylistic Issues',
            recommended: false,
            url: 'https://www.npmjs.com/package/@rushstack/eslint-plugin'
        }
    },
    create: (context) => {
        const parserServices = context.parserServices;
        if (!parserServices || !parserServices.program || !parserServices.esTreeNodeToTSNodeMap) {
            throw new Error('This rule requires your ESLint configuration to define the "parserOptions.project"' +
                ' property for "@typescript-eslint/parser".');
        }
        const typeChecker = parserServices.program.getTypeChecker();
        return {
            MemberExpression: function (node) {
                // Is it an expression like "x.y"?
                // Ignore expressions such as "super.y", "this.y", and "that.y"
                const memberObject = node.object;
                if (memberObject) {
                    if (memberObject.type === 'Super' || memberObject.type === 'ThisExpression') {
                        return; // no match
                    }
                    if (memberObject.type === 'Identifier') {
                        if (memberObject.name === 'this' || memberObject.name == 'that') {
                            return; // no match
                        }
                    }
                }
                // Does the member name start with an underscore?  (e.g. "x._y")
                if (node.property && node.property.type === 'Identifier') {
                    const memberName = node.property.name;
                    if (memberName && memberName[0] === '_') {
                        // Do we have type information for the property (e.g. "_y")?
                        //
                        // Examples where propertyType is defined:
                        //
                        //    let x: { _y: any };
                        //    let x: {
                        //      _y: boolean;
                        //      [key: string]: number;
                        //    };
                        //
                        // Examples with propertyType=undefined:
                        //    let x: any;
                        //    let x: { [key: string]: number };
                        //
                        let propertyType = undefined;
                        const memberObjectNode = parserServices.esTreeNodeToTSNodeMap.get(node.object);
                        if (memberObjectNode) {
                            const memberObjectType = typeChecker.getTypeAtLocation(memberObjectNode);
                            if (memberObjectType) {
                                propertyType = memberObjectType.getProperty(memberName);
                            }
                        }
                        // TypeScript's type system already sufficiently restricts access to private members.
                        // Thus, this ESLint rule only considers untyped code such as a legacy JavaScript API.
                        if (!propertyType) {
                            context.report({
                                node,
                                messageId: 'error-untyped-underscore',
                                data: { memberName: memberName }
                            });
                        }
                    }
                }
            }
        };
    }
};
exports.noUntypedUnderscoreRule = noUntypedUnderscoreRule;
//# sourceMappingURL=no-untyped-underscore.js.map