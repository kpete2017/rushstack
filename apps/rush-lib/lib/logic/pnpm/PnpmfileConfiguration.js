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
exports.PnpmfileConfiguration = void 0;
const path = __importStar(require("path"));
const node_core_library_1 = require("@rushstack/node-core-library");
const pnpmfile = __importStar(require("./PnpmfileShim"));
/**
 * Loads PNPM's pnpmfile.js configuration, and invokes it to preprocess package.json files,
 * optionally utilizing a pnpmfile shim to inject preferred versions.
 */
class PnpmfileConfiguration {
    constructor(rushConfiguration, pnpmfileShimOptions) {
        if (rushConfiguration.packageManager !== 'pnpm') {
            throw new Error(`PnpmfileConfiguration cannot be used with package manager "${rushConfiguration.packageManager}"`);
        }
        // Set the context to swallow log output and store our settings
        this._context = {
            log: (message) => { },
            pnpmfileShimSettings: PnpmfileConfiguration._getPnpmfileShimSettings(rushConfiguration, pnpmfileShimOptions)
        };
    }
    static async writeCommonTempPnpmfileShimAsync(rushConfiguration, options) {
        if (rushConfiguration.packageManager !== 'pnpm') {
            throw new Error(`PnpmfileConfiguration cannot be used with package manager "${rushConfiguration.packageManager}"`);
        }
        const targetDir = rushConfiguration.commonTempFolder;
        const pnpmfilePath = path.join(targetDir, rushConfiguration.packageManagerWrapper.pnpmfileFilename);
        // Write the shim itself
        await node_core_library_1.FileSystem.copyFileAsync({
            sourcePath: path.join(__dirname, 'PnpmfileShim.js'),
            destinationPath: pnpmfilePath
        });
        const pnpmfileShimSettings = PnpmfileConfiguration._getPnpmfileShimSettings(rushConfiguration, options);
        // Write the settings file used by the shim
        await node_core_library_1.JsonFile.saveAsync(pnpmfileShimSettings, path.join(targetDir, 'pnpmfileSettings.json'), {
            ensureFolderExists: true
        });
    }
    static _getPnpmfileShimSettings(rushConfiguration, options) {
        let allPreferredVersions = {};
        let allowedAlternativeVersions = {};
        // Only workspaces shims in the common versions using pnpmfile
        if (rushConfiguration.packageManagerOptions.useWorkspaces) {
            const commonVersionsConfiguration = rushConfiguration.getCommonVersions();
            const preferredVersions = new Map();
            node_core_library_1.MapExtensions.mergeFromMap(preferredVersions, commonVersionsConfiguration.getAllPreferredVersions());
            node_core_library_1.MapExtensions.mergeFromMap(preferredVersions, rushConfiguration.getImplicitlyPreferredVersions());
            allPreferredVersions = node_core_library_1.MapExtensions.toObject(preferredVersions);
            allowedAlternativeVersions = node_core_library_1.MapExtensions.toObject(commonVersionsConfiguration.allowedAlternativeVersions);
        }
        const settings = {
            allPreferredVersions,
            allowedAlternativeVersions,
            semverPath: require.resolve('semver')
        };
        // Use the provided path if available. Otherwise, use the default path.
        const userPnpmfilePath = rushConfiguration.getPnpmfilePath(options === null || options === void 0 ? void 0 : options.variant);
        if (userPnpmfilePath && node_core_library_1.FileSystem.exists(userPnpmfilePath)) {
            settings.userPnpmfilePath = userPnpmfilePath;
        }
        return settings;
    }
    /**
     * Transform a package.json file using the pnpmfile.js hook.
     * @returns the tranformed object, or the original input if pnpmfile.js was not found.
     */
    transform(packageJson) {
        var _a;
        if (!((_a = pnpmfile.hooks) === null || _a === void 0 ? void 0 : _a.readPackage) || !this._context) {
            return packageJson;
        }
        else {
            return pnpmfile.hooks.readPackage(packageJson, this._context);
        }
    }
}
exports.PnpmfileConfiguration = PnpmfileConfiguration;
//# sourceMappingURL=PnpmfileConfiguration.js.map