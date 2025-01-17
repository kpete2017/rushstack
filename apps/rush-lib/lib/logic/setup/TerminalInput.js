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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TerminalInput = void 0;
const readline = __importStar(require("readline"));
const process = __importStar(require("process"));
const safe_1 = __importDefault(require("colors/safe"));
const node_core_library_1 = require("@rushstack/node-core-library");
const KeyboardLoop_1 = require("./KeyboardLoop");
class YesNoKeyboardLoop extends KeyboardLoop_1.KeyboardLoop {
    constructor(options) {
        super();
        this.result = undefined;
        this.options = options;
    }
    onStart() {
        this.stderr.write(safe_1.default.green('==>') + ' ');
        this.stderr.write(safe_1.default.bold(this.options.message));
        let optionSuffix = '';
        switch (this.options.defaultValue) {
            case true:
                optionSuffix = '(Y/n)';
                break;
            case false:
                optionSuffix = '(y/N)';
                break;
            default:
                optionSuffix = '(y/n)';
                break;
        }
        this.stderr.write(' ' + safe_1.default.bold(optionSuffix) + ' ');
    }
    onKeypress(character, key) {
        if (this.result !== undefined) {
            return;
        }
        switch (key.name) {
            case 'y':
                this.result = true;
                break;
            case 'n':
                this.result = false;
                break;
            case 'enter':
            case 'return':
                if (this.options.defaultValue !== undefined) {
                    this.result = this.options.defaultValue;
                }
                break;
        }
        if (this.result !== undefined) {
            this.stderr.write(this.result ? 'Yes\n' : 'No\n');
            this.resolveAsync();
            return;
        }
    }
}
class PasswordKeyboardLoop extends KeyboardLoop_1.KeyboardLoop {
    constructor(options) {
        super();
        this._startX = 0;
        this._printedY = 0;
        this._lastPrintedLength = 0;
        this.result = '';
        this._options = options;
        this._passwordCharacter =
            this._options.passwordCharacter === undefined ? '*' : this._options.passwordCharacter.substr(0, 1);
    }
    _getLineWrapWidth() {
        return this.stderr.columns ? this.stderr.columns : 80;
    }
    onStart() {
        this.result = '';
        readline.cursorTo(this.stderr, 0);
        readline.clearLine(this.stderr, 1);
        const prefix = safe_1.default.green('==>') + ' ' + safe_1.default.bold(this._options.message) + ' ';
        this.stderr.write(prefix);
        let lineStartIndex = prefix.lastIndexOf('\n');
        if (lineStartIndex < 0) {
            lineStartIndex = 0;
        }
        const line = prefix.substring(lineStartIndex);
        this._startX = node_core_library_1.AnsiEscape.removeCodes(line).length % this._getLineWrapWidth();
    }
    onKeypress(character, key) {
        switch (key.name) {
            case 'enter':
            case 'return':
                if (this._passwordCharacter !== '') {
                    // To avoid disclosing the length of the password, after the user presses ENTER,
                    // replace the "*********" sequence with exactly three stars ("***").
                    this._render(this._passwordCharacter.repeat(3));
                }
                this.stderr.write('\n');
                this.resolveAsync();
                return;
            case 'backspace':
                this.result = this.result.substring(0, this.result.length - 1);
                this._render(this.result);
                break;
            default:
                let printable = true;
                if (character === '') {
                    printable = false;
                }
                else if (key.name && key.name.length !== 1 && key.name !== 'space') {
                    printable = false;
                }
                else if (!key.name && !key.sequence) {
                    printable = false;
                }
                if (printable) {
                    this.result += character;
                    this._render(this.result);
                }
        }
    }
    _render(text) {
        // Optimize rendering when we don't need to erase anything
        const needsClear = text.length < this._lastPrintedLength;
        this._lastPrintedLength = text.length;
        this.hideCursor();
        // Restore Y
        while (this._printedY > 0) {
            readline.cursorTo(this.stderr, 0);
            if (needsClear) {
                readline.clearLine(this.stderr, 1);
            }
            readline.moveCursor(this.stderr, 0, -1);
            --this._printedY;
        }
        // Restore X
        readline.cursorTo(this.stderr, this._startX);
        let i = 0;
        let column = this._startX;
        this._printedY = 0;
        let buffer = '';
        while (i < text.length) {
            if (this._passwordCharacter === '') {
                buffer += text.substr(i, 1);
            }
            else {
                buffer += this._passwordCharacter;
            }
            ++i;
            ++column;
            // -1 to avoid weird TTY behavior in final column
            if (column >= this._getLineWrapWidth() - 1) {
                column = 0;
                ++this._printedY;
                buffer += '\n';
            }
        }
        this.stderr.write(buffer);
        if (needsClear) {
            readline.clearLine(this.stderr, 1);
        }
        this.unhideCursor();
    }
}
class TerminalInput {
    static async _readLine() {
        const readlineInterface = readline.createInterface({ input: process.stdin });
        try {
            return await new Promise((resolve, reject) => {
                readlineInterface.question('', (answer) => {
                    resolve(answer);
                });
            });
        }
        finally {
            readlineInterface.close();
        }
    }
    static async promptYesNo(options) {
        const keyboardLoop = new YesNoKeyboardLoop(options);
        await keyboardLoop.startAsync();
        return keyboardLoop.result;
    }
    static async promptLine(options) {
        const stderr = process.stderr;
        stderr.write(safe_1.default.green('==>') + ' ');
        stderr.write(safe_1.default.bold(options.message));
        stderr.write(' ');
        return await TerminalInput._readLine();
    }
    static async promptPasswordLine(options) {
        const keyboardLoop = new PasswordKeyboardLoop(options);
        await keyboardLoop.startAsync();
        return keyboardLoop.result;
    }
}
exports.TerminalInput = TerminalInput;
//# sourceMappingURL=TerminalInput.js.map