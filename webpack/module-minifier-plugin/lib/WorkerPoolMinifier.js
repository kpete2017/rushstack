"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkerPoolMinifier = void 0;
const WorkerPool_1 = require("./workerPool/WorkerPool");
const os_1 = require("os");
require("./OverrideWebpackIdentifierAllocation");
/**
 * Minifier implementation that uses a thread pool for minification.
 * @public
 */
class WorkerPoolMinifier {
    constructor(options) {
        const { maxThreads = os_1.cpus().length, terserOptions = {} } = options || {};
        const activeRequests = new Map();
        const resultCache = new Map();
        const terserPool = new WorkerPool_1.WorkerPool({
            id: 'Minifier',
            maxWorkers: maxThreads,
            prepareWorker: (worker) => {
                worker.on('message', (message) => {
                    const callbacks = activeRequests.get(message.hash);
                    activeRequests.delete(message.hash);
                    resultCache.set(message.hash, message);
                    for (const callback of callbacks) {
                        callback(message);
                    }
                    terserPool.checkinWorker(worker);
                });
            },
            workerData: terserOptions,
            workerScriptPath: require.resolve('./workerPool/MinifierWorker')
        });
        this._activeRequests = activeRequests;
        this._refCount = 0;
        this._resultCache = resultCache;
        this._pool = terserPool;
        this._deduped = 0;
        this._minified = 0;
    }
    get maxThreads() {
        return this._pool.maxWorkers;
    }
    set maxThreads(threads) {
        this._pool.maxWorkers = threads;
    }
    /**
     * Transform code by farming it out to a worker pool.
     * @param request - The request to process
     * @param callback - The callback to invoke
     */
    minify(request, callback) {
        const { hash } = request;
        const cached = this._resultCache.get(hash);
        if (cached) {
            ++this._deduped;
            return callback(cached);
        }
        const { _activeRequests: activeRequests } = this;
        const callbacks = activeRequests.get(hash);
        if (callbacks) {
            ++this._deduped;
            callbacks.push(callback);
            return;
        }
        activeRequests.set(hash, [callback]);
        ++this._minified;
        this._pool
            .checkoutWorkerAsync(true)
            .then((worker) => {
            worker.postMessage(request);
        })
            .catch((error) => {
            const errorCallbacks = activeRequests.get(hash);
            for (const errorCallback of errorCallbacks) {
                errorCallback({
                    hash,
                    error,
                    code: undefined,
                    map: undefined,
                    extractedComments: undefined
                });
            }
        });
    }
    ref() {
        if (++this._refCount === 1) {
            this._pool.reset();
        }
        return async () => {
            if (--this._refCount === 0) {
                await this._pool.finishAsync();
                console.log(`Module minification: ${this._deduped} Deduped, ${this._minified} Processed`);
            }
        };
    }
}
exports.WorkerPoolMinifier = WorkerPoolMinifier;
//# sourceMappingURL=WorkerPoolMinifier.js.map