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
require("../../test/mockRushCommandLineParser");
const path = __importStar(require("path"));
const PackageJsonUpdater_1 = require("../../../logic/PackageJsonUpdater");
const RushCommandLineParser_1 = require("../../RushCommandLineParser");
describe('AddAction', () => {
    describe(`basic "rush add" tests`, () => {
        let doRushAddMock;
        let oldExitCode;
        let oldArgs;
        beforeEach(() => {
            doRushAddMock = jest
                .spyOn(PackageJsonUpdater_1.PackageJsonUpdater.prototype, 'doRushAdd')
                .mockImplementation(() => Promise.resolve());
            jest.spyOn(process, 'exit').mockImplementation();
            oldExitCode = process.exitCode;
            oldArgs = process.argv;
        });
        afterEach(() => {
            jest.clearAllMocks();
            process.exitCode = oldExitCode;
            process.argv = oldArgs;
        });
        describe(`'add' action`, () => {
            it(`adds a dependency to just one repo in the workspace`, async () => {
                const startPath = path.resolve(__dirname, 'addRepo');
                const aPath = path.resolve(__dirname, 'addRepo', 'a');
                // Create a Rush CLI instance. This instance is heavy-weight and relies on setting process.exit
                // to exit and clear the Rush file lock. So running multiple `it` or `describe` test blocks over the same test
                // repo will fail due to contention over the same lock which is kept until the test runner process
                // ends.
                const parser = new RushCommandLineParser_1.RushCommandLineParser({ cwd: startPath });
                // Switching to the "a" package of addRepo
                jest.spyOn(process, 'cwd').mockReturnValue(aPath);
                // Mock the command
                process.argv = ['pretend-this-is-node.exe', 'pretend-this-is-rush', 'add', '-p', 'assert'];
                await expect(parser.execute()).resolves.toEqual(true);
                expect(doRushAddMock).toHaveBeenCalledTimes(1);
                expect(doRushAddMock.mock.calls[0][0].projects).toHaveLength(1);
                expect(doRushAddMock.mock.calls[0][0].projects[0].packageName).toEqual('a');
                expect(doRushAddMock.mock.calls[0][0].packageName).toEqual('assert');
            });
        });
        describe(`'add' action with --all`, () => {
            it(`adds a dependency to all repos in the workspace`, async () => {
                const startPath = path.resolve(__dirname, 'addRepo');
                const aPath = path.resolve(__dirname, 'addRepo', 'a');
                // Create a Rush CLI instance. This instance is heavy-weight and relies on setting process.exit
                // to exit and clear the Rush file lock. So running multiple `it` or `describe` test blocks over the same test
                // repo will fail due to contention over the same lock which is kept until the test runner process
                // ends.
                const parser = new RushCommandLineParser_1.RushCommandLineParser({ cwd: startPath });
                // Switching to the "a" package of addRepo
                jest.spyOn(process, 'cwd').mockReturnValue(aPath);
                // Mock the command
                process.argv = ['pretend-this-is-node.exe', 'pretend-this-is-rush', 'add', '-p', 'assert', '--all'];
                await expect(parser.execute()).resolves.toEqual(true);
                expect(doRushAddMock).toHaveBeenCalledTimes(1);
                expect(doRushAddMock.mock.calls[0][0].projects).toHaveLength(2);
                expect(doRushAddMock.mock.calls[0][0].projects[0].packageName).toEqual('a');
                expect(doRushAddMock.mock.calls[0][0].projects[1].packageName).toEqual('b');
                expect(doRushAddMock.mock.calls[0][0].packageName).toEqual('assert');
            });
        });
    });
});
//# sourceMappingURL=AddAction.test.js.map