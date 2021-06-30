"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublicClass = void 0;
/**
 * This is a public class
 * @public
 */
class PublicClass {
    /** @internal */
    constructor(parameters) {
        /**
         * This is a beta field
         * @beta
         */
        this.betaField = 'hello';
    }
    /**
     * This is a comment
     */
    undecoratedMember() { }
    /**
     * This is a beta comment
     * @beta
     */
    betaMember() { }
    /**
     * This is an alpha comment
     * @alpha
     */
    alphaMember() { }
    /**
     * This is an internal member
     * @internal
     */
    _internalMember() { }
}
exports.PublicClass = PublicClass;
//# sourceMappingURL=PublicClass.js.map