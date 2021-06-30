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
exports.getWebpackVersions = void 0;
const webpack = __importStar(require("webpack"));
const node_core_library_1 = require("@rushstack/node-core-library");
let _webpackVersions;
function getWebpackVersions() {
    if (!_webpackVersions) {
        const webpackDevServerPackageJsonPath = node_core_library_1.Import.resolveModule({
            modulePath: 'webpack-dev-server/package.json',
            baseFolderPath: __dirname
        });
        const webpackDevServerPackageJson = node_core_library_1.PackageJsonLookup.instance.loadPackageJson(webpackDevServerPackageJsonPath);
        _webpackVersions = {
            webpackVersion: webpack.version,
            webpackDevServerVersion: webpackDevServerPackageJson.version
        };
    }
    return _webpackVersions;
}
exports.getWebpackVersions = getWebpackVersions;
//# sourceMappingURL=shared.js.map