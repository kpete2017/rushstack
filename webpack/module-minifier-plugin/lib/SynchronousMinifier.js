"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.SynchronousMinifier = void 0;
const MinifySingleFile_1 = require("./terser/MinifySingleFile");
require("./OverrideWebpackIdentifierAllocation");
/**
 * Minifier implementation that synchronously minifies code on the main thread.
 * @public
 */
class SynchronousMinifier {
    constructor(options) {
        const { terserOptions = {} } = options || {};
        this.terserOptions = {
            ...terserOptions,
            output: terserOptions.output
                ? {
                    ...terserOptions.output
                }
                : {}
        };
        this._resultCache = new Map();
    }
    /**
     * Transform that synchronously invokes Terser
     * @param request - The request to process
     * @param callback - The callback to invoke
     */
    minify(request, callback) {
        const { hash } = request;
        const cached = this._resultCache.get(hash);
        if (cached) {
            return callback(cached);
        }
        const result = MinifySingleFile_1.minifySingleFile(request, this.terserOptions);
        this._resultCache.set(hash, result);
        callback(result);
    }
}
exports.SynchronousMinifier = SynchronousMinifier;
//# sourceMappingURL=SynchronousMinifier.js.map