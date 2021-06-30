"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
const terminal_1 = require("@rushstack/terminal");
const StreamCollator_1 = require("../StreamCollator");
let collator;
const mockWritable = new terminal_1.MockWritable();
describe('StreamCollator tests', () => {
    // Reset task information before each test
    beforeEach(() => {
        mockWritable.reset();
        collator = new StreamCollator_1.StreamCollator({ destination: mockWritable });
    });
    describe('Testing register and close', () => {
        it('can register a task', () => {
            const helloWorldWriter = collator.registerTask('Hello World');
            expect(helloWorldWriter.taskName).toEqual('Hello World');
        });
        it('should not let you register two tasks with the same name', () => {
            const taskName = 'Hello World';
            expect(() => {
                collator.registerTask(taskName);
            }).not.toThrow();
            expect(() => {
                collator.registerTask(taskName);
            }).toThrow();
        });
        it('should not let you close a task twice', () => {
            const taskName = 'Hello World';
            const writer = collator.registerTask(taskName);
            writer.close();
            expect(writer.close).toThrow();
        });
        it('should not let you write to a closed task', () => {
            const taskName = 'Hello World';
            const writer = collator.registerTask(taskName);
            writer.close();
            expect(() => {
                writer.terminal.writeChunk({ text: '1', kind: "O" /* Stdout */ });
            }).toThrow();
        });
    });
    describe('Testing write functions', () => {
        it('writeLine should add a newline', () => {
            const taskA = collator.registerTask('A');
            const text = 'Hello World';
            taskA.terminal.writeChunk({ text, kind: "O" /* Stdout */ });
            expect(mockWritable.chunks).toEqual([{ text, kind: "O" /* Stdout */ }]);
        });
        it('should write errors to stderr', () => {
            const taskA = collator.registerTask('A');
            const error = 'Critical error';
            taskA.terminal.writeChunk({ text: error, kind: "E" /* Stderr */ });
            expect(mockWritable.chunks).toEqual([{ text: error, kind: "E" /* Stderr */ }]);
            taskA.close();
            expect(taskA.bufferedChunks).toEqual([]);
            expect(mockWritable.chunks).toEqual([{ text: error, kind: "E" /* Stderr */ }]);
        });
    });
    describe('Testing that output is interleaved', () => {
        it('should not write non-active tasks to stdout', () => {
            const taskA = collator.registerTask('A');
            const taskB = collator.registerTask('B');
            taskA.terminal.writeChunk({ text: '1', kind: "O" /* Stdout */ });
            expect(taskA.bufferedChunks).toEqual([]);
            expect(mockWritable.chunks).toEqual([{ text: '1', kind: "O" /* Stdout */ }]);
            taskB.terminal.writeChunk({ text: '2', kind: "O" /* Stdout */ });
            expect(taskB.bufferedChunks).toEqual([{ text: '2', kind: "O" /* Stdout */ }]);
            expect(mockWritable.chunks).toEqual([{ text: '1', kind: "O" /* Stdout */ }]);
            taskA.terminal.writeChunk({ text: '3', kind: "O" /* Stdout */ });
            expect(mockWritable.chunks).toEqual([
                { text: '1', kind: "O" /* Stdout */ },
                { text: '3', kind: "O" /* Stdout */ }
            ]);
            taskA.close();
            expect(mockWritable.chunks).toEqual([
                { text: '1', kind: "O" /* Stdout */ },
                { text: '3', kind: "O" /* Stdout */ },
                { text: '2', kind: "O" /* Stdout */ }
            ]);
            taskB.close();
            expect(mockWritable.chunks).toEqual([
                { text: '1', kind: "O" /* Stdout */ },
                { text: '3', kind: "O" /* Stdout */ },
                { text: '2', kind: "O" /* Stdout */ }
            ]);
            expect(taskA.bufferedChunks).toEqual([]);
            expect(taskB.bufferedChunks).toEqual([]);
        });
        it('should update the active task once the active task is closed', () => {
            const taskA = collator.registerTask('A');
            const taskB = collator.registerTask('B');
            taskA.terminal.writeChunk({ text: '1', kind: "O" /* Stdout */ });
            expect(mockWritable.chunks).toEqual([{ text: '1', kind: "O" /* Stdout */ }]);
            taskA.close();
            taskB.terminal.writeChunk({ text: '2', kind: "O" /* Stdout */ });
            expect(mockWritable.chunks).toEqual([
                { text: '1', kind: "O" /* Stdout */ },
                { text: '2', kind: "O" /* Stdout */ }
            ]);
            taskB.close();
            expect(mockWritable.chunks).toEqual([
                { text: '1', kind: "O" /* Stdout */ },
                { text: '2', kind: "O" /* Stdout */ }
            ]);
        });
        it('should write completed tasks after the active task is completed', () => {
            const taskA = collator.registerTask('A');
            const taskB = collator.registerTask('B');
            taskA.terminal.writeChunk({ text: '1', kind: "O" /* Stdout */ });
            expect(mockWritable.chunks).toEqual([{ text: '1', kind: "O" /* Stdout */ }]);
            taskB.terminal.writeChunk({ text: '2', kind: "O" /* Stdout */ });
            expect(mockWritable.chunks).toEqual([{ text: '1', kind: "O" /* Stdout */ }]);
            taskB.close();
            expect(mockWritable.chunks).toEqual([{ text: '1', kind: "O" /* Stdout */ }]);
            taskA.close();
            expect(mockWritable.chunks).toEqual([
                { text: '1', kind: "O" /* Stdout */ },
                { text: '2', kind: "O" /* Stdout */ }
            ]);
        });
    });
});
//# sourceMappingURL=StreamCollator.test.js.map