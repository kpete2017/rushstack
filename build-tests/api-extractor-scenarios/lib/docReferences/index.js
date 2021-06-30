"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.failWithMissingReference = exports.failWithBrokenLink = exports.succeedForNow = exports.testSimple = exports.MyNamespace = void 0;
/**
 * @public
 */
var MyNamespace;
(function (MyNamespace) {
    class MyClass {
        /**
         * Summary for myMethod
         * @remarks
         * Remarks for myMethod
         * @param x - the parameter
         * @returns a number
         * @beta
         */
        myMethod(x) {
            return x;
        }
    }
    MyNamespace.MyClass = MyClass;
})(MyNamespace = exports.MyNamespace || (exports.MyNamespace = {}));
/**
 * {@inheritDoc MyNamespace.MyClass.myMethod}
 * @privateRemarks
 * The MyClass.myMethod documentation content will get copied,
 * but its `@beta` tag will not get copied.
 * @public
 */
function testSimple() { }
exports.testSimple = testSimple;
/**
 * {@inheritDoc nonexistent-package#MyNamespace.MyClass.nonExistentMethod}
 *
 * @privateRemarks
 * succeedForNow() should fail due to a broken link, but it's ignored until we fix this issue:
 * https://github.com/microsoft/rushstack/issues/1195
 *
 * @public
 */
function succeedForNow() { }
exports.succeedForNow = succeedForNow;
/**
 * {@inheritDoc MyNamespace.MyClass.nonExistentMethod}
 * @public
 */
function failWithBrokenLink() { }
exports.failWithBrokenLink = failWithBrokenLink;
/**
 * {@inheritDoc}
 * @public
 */
function failWithMissingReference() { }
exports.failWithMissingReference = failWithMissingReference;
//# sourceMappingURL=index.js.map