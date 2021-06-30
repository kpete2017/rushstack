"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const colors_1 = __importDefault(require("colors"));
const RemoveColorsTextRewriter_1 = require("../RemoveColorsTextRewriter");
const node_core_library_1 = require("@rushstack/node-core-library");
function testCase(inputs) {
    const matcher = new RemoveColorsTextRewriter_1.RemoveColorsTextRewriter();
    const state = matcher.initialize();
    const outputs = inputs.map((x) => matcher.process(state, x));
    const closeOutput = matcher.close(state);
    if (closeOutput !== '') {
        outputs.push('--close--');
        outputs.push(closeOutput);
    }
    expect({
        inputs: inputs.map((x) => node_core_library_1.AnsiEscape.formatForTests(x)),
        outputs
    }).toMatchSnapshot();
}
describe('RemoveColorsTextRewriter', () => {
    let initialColorsEnabled;
    beforeAll(() => {
        initialColorsEnabled = colors_1.default.enabled;
        colors_1.default.enable();
    });
    afterAll(() => {
        if (!initialColorsEnabled) {
            colors_1.default.disable();
        }
    });
    it('01 should process empty inputs', () => {
        testCase([]);
        testCase(['']);
        testCase(['', 'a', '']);
    });
    it('02 should remove colors from complete chunks', () => {
        testCase([colors_1.default.red('1')]);
        testCase([colors_1.default.red('1') + colors_1.default.green('2')]);
        testCase([colors_1.default.red('1') + '2' + colors_1.default.green('3')]);
    });
    it('03 should remove colors from 1-character chunks', () => {
        const source = '1' + colors_1.default.red('2');
        const inputs = [];
        for (let i = 0; i < source.length; ++i) {
            inputs.push(source.substr(i, 1));
        }
        testCase(inputs);
    });
    it('04 should pass through incomplete partial matches', () => {
        testCase(['\x1b']);
        testCase(['\x1b[\n']);
        testCase(['\x1b[1']);
    });
});
//# sourceMappingURL=RemoveColorsTextRewriter.test.js.map