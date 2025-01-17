"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * This simple plugin sets the `__webpack_public_path__` variable to
 *  a value specified in the arguments, optionally appended to the SystemJs baseURL
 *  property.
 * @packageDocumentation
 */
__exportStar(require("./SetPublicPathPlugin"), exports);
var codeGenerator_1 = require("./codeGenerator");
Object.defineProperty(exports, "getGlobalRegisterCode", { enumerable: true, get: function () { return codeGenerator_1.getGlobalRegisterCode; } });
Object.defineProperty(exports, "registryVariableName", { enumerable: true, get: function () { return codeGenerator_1.registryVariableName; } });
//# sourceMappingURL=index.js.map