"use strict";
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
exports.EnvironmentConfiguration = void 0;
const node_core_library_1 = require("@rushstack/node-core-library");
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
const os = __importStar(require("os"));
const path = __importStar(require("path"));
const true_case_path_1 = require("true-case-path");
/**
 * Provides Rush-specific environment variable data. All Rush environment variables must start with "RUSH_". This class
 * is designed to be used by RushConfiguration.
 *
 * @remarks
 * Initialize will throw if any unknown parameters are present.
 */
class EnvironmentConfiguration {
    /**
     * An override for the common/temp folder path.
     */
    static get rushTempFolderOverride() {
        EnvironmentConfiguration._ensureInitialized();
        return EnvironmentConfiguration._rushTempFolderOverride;
    }
    /**
     * If "1", create symlinks with absolute paths instead of relative paths.
     * See {@link EnvironmentVariableNames.RUSH_ABSOLUTE_SYMLINKS}
     */
    static get absoluteSymlinks() {
        EnvironmentConfiguration._ensureInitialized();
        return EnvironmentConfiguration._absoluteSymlinks;
    }
    /**
     * If this environment variable is set to "1", the Node.js version check will print a warning
     * instead of causing a hard error if the environment's Node.js version doesn't match the
     * version specifier in `rush.json`'s "nodeSupportedVersionRange" property.
     *
     * See {@link EnvironmentVariableNames.RUSH_ALLOW_UNSUPPORTED_NODEJS}.
     */
    static get allowUnsupportedNodeVersion() {
        EnvironmentConfiguration._ensureInitialized();
        return EnvironmentConfiguration._allowUnsupportedNodeVersion;
    }
    /**
     * Setting this environment variable overrides the value of `allowWarningsInSuccessfulBuild`
     * in the `command-line.json` configuration file. Specify `1` to allow warnings in a successful build,
     * or `0` to disallow them. (See the comments in the command-line.json file for more information).
     */
    static get allowWarningsInSuccessfulBuild() {
        EnvironmentConfiguration._ensureInitialized();
        return EnvironmentConfiguration._allowWarningsInSuccessfulBuild;
    }
    /**
     * An override for the PNPM store path, if `pnpmStore` configuration is set to 'path'
     * See {@link EnvironmentVariableNames.RUSH_PNPM_STORE_PATH}
     */
    static get pnpmStorePathOverride() {
        EnvironmentConfiguration._ensureInitialized();
        return EnvironmentConfiguration._pnpmStorePathOverride;
    }
    /**
     * Overrides the location of the `~/.rush` global folder where Rush stores temporary files.
     * See {@link EnvironmentVariableNames.RUSH_GLOBAL_FOLDER}
     */
    static get rushGlobalFolderOverride() {
        EnvironmentConfiguration._ensureInitialized();
        return EnvironmentConfiguration._rushGlobalFolderOverride;
    }
    /**
     * Provides a credential for reading from and writing to a remote build cache, if configured.
     * See {@link EnvironmentVariableNames.RUSH_BUILD_CACHE_CREDENTIAL}
     */
    static get buildCacheCredential() {
        EnvironmentConfiguration._ensureInitialized();
        return EnvironmentConfiguration._buildCacheCredential;
    }
    /**
     * If set, enables or disables the cloud build cache feature.
     * See {@link EnvironmentVariableNames.RUSH_BUILD_CACHE_ENABLED}
     */
    static get buildCacheEnabled() {
        EnvironmentConfiguration._ensureInitialized();
        return EnvironmentConfiguration._buildCacheEnabled;
    }
    /**
     * If set, enables or disables writing to the cloud build cache.
     * See {@link EnvironmentVariableNames.RUSH_BUILD_CACHE_WRITE_ALLOWED}
     */
    static get buildCacheWriteAllowed() {
        EnvironmentConfiguration._ensureInitialized();
        return EnvironmentConfiguration._buildCacheWriteAllowed;
    }
    /**
     * Allows the git binary path to be explicitly provided.
     * See {@link EnvironmentVariableNames.RUSH_GIT_BINARY_PATH}
     */
    static get gitBinaryPath() {
        EnvironmentConfiguration._ensureInitialized();
        return EnvironmentConfiguration._gitBinaryPath;
    }
    /**
     * The front-end RushVersionSelector relies on `RUSH_GLOBAL_FOLDER`, so its value must be read before
     * `EnvironmentConfiguration` is initialized (and actually before the correct version of `EnvironmentConfiguration`
     * is even installed). Thus we need to read this environment variable differently from all the others.
     * @internal
     */
    static _getRushGlobalFolderOverride(processEnv) {
        const value = processEnv["RUSH_GLOBAL_FOLDER" /* RUSH_GLOBAL_FOLDER */];
        if (value) {
            const normalizedValue = EnvironmentConfiguration._normalizeDeepestParentFolderPath(value);
            return normalizedValue;
        }
    }
    /**
     * Reads and validates environment variables. If any are invalid, this function will throw.
     */
    static initialize(options = {}) {
        var _a, _b, _c;
        EnvironmentConfiguration.reset();
        const unknownEnvVariables = [];
        for (const envVarName in process.env) {
            if (process.env.hasOwnProperty(envVarName) && envVarName.match(/^RUSH_/i)) {
                const value = process.env[envVarName];
                // Environment variables are only case-insensitive on Windows
                const normalizedEnvVarName = os.platform() === 'win32' ? envVarName.toUpperCase() : envVarName;
                switch (normalizedEnvVarName) {
                    case "RUSH_TEMP_FOLDER" /* RUSH_TEMP_FOLDER */: {
                        EnvironmentConfiguration._rushTempFolderOverride =
                            value && !options.doNotNormalizePaths
                                ? EnvironmentConfiguration._normalizeDeepestParentFolderPath(value) || value
                                : value;
                        break;
                    }
                    case "RUSH_ABSOLUTE_SYMLINKS" /* RUSH_ABSOLUTE_SYMLINKS */: {
                        EnvironmentConfiguration._absoluteSymlinks = (_a = EnvironmentConfiguration.parseBooleanEnvironmentVariable("RUSH_ABSOLUTE_SYMLINKS" /* RUSH_ABSOLUTE_SYMLINKS */, value)) !== null && _a !== void 0 ? _a : false;
                        break;
                    }
                    case "RUSH_ALLOW_UNSUPPORTED_NODEJS" /* RUSH_ALLOW_UNSUPPORTED_NODEJS */: {
                        if (value === 'true' || value === 'false') {
                            // Small, undocumented acceptance of old "true" and "false" values for
                            // users of RUSH_ALLOW_UNSUPPORTED_NODEJS in rush pre-v5.46.
                            EnvironmentConfiguration._allowUnsupportedNodeVersion = value === 'true';
                        }
                        else {
                            EnvironmentConfiguration._allowUnsupportedNodeVersion = (_b = EnvironmentConfiguration.parseBooleanEnvironmentVariable("RUSH_ALLOW_UNSUPPORTED_NODEJS" /* RUSH_ALLOW_UNSUPPORTED_NODEJS */, value)) !== null && _b !== void 0 ? _b : false;
                        }
                        break;
                    }
                    case "RUSH_ALLOW_WARNINGS_IN_SUCCESSFUL_BUILD" /* RUSH_ALLOW_WARNINGS_IN_SUCCESSFUL_BUILD */: {
                        EnvironmentConfiguration._allowWarningsInSuccessfulBuild = (_c = EnvironmentConfiguration.parseBooleanEnvironmentVariable("RUSH_ALLOW_WARNINGS_IN_SUCCESSFUL_BUILD" /* RUSH_ALLOW_WARNINGS_IN_SUCCESSFUL_BUILD */, value)) !== null && _c !== void 0 ? _c : false;
                        break;
                    }
                    case "RUSH_PNPM_STORE_PATH" /* RUSH_PNPM_STORE_PATH */: {
                        EnvironmentConfiguration._pnpmStorePathOverride =
                            value && !options.doNotNormalizePaths
                                ? EnvironmentConfiguration._normalizeDeepestParentFolderPath(value) || value
                                : value;
                        break;
                    }
                    case "RUSH_GLOBAL_FOLDER" /* RUSH_GLOBAL_FOLDER */: {
                        // Handled specially below
                        break;
                    }
                    case "RUSH_BUILD_CACHE_CREDENTIAL" /* RUSH_BUILD_CACHE_CREDENTIAL */: {
                        EnvironmentConfiguration._buildCacheCredential = value;
                        break;
                    }
                    case "RUSH_BUILD_CACHE_ENABLED" /* RUSH_BUILD_CACHE_ENABLED */: {
                        EnvironmentConfiguration._buildCacheEnabled =
                            EnvironmentConfiguration.parseBooleanEnvironmentVariable("RUSH_BUILD_CACHE_ENABLED" /* RUSH_BUILD_CACHE_ENABLED */, value);
                        break;
                    }
                    case "RUSH_BUILD_CACHE_WRITE_ALLOWED" /* RUSH_BUILD_CACHE_WRITE_ALLOWED */: {
                        EnvironmentConfiguration._buildCacheWriteAllowed =
                            EnvironmentConfiguration.parseBooleanEnvironmentVariable("RUSH_BUILD_CACHE_WRITE_ALLOWED" /* RUSH_BUILD_CACHE_WRITE_ALLOWED */, value);
                        break;
                    }
                    case "RUSH_GIT_BINARY_PATH" /* RUSH_GIT_BINARY_PATH */: {
                        EnvironmentConfiguration._gitBinaryPath = value;
                        break;
                    }
                    case "RUSH_PARALLELISM" /* RUSH_PARALLELISM */:
                    case "RUSH_PREVIEW_VERSION" /* RUSH_PREVIEW_VERSION */:
                    case "RUSH_VARIANT" /* RUSH_VARIANT */:
                    case "RUSH_DEPLOY_TARGET_FOLDER" /* RUSH_DEPLOY_TARGET_FOLDER */:
                        // Handled by @microsoft/rush front end
                        break;
                    case "RUSH_INVOKED_FOLDER" /* RUSH_INVOKED_FOLDER */:
                        // Assigned by Rush itself
                        break;
                    default:
                        unknownEnvVariables.push(envVarName);
                        break;
                }
            }
        }
        // This strictness intends to catch mistakes where variables are misspelled or not used correctly.
        if (unknownEnvVariables.length > 0) {
            throw new Error('The following environment variables were found with the "RUSH_" prefix, but they are not ' +
                `recognized by this version of Rush: ${unknownEnvVariables.join(', ')}`);
        }
        // See doc comment for EnvironmentConfiguration._getRushGlobalFolderOverride().
        EnvironmentConfiguration._rushGlobalFolderOverride =
            EnvironmentConfiguration._getRushGlobalFolderOverride(process.env);
        EnvironmentConfiguration._hasBeenInitialized = true;
    }
    /**
     * Resets EnvironmentConfiguration into an un-initialized state.
     */
    static reset() {
        EnvironmentConfiguration._rushTempFolderOverride = undefined;
        EnvironmentConfiguration._hasBeenInitialized = false;
    }
    static _ensureInitialized() {
        if (!EnvironmentConfiguration._hasBeenInitialized) {
            throw new node_core_library_1.InternalError('The EnvironmentConfiguration must be initialized before values can be accessed.');
        }
    }
    static parseBooleanEnvironmentVariable(name, value) {
        if (value === '' || value === undefined) {
            return undefined;
        }
        else if (value === '0') {
            return false;
        }
        else if (value === '1') {
            return true;
        }
        else {
            throw new Error(`Invalid value "${value}" for the environment variable ${name}. Valid choices are 0 or 1.`);
        }
    }
    /**
     * Given a path to a folder (that may or may not exist), normalize the path, including casing,
     * to the first existing parent folder in the path.
     *
     * If no existing path can be found (for example, if the root is a volume that doesn't exist),
     * this function returns undefined.
     *
     * @example
     * If the following path exists on disk: C:\Folder1\folder2\
     * _normalizeFirstExistingFolderPath('c:\\folder1\\folder2\\temp\\subfolder')
     * returns 'C:\\Folder1\\folder2\\temp\\subfolder'
     */
    static _normalizeDeepestParentFolderPath(folderPath) {
        folderPath = path.normalize(folderPath);
        const endsWithSlash = folderPath.charAt(folderPath.length - 1) === path.sep;
        const parsedPath = path.parse(folderPath);
        const pathRoot = parsedPath.root;
        const pathWithoutRoot = parsedPath.dir.substr(pathRoot.length);
        const pathParts = [...pathWithoutRoot.split(path.sep), parsedPath.name].filter((part) => !!part);
        // Starting with all path sections, and eliminating one from the end during each loop iteration,
        // run trueCasePathSync. If trueCasePathSync returns without exception, we've found a subset
        // of the path that exists and we've now gotten the correct casing.
        //
        // Once we've found a parent folder that exists, append the path sections that didn't exist.
        for (let i = pathParts.length; i >= 0; i--) {
            const constructedPath = path.join(pathRoot, ...pathParts.slice(0, i));
            try {
                const normalizedConstructedPath = true_case_path_1.trueCasePathSync(constructedPath);
                const result = path.join(normalizedConstructedPath, ...pathParts.slice(i));
                if (endsWithSlash) {
                    return `${result}${path.sep}`;
                }
                else {
                    return result;
                }
            }
            catch (e) {
                // This path doesn't exist, continue to the next subpath
            }
        }
        return undefined;
    }
}
exports.EnvironmentConfiguration = EnvironmentConfiguration;
EnvironmentConfiguration._hasBeenInitialized = false;
EnvironmentConfiguration._absoluteSymlinks = false;
EnvironmentConfiguration._allowUnsupportedNodeVersion = false;
EnvironmentConfiguration._allowWarningsInSuccessfulBuild = false;
//# sourceMappingURL=EnvironmentConfiguration.js.map