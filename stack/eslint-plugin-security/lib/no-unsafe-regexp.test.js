"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
const experimental_utils_1 = require("@typescript-eslint/experimental-utils");
const no_unsafe_regexp_1 = require("./no-unsafe-regexp");
const { RuleTester } = experimental_utils_1.ESLintUtils;
const ruleTester = new RuleTester({
    parser: '@typescript-eslint/parser'
});
ruleTester.run('no-unsafe-regexp', no_unsafe_regexp_1.noUnsafeRegExp, {
    invalid: [
        {
            // prettier-ignore
            code: [
                'function f(s: string) {',
                '  const r1 = new RegExp(s);',
                '}'
            ].join('\n'),
            errors: [{ messageId: 'error-unsafe-regexp' }]
        }
    ],
    valid: [
        {
            code: 'const r1 = new RegExp(".*");'
        }
    ]
});
//# sourceMappingURL=no-unsafe-regexp.test.js.map