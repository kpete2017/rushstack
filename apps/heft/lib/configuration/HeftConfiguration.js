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
exports.HeftConfiguration = void 0;
const path = __importStar(require("path"));
const node_core_library_1 = require("@rushstack/node-core-library");
const true_case_path_1 = require("true-case-path");
const rig_package_1 = require("@rushstack/rig-package");
const Constants_1 = require("../utilities/Constants");
/**
 * @public
 */
class HeftConfiguration {
    constructor() { }
    /**
     * Project build folder. This is the folder containing the project's package.json file.
     */
    get buildFolder() {
        return this._buildFolder;
    }
    /**
     * The path to the project's ".heft" folder.
     */
    get projectHeftDataFolder() {
        if (!this._projectHeftDataFolder) {
            this._projectHeftDataFolder = path.join(this.buildFolder, Constants_1.Constants.projectHeftFolderName);
        }
        return this._projectHeftDataFolder;
    }
    /**
     * The path to the project's "config" folder.
     */
    get projectConfigFolder() {
        if (!this._projectConfigFolder) {
            this._projectConfigFolder = path.join(this.buildFolder, Constants_1.Constants.projectConfigFolderName);
        }
        return this._projectConfigFolder;
    }
    /**
     * The project's build cache folder.
     *
     * This folder exists at \<project root\>/.heft/build-cache. TypeScript's output
     * goes into this folder and then is either copied or linked to the final output folder
     */
    get buildCacheFolder() {
        if (!this._buildCacheFolder) {
            this._buildCacheFolder = path.join(this.projectHeftDataFolder, Constants_1.Constants.buildCacheFolderName);
        }
        return this._buildCacheFolder;
    }
    /**
     * The rig.json configuration for this project, if present.
     */
    get rigConfig() {
        if (!this._rigConfig) {
            throw new node_core_library_1.InternalError('The rigConfig cannot be accessed until HeftConfiguration.checkForRigAsync() has been called');
        }
        return this._rigConfig;
    }
    /**
     * Terminal instance to facilitate logging.
     */
    get globalTerminal() {
        return this._globalTerminal;
    }
    /**
     * Terminal provider for the provided terminal.
     */
    get terminalProvider() {
        return this._terminalProvider;
    }
    /**
     * The Heft tool's package.json
     */
    get heftPackageJson() {
        return node_core_library_1.PackageJsonLookup.instance.tryLoadPackageJsonFor(__dirname);
    }
    /**
     * The package.json of the project being built
     */
    get projectPackageJson() {
        return node_core_library_1.PackageJsonLookup.instance.tryLoadPackageJsonFor(this.buildFolder);
    }
    /**
     * Performs the search for rig.json and initializes the `HeftConfiguration.rigConfig` object.
     * @internal
     */
    async _checkForRigAsync() {
        if (!this._rigConfig) {
            this._rigConfig = await rig_package_1.RigConfig.loadForProjectFolderAsync({ projectFolderPath: this._buildFolder });
        }
    }
    /**
     * @internal
     */
    static initialize(options) {
        const configuration = new HeftConfiguration();
        const packageJsonPath = node_core_library_1.PackageJsonLookup.instance.tryGetPackageJsonFilePathFor(options.cwd);
        if (packageJsonPath) {
            let buildFolder = path.dirname(packageJsonPath);
            // The CWD path's casing may be incorrect on a case-insensitive filesystem. Some tools, like Jest
            // expect the casing of the project path to be correct and produce unexpected behavior when the casing
            // isn't correct.
            // This ensures the casing of the project folder is correct.
            buildFolder = true_case_path_1.trueCasePathSync(buildFolder);
            configuration._buildFolder = buildFolder;
        }
        else {
            throw new Error('No package.json file found. Are you in a project folder?');
        }
        configuration._terminalProvider = options.terminalProvider;
        configuration._globalTerminal = new node_core_library_1.Terminal(options.terminalProvider);
        return configuration;
    }
}
exports.HeftConfiguration = HeftConfiguration;
//# sourceMappingURL=HeftConfiguration.js.map