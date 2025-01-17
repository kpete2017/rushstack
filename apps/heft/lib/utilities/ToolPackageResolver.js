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
exports.ToolPackageResolver = void 0;
const path = __importStar(require("path"));
const node_core_library_1 = require("@rushstack/node-core-library");
class ToolPackageResolver {
    constructor() {
        this._packageJsonLookup = new node_core_library_1.PackageJsonLookup();
        this._resolverCache = new Map();
    }
    async resolveToolPackagesAsync(heftConfiguration, terminal) {
        const buildFolder = heftConfiguration.buildFolder;
        const projectFolder = this._packageJsonLookup.tryGetPackageFolderFor(buildFolder);
        if (!projectFolder) {
            throw new Error(`Unable to find a package.json file for "${buildFolder}" `);
        }
        let resolutionPromise = this._resolverCache.get(projectFolder);
        if (!resolutionPromise) {
            resolutionPromise = this._resolveToolPackagesInnerAsync(heftConfiguration, terminal);
            this._resolverCache.set(projectFolder, resolutionPromise);
        }
        return await resolutionPromise;
    }
    async _resolveToolPackagesInnerAsync(heftConfiguration, terminal) {
        // The following rules will apply independently to each tool (TypeScript, AE, ESLint, TSLint)
        // - If the local project has a devDependency (not regular or peer dependency) on the tool,
        // that has highest precedence.
        // - OTHERWISE if there is a rig.json file, then look at the rig's package.json. Does it have a
        // regular dependency (not dev or peer dependency) on the tool? If yes, then
        // resolve the tool from the rig package folder.
        // - OTHERWISE try to resolve it from the current project.
        const typeScriptPackageResolvePromise = this._tryResolveToolPackageAsync('typescript', heftConfiguration, terminal);
        const tslintPackageResolvePromise = this._tryResolveToolPackageAsync('tslint', heftConfiguration, terminal);
        const eslintPackageResolvePromise = this._tryResolveToolPackageAsync('eslint', heftConfiguration, terminal);
        const apiExtractorPackageResolvePromise = this._tryResolveToolPackageAsync('@microsoft/api-extractor', heftConfiguration, terminal);
        const [typeScriptPackagePath, tslintPackagePath, eslintPackagePath, apiExtractorPackagePath] = await Promise.all([
            typeScriptPackageResolvePromise,
            tslintPackageResolvePromise,
            eslintPackageResolvePromise,
            apiExtractorPackageResolvePromise
        ]);
        return {
            apiExtractorPackagePath,
            typeScriptPackagePath,
            tslintPackagePath,
            eslintPackagePath
        };
    }
    async _tryResolveToolPackageAsync(toolPackageName, heftConfiguration, terminal) {
        // See if the project has a devDependency on the package
        if (heftConfiguration.projectPackageJson.devDependencies &&
            heftConfiguration.projectPackageJson.devDependencies[toolPackageName]) {
            try {
                const resolvedPackageFolder = node_core_library_1.Import.resolvePackage({
                    packageName: toolPackageName,
                    baseFolderPath: heftConfiguration.buildFolder
                });
                terminal.writeVerboseLine(`Resolved "${toolPackageName}" as a direct devDependency of the project.`);
                return resolvedPackageFolder;
            }
            catch (e) {
                terminal.writeWarningLine(`"${toolPackageName}" is listed as a direct devDependency of the project, but could not be resolved. ` +
                    'Have dependencies been installed?');
                return undefined;
            }
        }
        const rigConfiguration = heftConfiguration.rigConfig;
        if (rigConfiguration.rigFound) {
            const rigFolder = rigConfiguration.getResolvedProfileFolder();
            const rigPackageJsonPath = this._packageJsonLookup.tryGetPackageJsonFilePathFor(rigFolder);
            if (!rigPackageJsonPath) {
                throw new Error(`Unable to resolve the package.json file for the "${rigConfiguration.rigPackageName}" rig package.`);
            }
            const rigPackageJson = this._packageJsonLookup.loadNodePackageJson(rigPackageJsonPath);
            if (rigPackageJson.dependencies && rigPackageJson.dependencies[toolPackageName]) {
                try {
                    const resolvedPackageFolder = node_core_library_1.Import.resolvePackage({
                        packageName: toolPackageName,
                        baseFolderPath: path.dirname(rigPackageJsonPath)
                    });
                    terminal.writeVerboseLine(`Resolved "${toolPackageName}" as a dependency of the "${rigConfiguration.rigPackageName}" rig package.`);
                    return resolvedPackageFolder;
                }
                catch (e) {
                    terminal.writeWarningLine(`"${toolPackageName}" is listed as a dependency of the "${rigConfiguration.rigPackageName}" rig package, ` +
                        'but could not be resolved. Have dependencies been installed?');
                    return undefined;
                }
            }
        }
        try {
            const resolvedPackageFolder = node_core_library_1.Import.resolvePackage({
                packageName: toolPackageName,
                baseFolderPath: heftConfiguration.buildFolder
            });
            terminal.writeVerboseLine(`Resolved "${toolPackageName}" from ${resolvedPackageFolder}.`);
            return resolvedPackageFolder;
        }
        catch (e) {
            // Ignore
            return undefined;
        }
    }
}
exports.ToolPackageResolver = ToolPackageResolver;
//# sourceMappingURL=ToolPackageResolver.js.map