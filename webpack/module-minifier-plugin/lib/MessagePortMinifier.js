"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessagePortMinifier = void 0;
/**
 * Minifier implementation that outsources requests to the other side of a MessagePort
 * @public
 */
class MessagePortMinifier {
    constructor(port) {
        this.port = port;
        const callbacks = (this._callbacks = new Map());
        port.on('message', (message) => {
            if (typeof message === 'object') {
                const callbacksForRequest = callbacks.get(message.hash);
                callbacks.delete(message.hash);
                for (const callback of callbacksForRequest) {
                    callback(message);
                }
            }
        });
    }
    /**
     * No-op code transform.
     * @param request - The request to process
     * @param callback - The callback to invoke
     */
    minify(request, callback) {
        const { hash } = request;
        const callbacks = this._callbacks.get(hash);
        if (callbacks) {
            callbacks.push(callback);
            return;
        }
        this._callbacks.set(hash, [callback]);
        this.port.postMessage(request);
    }
}
exports.MessagePortMinifier = MessagePortMinifier;
//# sourceMappingURL=MessagePortMinifier.js.map