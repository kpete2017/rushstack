"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
const Async_1 = require("../Async");
describe('Async', () => {
    describe('mapAsync', () => {
        it('returns the same result as built-in Promise.all', async () => {
            const array = [1, 2, 3, 4, 5, 6, 7, 8];
            const fn = async (item) => `result ${item}`;
            expect(await Async_1.Async.mapAsync(array, fn)).toEqual(await Promise.all(array.map(fn)));
        });
        it('passes an index parameter to the callback function', async () => {
            const array = [1, 2, 3];
            const fn = jest.fn(async (item) => `result ${item}`);
            await Async_1.Async.mapAsync(array, fn);
            expect(fn).toHaveBeenNthCalledWith(1, 1, 0);
            expect(fn).toHaveBeenNthCalledWith(2, 2, 1);
            expect(fn).toHaveBeenNthCalledWith(3, 3, 2);
        });
        it('returns the same result as built-in Promise.all', async () => {
            const array = [1, 2, 3, 4, 5, 6, 7, 8];
            const fn = async (item) => `result ${item}`;
            expect(await Async_1.Async.mapAsync(array, fn)).toEqual(await Promise.all(array.map(fn)));
        });
        it('if concurrency is set, ensures no more than N operations occur in parallel', async () => {
            let running = 0;
            let maxRunning = 0;
            const array = [1, 2, 3, 4, 5, 6, 7, 8];
            const fn = async (item) => {
                running++;
                await Async_1.Async.sleep(1);
                maxRunning = Math.max(maxRunning, running);
                running--;
                return `result ${item}`;
            };
            expect(await Async_1.Async.mapAsync(array, fn, { concurrency: 3 })).toEqual([
                'result 1',
                'result 2',
                'result 3',
                'result 4',
                'result 5',
                'result 6',
                'result 7',
                'result 8'
            ]);
            expect(maxRunning).toEqual(3);
        });
    });
    describe('forEachAsync', () => {
        it('if concurrency is set, ensures no more than N operations occur in parallel', async () => {
            let running = 0;
            let maxRunning = 0;
            const array = [1, 2, 3, 4, 5, 6, 7, 8];
            const fn = jest.fn(async (item) => {
                running++;
                await Async_1.Async.sleep(1);
                maxRunning = Math.max(maxRunning, running);
                running--;
            });
            await Async_1.Async.forEachAsync(array, fn, { concurrency: 3 });
            expect(fn).toHaveBeenCalledTimes(8);
            expect(maxRunning).toEqual(3);
        });
        it('rejects if any operation rejects', async () => {
            const array = [1, 2, 3];
            const fn = jest.fn(async (item) => {
                await Async_1.Async.sleep(1);
                if (item === 3)
                    throw new Error('Something broke');
            });
            await expect(() => Async_1.Async.forEachAsync(array, fn, { concurrency: 3 })).rejects.toThrowError('Something broke');
            expect(fn).toHaveBeenCalledTimes(3);
        });
        it('rejects if any operation synchronously throws', async () => {
            const array = [1, 2, 3];
            // The compiler is (rightly) very concerned about us claiming that this synchronous
            // function is going to return a promise. This situation is not very likely in a
            // TypeScript project, but it's such a common problem in JavaScript projects that
            // it's worth doing an explicit test.
            const fn = jest.fn((item) => {
                if (item === 3)
                    throw new Error('Something broke');
            });
            await expect(() => Async_1.Async.forEachAsync(array, fn, { concurrency: 3 })).rejects.toThrowError('Something broke');
            expect(fn).toHaveBeenCalledTimes(3);
        });
    });
});
//# sourceMappingURL=Async.test.js.map