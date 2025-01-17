"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.CollatedTerminal = void 0;
/**
 * This API was introduced as a temporary measure.
 * @deprecated Very soon we plan to replace this with the `Terminal` API from `@rushstack/node-core-library`.
 * @beta
 */
class CollatedTerminal {
    constructor(destination) {
        this._destination = destination;
    }
    writeChunk(chunk) {
        this._destination.writeChunk(chunk);
    }
    writeStdoutLine(message) {
        this._destination.writeChunk({ text: message + '\n', kind: "O" /* Stdout */ });
    }
    writeStderrLine(message) {
        this._destination.writeChunk({ text: message + '\n', kind: "E" /* Stderr */ });
    }
}
exports.CollatedTerminal = CollatedTerminal;
//# sourceMappingURL=CollatedTerminal.js.map