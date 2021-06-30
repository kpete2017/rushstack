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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __await = (this && this.__await) || function (v) { return this instanceof __await ? (this.v = v, this) : new __await(v); }
var __asyncDelegator = (this && this.__asyncDelegator) || function (o) {
    var i, p;
    return i = {}, verb("next"), verb("throw", function (e) { throw e; }), verb("return"), i[Symbol.iterator] = function () { return this; }, i;
    function verb(n, f) { i[n] = o[n] ? function (v) { return (p = !p) ? { value: __await(o[n](v)), done: n === "return" } : f ? f(v) : v; } : f; }
};
var __asyncGenerator = (this && this.__asyncGenerator) || function (thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
    function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectBuildCache = void 0;
const path = __importStar(require("path"));
const events = __importStar(require("events"));
const crypto = __importStar(require("crypto"));
const tar = __importStar(require("tar"));
const node_core_library_1 = require("@rushstack/node-core-library");
const fs = __importStar(require("fs"));
const RushConstants_1 = require("../RushConstants");
const TarExecutable_1 = require("../../utilities/TarExecutable");
const Utilities_1 = require("../../utilities/Utilities");
class ProjectBuildCache {
    constructor(cacheId, options) {
        this._project = options.projectConfiguration.project;
        this._localBuildCacheProvider = options.buildCacheConfiguration.localCacheProvider;
        this._cloudBuildCacheProvider = options.buildCacheConfiguration.cloudCacheProvider;
        this._buildCacheEnabled = options.buildCacheConfiguration.buildCacheEnabled;
        this._projectOutputFolderNames = options.projectConfiguration.projectOutputFolderNames || [];
        this._cacheId = cacheId;
    }
    static _tryGetTarUtility(terminal) {
        if (ProjectBuildCache._tarUtility === null) {
            ProjectBuildCache._tarUtility = TarExecutable_1.TarExecutable.tryInitialize(terminal);
        }
        return ProjectBuildCache._tarUtility;
    }
    static async tryGetProjectBuildCache(options) {
        const { terminal, projectConfiguration, trackedProjectFiles } = options;
        if (!trackedProjectFiles) {
            return undefined;
        }
        if (!ProjectBuildCache._validateProject(terminal, projectConfiguration, trackedProjectFiles)) {
            return undefined;
        }
        const cacheId = await ProjectBuildCache._getCacheId(options);
        return new ProjectBuildCache(cacheId, options);
    }
    static _validateProject(terminal, projectConfiguration, trackedProjectFiles) {
        const normalizedProjectRelativeFolder = node_core_library_1.Path.convertToSlashes(projectConfiguration.project.projectRelativeFolder);
        const outputFolders = [];
        if (projectConfiguration.projectOutputFolderNames) {
            for (const outputFolderName of projectConfiguration.projectOutputFolderNames) {
                outputFolders.push(`${normalizedProjectRelativeFolder}/${outputFolderName}/`);
            }
        }
        const inputOutputFiles = [];
        for (const file of trackedProjectFiles) {
            for (const outputFolder of outputFolders) {
                if (file.startsWith(outputFolder)) {
                    inputOutputFiles.push(file);
                }
            }
        }
        if (inputOutputFiles.length > 0) {
            terminal.writeWarningLine('Unable to use build cache. The following files are used to calculate project state ' +
                `and are considered project output: ${inputOutputFiles.join(', ')}`);
            return false;
        }
        else {
            return true;
        }
    }
    async tryRestoreFromCacheAsync(terminal) {
        const cacheId = this._cacheId;
        if (!cacheId) {
            terminal.writeWarningLine('Unable to get cache ID. Ensure Git is installed.');
            return false;
        }
        if (!this._buildCacheEnabled) {
            // Skip reading local and cloud build caches, without any noise
            return false;
        }
        let localCacheEntryPath = await this._localBuildCacheProvider.tryGetCacheEntryPathByIdAsync(terminal, cacheId);
        let cacheEntryBuffer;
        let updateLocalCacheSuccess;
        if (!localCacheEntryPath && this._cloudBuildCacheProvider) {
            terminal.writeVerboseLine('This project was not found in the local build cache. Querying the cloud build cache.');
            cacheEntryBuffer = await this._cloudBuildCacheProvider.tryGetCacheEntryBufferByIdAsync(terminal, cacheId);
            if (cacheEntryBuffer) {
                try {
                    localCacheEntryPath = await this._localBuildCacheProvider.trySetCacheEntryBufferAsync(terminal, cacheId, cacheEntryBuffer);
                    updateLocalCacheSuccess = true;
                }
                catch (e) {
                    updateLocalCacheSuccess = false;
                }
            }
        }
        if (!localCacheEntryPath && !cacheEntryBuffer) {
            terminal.writeVerboseLine('This project was not found in the build cache.');
            return false;
        }
        terminal.writeLine('Build cache hit.');
        const projectFolderPath = this._project.projectFolder;
        // Purge output folders
        terminal.writeVerboseLine(`Clearing cached folders: ${this._projectOutputFolderNames.join(', ')}`);
        await Promise.all(this._projectOutputFolderNames.map((outputFolderName) => node_core_library_1.FileSystem.deleteFolderAsync(`${projectFolderPath}/${outputFolderName}`)));
        const tarUtility = ProjectBuildCache._tryGetTarUtility(terminal);
        let restoreSuccess = false;
        if (tarUtility && localCacheEntryPath) {
            const logFilePath = this._getTarLogFilePath();
            const tarExitCode = await tarUtility.tryUntarAsync({
                archivePath: localCacheEntryPath,
                outputFolderPath: projectFolderPath,
                logFilePath
            });
            if (tarExitCode === 0) {
                restoreSuccess = true;
            }
            else {
                terminal.writeWarningLine(`"tar" exited with code ${tarExitCode} while attempting to restore cache entry. ` +
                    'Rush will attempt to extract from the cache entry with a JavaScript implementation of tar. ' +
                    `See "${logFilePath}" for logs from the tar process.`);
            }
        }
        if (!restoreSuccess) {
            if (!cacheEntryBuffer && localCacheEntryPath) {
                cacheEntryBuffer = await node_core_library_1.FileSystem.readFileToBufferAsync(localCacheEntryPath);
            }
            if (!cacheEntryBuffer) {
                throw new Error('Expected the cache entry buffer to be set.');
            }
            // If we don't have tar on the PATH, if we failed to update the local cache entry,
            // or if the tar binary failed, untar in-memory
            const tarStream = tar.extract({
                cwd: projectFolderPath,
                // Set to true to omit writing mtime value for extracted entries.
                m: true
            });
            try {
                const tarPromise = events.once(tarStream, 'drain');
                tarStream.write(cacheEntryBuffer);
                await tarPromise;
                restoreSuccess = true;
            }
            catch (e) {
                restoreSuccess = false;
            }
        }
        if (restoreSuccess) {
            terminal.writeLine('Successfully restored output from the build cache.');
        }
        else {
            terminal.writeWarningLine('Unable to restore output from the build cache.');
        }
        if (updateLocalCacheSuccess === false) {
            terminal.writeWarningLine('Unable to update the local build cache with data from the cloud cache.');
        }
        return restoreSuccess;
    }
    async trySetCacheEntryAsync(terminal) {
        var _a, _b;
        const cacheId = this._cacheId;
        if (!cacheId) {
            terminal.writeWarningLine('Unable to get cache ID. Ensure Git is installed.');
            return false;
        }
        if (!this._buildCacheEnabled) {
            // Skip writing local and cloud build caches, without any noise
            return false;
        }
        const projectFolderPath = this._project.projectFolder;
        const filesToCache = await this._tryCollectPathsToCacheAsync(terminal);
        if (!filesToCache) {
            return false;
        }
        terminal.writeVerboseLine(`Caching build output folders: ${filesToCache.filteredOutputFolderNames.join(', ')}`);
        let localCacheEntryPath;
        const tarUtility = ProjectBuildCache._tryGetTarUtility(terminal);
        if (tarUtility) {
            const tempLocalCacheEntryPath = this._localBuildCacheProvider.getCacheEntryPath(cacheId);
            const logFilePath = this._getTarLogFilePath();
            const tarExitCode = await tarUtility.tryCreateArchiveFromProjectPathsAsync({
                archivePath: tempLocalCacheEntryPath,
                paths: filesToCache.outputFilePaths,
                project: this._project,
                logFilePath
            });
            if (tarExitCode === 0) {
                localCacheEntryPath = tempLocalCacheEntryPath;
            }
            else {
                terminal.writeWarningLine(`"tar" exited with code ${tarExitCode} while attempting to create the cache entry. ` +
                    'Rush will attempt to create the cache entry with a JavaScript implementation of tar. ' +
                    `See "${logFilePath}" for logs from the tar process.`);
            }
        }
        let cacheEntryBuffer;
        let setLocalCacheEntryPromise;
        if (!localCacheEntryPath) {
            // If we weren't able to create the cache entry with tar, try to do it with the "tar" NPM package
            const tarStream = tar.create({
                gzip: true,
                portable: true,
                strict: true,
                cwd: projectFolderPath
            }, filesToCache.outputFilePaths);
            cacheEntryBuffer = await Utilities_1.Utilities.readStreamToBufferAsync(tarStream);
            setLocalCacheEntryPromise = this._localBuildCacheProvider.trySetCacheEntryBufferAsync(terminal, cacheId, cacheEntryBuffer);
        }
        else {
            setLocalCacheEntryPromise = Promise.resolve(localCacheEntryPath);
        }
        let setCloudCacheEntryPromise;
        // Note that "writeAllowed" settings (whether in config or environment) always apply to
        // the configured CLOUD cache. If the cache is enabled, rush is always allowed to read from and
        // write to the local build cache.
        if ((_a = this._cloudBuildCacheProvider) === null || _a === void 0 ? void 0 : _a.isCacheWriteAllowed) {
            if (!cacheEntryBuffer) {
                if (localCacheEntryPath) {
                    cacheEntryBuffer = await node_core_library_1.FileSystem.readFileToBufferAsync(localCacheEntryPath);
                }
                else {
                    throw new Error('Expected the local cache entry path to be set.');
                }
            }
            setCloudCacheEntryPromise = (_b = this._cloudBuildCacheProvider) === null || _b === void 0 ? void 0 : _b.trySetCacheEntryBufferAsync(terminal, cacheId, cacheEntryBuffer);
        }
        let localCachePath;
        let updateCloudCacheSuccess;
        if (setCloudCacheEntryPromise) {
            [updateCloudCacheSuccess, localCachePath] = await Promise.all([
                setCloudCacheEntryPromise,
                setLocalCacheEntryPromise
            ]);
        }
        else {
            updateCloudCacheSuccess = true;
            localCachePath = await setLocalCacheEntryPromise;
        }
        const success = updateCloudCacheSuccess && !!localCachePath;
        if (success) {
            terminal.writeLine('Successfully set cache entry.');
        }
        else if (!localCachePath && updateCloudCacheSuccess) {
            terminal.writeWarningLine('Unable to set local cache entry.');
        }
        else if (localCachePath && !updateCloudCacheSuccess) {
            terminal.writeWarningLine('Unable to set cloud cache entry.');
        }
        else {
            terminal.writeWarningLine('Unable to set both cloud and local cache entries.');
        }
        return success;
    }
    async _tryCollectPathsToCacheAsync(terminal) {
        var e_1, _a;
        const projectFolderPath = this._project.projectFolder;
        const outputFolderNamesThatExist = await Promise.all(this._projectOutputFolderNames.map((outputFolderName) => node_core_library_1.FileSystem.existsAsync(`${projectFolderPath}/${outputFolderName}`)));
        const filteredOutputFolderNames = [];
        for (let i = 0; i < outputFolderNamesThatExist.length; i++) {
            if (outputFolderNamesThatExist[i]) {
                filteredOutputFolderNames.push(this._projectOutputFolderNames[i]);
            }
        }
        let encounteredEnumerationIssue = false;
        function symbolicLinkPathCallback(entryPath) {
            terminal.writeError(`Unable to include "${entryPath}" in build cache. It is a symbolic link.`);
            encounteredEnumerationIssue = true;
        }
        const outputFilePaths = [];
        for (const filteredOutputFolderName of filteredOutputFolderNames) {
            if (encounteredEnumerationIssue) {
                return undefined;
            }
            const outputFilePathsForFolder = this._getPathsInFolder(terminal, symbolicLinkPathCallback, filteredOutputFolderName, `${projectFolderPath}/${filteredOutputFolderName}`);
            try {
                for (var outputFilePathsForFolder_1 = (e_1 = void 0, __asyncValues(outputFilePathsForFolder)), outputFilePathsForFolder_1_1; outputFilePathsForFolder_1_1 = await outputFilePathsForFolder_1.next(), !outputFilePathsForFolder_1_1.done;) {
                    const outputFilePath = outputFilePathsForFolder_1_1.value;
                    outputFilePaths.push(outputFilePath);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (outputFilePathsForFolder_1_1 && !outputFilePathsForFolder_1_1.done && (_a = outputFilePathsForFolder_1.return)) await _a.call(outputFilePathsForFolder_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
        }
        if (encounteredEnumerationIssue) {
            return undefined;
        }
        return {
            filteredOutputFolderNames,
            outputFilePaths
        };
    }
    _getPathsInFolder(terminal, symbolicLinkPathCallback, posixPrefix, folderPath) {
        return __asyncGenerator(this, arguments, function* _getPathsInFolder_1() {
            const folderEntries = yield __await(node_core_library_1.LegacyAdapters.convertCallbackToPromise(fs.readdir, folderPath, {
                withFileTypes: true
            }));
            for (const folderEntry of folderEntries) {
                const entryPath = `${posixPrefix}/${folderEntry.name}`;
                if (folderEntry.isSymbolicLink()) {
                    symbolicLinkPathCallback(entryPath);
                }
                else if (folderEntry.isDirectory()) {
                    yield __await(yield* __asyncDelegator(__asyncValues(this._getPathsInFolder(terminal, symbolicLinkPathCallback, entryPath, `${folderPath}/${folderEntry.name}`))));
                }
                else {
                    yield yield __await(entryPath);
                }
            }
        });
    }
    _getTarLogFilePath() {
        return path.join(this._project.projectRushTempFolder, 'build-cache-tar.log');
    }
    static async _getCacheId(options) {
        // The project state hash is calculated in the following method:
        // - The current project's hash (see PackageChangeAnalyzer.getProjectStateHash) is
        //   calculated and appended to an array
        // - The current project's recursive dependency projects' hashes are calculated
        //   and appended to the array
        // - A SHA1 hash is created and the following data is fed into it, in order:
        //   1. The JSON-serialized list of output folder names for this
        //      project (see ProjectBuildCache._projectOutputFolderNames)
        //   2. The command that will be run in the project
        //   3. Each dependency project hash (from the array constructed in previous steps),
        //      in sorted alphanumerical-sorted order
        // - A hex digest of the hash is returned
        const packageChangeAnalyzer = options.packageChangeAnalyzer;
        const projectStates = [];
        const projectsThatHaveBeenProcessed = new Set();
        let projectsToProcess = new Set();
        projectsToProcess.add(options.projectConfiguration.project);
        while (projectsToProcess.size > 0) {
            const newProjectsToProcess = new Set();
            for (const projectToProcess of projectsToProcess) {
                projectsThatHaveBeenProcessed.add(projectToProcess);
                const projectState = await packageChangeAnalyzer.getProjectStateHash(projectToProcess.packageName, options.terminal);
                if (!projectState) {
                    // If we hit any projects with unknown state, return unknown cache ID
                    return undefined;
                }
                else {
                    projectStates.push(projectState);
                    for (const dependency of projectToProcess.dependencyProjects) {
                        if (!projectsThatHaveBeenProcessed.has(dependency)) {
                            newProjectsToProcess.add(dependency);
                        }
                    }
                }
            }
            projectsToProcess = newProjectsToProcess;
        }
        const sortedProjectStates = projectStates.sort();
        const hash = crypto.createHash('sha1');
        const serializedOutputFolders = JSON.stringify(options.projectConfiguration.projectOutputFolderNames);
        hash.update(serializedOutputFolders);
        hash.update(RushConstants_1.RushConstants.hashDelimiter);
        hash.update(options.command);
        hash.update(RushConstants_1.RushConstants.hashDelimiter);
        for (const projectHash of sortedProjectStates) {
            hash.update(projectHash);
            hash.update(RushConstants_1.RushConstants.hashDelimiter);
        }
        const projectStateHash = hash.digest('hex');
        return options.buildCacheConfiguration.getCacheEntryId({
            projectName: options.projectConfiguration.project.packageName,
            projectStateHash
        });
    }
}
exports.ProjectBuildCache = ProjectBuildCache;
/**
 * null === we haven't tried to initialize yet
 * undefined === unable to initialize
 */
ProjectBuildCache._tarUtility = null;
//# sourceMappingURL=ProjectBuildCache.js.map