"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkerPool = exports.WORKER_ID_SYMBOL = void 0;
/**
 * Symbol to read the ID off of a worker
 * @internal
 */
exports.WORKER_ID_SYMBOL = Symbol('workerId');
/**
 * Manages a pool of workers.
 * Workers will be shutdown by sending them the boolean value `false` in a postMessage.
 * @internal
 */
class WorkerPool {
    constructor(options) {
        const { id, maxWorkers, onWorkerDestroyed, prepareWorker, workerData, workerScriptPath } = options;
        this.id = id;
        this.maxWorkers = maxWorkers;
        this._alive = [];
        this._error = undefined;
        this._finishing = false;
        this._idle = [];
        this._nextId = 0;
        this._onComplete = [];
        this._onWorkerDestroyed = onWorkerDestroyed;
        this._pending = [];
        this._prepare = prepareWorker;
        this._workerData = workerData;
        this._workerScript = workerScriptPath;
    }
    /**
     * Gets the count of active workers.
     */
    getActiveCount() {
        return this._alive.length - this._idle.length;
    }
    /**
     * Gets the count of idle workers.
     */
    getIdleCount() {
        return this._idle.length;
    }
    /**
     * Gets the count of live workers.
     */
    getLiveCount() {
        return this._alive.length;
    }
    /**
     * Tells the pool to shut down when all workers are done.
     * Returns a promise that will be fulfilled if all workers finish successfully, or reject with the first error.
     */
    async finishAsync() {
        this._finishing = true;
        if (this._error) {
            throw this._error;
        }
        if (!this._alive.length) {
            // The pool has no live workers, this is a no-op
            return;
        }
        // Clean up all idle workers
        for (const worker of this._idle.splice(0)) {
            worker.postMessage(false);
        }
        // There are still active workers, wait for them to clean up.
        await new Promise((resolve, reject) => this._onComplete.push([resolve, reject]));
    }
    /**
     * Resets the pool and allows more work
     */
    reset() {
        this._finishing = false;
        this._error = undefined;
    }
    /**
     * Returns a worker to the pool. If the pool is finishing, deallocates the worker.
     * @param worker - The worker to free
     */
    checkinWorker(worker) {
        if (this._error) {
            // Shut down the worker (failure)
            worker.postMessage(false);
            return;
        }
        const next = this._pending.shift();
        if (next) {
            // Perform the next unit of work;
            next[0](worker);
        }
        else if (this._finishing) {
            // Shut down the worker (success)
            worker.postMessage(false);
        }
        else {
            // No pending work, idle the workers
            this._idle.push(worker);
        }
    }
    /**
     * Checks out a currently available worker or waits for the next free worker.
     * @param allowCreate - If creating new workers is allowed (subject to maxSize)
     */
    async checkoutWorkerAsync(allowCreate) {
        if (this._error) {
            throw this._error;
        }
        let worker = this._idle.shift();
        if (!worker && allowCreate) {
            worker = this._createWorker();
        }
        if (worker) {
            return worker;
        }
        return await new Promise((resolve, reject) => {
            this._pending.push([resolve, reject]);
        });
    }
    /**
     * Creates a new worker if allowed by maxSize.
     */
    _createWorker() {
        if (this._alive.length >= this.maxWorkers) {
            return;
        }
        // Defer the import to allow WorkerPoolMinifier to be exposed via the index
        const workerConstructor = require('worker_threads').Worker;
        const worker = new workerConstructor(this._workerScript, {
            eval: false,
            workerData: this._workerData
        });
        const id = `${this.id}#${++this._nextId}`;
        worker[exports.WORKER_ID_SYMBOL] = id;
        this._alive.push(worker);
        worker.on('error', (err) => {
            this._onError(err);
            this._destroyWorker(worker);
        });
        worker.on('exit', (exitCode) => {
            if (exitCode !== 0) {
                this._onError(new Error(`Worker ${id} exited with code ${exitCode}`));
            }
            this._destroyWorker(worker);
        });
        if (this._prepare) {
            this._prepare(worker);
        }
        return worker;
    }
    /**
     * Cleans up a worker
     */
    _destroyWorker(worker) {
        const aliveIndex = this._alive.indexOf(worker);
        if (aliveIndex >= 0) {
            this._alive.splice(aliveIndex, 1);
        }
        const freeIndex = this._idle.indexOf(worker);
        if (freeIndex >= 0) {
            this._idle.splice(freeIndex, 1);
        }
        worker.unref();
        if (this._onWorkerDestroyed) {
            this._onWorkerDestroyed();
        }
        if (!this._alive.length && !this._error) {
            for (const [resolve] of this._onComplete) {
                resolve();
            }
        }
    }
    /**
     * Notifies all pending callbacks that an error has occurred and switches this pool into error state.
     */
    _onError(error) {
        this._error = error;
        for (const [, reject] of this._pending.splice(0)) {
            reject(this._error);
        }
        for (const [, reject] of this._onComplete.splice(0)) {
            reject(this._error);
        }
    }
}
exports.WorkerPool = WorkerPool;
//# sourceMappingURL=WorkerPool.js.map