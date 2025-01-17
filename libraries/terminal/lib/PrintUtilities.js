"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrintUtilities = exports.DEFAULT_CONSOLE_WIDTH = void 0;
const wordwrap_1 = __importDefault(require("wordwrap"));
/**
 * A sensible fallback column width for consoles.
 *
 * @public
 */
exports.DEFAULT_CONSOLE_WIDTH = 80;
/**
 * A collection of utilities for printing messages to the console.
 *
 * @public
 */
class PrintUtilities {
    /**
     * Returns the width of the console, measured in columns
     */
    static getConsoleWidth() {
        const stdout = process.stdout;
        if (stdout && stdout.columns) {
            return stdout.columns;
        }
    }
    /**
     * Applies word wrapping.  If maxLineLength is unspecified, then it defaults to the
     * console width.
     */
    static wrapWords(text, maxLineLength, indent) {
        if (!indent) {
            indent = 0;
        }
        if (!maxLineLength) {
            maxLineLength = PrintUtilities.getConsoleWidth() || exports.DEFAULT_CONSOLE_WIDTH;
        }
        const wrap = wordwrap_1.default(indent, maxLineLength, { mode: 'soft' });
        return wrap(text);
    }
    /**
     * Displays a message in the console wrapped in a box UI.
     *
     * @param boxWidth - The width of the box, defaults to half of the console width.
     */
    static printMessageInBox(message, terminal, boxWidth) {
        if (!boxWidth) {
            const consoleWidth = PrintUtilities.getConsoleWidth() || exports.DEFAULT_CONSOLE_WIDTH;
            boxWidth = Math.floor(consoleWidth / 2);
        }
        const maxLineLength = boxWidth - 10;
        const wrappedMessage = PrintUtilities.wrapWords(message, maxLineLength);
        const wrappedMessageLines = wrappedMessage.split('\n');
        // ╔═══════════╗
        // ║  Message  ║
        // ╚═══════════╝
        terminal.writeLine(` ╔${'═'.repeat(boxWidth - 2)}╗ `);
        for (const line of wrappedMessageLines) {
            const trimmedLine = line.trim();
            const padding = boxWidth - trimmedLine.length - 2;
            const leftPadding = Math.floor(padding / 2);
            const rightPadding = padding - leftPadding;
            terminal.writeLine(` ║${' '.repeat(leftPadding)}${trimmedLine}${' '.repeat(rightPadding)}║ `);
        }
        terminal.writeLine(` ╚${'═'.repeat(boxWidth - 2)}╝ `);
    }
}
exports.PrintUtilities = PrintUtilities;
//# sourceMappingURL=PrintUtilities.js.map