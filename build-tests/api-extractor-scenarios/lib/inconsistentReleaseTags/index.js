"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.publicFunctionReturnsBeta = exports.alphaFunctionReturnsBeta = void 0;
/**
 * It's okay for an "alpha" function to reference a "beta" symbol,
 * because "beta" is more public than "alpha".
 * @alpha
 */
function alphaFunctionReturnsBeta() {
    return { x: 123 };
}
exports.alphaFunctionReturnsBeta = alphaFunctionReturnsBeta;
/**
 * It's not okay for a "public" function to reference a "beta" symbol,
 * because "beta" is less public than "public".
 * @public
 */
function publicFunctionReturnsBeta() {
    return { x: 123 };
}
exports.publicFunctionReturnsBeta = publicFunctionReturnsBeta;
//# sourceMappingURL=index.js.map