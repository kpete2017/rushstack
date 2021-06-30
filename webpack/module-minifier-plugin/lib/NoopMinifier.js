"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.NoopMinifier = void 0;
/**
 * Minifier implementation that does not actually transform the code, for debugging.
 * @public
 */
class NoopMinifier {
    /**
     * No-op code transform.
     * @param request - The request to process
     * @param callback - The callback to invoke
     */
    minify(request, callback) {
        const { code, hash } = request;
        callback({
            hash,
            error: undefined,
            code,
            map: undefined,
            extractedComments: []
        });
    }
}
exports.NoopMinifier = NoopMinifier;
//# sourceMappingURL=NoopMinifier.js.map