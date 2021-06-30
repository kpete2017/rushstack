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
exports.generateLicenseFileForAsset = void 0;
const path = __importStar(require("path"));
const webpack_sources_1 = require("webpack-sources");
/**
 * Generates a companion asset containing all extracted comments. If it is non-empty, returns a banner comment directing users to said companion asset.
 *
 * @param compilation - The webpack compilation
 * @param asset - The asset to process
 * @param minifiedModules - The minified modules to pull comments from
 * @param assetName - The name of the asset
 * @public
 */
function generateLicenseFileForAsset(compilation, asset, minifiedModules) {
    // Extracted comments from the minified asset and from the modules.
    // The former generally will be nonexistent (since it contains only the runtime), but the modules may have some.
    const comments = new Set(asset.extractedComments);
    for (const moduleId of asset.modules) {
        const mod = minifiedModules.get(moduleId);
        if (mod) {
            for (const comment of mod.extractedComments) {
                comments.add(comment);
            }
        }
    }
    const assetName = asset.fileName;
    let banner = '';
    if (comments.size) {
        // There are license comments in this chunk, so generate the companion file and inject a banner
        const licenseSource = new webpack_sources_1.ConcatSource();
        comments.forEach((comment) => {
            licenseSource.add(comment);
        });
        const licenseFileName = `${assetName}.LICENSE.txt`;
        compilation.assets[licenseFileName] = licenseSource;
        banner = `/*! For license information please see ${path.basename(licenseFileName)} */\n`;
    }
    return banner;
}
exports.generateLicenseFileForAsset = generateLicenseFileForAsset;
//# sourceMappingURL=GenerateLicenseFileForAsset.js.map