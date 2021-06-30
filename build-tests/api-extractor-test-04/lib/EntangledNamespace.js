"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntangledNamespace = void 0;
/**
 * This is a "beta" namespace.
 * @beta
 */
var EntangledNamespace;
(function (EntangledNamespace) {
    /**
     * This is a nested namespace.
     * The "beta" release tag is inherited from the parent.
     */
    let N2;
    (function (N2) {
        /**
         * This class is in a nested namespace.
         * @alpha
         */
        class ClassX {
        }
        N2.ClassX = ClassX;
    })(N2 = EntangledNamespace.N2 || (EntangledNamespace.N2 = {}));
    /**
     * This is a nested namespace.
     * The "beta" release tag is inherited from the parent.
     */
    let N3;
    (function (N3) {
        /**
         * This class is in a nested namespace.
         * @internal
         */
        class _ClassY {
            /**
             * This definition refers to the type of a "alpha" namespaced member.
             */
            c() {
                return undefined;
            }
        }
        N3._ClassY = _ClassY;
    })(N3 = EntangledNamespace.N3 || (EntangledNamespace.N3 = {}));
})(EntangledNamespace = exports.EntangledNamespace || (exports.EntangledNamespace = {}));
//# sourceMappingURL=EntangledNamespace.js.map