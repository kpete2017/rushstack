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
exports.TypeScriptBuilder = void 0;
const path = __importStar(require("path"));
const semver = __importStar(require("semver"));
const node_core_library_1 = require("@rushstack/node-core-library");
const SubprocessRunnerBase_1 = require("../../utilities/subprocess/SubprocessRunnerBase");
const Async_1 = require("../../utilities/Async");
const Tslint_1 = require("./Tslint");
const Eslint_1 = require("./Eslint");
const FileError_1 = require("../../pluginFramework/logging/FileError");
const EmitFilesPatch_1 = require("./EmitFilesPatch");
const EmitCompletedCallbackManager_1 = require("./EmitCompletedCallbackManager");
const TypeScriptCachedFileSystem_1 = require("../../utilities/fileSystem/TypeScriptCachedFileSystem");
const EMPTY_JSON = {};
class TypeScriptBuilder extends SubprocessRunnerBase_1.SubprocessRunnerBase {
    constructor(parentGlobalTerminalProvider, configuration, heftSession, emitCallback) {
        super(parentGlobalTerminalProvider, configuration, heftSession);
        this._tsReadJsonCache = new Map();
        this._cachedFileSystem = new TypeScriptCachedFileSystem_1.TypeScriptCachedFileSystem();
        this._emitCompletedCallbackManager = new EmitCompletedCallbackManager_1.EmitCompletedCallbackManager(emitCallback);
        this.registerSubprocessCommunicationManager(this._emitCompletedCallbackManager);
    }
    get filename() {
        return __filename;
    }
    get _tsCacheFilePath() {
        if (!this.__tsCacheFilePath) {
            const configHash = Tslint_1.Tslint.getConfigHash(this._configuration.tsconfigPath, this._typescriptTerminal, this._cachedFileSystem);
            configHash.update(JSON.stringify(this._configuration.additionalModuleKindsToEmit || {}));
            const serializedConfigHash = configHash.digest('hex');
            this.__tsCacheFilePath = path.posix.join(this._configuration.buildCacheFolder, `ts_${serializedConfigHash}.json`);
        }
        return this.__tsCacheFilePath;
    }
    async invokeAsync() {
        this._typescriptLogger = await this.requestScopedLoggerAsync('typescript');
        this._typescriptTerminal = this._typescriptLogger.terminal;
        // Determine the compiler version
        const compilerPackageJsonFilename = path.join(this._configuration.typeScriptToolPath, 'package.json');
        const packageJson = node_core_library_1.JsonFile.load(compilerPackageJsonFilename);
        this._typescriptVersion = packageJson.version;
        const parsedVersion = semver.parse(this._typescriptVersion);
        if (!parsedVersion) {
            throw new Error(`Unable to parse version "${this._typescriptVersion}" for TypeScript compiler package in: ` +
                compilerPackageJsonFilename);
        }
        this._typescriptParsedVersion = parsedVersion;
        // Detect what features this compiler supports.  Note that manually comparing major/minor numbers
        // loosens the matching to accept prereleases such as "3.6.0-dev.20190530"
        this._capabilities = {
            incrementalProgram: false
        };
        if (this._typescriptParsedVersion.major > 3 ||
            (this._typescriptParsedVersion.major === 3 && this._typescriptParsedVersion.minor >= 6)) {
            this._capabilities.incrementalProgram = true;
        }
        // Disable incremental "useIncrementalProgram" in watch mode because its compiler configuration is
        // different, which will invalidate the incremental build cache.  In order to support this, we'd need
        // to delete the cache when switching modes, or else maintain two separate cache folders.
        this._useIncrementalProgram = this._capabilities.incrementalProgram && !this._configuration.watchMode;
        this._configuration.buildCacheFolder = node_core_library_1.Path.convertToSlashes(this._configuration.buildCacheFolder);
        this._tslintConfigFilePath = path.resolve(this._configuration.buildFolder, 'tslint.json');
        this._eslintConfigFilePath = path.resolve(this._configuration.buildFolder, '.eslintrc.js');
        this._eslintEnabled = this._tslintEnabled =
            this._configuration.lintingEnabled && !this._configuration.watchMode; // Don't run lint in watch mode
        if (this._tslintEnabled) {
            this._tslintEnabled = this._cachedFileSystem.exists(this._tslintConfigFilePath);
        }
        if (this._eslintEnabled) {
            this._eslintEnabled = this._cachedFileSystem.exists(this._eslintConfigFilePath);
        }
        // Report a warning if the TypeScript version is too old/new.  The current oldest supported version is
        // TypeScript 2.9. Prior to that the "ts.getConfigFileParsingDiagnostics()" API is missing; more fixups
        // would be required to deal with that.  We won't do that work unless someone requests it.
        if (this._typescriptParsedVersion.major < 2 ||
            (this._typescriptParsedVersion.major === 2 && this._typescriptParsedVersion.minor < 9)) {
            // We don't use writeWarningLine() here because, if the person wants to take their chances with
            // a seemingly unsupported compiler, their build should be allowed to succeed.
            this._typescriptTerminal.writeLine(`The TypeScript compiler version ${this._typescriptVersion} is very old` +
                ` and has not been tested with Heft; it may not work correctly.`);
        }
        else if (this._typescriptParsedVersion.major > 4) {
            this._typescriptTerminal.writeLine(`The TypeScript compiler version ${this._typescriptVersion} is newer` +
                ` than the latest version that was tested with Heft; it may not work correctly.`);
        }
        const ts = require(this._configuration.typeScriptToolPath);
        ts.performance.enable();
        const measureTsPerformance = (measurementName, fn) => {
            const beforeName = `before${measurementName}`;
            ts.performance.mark(beforeName);
            const result = fn();
            const afterName = `after${measurementName}`;
            ts.performance.mark(afterName);
            ts.performance.measure(measurementName, beforeName, afterName);
            return Object.assign(Object.assign({}, result), { duration: ts.performance.getDuration(measurementName), count: ts.performance.getCount(beforeName) });
        };
        const measureTsPerformanceAsync = async (measurementName, fn) => {
            const beforeName = `before${measurementName}`;
            ts.performance.mark(beforeName);
            const resultPromise = fn();
            const result = await resultPromise;
            const afterName = `after${measurementName}`;
            ts.performance.mark(afterName);
            ts.performance.measure(measurementName, beforeName, afterName);
            return Object.assign(Object.assign({}, result), { duration: ts.performance.getDuration(measurementName) });
        };
        let tslint = undefined;
        if (this._tslintEnabled) {
            if (!this._configuration.tslintToolPath) {
                throw new Error('Unable to resolve "tslint" package');
            }
            const tslintLogger = await this.requestScopedLoggerAsync('tslint');
            tslint = new Tslint_1.Tslint({
                ts: ts,
                tslintPackagePath: this._configuration.tslintToolPath,
                scopedLogger: tslintLogger,
                buildFolderPath: this._configuration.buildFolder,
                buildCacheFolderPath: this._configuration.buildCacheFolder,
                linterConfigFilePath: this._tslintConfigFilePath,
                cachedFileSystem: this._cachedFileSystem,
                measurePerformance: measureTsPerformance
            });
        }
        let eslint = undefined;
        if (this._eslintEnabled) {
            if (!this._configuration.eslintToolPath) {
                throw new Error('Unable to resolve "eslint" package');
            }
            const eslintLogger = await this.requestScopedLoggerAsync('eslint');
            eslint = new Eslint_1.Eslint({
                ts: ts,
                eslintPackagePath: this._configuration.eslintToolPath,
                scopedLogger: eslintLogger,
                buildFolderPath: this._configuration.buildFolder,
                buildCacheFolderPath: this._configuration.buildCacheFolder,
                linterConfigFilePath: this._eslintConfigFilePath,
                measurePerformance: measureTsPerformance
            });
        }
        this._typescriptTerminal.writeLine(`Using TypeScript version ${ts.version}`);
        if (eslint) {
            eslint.printVersionHeader();
        }
        if (tslint) {
            tslint.printVersionHeader();
        }
        if (this._configuration.watchMode) {
            await this._runWatch(ts, measureTsPerformance);
        }
        else {
            await this._runBuild(ts, eslint, tslint, measureTsPerformance, measureTsPerformanceAsync);
        }
    }
    async _runWatch(ts, measureTsPerformance) {
        //#region CONFIGURE
        const { duration: configureDurationMs, tsconfig, compilerHost } = measureTsPerformance('Configure', () => {
            const _tsconfig = this._loadTsconfig(ts);
            const _compilerHost = this._buildWatchCompilerHost(ts, _tsconfig);
            return {
                tsconfig: _tsconfig,
                compilerHost: _compilerHost
            };
        });
        this._typescriptTerminal.writeVerboseLine(`Configure: ${configureDurationMs}ms`);
        //#endregion
        this._validateTsconfig(ts, tsconfig);
        EmitFilesPatch_1.EmitFilesPatch.install(ts, tsconfig, this._moduleKindsToEmit, /* useBuildCache */ false);
        ts.createWatchProgram(compilerHost);
        return new Promise(() => {
            /* never terminate */
        });
    }
    async _runBuild(ts, eslint, tslint, measureTsPerformance, measureTsPerformanceAsync) {
        // Ensure the cache folder exists
        this._cachedFileSystem.ensureFolder(this._configuration.buildCacheFolder);
        //#region CONFIGURE
        const { duration: configureDurationMs, tsconfig, compilerHost } = measureTsPerformance('Configure', () => {
            this._overrideTypeScriptReadJson(ts);
            const _tsconfig = this._loadTsconfig(ts);
            const _compilerHost = this._buildIncrementalCompilerHost(ts, _tsconfig);
            return {
                tsconfig: _tsconfig,
                compilerHost: _compilerHost
            };
        });
        this._typescriptTerminal.writeVerboseLine(`Configure: ${configureDurationMs}ms`);
        //#endregion
        this._validateTsconfig(ts, tsconfig);
        //#region PROGRAM
        // There will be only one program here; emit will get a bit abused if we produce multiple outputs
        let builderProgram = undefined;
        let tsProgram;
        if (this._useIncrementalProgram) {
            builderProgram = ts.createIncrementalProgram({
                rootNames: tsconfig.fileNames,
                options: tsconfig.options,
                projectReferences: tsconfig.projectReferences,
                host: compilerHost,
                configFileParsingDiagnostics: ts.getConfigFileParsingDiagnostics(tsconfig)
            });
            tsProgram = builderProgram.getProgram();
        }
        else {
            tsProgram = ts.createProgram({
                rootNames: tsconfig.fileNames,
                options: tsconfig.options,
                projectReferences: tsconfig.projectReferences,
                host: compilerHost,
                configFileParsingDiagnostics: ts.getConfigFileParsingDiagnostics(tsconfig)
            });
        }
        // Prefer the builder program, since it is what gives us incremental builds
        const genericProgram = builderProgram || tsProgram;
        this._typescriptTerminal.writeVerboseLine(`I/O Read: ${ts.performance.getDuration('I/O Read')}ms (${ts.performance.getCount('beforeIORead')} files)`);
        this._typescriptTerminal.writeVerboseLine(`Parse: ${ts.performance.getDuration('Parse')}ms (${ts.performance.getCount('beforeParse')} files)`);
        this._typescriptTerminal.writeVerboseLine(`Program (includes Read + Parse): ${ts.performance.getDuration('Program')}ms`);
        //#endregion
        //#region ANALYSIS
        const { duration: diagnosticsDurationMs, diagnostics: preDiagnostics } = measureTsPerformance('Analyze', () => {
            const rawDiagnostics = [
                ...genericProgram.getConfigFileParsingDiagnostics(),
                ...genericProgram.getOptionsDiagnostics(),
                ...genericProgram.getSyntacticDiagnostics(),
                ...genericProgram.getGlobalDiagnostics(),
                ...genericProgram.getSemanticDiagnostics()
            ];
            return { diagnostics: rawDiagnostics };
        });
        this._typescriptTerminal.writeVerboseLine(`Analyze: ${diagnosticsDurationMs}ms`);
        //#endregion
        //#region EMIT
        const emitResult = this._emit(ts, tsconfig, genericProgram);
        //#endregion
        this._typescriptTerminal.writeVerboseLine(`Bind: ${ts.performance.getDuration('Bind')}ms`);
        this._typescriptTerminal.writeVerboseLine(`Check: ${ts.performance.getDuration('Check')}ms`);
        this._typescriptTerminal.writeVerboseLine(`Transform: ${ts.performance.getDuration('transformTime')}ms ` +
            `(${ts.performance.getCount('beforeTransform')} files)`);
        this._typescriptTerminal.writeVerboseLine(`Print: ${ts.performance.getDuration('printTime')}ms ` +
            `(${ts.performance.getCount('beforePrint')} files) (Includes Transform)`);
        this._typescriptTerminal.writeVerboseLine(`Emit: ${ts.performance.getDuration('Emit')}ms (Includes Print)`);
        //#region FINAL_ANALYSIS
        // Need to ensure that we include emit diagnostics, since they might not be part of the other sets
        const { duration: mergeDiagnosticDurationMs, diagnostics } = measureTsPerformance('Diagnostics', () => {
            const rawDiagnostics = [...preDiagnostics, ...emitResult.diagnostics];
            return { diagnostics: ts.sortAndDeduplicateDiagnostics(rawDiagnostics) };
        });
        this._typescriptTerminal.writeVerboseLine(`Diagnostics: ${mergeDiagnosticDurationMs}ms`);
        //#endregion
        //#region WRITE
        const writePromise = measureTsPerformanceAsync('Write', () => Async_1.Async.forEachLimitAsync(emitResult.filesToWrite, this._configuration.maxWriteParallelism, async ({ filePath, data }) => this._cachedFileSystem.writeFile(filePath, data, { ensureFolderExists: true })));
        //#endregion
        const typeScriptFilenames = new Set(tsconfig.fileNames);
        const extendedProgram = tsProgram;
        //#region ESLINT
        if (eslint) {
            await eslint.performLintingAsync({
                tsProgram: extendedProgram,
                typeScriptFilenames: typeScriptFilenames,
                changedFiles: emitResult.changedSourceFiles
            });
        }
        //#endregion
        //#region TSLINT
        if (tslint) {
            await tslint.performLintingAsync({
                tsProgram: extendedProgram,
                typeScriptFilenames: typeScriptFilenames,
                changedFiles: emitResult.changedSourceFiles
            });
        }
        //#endregion
        const { duration: writeDuration } = await writePromise;
        this._typescriptTerminal.writeVerboseLine(`I/O Write: ${writeDuration}ms (${emitResult.filesToWrite.length} files)`);
        //#region HARDLINK/COPY
        const shouldHardlink = this._configuration.copyFromCacheMode !== 'copy';
        const { duration: hardlinkDuration, linkCount: hardlinkCount } = await measureTsPerformanceAsync(shouldHardlink ? 'Hardlink' : 'CopyFromCache', async () => {
            const commonSourceDirectory = extendedProgram.getCommonSourceDirectory();
            const linkPromises = [];
            let linkCount = 0;
            const resolverHost = {
                getCurrentDirectory: () => compilerHost.getCurrentDirectory(),
                getCommonSourceDirectory: () => commonSourceDirectory,
                getCanonicalFileName: (filename) => compilerHost.getCanonicalFileName(filename)
            };
            let queueLinkOrCopy;
            if (shouldHardlink) {
                queueLinkOrCopy = (options) => {
                    linkPromises.push(this._cachedFileSystem
                        .createHardLinkAsync(Object.assign(Object.assign({}, options), { alreadyExistsBehavior: "ignore" /* Ignore */ }))
                        .then(() => {
                        linkCount++;
                    })
                        .catch((error) => {
                        if (!node_core_library_1.FileSystem.isNotExistError(error)) {
                            // Only re-throw errors that aren't not-exist errors
                            throw error;
                        }
                    }));
                };
            }
            else {
                queueLinkOrCopy = (options) => {
                    linkPromises.push(this._cachedFileSystem
                        .copyFileAsync({
                        sourcePath: options.linkTargetPath,
                        destinationPath: options.newLinkPath
                    })
                        .then(() => {
                        linkCount++;
                    })
                        .catch((error) => {
                        if (!node_core_library_1.FileSystem.isNotExistError(error)) {
                            // Only re-throw errors that aren't not-exist errors
                            throw error;
                        }
                    }));
                };
            }
            for (const sourceFile of genericProgram.getSourceFiles()) {
                const filename = sourceFile.fileName;
                if (typeScriptFilenames.has(filename)) {
                    const relativeFilenameWithoutExtension = ts.removeFileExtension(ts.getExternalModuleNameFromPath(resolverHost, filename));
                    for (const { cacheOutFolderPath, outFolderPath, jsExtensionOverride = '.js', isPrimary } of this
                        ._moduleKindsToEmit) {
                        // Only primary module kinds emit declarations
                        if (isPrimary) {
                            if (tsconfig.options.declarationMap) {
                                const dtsMapFilename = `${relativeFilenameWithoutExtension}.d.ts.map`;
                                queueLinkOrCopy({
                                    linkTargetPath: path.join(cacheOutFolderPath, dtsMapFilename),
                                    newLinkPath: path.join(outFolderPath, dtsMapFilename)
                                });
                            }
                            if (tsconfig.options.declaration) {
                                const dtsFilename = `${relativeFilenameWithoutExtension}.d.ts`;
                                queueLinkOrCopy({
                                    linkTargetPath: path.join(cacheOutFolderPath, dtsFilename),
                                    newLinkPath: path.join(outFolderPath, dtsFilename)
                                });
                            }
                        }
                        if (tsconfig.options.sourceMap && !sourceFile.isDeclarationFile) {
                            const jsMapFilename = `${relativeFilenameWithoutExtension}${jsExtensionOverride}.map`;
                            queueLinkOrCopy({
                                linkTargetPath: path.join(cacheOutFolderPath, jsMapFilename),
                                newLinkPath: path.join(outFolderPath, jsMapFilename)
                            });
                        }
                        // Write the .js file last in case something is watching its timestamp
                        if (!sourceFile.isDeclarationFile) {
                            const jsFilename = `${relativeFilenameWithoutExtension}${jsExtensionOverride}`;
                            queueLinkOrCopy({
                                linkTargetPath: path.join(cacheOutFolderPath, jsFilename),
                                newLinkPath: path.join(outFolderPath, jsFilename)
                            });
                        }
                    }
                }
            }
            await Promise.all(linkPromises);
            return { linkCount };
        });
        this._typescriptTerminal.writeVerboseLine(`${shouldHardlink ? 'Hardlink' : 'Copy from cache'}: ${hardlinkDuration}ms (${hardlinkCount} files)`);
        // In non-watch mode, notify EmitCompletedCallbackManager once after we complete the compile step
        this._emitCompletedCallbackManager.callback();
        //#endregion
        let typeScriptErrorCount = 0;
        if (diagnostics.length > 0) {
            this._typescriptTerminal.writeLine(`Encountered ${diagnostics.length} TypeScript issue${diagnostics.length > 1 ? 's' : ''}:`);
            for (const diagnostic of diagnostics) {
                const diagnosticCategory = this._getAdjustedDiagnosticCategory(diagnostic, ts);
                if (diagnosticCategory === ts.DiagnosticCategory.Error) {
                    typeScriptErrorCount++;
                }
                this._printDiagnosticMessage(ts, diagnostic, diagnosticCategory);
            }
        }
        if (eslint) {
            eslint.reportFailures();
        }
        if (tslint) {
            tslint.reportFailures();
        }
        if (typeScriptErrorCount > 0) {
            throw new Error(`Encountered TypeScript error${typeScriptErrorCount > 1 ? 's' : ''}`);
        }
    }
    _printDiagnosticMessage(ts, diagnostic, diagnosticCategory = this._getAdjustedDiagnosticCategory(diagnostic, ts)) {
        // Code taken from reference example
        let diagnosticMessage;
        let errorObject;
        if (diagnostic.file) {
            const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
            const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
            const buildFolderRelativeFilename = path.relative(this._configuration.buildFolder, diagnostic.file.fileName);
            const formattedMessage = `(TS${diagnostic.code}) ${message}`;
            errorObject = new FileError_1.FileError(formattedMessage, buildFolderRelativeFilename, line + 1, character + 1);
            diagnosticMessage = errorObject.toString();
        }
        else {
            diagnosticMessage = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
            errorObject = new Error(diagnosticMessage);
        }
        switch (diagnosticCategory) {
            case ts.DiagnosticCategory.Error: {
                this._typescriptLogger.emitError(errorObject);
                break;
            }
            case ts.DiagnosticCategory.Warning: {
                this._typescriptLogger.emitWarning(errorObject);
                break;
            }
            default: {
                this._typescriptTerminal.writeLine(...diagnosticMessage);
                break;
            }
        }
    }
    _getAdjustedDiagnosticCategory(diagnostic, ts) {
        // Workaround for https://github.com/microsoft/TypeScript/issues/40058
        // The compiler reports a hard error for issues such as this:
        //
        //    error TS6133: 'x' is declared but its value is never read.
        //
        // These should properly be treated as warnings, because they are purely cosmetic issues.
        // TODO: Maybe heft should provide a config file for managing DiagnosticCategory mappings.
        if (diagnostic.reportsUnnecessary && diagnostic.category === ts.DiagnosticCategory.Error) {
            return ts.DiagnosticCategory.Warning;
        }
        // These pedantic checks also should not be treated as hard errors
        switch (diagnostic.code) {
            case ts.Diagnostics.Property_0_has_no_initializer_and_is_not_definitely_assigned_in_the_constructor
                .code:
            case ts.Diagnostics
                .Element_implicitly_has_an_any_type_because_expression_of_type_0_can_t_be_used_to_index_type_1.code:
                return ts.DiagnosticCategory.Warning;
        }
        return diagnostic.category;
    }
    _emit(ts, tsconfig, genericProgram) {
        const filesToWrite = [];
        const changedFiles = new Set();
        EmitFilesPatch_1.EmitFilesPatch.install(ts, tsconfig, this._moduleKindsToEmit, /* useBuildCache */ true, changedFiles);
        const writeFileCallback = (filePath, data) => {
            const redirectedFilePath = EmitFilesPatch_1.EmitFilesPatch.getRedirectedFilePath(filePath);
            filesToWrite.push({ filePath: redirectedFilePath, data });
        };
        const result = genericProgram.emit(undefined, // Target source file
        writeFileCallback);
        EmitFilesPatch_1.EmitFilesPatch.uninstall(ts);
        return Object.assign(Object.assign({}, result), { changedSourceFiles: changedFiles, filesToWrite });
    }
    _validateTsconfig(ts, tsconfig) {
        if ((tsconfig.options.module && !tsconfig.options.outDir) ||
            (!tsconfig.options.module && tsconfig.options.outDir)) {
            throw new Error('If either the module or the outDir option is provided in the tsconfig compilerOptions, both must be provided');
        }
        this._moduleKindsToEmit = [];
        const specifiedKinds = new Map();
        const specifiedOutDirs = new Map();
        if (!tsconfig.options.module) {
            throw new Error('If the module tsconfig compilerOption is not provided, the builder must be provided with the ' +
                'additionalModuleKindsToEmit configuration option.');
        }
        if (this._configuration.emitCjsExtensionForCommonJS) {
            this._addModuleKindToEmit(ts.ModuleKind.CommonJS, tsconfig.options.outDir, 
            /* isPrimary */ tsconfig.options.module === ts.ModuleKind.CommonJS, '.cjs');
            const cjsReason = {
                outDir: tsconfig.options.outDir,
                kind: 'CommonJS',
                extension: '.cjs',
                reason: 'emitCjsExtensionForCommonJS'
            };
            specifiedKinds.set(ts.ModuleKind.CommonJS, cjsReason);
            specifiedOutDirs.set(`${tsconfig.options.outDir}:.cjs`, cjsReason);
        }
        if (this._configuration.emitMjsExtensionForESModule) {
            this._addModuleKindToEmit(ts.ModuleKind.ESNext, tsconfig.options.outDir, 
            /* isPrimary */ tsconfig.options.module === ts.ModuleKind.ESNext, '.mjs');
            const mjsReason = {
                outDir: tsconfig.options.outDir,
                kind: 'ESNext',
                extension: '.mjs',
                reason: 'emitMjsExtensionForESModule'
            };
            specifiedKinds.set(ts.ModuleKind.CommonJS, mjsReason);
            specifiedOutDirs.set(`${tsconfig.options.outDir}:.mjs`, mjsReason);
        }
        if (!specifiedKinds.has(tsconfig.options.module)) {
            this._addModuleKindToEmit(tsconfig.options.module, tsconfig.options.outDir, 
            /* isPrimary */ true, 
            /* jsExtensionOverride */ undefined);
            const tsConfigReason = {
                outDir: tsconfig.options.outDir,
                kind: ts.ModuleKind[tsconfig.options.module],
                extension: '.js',
                reason: 'tsconfig.json'
            };
            specifiedKinds.set(tsconfig.options.module, tsConfigReason);
            specifiedOutDirs.set(`${tsconfig.options.outDir}:.js`, tsConfigReason);
        }
        if (this._configuration.additionalModuleKindsToEmit) {
            for (const additionalModuleKindToEmit of this._configuration.additionalModuleKindsToEmit) {
                const moduleKind = this._parseModuleKind(ts, additionalModuleKindToEmit.moduleKind);
                const outDirKey = `${additionalModuleKindToEmit.outFolderName}:.js`;
                const moduleKindReason = {
                    kind: ts.ModuleKind[moduleKind],
                    outDir: additionalModuleKindToEmit.outFolderName,
                    extension: '.js',
                    reason: `additionalModuleKindsToEmit`
                };
                const existingKind = specifiedKinds.get(moduleKind);
                const existingDir = specifiedOutDirs.get(outDirKey);
                if (existingKind) {
                    throw new Error(`Module kind "${additionalModuleKindToEmit.moduleKind}" is already emitted at ${existingKind.outDir} with extension '${existingKind.extension}' by option ${existingKind.reason}.`);
                }
                else if (existingDir) {
                    throw new Error(`Output folder "${additionalModuleKindToEmit.outFolderName}" already contains module kind ${existingDir.kind} with extension '${existingDir.extension}', specified by option ${existingDir.reason}.`);
                }
                else {
                    const outFolderKey = this._addModuleKindToEmit(moduleKind, additionalModuleKindToEmit.outFolderName, 
                    /* isPrimary */ false, undefined);
                    if (outFolderKey) {
                        specifiedKinds.set(moduleKind, moduleKindReason);
                        specifiedOutDirs.set(outFolderKey, moduleKindReason);
                    }
                }
            }
        }
    }
    _addModuleKindToEmit(moduleKind, outFolderPath, isPrimary, jsExtensionOverride) {
        let outFolderName;
        if (path.isAbsolute(outFolderPath)) {
            outFolderName = path.relative(this._configuration.buildFolder, outFolderPath);
        }
        else {
            outFolderName = outFolderPath;
            outFolderPath = path.resolve(this._configuration.buildFolder, outFolderPath);
        }
        outFolderPath = node_core_library_1.Path.convertToSlashes(outFolderPath);
        outFolderPath = outFolderPath.replace(/\/*$/, '/'); // Ensure the outFolderPath ends with a slash
        for (const existingModuleKindToEmit of this._moduleKindsToEmit) {
            let errorText;
            if (existingModuleKindToEmit.outFolderPath === outFolderPath) {
                if (existingModuleKindToEmit.jsExtensionOverride === jsExtensionOverride) {
                    errorText =
                        'Unable to output two different module kinds with the same ' +
                            `module extension (${jsExtensionOverride || '.js'}) to the same ` +
                            `folder ("${outFolderPath}").`;
                }
            }
            else {
                let parentFolder;
                let childFolder;
                if (outFolderPath.startsWith(existingModuleKindToEmit.outFolderPath)) {
                    parentFolder = outFolderPath;
                    childFolder = existingModuleKindToEmit.outFolderPath;
                }
                else if (existingModuleKindToEmit.outFolderPath.startsWith(outFolderPath)) {
                    parentFolder = existingModuleKindToEmit.outFolderPath;
                    childFolder = outFolderPath;
                }
                if (parentFolder) {
                    errorText =
                        'Unable to output two different module kinds to nested folders ' +
                            `("${parentFolder}" and "${childFolder}").`;
                }
            }
            if (errorText) {
                this._typescriptLogger.emitError(new Error(errorText));
                return undefined;
            }
        }
        this._moduleKindsToEmit.push({
            outFolderPath,
            moduleKind,
            cacheOutFolderPath: node_core_library_1.Path.convertToSlashes(path.resolve(this._configuration.buildCacheFolder, outFolderName)),
            jsExtensionOverride,
            isPrimary
        });
        return `${outFolderName}:${jsExtensionOverride || '.js'}`;
    }
    _loadTsconfig(ts) {
        const parsedConfigFile = ts.readConfigFile(this._configuration.tsconfigPath, this._cachedFileSystem.readFile);
        const currentFolder = path.dirname(this._configuration.tsconfigPath);
        const tsconfig = ts.parseJsonConfigFileContent(parsedConfigFile.config, {
            fileExists: this._cachedFileSystem.exists,
            readFile: this._cachedFileSystem.readFile,
            readDirectory: (folderPath, extensions, excludes, includes, depth) => ts.matchFiles(folderPath, extensions, excludes, includes, 
            /* useCaseSensitiveFileNames */ true, currentFolder, depth, this._cachedFileSystem.readFolderFilesAndDirectories.bind(this._cachedFileSystem), this._cachedFileSystem.getRealPath.bind(this._cachedFileSystem)),
            useCaseSensitiveFileNames: true
        }, currentFolder);
        if (this._useIncrementalProgram) {
            tsconfig.options.incremental = true;
            tsconfig.options.tsBuildInfoFile = this._tsCacheFilePath;
        }
        return tsconfig;
    }
    _buildIncrementalCompilerHost(ts, tsconfig) {
        let compilerHost;
        if (this._useIncrementalProgram) {
            compilerHost = ts.createIncrementalCompilerHost(tsconfig.options);
        }
        else {
            compilerHost = ts.createCompilerHost(tsconfig.options);
        }
        compilerHost.realpath = this._cachedFileSystem.getRealPath.bind(this._cachedFileSystem);
        compilerHost.readFile = (filePath) => {
            try {
                return this._cachedFileSystem.readFile(filePath, {});
            }
            catch (error) {
                if (node_core_library_1.FileSystem.isNotExistError(error)) {
                    return undefined;
                }
                else {
                    throw error;
                }
            }
        };
        compilerHost.fileExists = this._cachedFileSystem.exists.bind(this._cachedFileSystem);
        compilerHost.directoryExists = (directoryPath) => {
            try {
                const stats = this._cachedFileSystem.getStatistics(directoryPath);
                return stats.isDirectory() || stats.isSymbolicLink();
            }
            catch (error) {
                if (node_core_library_1.FileSystem.isNotExistError(error)) {
                    return false;
                }
                else {
                    throw error;
                }
            }
        };
        compilerHost.getDirectories = (folderPath) => this._cachedFileSystem.readFolderFilesAndDirectories(folderPath).directories;
        /* Use the Heft config's build folder because it has corrected casing */
        compilerHost.getCurrentDirectory = () => this._configuration.buildFolder;
        return compilerHost;
    }
    _buildWatchCompilerHost(ts, tsconfig) {
        return ts.createWatchCompilerHost(tsconfig.fileNames, tsconfig.options, ts.sys, (rootNames, options, compilerHost, oldProgram, configFileParsingDiagnostics, projectReferences) => {
            if (compilerHost === undefined) {
                throw new node_core_library_1.InternalError('_buildWatchCompilerHost() expects a compilerHost to be configured');
            }
            const originalWriteFile = compilerHost.writeFile;
            compilerHost.writeFile = (filePath, 
            // Do this with a "rest" argument in case the TS API changes
            ...rest) => {
                const redirectedFilePath = EmitFilesPatch_1.EmitFilesPatch.getRedirectedFilePath(filePath);
                originalWriteFile.call(this, redirectedFilePath, ...rest);
            };
            return ts.createEmitAndSemanticDiagnosticsBuilderProgram(rootNames, options, compilerHost, oldProgram, configFileParsingDiagnostics, projectReferences);
        }, (diagnostic) => this._printDiagnosticMessage(ts, diagnostic), (diagnostic) => {
            this._printDiagnosticMessage(ts, diagnostic);
            // In watch mode, notify EmitCompletedCallbackManager every time we finish recompiling.
            if (diagnostic.code === ts.Diagnostics.Found_0_errors_Watching_for_file_changes.code ||
                diagnostic.code === ts.Diagnostics.Found_1_error_Watching_for_file_changes.code) {
                this._emitCompletedCallbackManager.callback();
            }
        }, tsconfig.projectReferences);
    }
    _overrideTypeScriptReadJson(ts) {
        ts.readJson = (filePath) => {
            let jsonData = this._tsReadJsonCache.get(filePath);
            if (jsonData) {
                return jsonData;
            }
            else {
                try {
                    const fileContents = this._cachedFileSystem.readFile(filePath);
                    if (!fileContents) {
                        jsonData = EMPTY_JSON;
                    }
                    else {
                        const parsedFile = ts.parseConfigFileTextToJson(filePath, fileContents);
                        if (parsedFile.error) {
                            jsonData = EMPTY_JSON;
                        }
                        else {
                            jsonData = parsedFile.config;
                        }
                    }
                }
                catch (error) {
                    jsonData = EMPTY_JSON;
                }
                this._tsReadJsonCache.set(filePath, jsonData);
                return jsonData;
            }
        };
    }
    _parseModuleKind(ts, moduleKindName) {
        switch (moduleKindName.toLowerCase()) {
            case 'commonjs':
                return ts.ModuleKind.CommonJS;
            case 'amd':
                return ts.ModuleKind.AMD;
            case 'umd':
                return ts.ModuleKind.UMD;
            case 'system':
                return ts.ModuleKind.System;
            case 'es2015':
                return ts.ModuleKind.ES2015;
            case 'esnext':
                return ts.ModuleKind.ESNext;
            default:
                throw new Error(`"${moduleKindName}" is not a valid module kind name.`);
        }
    }
}
exports.TypeScriptBuilder = TypeScriptBuilder;
//# sourceMappingURL=TypeScriptBuilder.js.map