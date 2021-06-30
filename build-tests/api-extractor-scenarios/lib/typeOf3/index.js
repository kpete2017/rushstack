"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.f3 = exports.f2 = exports.f1 = void 0;
/**
 * A function that references its own parameter type.
 * @public
 */
function f1(x) {
    return x;
}
exports.f1 = f1;
/**
 * A function that indirectly references its own  parameter type.
 * @public
 */
function f2(x) {
    return 'valueOf';
}
exports.f2 = f2;
/**
 * A function that  references its own  type.
 * @public
 */
function f3() {
    return undefined;
}
exports.f3 = f3;
//# sourceMappingURL=index.js.map