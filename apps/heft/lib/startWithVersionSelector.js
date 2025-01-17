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
// NOTE: Since startWithVersionSelector.ts is loaded in the same process as start.ts, any dependencies that
// we import here may become side-by-side versions.  We want to minimize any dependencies.
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const HEFT_PACKAGE_NAME = '@rushstack/heft';
// Excerpted from PackageJsonLookup.tryGetPackageFolderFor()
function tryGetPackageFolderFor(resolvedFileOrFolderPath) {
    // Two lookups are required, because get() cannot distinguish the undefined value
    // versus a missing key.
    // if (this._packageFolderCache.has(resolvedFileOrFolderPath)) {
    //   return this._packageFolderCache.get(resolvedFileOrFolderPath);
    // }
    // Is resolvedFileOrFolderPath itself a folder with a package.json file?  If so, return it.
    if (fs.existsSync(path.join(resolvedFileOrFolderPath, 'package.json'))) {
        // this._packageFolderCache.set(resolvedFileOrFolderPath, resolvedFileOrFolderPath);
        return resolvedFileOrFolderPath;
    }
    // Otherwise go up one level
    const parentFolder = path.dirname(resolvedFileOrFolderPath);
    if (!parentFolder || parentFolder === resolvedFileOrFolderPath) {
        // We reached the root directory without finding a package.json file,
        // so cache the negative result
        // this._packageFolderCache.set(resolvedFileOrFolderPath, undefined);
        return undefined; // no match
    }
    // Recurse upwards, caching every step along the way
    const parentResult = tryGetPackageFolderFor(parentFolder);
    // Cache the parent's answer as well
    // this._packageFolderCache.set(resolvedFileOrFolderPath, parentResult);
    return parentResult;
}
/**
 * When Heft is invoked via the shell path, we examine the project's package.json dependencies and try to load
 * the locally installed version of Heft. This avoids accidentally building using the wrong version of Heft.
 * Use "heft --unmanaged" to bypass this feature.
 */
function tryStartLocalHeft() {
    if (process.argv.indexOf('--unmanaged') >= 0) {
        console.log('(Bypassing the Heft version selector because "--unmanaged" was specified.)');
        console.log();
        return false;
    }
    else if (process.argv.indexOf('--debug') >= 0) {
        // The unmanaged flag could be undiscoverable if it's not in their locally installed version
        console.log('Searching for a locally installed version of Heft. Use the --unmanaged flag if you want to avoid this');
    }
    // Find the package.json file that governs the current folder location
    const projectFolder = tryGetPackageFolderFor(process.cwd());
    if (projectFolder) {
        let heftEntryPoint;
        try {
            const packageJsonPath = path.join(projectFolder, 'package.json');
            const packageJsonContent = fs.readFileSync(packageJsonPath).toString();
            let packageJson;
            try {
                packageJson = JSON.parse(packageJsonContent);
            }
            catch (error) {
                throw new Error(`Error parsing ${packageJsonPath}:` + error.message);
            }
            // Does package.json have a dependency on Heft?
            if (!(packageJson.dependencies && packageJson.dependencies[HEFT_PACKAGE_NAME]) &&
                !(packageJson.devDependencies && packageJson.devDependencies[HEFT_PACKAGE_NAME])) {
                // No explicit dependency on Heft
                return false;
            }
            // To avoid a loading the "resolve" NPM package, let's assume that the Heft dependency must be
            // installed as "<projectFolder>/node_modules/@rushstack/heft".
            const heftFolder = path.join(projectFolder, 'node_modules', HEFT_PACKAGE_NAME);
            heftEntryPoint = path.join(heftFolder, 'lib', 'start.js');
            if (!fs.existsSync(heftEntryPoint)) {
                throw new Error('Unable to find Heft entry point: ' + heftEntryPoint);
            }
            console.log(`Using local Heft from ${heftFolder}`);
            console.log();
        }
        catch (error) {
            throw new Error('Error probing for local Heft version: ' + error.message);
        }
        require(heftEntryPoint);
        // We found and successfully invoked the local Heft
        return true;
    }
    // We couldn't find the package folder
    return false;
}
if (!tryStartLocalHeft()) {
    // A project Heft dependency was not found, so launch the unmanaged version.
    require('./start.js');
}
//# sourceMappingURL=startWithVersionSelector.js.map