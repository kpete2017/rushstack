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
const nodeJsPath = __importStar(require("path"));
const ConfigurationFile_1 = require("../ConfigurationFile");
const node_core_library_1 = require("@rushstack/node-core-library");
const rig_package_1 = require("@rushstack/rig-package");
describe('ConfigurationFile', () => {
    const projectRoot = nodeJsPath.resolve(__dirname, '..', '..');
    let terminalProvider;
    let terminal;
    beforeEach(() => {
        const projectRoot = nodeJsPath.resolve(__dirname, '..', '..');
        const formatPathForLogging = (path) => `<project root>/${node_core_library_1.Path.convertToSlashes(nodeJsPath.relative(projectRoot, path))}`;
        jest.spyOn(ConfigurationFile_1.ConfigurationFile, '_formatPathForLogging').mockImplementation(formatPathForLogging);
        jest.spyOn(node_core_library_1.JsonFile, '_formatPathForError').mockImplementation(formatPathForLogging);
        terminalProvider = new node_core_library_1.StringBufferTerminalProvider(false);
        terminal = new node_core_library_1.Terminal(terminalProvider);
    });
    afterEach(() => {
        expect({
            log: terminalProvider.getOutput(),
            warning: terminalProvider.getWarningOutput(),
            error: terminalProvider.getErrorOutput(),
            verbose: terminalProvider.getVerbose()
        }).toMatchSnapshot();
    });
    describe('A simple config file', () => {
        const configFileFolderName = 'simplestConfigFile';
        const projectRelativeFilePath = `${configFileFolderName}/simplestConfigFile.json`;
        const schemaPath = nodeJsPath.resolve(__dirname, configFileFolderName, 'simplestConfigFile.schema.json');
        it('Correctly loads the config file', async () => {
            const configFileLoader = new ConfigurationFile_1.ConfigurationFile({
                projectRelativeFilePath: projectRelativeFilePath,
                jsonSchemaPath: schemaPath
            });
            const loadedConfigFile = await configFileLoader.loadConfigurationFileForProjectAsync(terminal, __dirname);
            const expectedConfigFile = { thing: 'A' };
            expect(JSON.stringify(loadedConfigFile)).toEqual(JSON.stringify(expectedConfigFile));
            expect(configFileLoader.getObjectSourceFilePath(loadedConfigFile)).toEqual(nodeJsPath.resolve(__dirname, projectRelativeFilePath));
            expect(configFileLoader.getPropertyOriginalValue({ parentObject: loadedConfigFile, propertyName: 'thing' })).toEqual('A');
        });
        it('Correctly resolves paths relative to the config file', async () => {
            const configFileLoader = new ConfigurationFile_1.ConfigurationFile({
                projectRelativeFilePath: projectRelativeFilePath,
                jsonSchemaPath: schemaPath,
                jsonPathMetadata: {
                    '$.thing': {
                        pathResolutionMethod: ConfigurationFile_1.PathResolutionMethod.resolvePathRelativeToConfigurationFile
                    }
                }
            });
            const loadedConfigFile = await configFileLoader.loadConfigurationFileForProjectAsync(terminal, __dirname);
            const expectedConfigFile = {
                thing: nodeJsPath.resolve(__dirname, configFileFolderName, 'A')
            };
            expect(JSON.stringify(loadedConfigFile)).toEqual(JSON.stringify(expectedConfigFile));
            expect(configFileLoader.getObjectSourceFilePath(loadedConfigFile)).toEqual(nodeJsPath.resolve(__dirname, projectRelativeFilePath));
            expect(configFileLoader.getPropertyOriginalValue({ parentObject: loadedConfigFile, propertyName: 'thing' })).toEqual('A');
        });
        it('Correctly resolves paths relative to the project root', async () => {
            const configFileLoader = new ConfigurationFile_1.ConfigurationFile({
                projectRelativeFilePath: projectRelativeFilePath,
                jsonSchemaPath: schemaPath,
                jsonPathMetadata: {
                    '$.thing': {
                        pathResolutionMethod: ConfigurationFile_1.PathResolutionMethod.resolvePathRelativeToProjectRoot
                    }
                }
            });
            const loadedConfigFile = await configFileLoader.loadConfigurationFileForProjectAsync(terminal, __dirname);
            const expectedConfigFile = {
                thing: nodeJsPath.resolve(projectRoot, 'A')
            };
            expect(JSON.stringify(loadedConfigFile)).toEqual(JSON.stringify(expectedConfigFile));
            expect(configFileLoader.getObjectSourceFilePath(loadedConfigFile)).toEqual(nodeJsPath.resolve(__dirname, projectRelativeFilePath));
            expect(configFileLoader.getPropertyOriginalValue({ parentObject: loadedConfigFile, propertyName: 'thing' })).toEqual('A');
        });
    });
    describe('A simple config file containing an array', () => {
        const configFileFolderName = 'simpleConfigFile';
        const projectRelativeFilePath = `${configFileFolderName}/simpleConfigFile.json`;
        const schemaPath = nodeJsPath.resolve(__dirname, configFileFolderName, 'simpleConfigFile.schema.json');
        it('Correctly loads the config file', async () => {
            const configFileLoader = new ConfigurationFile_1.ConfigurationFile({ projectRelativeFilePath: projectRelativeFilePath, jsonSchemaPath: schemaPath });
            const loadedConfigFile = await configFileLoader.loadConfigurationFileForProjectAsync(terminal, __dirname);
            const expectedConfigFile = { things: ['A', 'B', 'C'] };
            expect(JSON.stringify(loadedConfigFile)).toEqual(JSON.stringify(expectedConfigFile));
        });
        it('Correctly resolves paths relative to the config file', async () => {
            const configFileLoader = new ConfigurationFile_1.ConfigurationFile({
                projectRelativeFilePath: projectRelativeFilePath,
                jsonSchemaPath: schemaPath,
                jsonPathMetadata: {
                    '$.things.*': {
                        pathResolutionMethod: ConfigurationFile_1.PathResolutionMethod.resolvePathRelativeToConfigurationFile
                    }
                }
            });
            const loadedConfigFile = await configFileLoader.loadConfigurationFileForProjectAsync(terminal, __dirname);
            const expectedConfigFile = {
                things: [
                    nodeJsPath.resolve(__dirname, configFileFolderName, 'A'),
                    nodeJsPath.resolve(__dirname, configFileFolderName, 'B'),
                    nodeJsPath.resolve(__dirname, configFileFolderName, 'C')
                ]
            };
            expect(JSON.stringify(loadedConfigFile)).toEqual(JSON.stringify(expectedConfigFile));
        });
        it('Correctly resolves paths relative to the project root', async () => {
            const configFileLoader = new ConfigurationFile_1.ConfigurationFile({
                projectRelativeFilePath: projectRelativeFilePath,
                jsonSchemaPath: schemaPath,
                jsonPathMetadata: {
                    '$.things.*': {
                        pathResolutionMethod: ConfigurationFile_1.PathResolutionMethod.resolvePathRelativeToProjectRoot
                    }
                }
            });
            const loadedConfigFile = await configFileLoader.loadConfigurationFileForProjectAsync(terminal, __dirname);
            const expectedConfigFile = {
                things: [
                    nodeJsPath.resolve(projectRoot, 'A'),
                    nodeJsPath.resolve(projectRoot, 'B'),
                    nodeJsPath.resolve(projectRoot, 'C')
                ]
            };
            expect(JSON.stringify(loadedConfigFile)).toEqual(JSON.stringify(expectedConfigFile));
        });
    });
    describe('A simple config file with "extends"', () => {
        const configFileFolderName = 'simpleConfigFileWithExtends';
        const projectRelativeFilePath = `${configFileFolderName}/simpleConfigFileWithExtends.json`;
        const schemaPath = nodeJsPath.resolve(__dirname, configFileFolderName, 'simpleConfigFileWithExtends.schema.json');
        it('Correctly loads the config file with default config meta', async () => {
            const configFileLoader = new ConfigurationFile_1.ConfigurationFile({ projectRelativeFilePath: projectRelativeFilePath, jsonSchemaPath: schemaPath });
            const loadedConfigFile = await configFileLoader.loadConfigurationFileForProjectAsync(terminal, __dirname);
            const expectedConfigFile = { things: ['A', 'B', 'C', 'D', 'E'] };
            expect(JSON.stringify(loadedConfigFile)).toEqual(JSON.stringify(expectedConfigFile));
        });
        it('Correctly loads the config file with "append" in config meta', async () => {
            const configFileLoader = new ConfigurationFile_1.ConfigurationFile({
                projectRelativeFilePath: projectRelativeFilePath,
                jsonSchemaPath: schemaPath,
                propertyInheritance: {
                    things: {
                        inheritanceType: ConfigurationFile_1.InheritanceType.append
                    }
                }
            });
            const loadedConfigFile = await configFileLoader.loadConfigurationFileForProjectAsync(terminal, __dirname);
            const expectedConfigFile = { things: ['A', 'B', 'C', 'D', 'E'] };
            expect(JSON.stringify(loadedConfigFile)).toEqual(JSON.stringify(expectedConfigFile));
        });
        it('Correctly loads the config file with "replace" in config meta', async () => {
            const configFileLoader = new ConfigurationFile_1.ConfigurationFile({
                projectRelativeFilePath: projectRelativeFilePath,
                jsonSchemaPath: schemaPath,
                propertyInheritance: {
                    things: {
                        inheritanceType: ConfigurationFile_1.InheritanceType.replace
                    }
                }
            });
            const loadedConfigFile = await configFileLoader.loadConfigurationFileForProjectAsync(terminal, __dirname);
            const expectedConfigFile = { things: ['D', 'E'] };
            expect(JSON.stringify(loadedConfigFile)).toEqual(JSON.stringify(expectedConfigFile));
        });
        it('Correctly loads the config file with "custom" in config meta', async () => {
            const configFileLoader = new ConfigurationFile_1.ConfigurationFile({
                projectRelativeFilePath: projectRelativeFilePath,
                jsonSchemaPath: schemaPath,
                propertyInheritance: {
                    things: {
                        inheritanceType: ConfigurationFile_1.InheritanceType.custom,
                        inheritanceFunction: (current, parent) => ['X', 'Y', 'Z']
                    }
                }
            });
            const loadedConfigFile = await configFileLoader.loadConfigurationFileForProjectAsync(terminal, __dirname);
            const expectedConfigFile = { things: ['X', 'Y', 'Z'] };
            expect(JSON.stringify(loadedConfigFile)).toEqual(JSON.stringify(expectedConfigFile));
        });
        it('Correctly resolves paths relative to the config file', async () => {
            const configFileLoader = new ConfigurationFile_1.ConfigurationFile({
                projectRelativeFilePath: projectRelativeFilePath,
                jsonSchemaPath: schemaPath,
                jsonPathMetadata: {
                    '$.things.*': {
                        pathResolutionMethod: ConfigurationFile_1.PathResolutionMethod.resolvePathRelativeToConfigurationFile
                    }
                }
            });
            const loadedConfigFile = await configFileLoader.loadConfigurationFileForProjectAsync(terminal, __dirname);
            const parentConfigFileFolder = nodeJsPath.resolve(__dirname, configFileFolderName, '..', 'simpleConfigFile');
            const expectedConfigFile = {
                things: [
                    nodeJsPath.resolve(parentConfigFileFolder, 'A'),
                    nodeJsPath.resolve(parentConfigFileFolder, 'B'),
                    nodeJsPath.resolve(parentConfigFileFolder, 'C'),
                    nodeJsPath.resolve(__dirname, configFileFolderName, 'D'),
                    nodeJsPath.resolve(__dirname, configFileFolderName, 'E')
                ]
            };
            expect(JSON.stringify(loadedConfigFile)).toEqual(JSON.stringify(expectedConfigFile));
        });
    });
    describe('A complex config file', () => {
        it('Correctly loads a complex config file', async () => {
            const projectRelativeFilePath = 'complexConfigFile/pluginsD.json';
            const rootConfigFilePath = nodeJsPath.resolve(__dirname, 'complexConfigFile', 'pluginsA.json');
            const secondConfigFilePath = nodeJsPath.resolve(__dirname, 'complexConfigFile', 'pluginsB.json');
            const schemaPath = nodeJsPath.resolve(__dirname, 'complexConfigFile', 'plugins.schema.json');
            const configFileLoader = new ConfigurationFile_1.ConfigurationFile({
                projectRelativeFilePath: projectRelativeFilePath,
                jsonSchemaPath: schemaPath,
                jsonPathMetadata: {
                    '$.plugins.*.plugin': {
                        pathResolutionMethod: ConfigurationFile_1.PathResolutionMethod.NodeResolve
                    }
                }
            });
            const loadedConfigFile = await configFileLoader.loadConfigurationFileForProjectAsync(terminal, __dirname);
            const expectedConfigFile = {
                plugins: [
                    {
                        plugin: await node_core_library_1.FileSystem.getRealPathAsync(nodeJsPath.resolve(projectRoot, 'node_modules', '@rushstack', 'node-core-library', 'lib', 'index.js'))
                    },
                    {
                        plugin: await node_core_library_1.FileSystem.getRealPathAsync(nodeJsPath.resolve(projectRoot, 'node_modules', '@rushstack', 'heft', 'lib', 'index.js'))
                    },
                    {
                        plugin: await node_core_library_1.FileSystem.getRealPathAsync(nodeJsPath.resolve(projectRoot, 'node_modules', '@rushstack', 'eslint-config', 'index.js'))
                    }
                ]
            };
            expect(JSON.stringify(loadedConfigFile)).toEqual(JSON.stringify(expectedConfigFile));
            expect(configFileLoader.getPropertyOriginalValue({
                parentObject: loadedConfigFile.plugins[0],
                propertyName: 'plugin'
            })).toEqual('@rushstack/node-core-library');
            expect(configFileLoader.getPropertyOriginalValue({
                parentObject: loadedConfigFile.plugins[1],
                propertyName: 'plugin'
            })).toEqual('@rushstack/heft');
            expect(configFileLoader.getPropertyOriginalValue({
                parentObject: loadedConfigFile.plugins[2],
                propertyName: 'plugin'
            })).toEqual('@rushstack/eslint-config');
            expect(configFileLoader.getObjectSourceFilePath(loadedConfigFile.plugins[0])).toEqual(rootConfigFilePath);
            expect(configFileLoader.getObjectSourceFilePath(loadedConfigFile.plugins[1])).toEqual(nodeJsPath.resolve(__dirname, secondConfigFilePath));
            expect(configFileLoader.getObjectSourceFilePath(loadedConfigFile.plugins[2])).toEqual(nodeJsPath.resolve(__dirname, secondConfigFilePath));
        });
    });
    describe('loading a rig', () => {
        const projectFolder = nodeJsPath.resolve(__dirname, 'project-referencing-rig');
        const rigConfig = rig_package_1.RigConfig.loadForProjectFolder({ projectFolderPath: projectFolder });
        const schemaPath = nodeJsPath.resolve(__dirname, 'simplestConfigFile', 'simplestConfigFile.schema.json');
        it('correctly loads a config file inside a rig', async () => {
            const projectRelativeFilePath = 'config/simplestConfigFile.json';
            const configFileLoader = new ConfigurationFile_1.ConfigurationFile({
                projectRelativeFilePath: projectRelativeFilePath,
                jsonSchemaPath: schemaPath
            });
            const loadedConfigFile = await configFileLoader.loadConfigurationFileForProjectAsync(terminal, projectFolder, rigConfig);
            const expectedConfigFile = { thing: 'A' };
            expect(JSON.stringify(loadedConfigFile)).toEqual(JSON.stringify(expectedConfigFile));
            expect(configFileLoader.getObjectSourceFilePath(loadedConfigFile)).toEqual(nodeJsPath.resolve(projectFolder, 'node_modules', 'test-rig', 'profiles', 'default', projectRelativeFilePath));
            expect(configFileLoader.getPropertyOriginalValue({ parentObject: loadedConfigFile, propertyName: 'thing' })).toEqual('A');
        });
        it('correctly loads a config file inside a rig via tryLoadConfigurationFileForProjectAsync', async () => {
            const projectRelativeFilePath = 'config/simplestConfigFile.json';
            const configFileLoader = new ConfigurationFile_1.ConfigurationFile({
                projectRelativeFilePath: projectRelativeFilePath,
                jsonSchemaPath: schemaPath
            });
            const loadedConfigFile = await configFileLoader.tryLoadConfigurationFileForProjectAsync(terminal, projectFolder, rigConfig);
            const expectedConfigFile = { thing: 'A' };
            expect(loadedConfigFile).not.toBeUndefined();
            expect(JSON.stringify(loadedConfigFile)).toEqual(JSON.stringify(expectedConfigFile));
            expect(configFileLoader.getObjectSourceFilePath(loadedConfigFile)).toEqual(nodeJsPath.resolve(projectFolder, 'node_modules', 'test-rig', 'profiles', 'default', projectRelativeFilePath));
            expect(configFileLoader.getPropertyOriginalValue({ parentObject: loadedConfigFile, propertyName: 'thing' })).toEqual('A');
        });
        it("throws an error when a config file doesn't exist in a project referencing a rig, which also doesn't have the file", async () => {
            const configFileLoader = new ConfigurationFile_1.ConfigurationFile({
                projectRelativeFilePath: 'config/notExist.json',
                jsonSchemaPath: schemaPath
            });
            try {
                await configFileLoader.loadConfigurationFileForProjectAsync(terminal, projectFolder, rigConfig);
                fail();
            }
            catch (e) {
                expect(e).toMatchSnapshot();
            }
        });
    });
    describe('error cases', () => {
        const errorCasesFolderName = 'errorCases';
        it("throws an error when the file doesn't exist", async () => {
            const errorCaseFolderName = 'invalidType';
            const configFileLoader = new ConfigurationFile_1.ConfigurationFile({
                projectRelativeFilePath: `${errorCasesFolderName}/${errorCaseFolderName}/notExist.json`,
                jsonSchemaPath: nodeJsPath.resolve(__dirname, errorCasesFolderName, errorCaseFolderName, 'config.schema.json')
            });
            try {
                await configFileLoader.loadConfigurationFileForProjectAsync(terminal, __dirname);
                fail();
            }
            catch (e) {
                expect(e).toMatchSnapshot();
            }
        });
        it("returns undefined when the file doesn't exist for tryLoadConfigurationFileForProjectAsync", async () => {
            const errorCaseFolderName = 'invalidType';
            const configFileLoader = new ConfigurationFile_1.ConfigurationFile({
                projectRelativeFilePath: `${errorCasesFolderName}/${errorCaseFolderName}/notExist.json`,
                jsonSchemaPath: nodeJsPath.resolve(__dirname, errorCasesFolderName, errorCaseFolderName, 'config.schema.json')
            });
            expect(await configFileLoader.tryLoadConfigurationFileForProjectAsync(terminal, __dirname)).toBeUndefined();
        });
        it("Throws an error when the file isn't valid JSON", async () => {
            const errorCaseFolderName = 'invalidJson';
            const configFileLoader = new ConfigurationFile_1.ConfigurationFile({
                projectRelativeFilePath: `${errorCasesFolderName}/${errorCaseFolderName}/config.json`,
                jsonSchemaPath: nodeJsPath.resolve(__dirname, errorCasesFolderName, errorCaseFolderName, 'config.schema.json')
            });
            try {
                await configFileLoader.loadConfigurationFileForProjectAsync(terminal, __dirname);
                fail();
            }
            catch (e) {
                expect(e).toMatchSnapshot();
            }
        });
        it("Throws an error for a file that doesn't match its schema", async () => {
            const errorCaseFolderName = 'invalidType';
            const configFileLoader = new ConfigurationFile_1.ConfigurationFile({
                projectRelativeFilePath: `${errorCasesFolderName}/${errorCaseFolderName}/config.json`,
                jsonSchemaPath: nodeJsPath.resolve(__dirname, errorCasesFolderName, errorCaseFolderName, 'config.schema.json')
            });
            try {
                await configFileLoader.loadConfigurationFileForProjectAsync(terminal, __dirname);
                fail();
            }
            catch (e) {
                expect(e).toMatchSnapshot();
            }
        });
        it('Throws an error when there is a circular reference in "extends" properties', async () => {
            const errorCaseFolderName = 'circularReference';
            const configFileLoader = new ConfigurationFile_1.ConfigurationFile({
                projectRelativeFilePath: `${errorCasesFolderName}/${errorCaseFolderName}/config1.json`,
                jsonSchemaPath: nodeJsPath.resolve(__dirname, errorCasesFolderName, errorCaseFolderName, 'config.schema.json')
            });
            try {
                await configFileLoader.loadConfigurationFileForProjectAsync(terminal, __dirname);
                fail();
            }
            catch (e) {
                expect(e).toMatchSnapshot();
            }
        });
        it('Throws an error when an "extends" property points to a file that cannot be resolved', async () => {
            const errorCaseFolderName = 'extendsNotExist';
            const configFileLoader = new ConfigurationFile_1.ConfigurationFile({
                projectRelativeFilePath: `${errorCasesFolderName}/${errorCaseFolderName}/config.json`,
                jsonSchemaPath: nodeJsPath.resolve(__dirname, errorCasesFolderName, errorCaseFolderName, 'config.schema.json')
            });
            try {
                await configFileLoader.loadConfigurationFileForProjectAsync(terminal, __dirname);
                fail();
            }
            catch (e) {
                expect(e).toMatchSnapshot();
            }
        });
        it("Throws an error when a combined config file doesn't match the schema", async () => {
            const errorCaseFolderName = 'invalidCombinedFile';
            const configFileLoader = new ConfigurationFile_1.ConfigurationFile({
                projectRelativeFilePath: `${errorCasesFolderName}/${errorCaseFolderName}/config1.json`,
                jsonSchemaPath: nodeJsPath.resolve(__dirname, errorCasesFolderName, errorCaseFolderName, 'config.schema.json')
            });
            try {
                await configFileLoader.loadConfigurationFileForProjectAsync(terminal, __dirname);
                fail();
            }
            catch (e) {
                expect(e).toMatchSnapshot();
            }
        });
        it("Throws an error when a requested file doesn't exist", async () => {
            const configFileLoader = new ConfigurationFile_1.ConfigurationFile({
                projectRelativeFilePath: `${errorCasesFolderName}/folderThatDoesntExist/config.json`,
                jsonSchemaPath: nodeJsPath.resolve(__dirname, errorCasesFolderName, 'invalidCombinedFile', 'config.schema.json')
            });
            try {
                await configFileLoader.loadConfigurationFileForProjectAsync(terminal, __dirname);
                fail();
            }
            catch (e) {
                expect(e).toMatchSnapshot();
            }
        });
    });
});
//# sourceMappingURL=ConfigurationFile.test.js.map