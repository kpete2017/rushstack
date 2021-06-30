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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OuterNamespace = exports.exampleFunction = exports.constVariable = void 0;
/**
 * api-extractor-test-05
 *
 * This project tests various documentation generation scenarios and
 * doc comment syntaxes.
 *
 * @packageDocumentation
 */
__exportStar(require("./DocClass1"), exports);
__exportStar(require("./DocEnums"), exports);
var DecoratorExample_1 = require("./DecoratorExample");
Object.defineProperty(exports, "DecoratorExample", { enumerable: true, get: function () { return DecoratorExample_1.DecoratorExample; } });
/**
 * An exported variable declaration.
 * @public
 */
exports.constVariable = 123;
/**
 * An exported function with hyperlinked parameters and return value.
 *
 * @param x - an API item that should get hyperlinked
 * @param y - a system type that should NOT get hyperlinked
 * @returns an interface that should get hyperlinked
 * @public
 */
function exampleFunction(x, y) {
    return undefined;
}
exports.exampleFunction = exampleFunction;
/**
 * A top-level namespace
 * @public
 */
var OuterNamespace;
(function (OuterNamespace) {
    /**
     * A nested namespace
     */
    let InnerNamespace;
    (function (InnerNamespace) {
        /**
         * A function inside a namespace
         */
        function nestedFunction(x) {
            return x;
        }
        InnerNamespace.nestedFunction = nestedFunction;
    })(InnerNamespace = OuterNamespace.InnerNamespace || (OuterNamespace.InnerNamespace = {}));
    /**
     * A variable exported from within a namespace.
     */
    OuterNamespace.nestedVariable = false;
})(OuterNamespace = exports.OuterNamespace || (exports.OuterNamespace = {}));
//# sourceMappingURL=index.js.map