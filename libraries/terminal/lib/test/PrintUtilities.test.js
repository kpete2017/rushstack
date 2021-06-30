"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
const node_core_library_1 = require("@rushstack/node-core-library");
const PrintUtilities_1 = require("../PrintUtilities");
describe('PrintUtilities', () => {
    describe('printMessageInBox', () => {
        const MESSAGE = 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Maecenas porttitor congue massa. Fusce posuere, magna sed pulvinar ultricies, purus lectus malesuada libero, sit amet commodo magna eros quis urna.';
        let terminalProvider;
        let terminal;
        beforeEach(() => {
            terminalProvider = new node_core_library_1.StringBufferTerminalProvider(false);
            terminal = new node_core_library_1.Terminal(terminalProvider);
        });
        afterEach(() => {
            jest.resetAllMocks();
        });
        function validateOutput(expectedWidth) {
            const outputLines = terminalProvider
                .getOutput({ normalizeSpecialCharacters: true })
                .split('[n]');
            expect(outputLines).toMatchSnapshot();
            expect(outputLines[0].trim().length).toEqual(expectedWidth);
        }
        it('Correctly prints a narrow box', () => {
            PrintUtilities_1.PrintUtilities.printMessageInBox(MESSAGE, terminal, 20);
            validateOutput(20);
        });
        it('Correctly prints a wide box', () => {
            PrintUtilities_1.PrintUtilities.printMessageInBox(MESSAGE, terminal, 300);
            validateOutput(300);
        });
        it('Correctly gets the console width', () => {
            jest.spyOn(PrintUtilities_1.PrintUtilities, 'getConsoleWidth').mockReturnValue(65);
            PrintUtilities_1.PrintUtilities.printMessageInBox(MESSAGE, terminal);
            validateOutput(32);
        });
    });
});
//# sourceMappingURL=PrintUtilities.test.js.map