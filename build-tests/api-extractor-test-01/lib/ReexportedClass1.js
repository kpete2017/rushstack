"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReexportedClass1 = void 0;
/**
 * This class gets aliased twice before being exported from the package.
 * @public
 */
class ReexportedClass1 {
    getSelfReference() {
        return this;
    }
    getValue() {
        return 'Hello, world!';
    }
}
exports.ReexportedClass1 = ReexportedClass1;
//# sourceMappingURL=ReexportedClass1.js.map