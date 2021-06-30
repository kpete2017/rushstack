"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
const experimental_utils_1 = require("@typescript-eslint/experimental-utils");
const typedef_var_1 = require("./typedef-var");
const { RuleTester } = experimental_utils_1.ESLintUtils;
const ruleTester = new RuleTester({
    parser: '@typescript-eslint/parser'
});
ruleTester.run('typedef-var', typedef_var_1.typedefVar, {
    invalid: [
        {
            code: 'const x = 123;',
            errors: [{ messageId: 'expected-typedef-named' }]
        },
        {
            code: 'let x = 123;',
            errors: [{ messageId: 'expected-typedef-named' }]
        },
        {
            code: 'var x = 123;',
            errors: [{ messageId: 'expected-typedef-named' }]
        },
        {
            code: '{ const x = 123; }',
            errors: [{ messageId: 'expected-typedef-named' }]
        }
    ],
    valid: [
        {
            code: 'function f() { const x = 123; }'
        },
        {
            code: 'const f = () => { const x = 123; };'
        },
        {
            code: 'const f = function() { const x = 123; }'
        },
        {
            code: 'for (const x of []) { }'
        },
        {
            // prettier-ignore
            code: [
                'let { a , b } = {',
                '  a: 123,',
                '  b: 234',
                '}',
            ].join('\n')
        },
        {
            // prettier-ignore
            code: [
                'class C {',
                '  public m(): void {',
                '    const x = 123;',
                '  }',
                '}',
            ].join('\n')
        },
        {
            // prettier-ignore
            code: [
                'class C {',
                '  public m = (): void => {',
                '    const x = 123;',
                '  }',
                '}',
            ].join('\n')
        }
    ]
});
//# sourceMappingURL=typedef-var.test.js.map