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
const colors = __importStar(require("colors"));
const DynamicCommandLineParser_1 = require("../providers/DynamicCommandLineParser");
const DynamicCommandLineAction_1 = require("../providers/DynamicCommandLineAction");
function createParser() {
    const commandLineParser = new DynamicCommandLineParser_1.DynamicCommandLineParser({
        toolFilename: 'example',
        toolDescription: 'An example project'
    });
    commandLineParser.defineFlagParameter({
        parameterLongName: '--verbose',
        description: 'A flag that affects all actions'
    });
    const action = new DynamicCommandLineAction_1.DynamicCommandLineAction({
        actionName: 'run',
        summary: 'does the job',
        documentation: 'a longer description'
    });
    commandLineParser.addAction(action);
    action.defineStringParameter({
        parameterLongName: '--title',
        description: 'A string',
        argumentName: 'TEXT'
    });
    // Although this is defined BEFORE the parameter, but it should still capture the end
    action.defineCommandLineRemainder({
        description: 'The action remainder'
    });
    return commandLineParser;
}
describe('CommandLineRemainder', () => {
    it('prints the global help', () => {
        const commandLineParser = createParser();
        const helpText = colors.stripColors(commandLineParser.renderHelpText());
        expect(helpText).toMatchSnapshot();
    });
    it('prints the action help', () => {
        const commandLineParser = createParser();
        const helpText = colors.stripColors(commandLineParser.getAction('run').renderHelpText());
        expect(helpText).toMatchSnapshot();
    });
    it('parses an action input with remainder', async () => {
        const commandLineParser = createParser();
        const action = commandLineParser.getAction('run');
        const args = ['run', '--title', 'The title', 'the', 'remaining', 'args'];
        await commandLineParser.execute(args);
        expect(commandLineParser.selectedAction).toBe(action);
        const copiedArgs = [];
        for (const parameter of action.parameters) {
            copiedArgs.push(`### ${parameter.longName} output: ###`);
            parameter.appendToArgList(copiedArgs);
        }
        copiedArgs.push(`### remainder output: ###`);
        action.remainder.appendToArgList(copiedArgs);
        expect(copiedArgs).toMatchSnapshot();
    });
});
//# sourceMappingURL=CommandLineRemainder.test.js.map