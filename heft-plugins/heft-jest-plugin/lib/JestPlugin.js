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
exports.JestPlugin = void 0;
// Load the Jest patch
require("./jestWorkerPatch");
const path = __importStar(require("path"));
const utils_1 = require("jest-config/build/utils");
const lodash_1 = require("lodash");
const core_1 = require("@jest/core");
const heft_config_file_1 = require("@rushstack/heft-config-file");
const node_core_library_1 = require("@rushstack/node-core-library");
const HeftJestDataFile_1 = require("./HeftJestDataFile");
const PLUGIN_NAME = 'JestPlugin';
const PLUGIN_PACKAGE_NAME = '@rushstack/heft-jest-plugin';
const PLUGIN_PACKAGE_FOLDER = path.resolve(__dirname, '..');
const PLUGIN_SCHEMA_PATH = path.resolve(__dirname, 'schemas', 'heft-jest-plugin.schema.json');
const JEST_CONFIGURATION_LOCATION = `config/jest.config.json`;
const ROOTDIR_TOKEN = '<rootDir>';
const CONFIGDIR_TOKEN = '<configDir>';
const PACKAGE_CAPTUREGROUP = 'package';
const PACKAGEDIR_REGEX = new RegExp(/^<packageDir:\s*(?<package>[^\s>]+)\s*>/);
/**
 * @internal
 */
class JestPlugin {
    constructor() {
        this.pluginName = PLUGIN_NAME;
        this.optionsSchema = node_core_library_1.JsonSchema.fromFile(PLUGIN_SCHEMA_PATH);
    }
    /**
     * Runs required setup before running Jest through the JestPlugin.
     */
    static async _setupJestAsync(scopedLogger, heftConfiguration, debugMode, buildStageProperties, options) {
        // Write the data file used by jest-build-transform
        await HeftJestDataFile_1.HeftJestDataFile.saveForProjectAsync(heftConfiguration.buildFolder, {
            emitFolderNameForTests: buildStageProperties.emitFolderNameForTests || 'lib',
            extensionForTests: buildStageProperties.emitExtensionForTests || '.js',
            skipTimestampCheck: !buildStageProperties.watchMode,
            // If the property isn't defined, assume it's a not a TypeScript project since this
            // value should be set by the Heft TypeScriptPlugin during the compile hook
            isTypeScriptProject: !!buildStageProperties.isTypeScriptProject
        });
        scopedLogger.terminal.writeVerboseLine('Wrote heft-jest-data.json file');
    }
    /**
     * Runs Jest using the provided options.
     */
    static async _runJestAsync(scopedLogger, heftConfiguration, debugMode, testStageProperties, options) {
        var _a;
        const terminal = scopedLogger.terminal;
        terminal.writeLine(`Using Jest version ${core_1.getVersion()}`);
        const buildFolder = heftConfiguration.buildFolder;
        const projectRelativeFilePath = (_a = options === null || options === void 0 ? void 0 : options.configurationPath) !== null && _a !== void 0 ? _a : JEST_CONFIGURATION_LOCATION;
        await HeftJestDataFile_1.HeftJestDataFile.loadAndValidateForProjectAsync(buildFolder);
        let jestConfig;
        if (options === null || options === void 0 ? void 0 : options.disableConfigurationModuleResolution) {
            // Module resolution explicitly disabled, use the config as-is
            const jestConfigPath = path.join(buildFolder, projectRelativeFilePath);
            if (!(await node_core_library_1.FileSystem.existsAsync(jestConfigPath))) {
                scopedLogger.emitError(new Error(`Expected to find jest config file at "${jestConfigPath}".`));
                return;
            }
            jestConfig = await node_core_library_1.JsonFile.loadAsync(jestConfigPath);
        }
        else {
            // Load in and resolve the config file using the "extends" field
            jestConfig = await JestPlugin._getJestConfigurationLoader(buildFolder, projectRelativeFilePath).loadConfigurationFileForProjectAsync(terminal, heftConfiguration.buildFolder, heftConfiguration.rigConfig);
            if (jestConfig.preset) {
                throw new Error('The provided jest.config.json specifies a "preset" property while using resolved modules. ' +
                    'You must either remove all "preset" values from your Jest configuration, use the "extends" ' +
                    'property, or set the "disableConfigurationModuleResolution" option to "true" on the Jest ' +
                    'plugin in heft.json');
            }
        }
        const jestArgv = {
            watch: testStageProperties.watchMode,
            // In debug mode, avoid forking separate processes that are difficult to debug
            runInBand: debugMode,
            debug: debugMode,
            detectOpenHandles: !!testStageProperties.detectOpenHandles,
            cacheDirectory: JestPlugin._getJestCacheFolder(heftConfiguration),
            updateSnapshot: testStageProperties.updateSnapshots,
            listTests: false,
            rootDir: buildFolder,
            silent: testStageProperties.silent,
            testNamePattern: testStageProperties.testNamePattern,
            testPathPattern: testStageProperties.testPathPattern
                ? [...testStageProperties.testPathPattern]
                : undefined,
            testTimeout: testStageProperties.testTimeout,
            maxWorkers: testStageProperties.maxWorkers,
            passWithNoTests: testStageProperties.passWithNoTests,
            $0: process.argv0,
            _: []
        };
        if (!testStageProperties.debugHeftReporter) {
            // Extract the reporters and transform to include the Heft reporter by default
            jestArgv.reporters = JestPlugin._extractHeftJestReporters(scopedLogger, heftConfiguration, debugMode, jestConfig, projectRelativeFilePath);
        }
        else {
            scopedLogger.emitWarning(new Error('The "--debug-heft-reporter" parameter was specified; disabling HeftJestReporter'));
        }
        if (testStageProperties.findRelatedTests && testStageProperties.findRelatedTests.length > 0) {
            // Pass test names as the command line remainder
            jestArgv.findRelatedTests = true;
            jestArgv._ = [...testStageProperties.findRelatedTests];
        }
        // Stringify the config and pass it into Jest directly
        jestArgv.config = JSON.stringify(jestConfig);
        const { 
        // Config.Argv is weakly typed.  After updating the jestArgv object, it's a good idea to inspect "globalConfig"
        // in the debugger to validate that your changes are being applied as expected.
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        globalConfig, results: jestResults } = await core_1.runCLI(jestArgv, [buildFolder]);
        if (jestResults.numFailedTests > 0) {
            scopedLogger.emitError(new Error(`${jestResults.numFailedTests} Jest test${jestResults.numFailedTests > 1 ? 's' : ''} failed`));
        }
        else if (jestResults.numFailedTestSuites > 0) {
            scopedLogger.emitError(new Error(`${jestResults.numFailedTestSuites} Jest test suite${jestResults.numFailedTestSuites > 1 ? 's' : ''} failed`));
        }
    }
    /**
     * Returns the loader for the `config/api-extractor-task.json` config file.
     */
    static _getJestConfigurationLoader(buildFolder, projectRelativeFilePath) {
        // Bypass Jest configuration validation
        const schemaPath = `${__dirname}/schemas/anything.schema.json`;
        // By default, ConfigurationFile will replace all objects, so we need to provide merge functions for these
        const shallowObjectInheritanceFunc = (currentObject, parentObject) => {
            // Merged in this order to ensure that the currentObject properties take priority in order-of-definition,
            // since Jest executes them in this order. For example, if the extended Jest configuration contains a
            // "\\.(css|sass|scss)$" transform but the extending Jest configuration contains a "\\.(css)$" transform,
            // merging like this will ensure that the returned transforms are executed in the correct order, stopping
            // after hitting the first pattern that applies:
            // {
            //   "\\.(css)$": "...",
            //   "\\.(css|sass|scss)$": "..."
            // }
            // https://github.com/facebook/jest/blob/0a902e10e0a5550b114340b87bd31764a7638729/packages/jest-config/src/normalize.ts#L102
            return Object.assign(Object.assign(Object.assign({}, (currentObject || {})), (parentObject || {})), (currentObject || {}));
        };
        const deepObjectInheritanceFunc = (currentObject, parentObject) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return lodash_1.mergeWith(parentObject || {}, currentObject || {}, (value, source) => {
                if (!lodash_1.isObject(source)) {
                    return source;
                }
                return Array.isArray(value) ? [...value, ...source] : Object.assign(Object.assign({}, value), source);
            });
        };
        const tokenResolveMetadata = JestPlugin._getJsonPathMetadata({
            rootDir: buildFolder
        });
        const jestResolveMetadata = JestPlugin._getJsonPathMetadata({
            rootDir: buildFolder,
            resolveAsModule: true
        });
        const watchPluginsJestResolveMetadata = JestPlugin._getJsonPathMetadata({
            rootDir: buildFolder,
            resolveAsModule: true,
            // Calls Jest's 'resolveWithPrefix()' using the 'jest-watch-' prefix to match 'jest-watch-<value>' packages
            // https://github.com/facebook/jest/blob/d6fb0d8fb0d43a17f90c7a5a6590257df2f2f6f5/packages/jest-resolve/src/utils.ts#L140
            modulePrefix: 'jest-watch-',
            ignoreMissingModule: true
        });
        return new heft_config_file_1.ConfigurationFile({
            projectRelativeFilePath: projectRelativeFilePath,
            jsonSchemaPath: schemaPath,
            propertyInheritance: {
                moduleNameMapper: {
                    inheritanceType: heft_config_file_1.InheritanceType.custom,
                    inheritanceFunction: shallowObjectInheritanceFunc
                },
                transform: {
                    inheritanceType: heft_config_file_1.InheritanceType.custom,
                    inheritanceFunction: shallowObjectInheritanceFunc
                },
                globals: {
                    inheritanceType: heft_config_file_1.InheritanceType.custom,
                    inheritanceFunction: deepObjectInheritanceFunc
                }
            },
            jsonPathMetadata: {
                // string
                '$.cacheDirectory': tokenResolveMetadata,
                '$.coverageDirectory': tokenResolveMetadata,
                '$.dependencyExtractor': jestResolveMetadata,
                '$.filter': jestResolveMetadata,
                '$.globalSetup': jestResolveMetadata,
                '$.globalTeardown': jestResolveMetadata,
                '$.moduleLoader': jestResolveMetadata,
                '$.prettierPath': jestResolveMetadata,
                '$.resolver': jestResolveMetadata,
                '$.runner': JestPlugin._getJsonPathMetadata({
                    rootDir: buildFolder,
                    resolveAsModule: true,
                    // Calls Jest's 'resolveWithPrefix()' using the 'jest-runner-' prefix to match 'jest-runner-<value>' packages
                    // https://github.com/facebook/jest/blob/d6fb0d8fb0d43a17f90c7a5a6590257df2f2f6f5/packages/jest-resolve/src/utils.ts#L170
                    modulePrefix: 'jest-runner-',
                    ignoreMissingModule: true
                }),
                '$.snapshotResolver': jestResolveMetadata,
                // This is a name like "jsdom" that gets mapped into a package name like "jest-environment-jsdom"
                '$.testEnvironment': JestPlugin._getJsonPathMetadata({
                    rootDir: buildFolder,
                    resolveAsModule: true,
                    // Calls Jest's 'resolveWithPrefix()' using the 'jest-environment-' prefix to match 'jest-environment-<value>' packages
                    // https://github.com/facebook/jest/blob/d6fb0d8fb0d43a17f90c7a5a6590257df2f2f6f5/packages/jest-resolve/src/utils.ts#L110
                    modulePrefix: 'jest-environment-',
                    ignoreMissingModule: true
                }),
                '$.testResultsProcessor': jestResolveMetadata,
                '$.testRunner': jestResolveMetadata,
                '$.testSequencer': JestPlugin._getJsonPathMetadata({
                    rootDir: buildFolder,
                    resolveAsModule: true,
                    // Calls Jest's 'resolveWithPrefix()' using the 'jest-sequencer-' prefix to match 'jest-sequencer-<value>' packages
                    // https://github.com/facebook/jest/blob/d6fb0d8fb0d43a17f90c7a5a6590257df2f2f6f5/packages/jest-resolve/src/utils.ts#L192
                    modulePrefix: 'jest-sequencer-',
                    ignoreMissingModule: true
                }),
                // string[]
                '$.modulePaths.*': tokenResolveMetadata,
                '$.roots.*': tokenResolveMetadata,
                '$.setupFiles.*': jestResolveMetadata,
                '$.setupFilesAfterEnv.*': jestResolveMetadata,
                '$.snapshotSerializers.*': jestResolveMetadata,
                // moduleNameMapper: { [regex]: path | [ ...paths ] }
                '$.moduleNameMapper.*@string()': tokenResolveMetadata,
                '$.moduleNameMapper.*.*': tokenResolveMetadata,
                // reporters: (path | [ path, options ])[]
                '$.reporters[?(@ !== "default")]*@string()': jestResolveMetadata,
                '$.reporters.*[?(@property == 0 && @ !== "default")]': jestResolveMetadata,
                // transform: { [regex]: path | [ path, options ] }
                '$.transform.*@string()': jestResolveMetadata,
                '$.transform.*[?(@property == 0)]': jestResolveMetadata,
                // watchPlugins: (path | [ path, options ])[]
                '$.watchPlugins.*@string()': watchPluginsJestResolveMetadata,
                '$.watchPlugins.*[?(@property == 0)]': watchPluginsJestResolveMetadata // First entry in [ path, options ]
            }
        });
    }
    static _extractHeftJestReporters(scopedLogger, heftConfiguration, debugMode, config, projectRelativeFilePath) {
        let isUsingHeftReporter = false;
        const reporterOptions = {
            heftConfiguration,
            debugMode
        };
        if (Array.isArray(config.reporters)) {
            // Harvest all the array indices that need to modified before altering the array
            const heftReporterIndices = JestPlugin._findIndexes(config.reporters, 'default');
            // Replace 'default' reporter with the heft reporter
            // This may clobber default reporters options
            if (heftReporterIndices.length > 0) {
                const heftReporter = JestPlugin._getHeftJestReporterConfig(reporterOptions);
                for (const index of heftReporterIndices) {
                    config.reporters[index] = heftReporter;
                }
                isUsingHeftReporter = true;
            }
        }
        else if (typeof config.reporters === 'undefined' || config.reporters === null) {
            // Otherwise if no reporters are specified install only the heft reporter
            config.reporters = [JestPlugin._getHeftJestReporterConfig(reporterOptions)];
            isUsingHeftReporter = true;
        }
        else {
            // Making a note if Heft cannot understand the reporter entry in Jest config
            // Not making this an error or warning because it does not warrant blocking a dev or CI test pass
            // If the Jest config is truly wrong Jest itself is in a better position to report what is wrong with the config
            scopedLogger.terminal.writeVerboseLine(`The 'reporters' entry in Jest config '${projectRelativeFilePath}' is in an unexpected format. Was ` +
                'expecting an array of reporters');
        }
        if (!isUsingHeftReporter) {
            scopedLogger.terminal.writeVerboseLine(`HeftJestReporter was not specified in Jest config '${projectRelativeFilePath}'. Consider adding a ` +
                "'default' entry in the reporters array.");
        }
        // Since we're injecting the HeftConfiguration, we need to pass these args directly and not through serialization
        const reporters = config.reporters;
        config.reporters = undefined;
        return reporters;
    }
    /**
     * Returns the reporter config using the HeftJestReporter and the provided options.
     */
    static _getHeftJestReporterConfig(reporterOptions) {
        return [
            `${__dirname}/HeftJestReporter.js`,
            reporterOptions
        ];
    }
    /**
     * Resolve all specified properties to an absolute path using Jest resolution. In addition, the following
     * transforms will be applied to the provided propertyValue before resolution:
     *   - replace <rootDir> with the same rootDir
     *   - replace <configDir> with the directory containing the current configuration file
     *   - replace <packageDir:...> with the path to the resolved package (NOT module)
     */
    static _getJsonPathMetadata(options) {
        return {
            customResolver: (configurationFilePath, propertyName, propertyValue) => {
                var _a;
                const configDir = path.dirname(configurationFilePath);
                // Compare with replaceRootDirInPath() from here:
                // https://github.com/facebook/jest/blob/5f4dd187d89070d07617444186684c20d9213031/packages/jest-config/src/utils.ts#L58
                if (propertyValue.startsWith(ROOTDIR_TOKEN)) {
                    // Example:  <rootDir>/path/to/file.js
                    const restOfPath = path.normalize('./' + propertyValue.substr(ROOTDIR_TOKEN.length));
                    propertyValue = path.resolve(options.rootDir, restOfPath);
                }
                else if (propertyValue.startsWith(CONFIGDIR_TOKEN)) {
                    // Example:  <configDir>/path/to/file.js
                    const restOfPath = path.normalize('./' + propertyValue.substr(CONFIGDIR_TOKEN.length));
                    propertyValue = path.resolve(configDir, restOfPath);
                }
                else {
                    // Example:  <packageDir:@my/package>/path/to/file.js
                    const packageDirMatches = PACKAGEDIR_REGEX.exec(propertyValue);
                    if (packageDirMatches !== null) {
                        const packageName = (_a = packageDirMatches.groups) === null || _a === void 0 ? void 0 : _a[PACKAGE_CAPTUREGROUP];
                        if (!packageName) {
                            throw new Error(`Could not parse package name from "packageDir" token ` +
                                (propertyName ? `of property "${propertyName}" ` : '') +
                                `in "${configDir}".`);
                        }
                        if (!node_core_library_1.PackageName.isValidName(packageName)) {
                            throw new Error(`Module paths are not supported when using the "packageDir" token ` +
                                (propertyName ? `of property "${propertyName}" ` : '') +
                                `in "${configDir}". Only a package name is allowed.`);
                        }
                        // Resolve to the package directory (not the module referenced by the package). The normal resolution
                        // method will generally not be able to find @rushstack/heft-jest-plugin from a project that is
                        // using a rig. Since it is important, and it is our own package, we resolve it manually as a special
                        // case.
                        const resolvedPackagePath = packageName === PLUGIN_PACKAGE_NAME
                            ? PLUGIN_PACKAGE_FOLDER
                            : node_core_library_1.Import.resolvePackage({
                                baseFolderPath: configDir,
                                packageName
                            });
                        // First entry is the entire match
                        const restOfPath = path.normalize('./' + propertyValue.substr(packageDirMatches[0].length));
                        propertyValue = path.resolve(resolvedPackagePath, restOfPath);
                    }
                }
                // Return early, since the remainder of this function is used to resolve module paths
                if (!options.resolveAsModule) {
                    return propertyValue;
                }
                // Example:  @rushstack/heft-jest-plugin
                if (propertyValue === PLUGIN_PACKAGE_NAME) {
                    return PLUGIN_PACKAGE_FOLDER;
                }
                // Example:  @rushstack/heft-jest-plugin/path/to/file.js
                if (propertyValue.startsWith(PLUGIN_PACKAGE_NAME)) {
                    const restOfPath = path.normalize('./' + propertyValue.substr(PLUGIN_PACKAGE_NAME.length));
                    return path.join(PLUGIN_PACKAGE_FOLDER, restOfPath);
                }
                return options.modulePrefix
                    ? utils_1.resolveWithPrefix(/*resolver:*/ undefined, {
                        rootDir: configDir,
                        filePath: propertyValue,
                        prefix: options.modulePrefix,
                        humanOptionName: propertyName,
                        optionName: propertyName
                    })
                    : utils_1.resolve(/*resolver:*/ undefined, {
                        rootDir: configDir,
                        filePath: propertyValue,
                        key: propertyName
                    });
            },
            pathResolutionMethod: heft_config_file_1.PathResolutionMethod.custom
        };
    }
    /**
     * Finds the indices of jest reporters with a given name
     */
    static _findIndexes(items, search) {
        const result = [];
        for (let index = 0; index < items.length; index++) {
            const item = items[index];
            // Item is either a string or a tuple of [reporterName: string, options: unknown]
            if (item === search) {
                result.push(index);
            }
            else if (typeof item !== 'undefined' && item !== null && item[0] === search) {
                result.push(index);
            }
        }
        return result;
    }
    /**
     * Add the jest-cache folder to the list of paths to delete when running the "clean" stage.
     */
    static _includeJestCacheWhenCleaning(heftConfiguration, clean) {
        // Jest's cache is not reliable.  For example, if a Jest configuration change causes files to be
        // transformed differently, the cache will continue to return the old results unless we manually
        // clean it.  Thus we need to ensure that "heft clean" always cleans the Jest cache.
        const cacheFolder = JestPlugin._getJestCacheFolder(heftConfiguration);
        clean.properties.pathsToDelete.add(cacheFolder);
    }
    /**
     * Returns the absolute path to the jest-cache directory.
     */
    static _getJestCacheFolder(heftConfiguration) {
        return path.join(heftConfiguration.buildCacheFolder, 'jest-cache');
    }
    apply(heftSession, heftConfiguration, options) {
        const scopedLogger = heftSession.requestScopedLogger('jest');
        heftSession.hooks.build.tap(PLUGIN_NAME, (build) => {
            build.hooks.postBuild.tap(PLUGIN_NAME, (postBuild) => {
                postBuild.hooks.run.tapPromise(PLUGIN_NAME, async () => {
                    await JestPlugin._setupJestAsync(scopedLogger, heftConfiguration, heftSession.debugMode, build.properties, options);
                });
            });
        });
        heftSession.hooks.test.tap(PLUGIN_NAME, (test) => {
            test.hooks.run.tapPromise(PLUGIN_NAME, async () => {
                await JestPlugin._runJestAsync(scopedLogger, heftConfiguration, heftSession.debugMode, test.properties, options);
            });
        });
        heftSession.hooks.clean.tap(PLUGIN_NAME, (clean) => {
            JestPlugin._includeJestCacheWhenCleaning(heftConfiguration, clean);
        });
    }
}
exports.JestPlugin = JestPlugin;
//# sourceMappingURL=JestPlugin.js.map