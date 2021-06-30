"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
const experimental_utils_1 = require("@typescript-eslint/experimental-utils");
const no_new_null_1 = require("./no-new-null");
const { RuleTester } = experimental_utils_1.ESLintUtils;
const ruleTester = new RuleTester({
    parser: '@typescript-eslint/parser'
});
ruleTester.run('no-new-null', no_new_null_1.noNewNullRule, {
    invalid: [
        {
            code: 'type FuncAlias = (args: string | null) => void',
            errors: [{ messageId: 'error-new-usage-of-null' }]
        },
        {
            code: 'type Alias = null',
            errors: [{ messageId: 'error-new-usage-of-null' }]
        },
        {
            code: 'type ObjAlias = { field: string | null; }',
            errors: [{ messageId: 'error-new-usage-of-null' }]
        },
        {
            code: 'type Constructor = {new (args: string | null)}',
            errors: [{ messageId: 'error-new-usage-of-null' }]
        },
        {
            code: 'function nullTypeArgs(args: string | null): void {}',
            errors: [{ messageId: 'error-new-usage-of-null' }]
        },
        {
            code: 'function nullReturn(args: string): (err: Error | null) => void {}',
            errors: [{ messageId: 'error-new-usage-of-null' }]
        },
        {
            code: 'const functionExpression = function (arg: null): void {}',
            errors: [{ messageId: 'error-new-usage-of-null' }]
        },
        {
            code: 'const arrow = (args: null) => {}',
            errors: [{ messageId: 'error-new-usage-of-null' }]
        },
        {
            code: 'interface I { field: null; }',
            errors: [{ messageId: 'error-new-usage-of-null' }]
        },
        {
            code: 'const v: string | null = "hello"',
            errors: [{ messageId: 'error-new-usage-of-null' }]
        },
        {
            code: [
                'class PublicNulls {',
                '  property: string | null;',
                '  propertyFunc: (val: string | null) => void;',
                '  legacyImplicitPublic(hello: string | null): void {}',
                '  public legacyExplicitPublic(hello: string | null): void {}',
                '}'
            ].join('\n'),
            errors: [
                {
                    messageId: 'error-new-usage-of-null'
                },
                {
                    messageId: 'error-new-usage-of-null'
                },
                {
                    messageId: 'error-new-usage-of-null'
                },
                {
                    messageId: 'error-new-usage-of-null'
                }
            ]
        }
    ],
    valid: [
        {
            code: [
                'export function wrapLegacy(hello: string): void {',
                '  const innerCallback: (err: NodeJS.ErrnoException | null) => void = (e) => {};',
                '  return innerCallback(null);',
                '}'
            ].join('\n')
        },
        {
            code: [
                'function functionWithLocalVariableTypes(): void {',
                '  const match: RegExpExecArray | null = null;',
                '}'
            ].join('\n')
        },
        {
            code: [
                'class PrivateNulls {',
                '  // private pField: string | null;',
                '  private pFunc: (val: string | null) => void;',
                '  l = this.legacyPrivate(null);',
                "  // field = this.legacyPrivate('null');",
                '  private legacyPrivate(hello: string | null): void {',
                '    // this.pFunc(this.pField)',
                "    this.pFunc('hello')",
                '  }',
                '}'
            ].join('\n')
        }
    ]
});
//# sourceMappingURL=no-new-null.test.js.map