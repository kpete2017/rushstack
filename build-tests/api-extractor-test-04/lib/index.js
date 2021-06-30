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
exports.variableDeclaration = void 0;
/**
 * api-extractor-test-04
 *
 * Test scenarios for trimming alpha/beta/internal definitions from the generated *.d.ts files.
 *
 * @packageDocumentation
 */
var AlphaClass_1 = require("./AlphaClass");
Object.defineProperty(exports, "AlphaClass", { enumerable: true, get: function () { return AlphaClass_1.AlphaClass; } });
var BetaClass_1 = require("./BetaClass");
Object.defineProperty(exports, "BetaClass", { enumerable: true, get: function () { return BetaClass_1.BetaClass; } });
var PublicClass_1 = require("./PublicClass");
Object.defineProperty(exports, "PublicClass", { enumerable: true, get: function () { return PublicClass_1.PublicClass; } });
var InternalClass_1 = require("./InternalClass");
Object.defineProperty(exports, "InternalClass", { enumerable: true, get: function () { return InternalClass_1.InternalClass; } });
var EntangledNamespace_1 = require("./EntangledNamespace");
Object.defineProperty(exports, "EntangledNamespace", { enumerable: true, get: function () { return EntangledNamespace_1.EntangledNamespace; } });
__exportStar(require("./EnumExamples"), exports);
/**
 * This is a module-scoped variable.
 * @beta
 */
exports.variableDeclaration = 'hello';
//# sourceMappingURL=index.js.map