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
require("./mockRushCommandLineParser");
const path = __importStar(require("path"));
const node_core_library_1 = require("@rushstack/node-core-library");
const RushCommandLineParser_1 = require("../RushCommandLineParser");
const LastLinkFlag_1 = require("../../api/LastLinkFlag");
/**
 * Configure the `child_process` `spawn` mock for these tests. This relies on the mock implementation
 * in `__mocks__/child_process.js`.
 */
function setSpawnMock(options) {
    const cpMocked = require('child_process');
    cpMocked.__setSpawnMockConfig(options);
    const spawnMock = cpMocked.spawn;
    spawnMock.mockName('spawn');
    return spawnMock;
}
/**
 * Helper to set up a test instance for RushCommandLineParser.
 */
function getCommandLineParserInstance(repoName, taskName) {
    // Point to the test repo folder
    const startPath = path.resolve(__dirname, repoName);
    // The `build` task is hard-coded to be incremental. So delete the package-deps file folder in
    // the test repo to guarantee the test actually runs.
    node_core_library_1.FileSystem.deleteFolder(path.resolve(__dirname, `${repoName}/a/.rush/temp`));
    node_core_library_1.FileSystem.deleteFolder(path.resolve(__dirname, `${repoName}/b/.rush/temp`));
    // Create a Rush CLI instance. This instance is heavy-weight and relies on setting process.exit
    // to exit and clear the Rush file lock. So running multiple `it` or `describe` test blocks over the same test
    // repo will fail due to contention over the same lock which is kept until the test runner process
    // ends.
    const parser = new RushCommandLineParser_1.RushCommandLineParser({ cwd: startPath });
    // Bulk tasks are hard-coded to expect install to have been completed. So, ensure the last-link.flag
    // file exists and is valid
    LastLinkFlag_1.LastLinkFlagFactory.getCommonTempFlag(parser.rushConfiguration).create();
    // Mock the command
    process.argv = ['pretend-this-is-node.exe', 'pretend-this-is-rush', taskName];
    const spawnMock = setSpawnMock();
    return {
        parser,
        spawnMock
    };
}
// Ordinals into the `mock.calls` array referencing each of the arguments to `spawn`
const SPAWN_ARG_ARGS = 1;
const SPAWN_ARG_OPTIONS = 2;
describe('RushCommandLineParser', () => {
    describe('execute', () => {
        afterEach(() => {
            jest.clearAllMocks();
        });
        describe('in basic repo', () => {
            describe(`'build' action`, () => {
                it(`executes the package's 'build' script`, async () => {
                    const repoName = 'basicAndRunBuildActionRepo';
                    const instance = getCommandLineParserInstance(repoName, 'build');
                    await expect(instance.parser.execute()).resolves.toEqual(true);
                    // There should be 1 build per package
                    const packageCount = instance.spawnMock.mock.calls.length;
                    expect(packageCount).toEqual(2);
                    // Use regex for task name in case spaces were prepended or appended to spawned command
                    const expectedBuildTaskRegexp = /fake_build_task_but_works_with_mock/;
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const firstSpawn = instance.spawnMock.mock.calls[0];
                    expect(firstSpawn[SPAWN_ARG_ARGS]).toEqual(expect.arrayContaining([expect.stringMatching(expectedBuildTaskRegexp)]));
                    expect(firstSpawn[SPAWN_ARG_OPTIONS]).toEqual(expect.any(Object));
                    expect(firstSpawn[SPAWN_ARG_OPTIONS].cwd).toEqual(path.resolve(__dirname, `${repoName}/a`));
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const secondSpawn = instance.spawnMock.mock.calls[1];
                    expect(secondSpawn[SPAWN_ARG_ARGS]).toEqual(expect.arrayContaining([expect.stringMatching(expectedBuildTaskRegexp)]));
                    expect(secondSpawn[SPAWN_ARG_OPTIONS]).toEqual(expect.any(Object));
                    expect(secondSpawn[SPAWN_ARG_OPTIONS].cwd).toEqual(path.resolve(__dirname, `${repoName}/b`));
                });
            });
            describe(`'rebuild' action`, () => {
                it(`executes the package's 'build' script`, async () => {
                    const repoName = 'basicAndRunRebuildActionRepo';
                    const instance = getCommandLineParserInstance(repoName, 'rebuild');
                    await expect(instance.parser.execute()).resolves.toEqual(true);
                    // There should be 1 build per package
                    const packageCount = instance.spawnMock.mock.calls.length;
                    expect(packageCount).toEqual(2);
                    // Use regex for task name in case spaces were prepended or appended to spawned command
                    const expectedBuildTaskRegexp = /fake_build_task_but_works_with_mock/;
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const firstSpawn = instance.spawnMock.mock.calls[0];
                    expect(firstSpawn[SPAWN_ARG_ARGS]).toEqual(expect.arrayContaining([expect.stringMatching(expectedBuildTaskRegexp)]));
                    expect(firstSpawn[SPAWN_ARG_OPTIONS]).toEqual(expect.any(Object));
                    expect(firstSpawn[SPAWN_ARG_OPTIONS].cwd).toEqual(path.resolve(__dirname, `${repoName}/a`));
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const secondSpawn = instance.spawnMock.mock.calls[1];
                    expect(secondSpawn[SPAWN_ARG_ARGS]).toEqual(expect.arrayContaining([expect.stringMatching(expectedBuildTaskRegexp)]));
                    expect(secondSpawn[SPAWN_ARG_OPTIONS]).toEqual(expect.any(Object));
                    expect(secondSpawn[SPAWN_ARG_OPTIONS].cwd).toEqual(path.resolve(__dirname, `${repoName}/b`));
                });
            });
        });
        describe(`in repo with 'rebuild' command overridden`, () => {
            describe(`'build' action`, () => {
                it(`executes the package's 'build' script`, async () => {
                    const repoName = 'overrideRebuildAndRunBuildActionRepo';
                    const instance = getCommandLineParserInstance(repoName, 'build');
                    await expect(instance.parser.execute()).resolves.toEqual(true);
                    // There should be 1 build per package
                    const packageCount = instance.spawnMock.mock.calls.length;
                    expect(packageCount).toEqual(2);
                    // Use regex for task name in case spaces were prepended or appended to spawned command
                    const expectedBuildTaskRegexp = /fake_build_task_but_works_with_mock/;
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const firstSpawn = instance.spawnMock.mock.calls[0];
                    expect(firstSpawn[SPAWN_ARG_ARGS]).toEqual(expect.arrayContaining([expect.stringMatching(expectedBuildTaskRegexp)]));
                    expect(firstSpawn[SPAWN_ARG_OPTIONS]).toEqual(expect.any(Object));
                    expect(firstSpawn[SPAWN_ARG_OPTIONS].cwd).toEqual(path.resolve(__dirname, `${repoName}/a`));
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const secondSpawn = instance.spawnMock.mock.calls[1];
                    expect(secondSpawn[SPAWN_ARG_ARGS]).toEqual(expect.arrayContaining([expect.stringMatching(expectedBuildTaskRegexp)]));
                    expect(secondSpawn[SPAWN_ARG_OPTIONS]).toEqual(expect.any(Object));
                    expect(secondSpawn[SPAWN_ARG_OPTIONS].cwd).toEqual(path.resolve(__dirname, `${repoName}/b`));
                });
            });
            describe(`'rebuild' action`, () => {
                it(`executes the package's 'rebuild' script`, async () => {
                    const repoName = 'overrideRebuildAndRunRebuildActionRepo';
                    const instance = getCommandLineParserInstance(repoName, 'rebuild');
                    await expect(instance.parser.execute()).resolves.toEqual(true);
                    // There should be 1 build per package
                    const packageCount = instance.spawnMock.mock.calls.length;
                    expect(packageCount).toEqual(2);
                    // Use regex for task name in case spaces were prepended or appended to spawned command
                    const expectedBuildTaskRegexp = /fake_REbuild_task_but_works_with_mock/;
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const firstSpawn = instance.spawnMock.mock.calls[0];
                    expect(firstSpawn[SPAWN_ARG_ARGS]).toEqual(expect.arrayContaining([expect.stringMatching(expectedBuildTaskRegexp)]));
                    expect(firstSpawn[SPAWN_ARG_OPTIONS]).toEqual(expect.any(Object));
                    expect(firstSpawn[SPAWN_ARG_OPTIONS].cwd).toEqual(path.resolve(__dirname, `${repoName}/a`));
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const secondSpawn = instance.spawnMock.mock.calls[1];
                    expect(secondSpawn[SPAWN_ARG_ARGS]).toEqual(expect.arrayContaining([expect.stringMatching(expectedBuildTaskRegexp)]));
                    expect(secondSpawn[SPAWN_ARG_OPTIONS]).toEqual(expect.any(Object));
                    expect(secondSpawn[SPAWN_ARG_OPTIONS].cwd).toEqual(path.resolve(__dirname, `${repoName}/b`));
                });
            });
        });
        describe(`in repo with 'rebuild' or 'build' partially set`, () => {
            describe(`'build' action`, () => {
                it(`executes the package's 'build' script`, async () => {
                    const repoName = 'overrideAndDefaultBuildActionRepo';
                    const instance = getCommandLineParserInstance(repoName, 'build');
                    await expect(instance.parser.execute()).resolves.toEqual(true);
                    // There should be 1 build per package
                    const packageCount = instance.spawnMock.mock.calls.length;
                    expect(packageCount).toEqual(2);
                    // Use regex for task name in case spaces were prepended or appended to spawned command
                    const expectedBuildTaskRegexp = /fake_build_task_but_works_with_mock/;
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const firstSpawn = instance.spawnMock.mock.calls[0];
                    expect(firstSpawn[SPAWN_ARG_ARGS]).toEqual(expect.arrayContaining([expect.stringMatching(expectedBuildTaskRegexp)]));
                    expect(firstSpawn[SPAWN_ARG_OPTIONS]).toEqual(expect.any(Object));
                    expect(firstSpawn[SPAWN_ARG_OPTIONS].cwd).toEqual(path.resolve(__dirname, `${repoName}/a`));
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const secondSpawn = instance.spawnMock.mock.calls[1];
                    expect(secondSpawn[SPAWN_ARG_ARGS]).toEqual(expect.arrayContaining([expect.stringMatching(expectedBuildTaskRegexp)]));
                    expect(secondSpawn[SPAWN_ARG_OPTIONS]).toEqual(expect.any(Object));
                    expect(secondSpawn[SPAWN_ARG_OPTIONS].cwd).toEqual(path.resolve(__dirname, `${repoName}/b`));
                });
            });
            describe(`'rebuild' action`, () => {
                it(`executes the package's 'build' script`, async () => {
                    // broken
                    const repoName = 'overrideAndDefaultRebuildActionRepo';
                    const instance = getCommandLineParserInstance(repoName, 'rebuild');
                    await expect(instance.parser.execute()).resolves.toEqual(true);
                    // There should be 1 build per package
                    const packageCount = instance.spawnMock.mock.calls.length;
                    expect(packageCount).toEqual(2);
                    // Use regex for task name in case spaces were prepended or appended to spawned command
                    const expectedBuildTaskRegexp = /fake_build_task_but_works_with_mock/;
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const firstSpawn = instance.spawnMock.mock.calls[0];
                    expect(firstSpawn[SPAWN_ARG_ARGS]).toEqual(expect.arrayContaining([expect.stringMatching(expectedBuildTaskRegexp)]));
                    expect(firstSpawn[SPAWN_ARG_OPTIONS]).toEqual(expect.any(Object));
                    expect(firstSpawn[SPAWN_ARG_OPTIONS].cwd).toEqual(path.resolve(__dirname, `${repoName}/a`));
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const secondSpawn = instance.spawnMock.mock.calls[1];
                    expect(secondSpawn[SPAWN_ARG_ARGS]).toEqual(expect.arrayContaining([expect.stringMatching(expectedBuildTaskRegexp)]));
                    expect(secondSpawn[SPAWN_ARG_OPTIONS]).toEqual(expect.any(Object));
                    expect(secondSpawn[SPAWN_ARG_OPTIONS].cwd).toEqual(path.resolve(__dirname, `${repoName}/b`));
                });
            });
        });
        describe(`in repo with 'build' command overridden as a global command`, () => {
            it(`throws an error when starting Rush`, async () => {
                const repoName = 'overrideBuildAsGlobalCommandRepo';
                await expect(() => {
                    getCommandLineParserInstance(repoName, 'doesnt-matter');
                }).toThrowError('This command can only be designated as a command kind "bulk"');
            });
        });
        describe(`in repo with 'rebuild' command overridden as a global command`, () => {
            it(`throws an error when starting Rush`, async () => {
                const repoName = 'overrideRebuildAsGlobalCommandRepo';
                await expect(() => {
                    getCommandLineParserInstance(repoName, 'doesnt-matter');
                }).toThrowError('This command can only be designated as a command kind "bulk"');
            });
        });
        describe(`in repo with 'build' command overridden with 'safeForSimultaneousRushProcesses=true'`, () => {
            it(`throws an error when starting Rush`, async () => {
                const repoName = 'overrideBuildWithSimultaneousProcessesRepo';
                await expect(() => {
                    getCommandLineParserInstance(repoName, 'doesnt-matter');
                }).toThrowError('"safeForSimultaneousRushProcesses=true". This configuration is not supported');
            });
        });
        describe(`in repo with 'rebuild' command overridden with 'safeForSimultaneousRushProcesses=true'`, () => {
            it(`throws an error when starting Rush`, async () => {
                const repoName = 'overrideRebuildWithSimultaneousProcessesRepo';
                await expect(() => {
                    getCommandLineParserInstance(repoName, 'doesnt-matter');
                }).toThrowError('"safeForSimultaneousRushProcesses=true". This configuration is not supported');
            });
        });
    });
});
//# sourceMappingURL=RushCommandLineParser.test.js.map