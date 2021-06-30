"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
const Terminal_1 = require("../Terminal");
const StringBufferTerminalProvider_1 = require("../StringBufferTerminalProvider");
const createColorGrid_1 = require("./createColorGrid");
const AnsiEscape_1 = require("../AnsiEscape");
describe('Colors', () => {
    let terminal;
    let provider;
    beforeEach(() => {
        provider = new StringBufferTerminalProvider_1.StringBufferTerminalProvider(true);
        terminal = new Terminal_1.Terminal(provider);
    });
    test('writes color grid correctly', () => {
        for (const line of createColorGrid_1.createColorGrid()) {
            terminal.writeLine(...line);
        }
        expect(provider.getOutput()).toMatchSnapshot();
    });
    test('correctly normalizes color codes for tests', () => {
        for (const line of createColorGrid_1.createColorGrid()) {
            terminal.writeLine(...line);
        }
        expect(AnsiEscape_1.AnsiEscape.formatForTests(provider.getOutput({ normalizeSpecialCharacters: false }))).toMatchSnapshot();
    });
});
//# sourceMappingURL=Colors.test.js.map