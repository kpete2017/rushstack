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
const __1 = require("..");
function createParser() {
    const commandLineParser = new __1.DynamicCommandLineParser({
        toolFilename: 'example',
        toolDescription: 'An example project'
    });
    commandLineParser.defineFlagParameter({
        parameterLongName: '--global-flag',
        parameterShortName: '-g',
        description: 'A flag that affects all actions'
    });
    const action = new __1.DynamicCommandLineAction({
        actionName: 'do:the-job',
        summary: 'does the job',
        documentation: 'a longer description'
    });
    commandLineParser.addAction(action);
    // Choice
    action.defineChoiceParameter({
        parameterLongName: '--choice',
        parameterShortName: '-c',
        description: 'A choice',
        alternatives: ['one', 'two', 'three', 'default'],
        environmentVariable: 'ENV_CHOICE'
    });
    action.defineChoiceParameter({
        parameterLongName: '--choice-with-default',
        description: 'A choice with a default. This description ends with a "quoted word"',
        alternatives: ['one', 'two', 'three', 'default'],
        environmentVariable: 'ENV_CHOICE2',
        defaultValue: 'default'
    });
    // Flag
    action.defineFlagParameter({
        parameterLongName: '--flag',
        parameterShortName: '-f',
        description: 'A flag',
        environmentVariable: 'ENV_FLAG'
    });
    // Integer
    action.defineIntegerParameter({
        parameterLongName: '--integer',
        parameterShortName: '-i',
        description: 'An integer',
        argumentName: 'NUMBER',
        environmentVariable: 'ENV_INTEGER'
    });
    action.defineIntegerParameter({
        parameterLongName: '--integer-with-default',
        description: 'An integer with a default',
        argumentName: 'NUMBER',
        environmentVariable: 'ENV_INTEGER2',
        defaultValue: 123
    });
    action.defineIntegerParameter({
        parameterLongName: '--integer-required',
        description: 'An integer',
        argumentName: 'NUMBER',
        // Not yet supported
        // environmentVariable: 'ENV_INTEGER_REQUIRED',
        required: true
    });
    // String
    action.defineStringParameter({
        parameterLongName: '--string',
        parameterShortName: '-s',
        description: 'A string',
        argumentName: 'TEXT',
        environmentVariable: 'ENV_STRING'
    });
    action.defineStringParameter({
        parameterLongName: '--string-with-default',
        description: 'A string with a default',
        argumentName: 'TEXT',
        environmentVariable: 'ENV_STRING2',
        defaultValue: '123'
    });
    action.defineStringParameter({
        parameterLongName: '--string-with-undocumented-synonym',
        description: 'A string with an undocumented synonym',
        argumentName: 'TEXT',
        undocumentedSynonyms: ['--undocumented-synonym']
    });
    // String List
    action.defineStringListParameter({
        parameterLongName: '--string-list',
        parameterShortName: '-l',
        description: 'This parameter be specified multiple times to make a list of strings',
        argumentName: 'LIST_ITEM',
        environmentVariable: 'ENV_STRING_LIST'
    });
    return commandLineParser;
}
function expectPropertiesToMatchSnapshot(object, propertyNames) {
    const snapshotObject = {};
    for (const propertyName of propertyNames) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        snapshotObject[propertyName] = object[propertyName];
    }
    expect(snapshotObject).toMatchSnapshot();
}
const snapshotPropertyNames = [
    'description',
    'kind',
    'longName',
    'shortName',
    'value',
    'kind',
    'argumentName',
    'environmentVariable',
    'required',
    'defaultValue',
    'values'
];
describe('CommandLineParameter', () => {
    it('prints the global help', () => {
        const commandLineParser = createParser();
        const helpText = colors.stripColors(commandLineParser.renderHelpText());
        expect(helpText).toMatchSnapshot();
    });
    it('prints the action help', () => {
        const commandLineParser = createParser();
        const helpText = colors.stripColors(commandLineParser.getAction('do:the-job').renderHelpText());
        expect(helpText).toMatchSnapshot();
    });
    it('parses an input with ALL parameters', async () => {
        const commandLineParser = createParser();
        const action = commandLineParser.getAction('do:the-job');
        const args = [
            '--global-flag',
            'do:the-job',
            '--choice',
            'two',
            '--flag',
            '--integer',
            '123',
            '--integer-required',
            '321',
            '--string',
            'hello',
            '--string-list',
            'first',
            '--string-list',
            'second'
        ];
        await commandLineParser.execute(args);
        expect(commandLineParser.selectedAction).toBe(action);
        expectPropertiesToMatchSnapshot(commandLineParser.getFlagParameter('--global-flag'), snapshotPropertyNames);
        expectPropertiesToMatchSnapshot(action.getChoiceParameter('--choice'), snapshotPropertyNames);
        expectPropertiesToMatchSnapshot(action.getChoiceParameter('--choice-with-default'), snapshotPropertyNames);
        expectPropertiesToMatchSnapshot(action.getFlagParameter('--flag'), snapshotPropertyNames);
        expectPropertiesToMatchSnapshot(action.getIntegerParameter('--integer'), snapshotPropertyNames);
        expectPropertiesToMatchSnapshot(action.getIntegerParameter('--integer-with-default'), snapshotPropertyNames);
        expectPropertiesToMatchSnapshot(action.getIntegerParameter('--integer-required'), snapshotPropertyNames);
        expectPropertiesToMatchSnapshot(action.getStringParameter('--string'), snapshotPropertyNames);
        expectPropertiesToMatchSnapshot(action.getStringParameter('--string-with-default'), snapshotPropertyNames);
        expectPropertiesToMatchSnapshot(action.getStringListParameter('--string-list'), snapshotPropertyNames);
        const copiedArgs = [];
        for (const parameter of action.parameters) {
            copiedArgs.push(`### ${parameter.longName} output: ###`);
            parameter.appendToArgList(copiedArgs);
        }
        expect(copiedArgs).toMatchSnapshot();
    });
    it('parses an input with NO parameters', async () => {
        const commandLineParser = createParser();
        const action = commandLineParser.getAction('do:the-job');
        const args = ['do:the-job', '--integer-required', '123'];
        await commandLineParser.execute(args);
        expect(commandLineParser.selectedAction).toBe(action);
        expectPropertiesToMatchSnapshot(commandLineParser.getFlagParameter('--global-flag'), snapshotPropertyNames);
        expectPropertiesToMatchSnapshot(action.getChoiceParameter('--choice'), snapshotPropertyNames);
        expectPropertiesToMatchSnapshot(action.getChoiceParameter('--choice-with-default'), snapshotPropertyNames);
        expectPropertiesToMatchSnapshot(action.getFlagParameter('--flag'), snapshotPropertyNames);
        expectPropertiesToMatchSnapshot(action.getIntegerParameter('--integer'), snapshotPropertyNames);
        expectPropertiesToMatchSnapshot(action.getIntegerParameter('--integer-with-default'), snapshotPropertyNames);
        expectPropertiesToMatchSnapshot(action.getIntegerParameter('--integer-required'), snapshotPropertyNames);
        expectPropertiesToMatchSnapshot(action.getStringParameter('--string'), snapshotPropertyNames);
        expectPropertiesToMatchSnapshot(action.getStringParameter('--string-with-default'), snapshotPropertyNames);
        expectPropertiesToMatchSnapshot(action.getStringListParameter('--string-list'), snapshotPropertyNames);
        const copiedArgs = [];
        for (const parameter of action.parameters) {
            copiedArgs.push(`### ${parameter.longName} output: ###`);
            parameter.appendToArgList(copiedArgs);
        }
        expect(copiedArgs).toMatchSnapshot();
    });
    it('parses each parameter from an environment variable', async () => {
        const commandLineParser = createParser();
        const action = commandLineParser.getAction('do:the-job');
        action.defineStringListParameter({
            parameterLongName: '--json-string-list',
            description: 'Test JSON parsing',
            argumentName: 'LIST_ITEM',
            environmentVariable: 'ENV_JSON_STRING_LIST'
        });
        const args = ['do:the-job', '--integer-required', '1'];
        process.env.ENV_CHOICE = 'one';
        process.env.ENV_CHOICE2 = 'two';
        process.env.ENV_FLAG = '1';
        process.env.ENV_INTEGER = '111';
        process.env.ENV_INTEGER2 = '222';
        process.env.ENV_INTEGER_REQUIRED = '333';
        process.env.ENV_STRING = 'Hello, world!';
        process.env.ENV_STRING2 = 'Hello, world!';
        process.env.ENV_STRING_LIST = 'simple text';
        process.env.ENV_JSON_STRING_LIST = ' [ 1, true, "Hello, world!" ] ';
        await commandLineParser.execute(args);
        expect(commandLineParser.selectedAction).toBe(action);
        const copiedArgs = [];
        for (const parameter of action.parameters) {
            copiedArgs.push(`### ${parameter.longName} output: ###`);
            parameter.appendToArgList(copiedArgs);
        }
        expect(copiedArgs).toMatchSnapshot();
    });
    it('allows an undocumented synonym', async () => {
        const commandLineParser = createParser();
        const action = commandLineParser.getAction('do:the-job');
        const args = [
            'do:the-job',
            '--undocumented-synonym',
            'undocumented-value',
            '--integer-required',
            '6'
        ];
        await commandLineParser.execute(args);
        expect(commandLineParser.selectedAction).toBe(action);
        const copiedArgs = [];
        for (const parameter of action.parameters) {
            copiedArgs.push(`### ${parameter.longName} output: ###`);
            parameter.appendToArgList(copiedArgs);
        }
        expect(copiedArgs).toMatchSnapshot();
    });
});
//# sourceMappingURL=CommandLineParameter.test.js.map