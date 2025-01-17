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
 * This library implements a system for processing human readable text that
 * will be output by console applications.
 *
 * @remarks
 * See the {@link TerminalWritable} documentation for an overview of the major concepts.
 *
 * @packageDocumentation
 */
__exportStar(require("./CallbackWritable"), exports);
__exportStar(require("./DiscardStdoutTransform"), exports);
__exportStar(require("./ITerminalChunk"), exports);
__exportStar(require("./MockWritable"), exports);
__exportStar(require("./NormalizeNewlinesTextRewriter"), exports);
__exportStar(require("./PrintUtilities"), exports);
__exportStar(require("./RemoveColorsTextRewriter"), exports);
__exportStar(require("./SplitterTransform"), exports);
__exportStar(require("./StdioLineTransform"), exports);
__exportStar(require("./StdioSummarizer"), exports);
__exportStar(require("./StdioWritable"), exports);
__exportStar(require("./TerminalTransform"), exports);
__exportStar(require("./TerminalWritable"), exports);
__exportStar(require("./TextRewriter"), exports);
__exportStar(require("./TextRewriterTransform"), exports);
//# sourceMappingURL=index.js.map