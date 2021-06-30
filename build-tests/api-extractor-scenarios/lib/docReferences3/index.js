"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.succeedWithExternalReference = exports.succeedWithSelector = exports.failWithAmbiguity = exports.A = void 0;
/** @public */
var A;
(function (A) {
    class B {
        myMethod() { }
    }
    A.B = B;
})(A = exports.A || (exports.A = {}));
/**
 * {@link MyNamespace.MyClass.myMethod | the method}
 * @public
 */
function failWithAmbiguity() { }
exports.failWithAmbiguity = failWithAmbiguity;
/**
 * {@link (A:namespace).B.myMethod | the method}
 * {@link (A:interface).myProperty | the property}
 * @public
 */
function succeedWithSelector() { }
exports.succeedWithSelector = succeedWithSelector;
/**
 * NOTE: The broken link checker currently is not able to validate references to external packages.
 * Tracked by:  https://github.com/microsoft/rushstack/issues/1195
 * {@link nonexistent#nonexistent}
 * @public
 */
function succeedWithExternalReference() { }
exports.succeedWithExternalReference = succeedWithExternalReference;
//# sourceMappingURL=index.js.map