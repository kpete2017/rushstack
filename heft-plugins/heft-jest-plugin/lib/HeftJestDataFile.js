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
exports.HeftJestDataFile = void 0;
const path = __importStar(require("path"));
const node_core_library_1 = require("@rushstack/node-core-library");
/**
 * Manages loading/saving the "heft-jest-data.json" data file.  This file communicates
 * configuration information from Heft to jest-build-transform.js.  The jest-build-transform.js script gets
 * loaded dynamically by the Jest engine, so it does not have access to the normal HeftConfiguration objects.
 */
class HeftJestDataFile {
    /**
     * Called by JestPlugin to write the file.
     */
    static async saveForProjectAsync(projectFolder, json) {
        const jsonFilePath = HeftJestDataFile.getConfigFilePath(projectFolder);
        await node_core_library_1.JsonFile.saveAsync(json, jsonFilePath, {
            ensureFolderExists: true,
            onlyIfChanged: true,
            headerComment: '// THIS DATA FILE IS INTERNAL TO HEFT; DO NOT MODIFY IT OR RELY ON ITS CONTENTS'
        });
    }
    /**
     * Called by JestPlugin to load and validate the Heft data file before running Jest.
     */
    static async loadAndValidateForProjectAsync(projectFolder) {
        const jsonFilePath = HeftJestDataFile.getConfigFilePath(projectFolder);
        let dataFile;
        try {
            dataFile = await node_core_library_1.JsonFile.loadAsync(jsonFilePath);
        }
        catch (e) {
            if (node_core_library_1.FileSystem.isFileDoesNotExistError(e)) {
                throw new Error(`Could not find the Jest TypeScript data file at "${jsonFilePath}". Was the compiler invoked?`);
            }
            throw e;
        }
        await HeftJestDataFile._validateHeftJestDataFileAsync(dataFile, projectFolder);
        return dataFile;
    }
    /**
     * Called by jest-build-transform.js to read the file. No validation is performed because validation
     * should be performed asynchronously in the JestPlugin.
     */
    static loadForProject(projectFolder) {
        const jsonFilePath = HeftJestDataFile.getConfigFilePath(projectFolder);
        return node_core_library_1.JsonFile.load(jsonFilePath);
    }
    /**
     * Get the absolute path to the heft-jest-data.json file
     */
    static getConfigFilePath(projectFolder) {
        return path.join(projectFolder, '.heft', 'build-cache', 'heft-jest-data.json');
    }
    static async _validateHeftJestDataFileAsync(heftJestDataFile, projectFolder) {
        // Only need to validate if using TypeScript
        if (heftJestDataFile.isTypeScriptProject) {
            const emitFolderPathForJest = path.join(projectFolder, heftJestDataFile.emitFolderNameForTests);
            if (!(await node_core_library_1.FileSystem.existsAsync(emitFolderPathForJest))) {
                throw new Error('The transpiler output folder does not exist:\n  ' +
                    emitFolderPathForJest +
                    '\nWas the compiler invoked? Is the "emitFolderNameForTests" setting correctly' +
                    ' specified in config/typescript.json?\n');
            }
        }
    }
}
exports.HeftJestDataFile = HeftJestDataFile;
//# sourceMappingURL=HeftJestDataFile.js.map