"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
const TaskCollection_1 = require("../TaskCollection");
const node_core_library_1 = require("@rushstack/node-core-library");
const MockBuilder_1 = require("./MockBuilder");
const TaskStatus_1 = require("../TaskStatus");
function checkConsoleOutput(terminalProvider) {
    expect(terminalProvider.getOutput()).toMatchSnapshot();
    expect(terminalProvider.getVerbose()).toMatchSnapshot();
    expect(terminalProvider.getWarningOutput()).toMatchSnapshot();
    expect(terminalProvider.getErrorOutput()).toMatchSnapshot();
}
describe('TaskCollection', () => {
    let terminalProvider;
    let taskCollection;
    beforeEach(() => {
        terminalProvider = new node_core_library_1.StringBufferTerminalProvider(true);
    });
    describe('Dependencies', () => {
        beforeEach(() => {
            taskCollection = new TaskCollection_1.TaskCollection();
        });
        it('throwsErrorOnNonExistentTask', () => {
            expect(() => taskCollection.addDependencies('foo', [])).toThrowErrorMatchingSnapshot();
        });
        it('throwsErrorOnNonExistentDependency', () => {
            taskCollection.addTask(new MockBuilder_1.MockBuilder('foo'));
            expect(() => taskCollection.addDependencies('foo', ['bar'])).toThrowErrorMatchingSnapshot();
        });
        it('detectsDependencyCycle', () => {
            taskCollection.addTask(new MockBuilder_1.MockBuilder('foo'));
            taskCollection.addTask(new MockBuilder_1.MockBuilder('bar'));
            taskCollection.addDependencies('foo', ['bar']);
            taskCollection.addDependencies('bar', ['foo']);
            expect(() => taskCollection.getOrderedTasks()).toThrowErrorMatchingSnapshot();
        });
        it('respectsDependencyOrder', () => {
            const result = [];
            taskCollection.addTask(new MockBuilder_1.MockBuilder('two', async () => {
                result.push('2');
                return TaskStatus_1.TaskStatus.Success;
            }));
            taskCollection.addTask(new MockBuilder_1.MockBuilder('one', async () => {
                result.push('1');
                return TaskStatus_1.TaskStatus.Success;
            }));
            taskCollection.addDependencies('two', ['one']);
            const tasks = taskCollection.getOrderedTasks();
            expect(tasks.map((t) => t.name).join(',')).toEqual('one,two');
            checkConsoleOutput(terminalProvider);
        });
    });
    describe('Error logging', () => {
        beforeEach(() => {
            taskCollection = new TaskCollection_1.TaskCollection();
        });
    });
});
//# sourceMappingURL=TaskCollection.test.js.map