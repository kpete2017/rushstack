"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
const MinifySingleFile_1 = require("../terser/MinifySingleFile");
const worker_threads_1 = require("worker_threads");
const terserOptions = worker_threads_1.workerData;
// Set to non-zero to help debug unexpected graceful exit
process.exitCode = 2;
worker_threads_1.parentPort.on('message', (message) => {
    if (!message) {
        process.exit(0);
    }
    const result = MinifySingleFile_1.minifySingleFile(message, terserOptions);
    worker_threads_1.parentPort.postMessage(result);
});
//# sourceMappingURL=MinifierWorker.js.map