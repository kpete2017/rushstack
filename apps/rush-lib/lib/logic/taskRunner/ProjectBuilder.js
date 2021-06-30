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
exports.convertSlashesForWindows = exports.ProjectBuilder = void 0;
const path = __importStar(require("path"));
const node_core_library_1 = require("@rushstack/node-core-library");
const terminal_1 = require("@rushstack/terminal");
const stream_collator_1 = require("@rushstack/stream-collator");
const Utilities_1 = require("../../utilities/Utilities");
const TaskStatus_1 = require("./TaskStatus");
const TaskError_1 = require("./TaskError");
const BaseBuilder_1 = require("./BaseBuilder");
const ProjectLogWritable_1 = require("./ProjectLogWritable");
const ProjectBuildCache_1 = require("../buildCache/ProjectBuildCache");
const RushProjectConfiguration_1 = require("../../api/RushProjectConfiguration");
const CollatedTerminalProvider_1 = require("../../utilities/CollatedTerminalProvider");
const RushConstants_1 = require("../RushConstants");
function _areShallowEqual(object1, object2) {
    for (const n in object1) {
        if (!(n in object2) || object1[n] !== object2[n]) {
            return false;
        }
    }
    for (const n in object2) {
        if (!(n in object1)) {
            return false;
        }
    }
    return true;
}
const UNINITIALIZED = 'UNINITIALIZED';
/**
 * A `BaseBuilder` subclass that builds a Rush project and updates its package-deps-hash
 * incremental state.
 */
class ProjectBuilder extends BaseBuilder_1.BaseBuilder {
    constructor(options) {
        super();
        this.hadEmptyScript = false;
        /**
         * UNINITIALIZED === we haven't tried to initialize yet
         * undefined === we didn't create one because the feature is not enabled
         */
        this._projectBuildCache = UNINITIALIZED;
        this._rushProject = options.rushProject;
        this._rushConfiguration = options.rushConfiguration;
        this._buildCacheConfiguration = options.buildCacheConfiguration;
        this._commandName = options.commandName;
        this._commandToRun = options.commandToRun;
        this.isIncrementalBuildAllowed = options.isIncrementalBuildAllowed;
        this._packageChangeAnalyzer = options.packageChangeAnalyzer;
        this._packageDepsFilename = options.packageDepsFilename;
    }
    get name() {
        return ProjectBuilder.getTaskName(this._rushProject);
    }
    /**
     * A helper method to determine the task name of a ProjectBuilder. Used when the task
     * name is required before a task is created.
     */
    static getTaskName(rushProject) {
        return rushProject.packageName;
    }
    async executeAsync(context) {
        try {
            if (!this._commandToRun) {
                this.hadEmptyScript = true;
            }
            return await this._executeTaskAsync(context);
        }
        catch (error) {
            throw new TaskError_1.TaskError('executing', error.message);
        }
    }
    async tryWriteCacheEntryAsync(terminal, trackedFilePaths, repoCommandLineConfiguration) {
        const projectBuildCache = await this._getProjectBuildCacheAsync(terminal, trackedFilePaths, repoCommandLineConfiguration);
        return projectBuildCache === null || projectBuildCache === void 0 ? void 0 : projectBuildCache.trySetCacheEntryAsync(terminal);
    }
    async _executeTaskAsync(context) {
        // TERMINAL PIPELINE:
        //
        //                             +--> quietModeTransform? --> collatedWriter
        //                             |
        // normalizeNewlineTransform --1--> stderrLineTransform --2--> removeColorsTransform --> projectLogWritable
        //                                                        |
        //                                                        +--> stdioSummarizer
        const projectLogWritable = new ProjectLogWritable_1.ProjectLogWritable(this._rushProject, context.collatedWriter.terminal);
        try {
            const removeColorsTransform = new terminal_1.TextRewriterTransform({
                destination: projectLogWritable,
                removeColors: true,
                normalizeNewlines: "os" /* OsDefault */
            });
            const splitterTransform2 = new terminal_1.SplitterTransform({
                destinations: [removeColorsTransform, context.stdioSummarizer]
            });
            const stderrLineTransform = new terminal_1.StderrLineTransform({
                destination: splitterTransform2,
                newlineKind: "\n" /* Lf */ // for StdioSummarizer
            });
            const quietModeTransform = new terminal_1.DiscardStdoutTransform({
                destination: context.collatedWriter
            });
            const splitterTransform1 = new terminal_1.SplitterTransform({
                destinations: [context.quietMode ? quietModeTransform : context.collatedWriter, stderrLineTransform]
            });
            const normalizeNewlineTransform = new terminal_1.TextRewriterTransform({
                destination: splitterTransform1,
                normalizeNewlines: "\n" /* Lf */,
                ensureNewlineAtEnd: true
            });
            const collatedTerminal = new stream_collator_1.CollatedTerminal(normalizeNewlineTransform);
            const terminalProvider = new CollatedTerminalProvider_1.CollatedTerminalProvider(collatedTerminal);
            const terminal = new node_core_library_1.Terminal(terminalProvider);
            let hasWarningOrError = false;
            const projectFolder = this._rushProject.projectFolder;
            let lastProjectBuildDeps = undefined;
            const currentDepsPath = path.join(this._rushProject.projectRushTempFolder, this._packageDepsFilename);
            if (node_core_library_1.FileSystem.exists(currentDepsPath)) {
                try {
                    lastProjectBuildDeps = node_core_library_1.JsonFile.load(currentDepsPath);
                }
                catch (e) {
                    // Warn and ignore - treat failing to load the file as the project being not built.
                    terminal.writeWarningLine(`Warning: error parsing ${this._packageDepsFilename}: ${e}. Ignoring and ` +
                        `treating the command "${this._commandToRun}" as not run.`);
                }
            }
            let projectBuildDeps;
            let trackedFiles;
            try {
                const fileHashes = await this._packageChangeAnalyzer.getPackageDeps(this._rushProject.packageName, terminal);
                if (fileHashes) {
                    const files = {};
                    trackedFiles = [];
                    for (const [filePath, fileHash] of fileHashes) {
                        files[filePath] = fileHash;
                        trackedFiles.push(filePath);
                    }
                    projectBuildDeps = {
                        files,
                        arguments: this._commandToRun
                    };
                }
                else {
                    terminal.writeLine('Unable to calculate incremental build state. Instead running full rebuild. Ensure Git is present.');
                }
            }
            catch (error) {
                terminal.writeLine('Error calculating incremental build state. Instead running full rebuild. ' + error.toString());
            }
            const isPackageUnchanged = !!(lastProjectBuildDeps &&
                projectBuildDeps &&
                projectBuildDeps.arguments === lastProjectBuildDeps.arguments &&
                _areShallowEqual(projectBuildDeps.files, lastProjectBuildDeps.files));
            const projectBuildCache = await this._getProjectBuildCacheAsync(terminal, trackedFiles, context.repoCommandLineConfiguration);
            const restoreFromCacheSuccess = await (projectBuildCache === null || projectBuildCache === void 0 ? void 0 : projectBuildCache.tryRestoreFromCacheAsync(terminal));
            if (restoreFromCacheSuccess) {
                return TaskStatus_1.TaskStatus.FromCache;
            }
            else if (isPackageUnchanged && this.isIncrementalBuildAllowed) {
                return TaskStatus_1.TaskStatus.Skipped;
            }
            else {
                // If the deps file exists, remove it before starting a build.
                node_core_library_1.FileSystem.deleteFile(currentDepsPath);
                // TODO: Remove legacyDepsPath with the next major release of Rush
                const legacyDepsPath = path.join(this._rushProject.projectFolder, 'package-deps.json');
                // Delete the legacy package-deps.json
                node_core_library_1.FileSystem.deleteFile(legacyDepsPath);
                if (!this._commandToRun) {
                    // Write deps on success.
                    if (projectBuildDeps) {
                        node_core_library_1.JsonFile.save(projectBuildDeps, currentDepsPath, {
                            ensureFolderExists: true
                        });
                    }
                    return TaskStatus_1.TaskStatus.Success;
                }
                // Run the task
                terminal.writeLine('Invoking: ' + this._commandToRun);
                const task = Utilities_1.Utilities.executeLifecycleCommandAsync(this._commandToRun, {
                    rushConfiguration: this._rushConfiguration,
                    workingDirectory: projectFolder,
                    initCwd: this._rushConfiguration.commonTempFolder,
                    handleOutput: true,
                    environmentPathOptions: {
                        includeProjectBin: true
                    }
                });
                // Hook into events, in order to get live streaming of build log
                if (task.stdout !== null) {
                    task.stdout.on('data', (data) => {
                        const text = data.toString();
                        collatedTerminal.writeChunk({ text, kind: "O" /* Stdout */ });
                    });
                }
                if (task.stderr !== null) {
                    task.stderr.on('data', (data) => {
                        const text = data.toString();
                        collatedTerminal.writeChunk({ text, kind: "E" /* Stderr */ });
                        hasWarningOrError = true;
                    });
                }
                let status = await new Promise((resolve, reject) => {
                    task.on('close', (code) => {
                        try {
                            if (code !== 0) {
                                reject(new TaskError_1.TaskError('error', `Returned error code: ${code}`));
                            }
                            else if (hasWarningOrError) {
                                resolve(TaskStatus_1.TaskStatus.SuccessWithWarning);
                            }
                            else {
                                resolve(TaskStatus_1.TaskStatus.Success);
                            }
                        }
                        catch (error) {
                            reject(error);
                        }
                    });
                });
                if (status === TaskStatus_1.TaskStatus.Success && projectBuildDeps) {
                    // Write deps on success.
                    const writeProjectStatePromise = node_core_library_1.JsonFile.saveAsync(projectBuildDeps, currentDepsPath, {
                        ensureFolderExists: true
                    });
                    const setCacheEntryPromise = this.tryWriteCacheEntryAsync(terminal, trackedFiles, context.repoCommandLineConfiguration);
                    const [, cacheWriteSuccess] = await Promise.all([writeProjectStatePromise, setCacheEntryPromise]);
                    if (terminalProvider.hasErrors) {
                        status = TaskStatus_1.TaskStatus.Failure;
                    }
                    else if (cacheWriteSuccess === false) {
                        status = TaskStatus_1.TaskStatus.SuccessWithWarning;
                    }
                }
                normalizeNewlineTransform.close();
                // If the pipeline is wired up correctly, then closing normalizeNewlineTransform should
                // have closed projectLogWritable.
                if (projectLogWritable.isOpen) {
                    throw new node_core_library_1.InternalError('The output file handle was not closed');
                }
                return status;
            }
        }
        finally {
            projectLogWritable.close();
        }
    }
    async _getProjectBuildCacheAsync(terminal, trackedProjectFiles, commandLineConfiguration) {
        var _a;
        if (this._projectBuildCache === UNINITIALIZED) {
            this._projectBuildCache = undefined;
            if (this._buildCacheConfiguration && this._buildCacheConfiguration.buildCacheEnabled) {
                const projectConfiguration = await RushProjectConfiguration_1.RushProjectConfiguration.tryLoadForProjectAsync(this._rushProject, commandLineConfiguration, terminal);
                if (projectConfiguration) {
                    if ((_a = projectConfiguration.cacheOptions) === null || _a === void 0 ? void 0 : _a.disableBuildCache) {
                        terminal.writeVerboseLine('Caching has been disabled for this project.');
                    }
                    else {
                        const commandOptions = projectConfiguration.cacheOptions.optionsForCommandsByName.get(this._commandName);
                        if (commandOptions === null || commandOptions === void 0 ? void 0 : commandOptions.disableBuildCache) {
                            terminal.writeVerboseLine(`Caching has been disabled for this project's "${this._commandName}" command.`);
                        }
                        else {
                            this._projectBuildCache = await ProjectBuildCache_1.ProjectBuildCache.tryGetProjectBuildCache({
                                projectConfiguration,
                                buildCacheConfiguration: this._buildCacheConfiguration,
                                terminal,
                                command: this._commandToRun,
                                trackedProjectFiles: trackedProjectFiles,
                                packageChangeAnalyzer: this._packageChangeAnalyzer
                            });
                        }
                    }
                }
                else {
                    terminal.writeVerboseLine(`Project does not have a ${RushConstants_1.RushConstants.rushProjectConfigFilename} configuration file, ` +
                        'or one provided by a rig, so it does not support caching.');
                }
            }
        }
        return this._projectBuildCache;
    }
}
exports.ProjectBuilder = ProjectBuilder;
/**
 * When running a command from the "scripts" block in package.json, if the command
 * contains Unix-style path slashes and the OS is Windows, the package managers will
 * convert slashes to backslashes.  This is a complicated undertaking.  For example, they
 * need to convert "node_modules/bin/this && ./scripts/that --name keep/this"
 * to "node_modules\bin\this && .\scripts\that --name keep/this", and they don't want to
 * convert ANY of the slashes in "cmd.exe /c echo a/b".  NPM and PNPM use npm-lifecycle for this,
 * but it unfortunately has a dependency on the entire node-gyp kitchen sink.  Yarn has a
 * simplified implementation in fix-cmd-win-slashes.js, but it's not exposed as a library.
 *
 * Fundamentally NPM's whole feature seems misguided:  They start by inviting people to write
 * shell scripts that will be executed by wildly different shell languages (e.g. cmd.exe and Bash).
 * It's very tricky for a developer to guess what's safe to do without testing every OS.
 * Even simple path separators are not portable, so NPM added heuristics to figure out which
 * slashes are part of a path or not, and convert them.  These workarounds end up having tons
 * of special cases.  They probably could have implemented their own entire minimal cross-platform
 * shell language with less code and less confusion than npm-lifecycle's approach.
 *
 * We've deprecated shell operators inside package.json.  Instead, we advise people to move their
 * scripts into conventional script files, and put only a file path in package.json.  So, for
 * Rush's workaround here, we really only care about supporting the small set of cases seen in the
 * unit tests.  For anything that doesn't fit those patterns, we leave the string untouched
 * (i.e. err on the side of not breaking anything).  We could revisit this later if someone
 * complains about it, but so far nobody has.  :-)
 */
function convertSlashesForWindows(command) {
    // The first group will match everything up to the first space, "&", "|", "<", ">", or quote.
    // The second group matches the remainder.
    const commandRegExp = /^([^\s&|<>"]+)(.*)$/;
    const match = commandRegExp.exec(command);
    if (match) {
        // Example input: "bin/blarg --path ./config/blah.json && a/b"
        // commandPart="bin/blarg"
        // remainder=" --path ./config/blah.json && a/b"
        const commandPart = match[1];
        const remainder = match[2];
        // If the command part already contains a backslash, then leave it alone
        if (commandPart.indexOf('\\') < 0) {
            // Replace all the slashes with backslashes, e.g. to produce:
            // "bin\blarg --path ./config/blah.json && a/b"
            //
            // NOTE: we don't attempt to process the path parameter or stuff after "&&"
            return node_core_library_1.Text.replaceAll(commandPart, '/', '\\') + remainder;
        }
    }
    // Don't change anything
    return command;
}
exports.convertSlashesForWindows = convertSlashesForWindows;
//# sourceMappingURL=ProjectBuilder.js.map