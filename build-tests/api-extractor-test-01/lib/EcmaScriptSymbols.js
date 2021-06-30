"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClassWithSymbols = exports.ANamespace = exports.fullyExportedCustomSymbol = exports.locallyExportedCustomSymbol = void 0;
/// <reference lib="es2015.symbol.wellknown" />
const unexportedCustomSymbol = Symbol('unexportedCustomSymbol');
exports.locallyExportedCustomSymbol = Symbol('locallyExportedCustomSymbol');
/** @public */
exports.fullyExportedCustomSymbol = Symbol('fullyExportedCustomSymbol');
// NOTE: named 'ANamespace' so that it appears earlier in the rollup .d.ts file, due to
// https://github.com/microsoft/TypeScript/issues/31746
/** @public */
var ANamespace;
(function (ANamespace) {
    ANamespace.locallyExportedCustomSymbol = Symbol('locallyExportedCustomSymbol');
    /** @public */
    ANamespace.fullyExportedCustomSymbol = Symbol('fullyExportedCustomSymbol');
})(ANamespace = exports.ANamespace || (exports.ANamespace = {}));
/**
 * @public
 */
class ClassWithSymbols {
    constructor() {
        this[_a] = 123;
    }
    get [(_a = unexportedCustomSymbol, exports.locallyExportedCustomSymbol)]() {
        return 'hello';
    }
    [exports.fullyExportedCustomSymbol]() { }
    get [ANamespace.locallyExportedCustomSymbol]() {
        return 'hello';
    }
    [ANamespace.fullyExportedCustomSymbol]() { }
    get [Symbol.toStringTag]() {
        return 'ClassWithSymbols';
    }
}
exports.ClassWithSymbols = ClassWithSymbols;
//# sourceMappingURL=EcmaScriptSymbols.js.map