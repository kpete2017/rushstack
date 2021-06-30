"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// The TaskRunner prints "x.xx seconds" in TestRunner.test.ts.snap; ensure that the Stopwatch timing is deterministic
jest.mock('../../../utilities/Utilities');
const safe_1 = __importDefault(require("colors/safe"));
const os_1 = require("os");
const terminal_1 = require("@rushstack/terminal");
const TaskRunner_1 = require("../TaskRunner");
const TaskStatus_1 = require("../TaskStatus");
const Task_1 = require("../Task");
const Utilities_1 = require("../../../utilities/Utilities");
const MockBuilder_1 = require("./MockBuilder");
const mockGetTimeInMs = jest.fn();
Utilities_1.Utilities.getTimeInMs = mockGetTimeInMs;
let mockTimeInMs = 0;
mockGetTimeInMs.mockImplementation(() => {
    console.log('CALLED mockGetTimeInMs');
    mockTimeInMs += 100;
    return mockTimeInMs;
});
const mockWritable = new terminal_1.MockWritable();
function createTaskRunner(taskRunnerOptions, builder) {
    const task = new Task_1.Task(builder, TaskStatus_1.TaskStatus.Ready);
    return new TaskRunner_1.TaskRunner([task], taskRunnerOptions);
}
const EXPECTED_FAIL = `Promise returned by ${TaskRunner_1.TaskRunner.prototype.executeAsync.name}() resolved but was expected to fail`;
describe('TaskRunner', () => {
    let taskRunner;
    let taskRunnerOptions;
    let initialColorsEnabled;
    beforeAll(() => {
        initialColorsEnabled = safe_1.default.enabled;
        safe_1.default.enable();
    });
    afterAll(() => {
        if (!initialColorsEnabled) {
            safe_1.default.disable();
        }
    });
    beforeEach(() => {
        mockWritable.reset();
    });
    describe('Constructor', () => {
        it('throwsErrorOnInvalidParallelism', () => {
            expect(() => new TaskRunner_1.TaskRunner([], {
                quietMode: false,
                parallelism: 'tequila',
                changedProjectsOnly: false,
                destination: mockWritable,
                allowWarningsInSuccessfulBuild: false,
                repoCommandLineConfiguration: undefined
            })).toThrowErrorMatchingSnapshot();
        });
    });
    describe('Error logging', () => {
        beforeEach(() => {
            taskRunnerOptions = {
                quietMode: false,
                parallelism: '1',
                changedProjectsOnly: false,
                destination: mockWritable,
                allowWarningsInSuccessfulBuild: false,
                repoCommandLineConfiguration: undefined
            };
        });
        it('printedStderrAfterError', async () => {
            taskRunner = createTaskRunner(taskRunnerOptions, new MockBuilder_1.MockBuilder('stdout+stderr', async (terminal) => {
                terminal.writeStdoutLine('Build step 1' + os_1.EOL);
                terminal.writeStderrLine('Error: step 1 failed' + os_1.EOL);
                return TaskStatus_1.TaskStatus.Failure;
            }));
            try {
                await taskRunner.executeAsync();
                fail(EXPECTED_FAIL);
            }
            catch (err) {
                expect(err.message).toMatchSnapshot();
                const allMessages = mockWritable.getAllOutput();
                expect(allMessages).toContain('Error: step 1 failed');
                expect(mockWritable.getFormattedChunks()).toMatchSnapshot();
            }
        });
        it('printedStdoutAfterErrorWithEmptyStderr', async () => {
            taskRunner = createTaskRunner(taskRunnerOptions, new MockBuilder_1.MockBuilder('stdout only', async (terminal) => {
                terminal.writeStdoutLine('Build step 1' + os_1.EOL);
                terminal.writeStdoutLine('Error: step 1 failed' + os_1.EOL);
                return TaskStatus_1.TaskStatus.Failure;
            }));
            try {
                await taskRunner.executeAsync();
                fail(EXPECTED_FAIL);
            }
            catch (err) {
                expect(err.message).toMatchSnapshot();
                const allOutput = mockWritable.getAllOutput();
                expect(allOutput).toMatch(/Build step 1/);
                expect(allOutput).toMatch(/Error: step 1 failed/);
                expect(mockWritable.getFormattedChunks()).toMatchSnapshot();
            }
        });
    });
    describe('Warning logging', () => {
        describe('Fail on warning', () => {
            beforeEach(() => {
                taskRunnerOptions = {
                    quietMode: false,
                    parallelism: '1',
                    changedProjectsOnly: false,
                    destination: mockWritable,
                    allowWarningsInSuccessfulBuild: false,
                    repoCommandLineConfiguration: undefined
                };
            });
            it('Logs warnings correctly', async () => {
                taskRunner = createTaskRunner(taskRunnerOptions, new MockBuilder_1.MockBuilder('success with warnings (failure)', async (terminal) => {
                    terminal.writeStdoutLine('Build step 1' + os_1.EOL);
                    terminal.writeStdoutLine('Warning: step 1 succeeded with warnings' + os_1.EOL);
                    return TaskStatus_1.TaskStatus.SuccessWithWarning;
                }));
                try {
                    await taskRunner.executeAsync();
                    fail(EXPECTED_FAIL);
                }
                catch (err) {
                    expect(err.message).toMatchSnapshot();
                    const allMessages = mockWritable.getAllOutput();
                    expect(allMessages).toContain('Build step 1');
                    expect(allMessages).toContain('step 1 succeeded with warnings');
                    expect(mockWritable.getFormattedChunks()).toMatchSnapshot();
                }
            });
        });
        describe('Success on warning', () => {
            beforeEach(() => {
                taskRunnerOptions = {
                    quietMode: false,
                    parallelism: '1',
                    changedProjectsOnly: false,
                    destination: mockWritable,
                    allowWarningsInSuccessfulBuild: true,
                    repoCommandLineConfiguration: undefined
                };
            });
            it('Logs warnings correctly', async () => {
                taskRunner = createTaskRunner(taskRunnerOptions, new MockBuilder_1.MockBuilder('success with warnings (success)', async (terminal) => {
                    terminal.writeStdoutLine('Build step 1' + os_1.EOL);
                    terminal.writeStdoutLine('Warning: step 1 succeeded with warnings' + os_1.EOL);
                    return TaskStatus_1.TaskStatus.SuccessWithWarning;
                }));
                await taskRunner.executeAsync();
                const allMessages = mockWritable.getAllOutput();
                expect(allMessages).toContain('Build step 1');
                expect(allMessages).toContain('Warning: step 1 succeeded with warnings');
                expect(mockWritable.getFormattedChunks()).toMatchSnapshot();
            });
        });
    });
});
//# sourceMappingURL=TaskRunner.test.js.map