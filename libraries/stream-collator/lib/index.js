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
/**
 * This library enables a tool to display live console output from multiple concurrent processes,
 * while ensuring that their output does not get jumbled together.
 *
 * @remarks
 *
 * For more info, please see the package {@link https://www.npmjs.com/package/@rushstack/stream-collator
 * | README}.
 *
 * @packageDocumentation
 */
__exportStar(require("./CollatedTerminal"), exports);
__exportStar(require("./CollatedWriter"), exports);
__exportStar(require("./StreamCollator"), exports);
//# sourceMappingURL=index.js.map