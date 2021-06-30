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
const path = __importStar(require("path"));
const Utilities_1 = require("../../utilities/Utilities");
describe('CLI', () => {
    it('should not fail when there is no rush.json', () => {
        const workingDir = '/';
        const startPath = path.resolve(path.join(__dirname, '../../../lib/start.js'));
        expect(() => {
            Utilities_1.Utilities.executeCommand({
                command: 'node',
                args: [startPath],
                workingDirectory: workingDir,
                suppressOutput: true
            });
        }).not.toThrow();
    });
    it('rushx should pass args to scripts', () => {
        // Invoke "rushx"
        const startPath = path.resolve(path.join(__dirname, '../../../lib/startx.js'));
        // Run "rushx show-args 1 2 -x" in the "repo/rushx-project" folder
        const output = Utilities_1.Utilities.executeCommandAndCaptureOutput('node', [startPath, 'show-args', '1', '2', '-x'], path.join(__dirname, 'repo', 'rushx-project'));
        const lastLine = output
            .split(/\s*\n\s*/)
            .filter((x) => x)
            .pop() || '';
        expect(lastLine).toEqual('build.js: ARGS=["1","2","-x"]');
    });
    it('rushx should fail in un-rush project', () => {
        // Invoke "rushx"
        const startPath = path.resolve(path.join(__dirname, '../../../lib/startx.js'));
        const output = Utilities_1.Utilities.executeCommandAndCaptureOutput('node', [startPath, 'show-args', '1', '2', '-x'], path.join(__dirname, 'repo', 'rushx-not-in-rush-project'));
        console.log(output);
        expect(output).toEqual(expect.stringMatching('Warning: You are invoking "rushx" inside a Rush repository, but this project is not registered in rush.json.'));
    });
});
//# sourceMappingURL=Cli.test.js.map