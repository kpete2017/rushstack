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
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KeyboardLoop = void 0;
const readline = __importStar(require("readline"));
const process = __importStar(require("process"));
const node_core_library_1 = require("@rushstack/node-core-library");
// TODO: Integrate these into the AnsiEscape API in @rushstack/node-core-library
// As part of that work we should generalize the "Colors" API to support more general
// terminal escapes, and simplify the interface for that API.
const ANSI_ESCAPE_SHOW_CURSOR = '\u001B[?25l';
const ANSI_ESCAPE_HIDE_CURSOR = '\u001B[?25h';
class KeyboardLoop {
    constructor() {
        this._cursorHidden = false;
        this._onKeypress = (character, key) => {
            if (key.name === 'c' && key.ctrl && !key.meta && !key.shift) {
                // Intercept CTRL+C
                process.kill(process.pid, 'SIGINT');
                return;
            }
            try {
                this.onKeypress(character, key);
            }
            catch (error) {
                throw new node_core_library_1.InternalError('Uncaught exception in Prompter.onKeypress(): ' + error.toString());
            }
        };
        this.stdin = process.stdin;
        this.stderr = process.stderr;
    }
    get capturedInput() {
        return this._readlineInterface !== undefined;
    }
    _captureInput() {
        if (this._readlineInterface) {
            return;
        }
        this._readlineInterface = readline.createInterface({ input: this.stdin });
        readline.emitKeypressEvents(process.stdin);
        this.stdin.setRawMode(true);
        this.stdin.addListener('keypress', this._onKeypress);
    }
    _uncaptureInput() {
        if (!this._readlineInterface) {
            return;
        }
        this.stdin.removeListener('keypress', this._onKeypress);
        this.stdin.setRawMode(false);
        this._readlineInterface.close();
        this._readlineInterface = undefined;
    }
    hideCursor() {
        if (this._cursorHidden) {
            return;
        }
        this._cursorHidden = true;
        this.stderr.write(ANSI_ESCAPE_SHOW_CURSOR);
    }
    unhideCursor() {
        if (!this._cursorHidden) {
            return;
        }
        this._cursorHidden = false;
        this.stderr.write(ANSI_ESCAPE_HIDE_CURSOR);
    }
    async startAsync() {
        try {
            this._captureInput();
            this.onStart();
            await new Promise((resolve, reject) => {
                this._resolvePromise = resolve;
                this._rejectPromise = reject;
            });
        }
        finally {
            this._uncaptureInput();
            this.unhideCursor();
        }
    }
    resolveAsync() {
        if (!this._resolvePromise) {
            return;
        }
        this._resolvePromise();
        this._resolvePromise = undefined;
        this._rejectPromise = undefined;
    }
    rejectAsync(error) {
        if (!this._rejectPromise) {
            return;
        }
        this._rejectPromise(error);
        this._resolvePromise = undefined;
        this._rejectPromise = undefined;
    }
    /** @virtual */
    onStart() { }
    /** @virtual */
    onKeypress(character, key) { }
}
exports.KeyboardLoop = KeyboardLoop;
//# sourceMappingURL=KeyboardLoop.js.map