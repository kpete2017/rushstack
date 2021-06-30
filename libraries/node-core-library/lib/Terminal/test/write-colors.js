"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * This file is a little program that prints all of the colors to the console.
 *
 * Run this program with `node write-colors.js`
 */
const index_1 = require("../../index");
const createColorGrid_1 = require("./createColorGrid");
const Colors_1 = require("../Colors");
const terminal = new index_1.Terminal(new index_1.ConsoleTerminalProvider());
function writeColorGrid(colorGridSequences) {
    for (const line of colorGridSequences) {
        terminal.writeLine(...line);
    }
}
writeColorGrid(createColorGrid_1.createColorGrid());
terminal.writeLine();
writeColorGrid(createColorGrid_1.createColorGrid(Colors_1.Colors.bold));
terminal.writeLine();
writeColorGrid(createColorGrid_1.createColorGrid(Colors_1.Colors.dim));
terminal.writeLine();
writeColorGrid(createColorGrid_1.createColorGrid(Colors_1.Colors.underline));
terminal.writeLine();
writeColorGrid(createColorGrid_1.createColorGrid(Colors_1.Colors.blink));
terminal.writeLine();
writeColorGrid(createColorGrid_1.createColorGrid(Colors_1.Colors.invertColor));
terminal.writeLine();
writeColorGrid(createColorGrid_1.createColorGrid(Colors_1.Colors.hidden));
terminal.writeLine();
terminal.write('Normal text...');
terminal.writeLine(Colors_1.Colors.green('done'));
terminal.writeError('Error...');
terminal.writeErrorLine(Colors_1.Colors.green('done'));
terminal.writeWarning('Warning...');
terminal.writeWarningLine(Colors_1.Colors.green('done'));
//# sourceMappingURL=write-colors.js.map