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
exports.TypingsGenerator = void 0;
const node_core_library_1 = require("@rushstack/node-core-library");
const glob = __importStar(require("glob"));
const path = __importStar(require("path"));
const os_1 = require("os");
const chokidar = __importStar(require("chokidar"));
/**
 * This is a simple tool that generates .d.ts files for non-TS files.
 *
 * @public
 */
class TypingsGenerator {
    constructor(options) {
        this._options = Object.assign({}, options);
        if (!this._options.generatedTsFolder) {
            throw new Error('generatedTsFolder must be provided');
        }
        if (!this._options.srcFolder) {
            throw new Error('srcFolder must be provided');
        }
        if (node_core_library_1.Path.isUnder(this._options.srcFolder, this._options.generatedTsFolder)) {
            throw new Error('srcFolder must not be under generatedTsFolder');
        }
        if (node_core_library_1.Path.isUnder(this._options.generatedTsFolder, this._options.srcFolder)) {
            throw new Error('generatedTsFolder must not be under srcFolder');
        }
        if (!this._options.fileExtensions || this._options.fileExtensions.length === 0) {
            throw new Error('At least one file extension must be provided.');
        }
        if (!this._options.filesToIgnore) {
            this._options.filesToIgnore = [];
        }
        if (!this._options.terminal) {
            this._options.terminal = new node_core_library_1.Terminal(new node_core_library_1.ConsoleTerminalProvider({ verboseEnabled: true }));
        }
        this._options.fileExtensions = this._normalizeFileExtensions(this._options.fileExtensions);
        this._targetMap = new Map();
        this._dependencyMap = new Map();
    }
    async generateTypingsAsync() {
        await node_core_library_1.FileSystem.ensureEmptyFolderAsync(this._options.generatedTsFolder);
        const filePaths = glob.sync(path.join('**', `*+(${this._options.fileExtensions.join('|')})`), {
            cwd: this._options.srcFolder,
            absolute: true,
            nosort: true,
            nodir: true
        });
        for (let filePath of filePaths) {
            filePath = path.resolve(this._options.srcFolder, filePath);
            await this._parseFileAndGenerateTypingsAsync(filePath);
        }
    }
    async runWatcherAsync() {
        await node_core_library_1.FileSystem.ensureFolderAsync(this._options.generatedTsFolder);
        const globBase = path.resolve(this._options.srcFolder, '**');
        await new Promise((resolve, reject) => {
            const watcher = chokidar.watch(this._options.fileExtensions.map((fileExtension) => path.join(globBase, `*${fileExtension}`)));
            const boundGenerateTypingsFunction = this._parseFileAndGenerateTypingsAsync.bind(this);
            watcher.on('add', boundGenerateTypingsFunction);
            watcher.on('change', boundGenerateTypingsFunction);
            watcher.on('unlink', async (filePath) => {
                const generatedTsFilePath = this._getTypingsFilePath(filePath);
                await node_core_library_1.FileSystem.deleteFileAsync(generatedTsFilePath);
            });
            watcher.on('error', reject);
        });
    }
    /**
     * Register file dependencies that may effect the typings of a target file.
     * Note: This feature is only useful in watch mode.
     * The registerDependency method must be called in the body of parseAndGenerateTypings every
     * time because the registry for a file is cleared at the beginning of processing.
     */
    registerDependency(target, dependency) {
        let targetDependencySet = this._targetMap.get(target);
        if (!targetDependencySet) {
            targetDependencySet = new Set();
            this._targetMap.set(target, targetDependencySet);
        }
        targetDependencySet.add(dependency);
        let dependencyTargetSet = this._dependencyMap.get(dependency);
        if (!dependencyTargetSet) {
            dependencyTargetSet = new Set();
            this._dependencyMap.set(dependency, dependencyTargetSet);
        }
        dependencyTargetSet.add(target);
    }
    async _parseFileAndGenerateTypingsAsync(locFilePath) {
        if (this._filesToIgnore.has(locFilePath)) {
            return;
        }
        // Clear registered dependencies prior to reprocessing.
        this._clearDependencies(locFilePath);
        // Check for targets that register this file as a dependency, and reprocess them too.
        for (const target of this._getDependencyTargets(locFilePath)) {
            await this._parseFileAndGenerateTypingsAsync(target);
        }
        try {
            const fileContents = await node_core_library_1.FileSystem.readFileAsync(locFilePath);
            const typingsData = await this._options.parseAndGenerateTypings(fileContents, locFilePath);
            const generatedTsFilePath = this._getTypingsFilePath(locFilePath);
            // Typings data will be undefined when no types should be generated for the parsed file.
            if (typingsData === undefined) {
                return;
            }
            const prefixedTypingsData = [
                '// This file was generated by a tool. Modifying it will produce unexpected behavior',
                '',
                typingsData
            ].join(os_1.EOL);
            await node_core_library_1.FileSystem.writeFileAsync(generatedTsFilePath, prefixedTypingsData, {
                ensureFolderExists: true,
                convertLineEndings: "os" /* OsDefault */
            });
        }
        catch (e) {
            this._options.terminal.writeError(`Error occurred parsing and generating typings for file "${locFilePath}": ${e}`);
        }
    }
    get _filesToIgnore() {
        if (!this._filesToIgnoreVal) {
            this._filesToIgnoreVal = new Set(this._options.filesToIgnore.map((fileToIgnore) => {
                return path.resolve(this._options.srcFolder, fileToIgnore);
            }));
        }
        return this._filesToIgnoreVal;
    }
    _clearDependencies(target) {
        const targetDependencySet = this._targetMap.get(target);
        if (targetDependencySet) {
            for (const dependency of targetDependencySet) {
                this._dependencyMap.get(dependency).delete(target);
            }
            targetDependencySet.clear();
        }
    }
    _getDependencyTargets(dependency) {
        var _a;
        return [...(((_a = this._dependencyMap.get(dependency)) === null || _a === void 0 ? void 0 : _a.keys()) || [])];
    }
    _getTypingsFilePath(locFilePath) {
        return path.resolve(this._options.generatedTsFolder, path.relative(this._options.srcFolder, `${locFilePath}.d.ts`));
    }
    _normalizeFileExtensions(fileExtensions) {
        const result = [];
        for (const fileExtension of fileExtensions) {
            if (!fileExtension.startsWith('.')) {
                result.push(`.${fileExtension}`);
            }
            else {
                result.push(fileExtension);
            }
        }
        return result;
    }
}
exports.TypingsGenerator = TypingsGenerator;
//# sourceMappingURL=TypingsGenerator.js.map