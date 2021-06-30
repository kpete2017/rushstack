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
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.process = void 0;
const path = __importStar(require("path"));
const node_core_library_1 = require("@rushstack/node-core-library");
// The transpiled output for IdentityMockProxy.ts
const proxyCode = node_core_library_1.FileSystem.readFile(path.join(__dirname, 'identityMock.js')).toString();
/**
 * This Jest transform handles imports of files like CSS that would normally be
 * processed by a Webpack loader.  Instead of actually loading the resource, we return a mock object.
 * The mock simply returns the imported name as a text string.  For example, `mock.xyz` would evaluate to `"xyz"`.
 * This technique is based on "identity-obj-proxy":
 *
 *   https://www.npmjs.com/package/identity-obj-proxy
 *
 * @privateRemarks
 * (We don't import the actual "identity-obj-proxy" package because transform output gets resolved with respect
 * to the target project folder, not Heft's folder.)
 */
function process(src, filename, jestOptions) {
    return proxyCode;
}
exports.process = process;
//# sourceMappingURL=jest-identity-mock-transform.js.map