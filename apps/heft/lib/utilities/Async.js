"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.Async = void 0;
const node_core_library_1 = require("@rushstack/node-core-library");
class Async {
    static async forEachLimitAsync(array, parallelismLimit, fn) {
        // Defer to the implementation in node-core-library
        return node_core_library_1.Async.forEachAsync(array, fn, { concurrency: parallelismLimit });
    }
    static runWatcherWithErrorHandling(fn, scopedLogger) {
        try {
            fn().catch((e) => scopedLogger.emitError(e));
        }
        catch (e) {
            scopedLogger.emitError(e);
        }
    }
}
exports.Async = Async;
//# sourceMappingURL=Async.js.map