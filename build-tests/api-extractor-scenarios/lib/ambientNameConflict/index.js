"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.ambientNameConflict = void 0;
/**
 * @public
 */
function ambientNameConflict(p1, p2) {
    // p1 is using the ambient Promise from the compiler's runtime
    // p2 is using the declaration from localFile, which happens to use the same name "Promise"
}
exports.ambientNameConflict = ambientNameConflict;
//# sourceMappingURL=index.js.map