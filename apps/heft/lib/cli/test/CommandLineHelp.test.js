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
const node_core_library_1 = require("@rushstack/node-core-library");
const colorsPackage = __importStar(require("colors"));
const HeftToolsCommandLineParser_1 = require("../HeftToolsCommandLineParser");
describe('CommandLineHelp', () => {
    let colorsEnabled;
    let parser;
    beforeEach(() => {
        colorsEnabled = colorsPackage.enabled;
        if (!colorsEnabled) {
            colorsPackage.enable();
        }
        // ts-command-line calls process.exit() which interferes with Jest
        jest.spyOn(process, 'exit').mockImplementation((code) => {
            throw new Error(`Test code called process.exit(${code})`);
        });
        // This call may terminate the entire test run because it invokes process.exit()
        // if it encounters errors.
        // TODO Remove the calls to process.exit() or override them for testing.
        parser = new HeftToolsCommandLineParser_1.HeftToolsCommandLineParser();
    });
    afterEach(() => {
        if (!colorsEnabled) {
            colorsPackage.disable();
        }
    });
    it('prints the global help', () => {
        const helpText = node_core_library_1.AnsiEscape.formatForTests(parser.renderHelpText());
        expect(helpText).toMatchSnapshot();
    });
    it(`prints the help for each action`, () => {
        for (const action of parser.actions) {
            const helpText = node_core_library_1.AnsiEscape.formatForTests(action.renderHelpText());
            expect(helpText).toMatchSnapshot(action.actionName);
        }
    });
});
//# sourceMappingURL=CommandLineHelp.test.js.map