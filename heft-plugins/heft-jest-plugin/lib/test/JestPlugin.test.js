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
const path = __importStar(require("path"));
const node_core_library_1 = require("@rushstack/node-core-library");
const JestPlugin_1 = require("../JestPlugin");
describe('JestConfigLoader', () => {
    let terminalProvider;
    let terminal;
    beforeEach(() => {
        terminalProvider = new node_core_library_1.StringBufferTerminalProvider(false);
        terminal = new node_core_library_1.Terminal(terminalProvider);
    });
    it('resolves extended config modules', async () => {
        var _a, _b;
        // Because we require the built modules, we need to set our rootDir to be in the 'lib' folder, since transpilation
        // means that we don't run on the built test assets directly
        const rootDir = path.resolve(__dirname, '..', '..', 'lib', 'test', 'project1');
        const loader = JestPlugin_1.JestPlugin._getJestConfigurationLoader(rootDir, 'config/jest.config.json');
        const loadedConfig = await loader.loadConfigurationFileForProjectAsync(terminal, path.join(__dirname, '..', '..', 'lib', 'test', 'project1'));
        expect(loadedConfig.preset).toBe(undefined);
        expect(loadedConfig.globalSetup).toBe(path.join(rootDir, 'a', 'b', 'globalSetupFile1.js'));
        // Validate string[]
        expect((_a = loadedConfig.setupFiles) === null || _a === void 0 ? void 0 : _a.length).toBe(2);
        expect(loadedConfig.setupFiles[0]).toBe(path.join(rootDir, 'a', 'b', 'setupFile2.js'));
        expect(loadedConfig.setupFiles[1]).toBe(path.join(rootDir, 'a', 'b', 'setupFile1.js'));
        // Validate testEnvironment
        expect(loadedConfig.testEnvironment).toBe(require.resolve('jest-environment-node'));
        // Validate reporters
        expect((_b = loadedConfig.reporters) === null || _b === void 0 ? void 0 : _b.length).toBe(3);
        expect(loadedConfig.reporters[0]).toBe('default');
        expect(loadedConfig.reporters[1]).toBe(path.join(rootDir, 'a', 'c', 'mockReporter1.js'));
        expect(loadedConfig.reporters[2][0]).toBe(path.join(rootDir, 'a', 'c', 'd', 'mockReporter2.js'));
        // Validate transformers
        expect(Object.keys(loadedConfig.transform || {}).length).toBe(2);
        expect(loadedConfig.transform['\\.(xxx)$']).toBe(path.join(rootDir, 'a', 'b', 'mockTransformModule2.js'));
        expect(loadedConfig.transform['\\.(yyy)$'][0]).toBe(path.join(rootDir, 'a', 'c', 'mockTransformModule3.js'));
        // Validate moduleNameMapper
        expect(Object.keys(loadedConfig.moduleNameMapper || {}).length).toBe(4);
        expect(loadedConfig.moduleNameMapper['\\.resx$']).toBe(
        // Test overrides
        path.join(rootDir, 'a', 'some', 'path', 'to', 'overridden', 'module.js'));
        expect(loadedConfig.moduleNameMapper['\\.jpg$']).toBe(
        // Test <configDir>
        path.join(rootDir, 'a', 'c', 'some', 'path', 'to', 'module.js'));
        expect(loadedConfig.moduleNameMapper['^!!file-loader']).toBe(
        // Test <packageDir:...>
        path.join(node_core_library_1.Import.resolvePackage({ packageName: '@rushstack/heft', baseFolderPath: __dirname }), 'some', 'path', 'to', 'module.js'));
        expect(loadedConfig.moduleNameMapper['^@1js/search-dispatcher/lib/(.+)']).toBe(
        // Test unmodified
        '@1js/search-dispatcher/lib-commonjs/$1');
        // Validate globals
        expect(Object.keys(loadedConfig.globals || {}).length).toBe(4);
        expect(loadedConfig.globals.key1).toBe('value5');
        expect(loadedConfig.globals.key2.length).toBe(4);
        expect(loadedConfig.globals.key2[0]).toBe('value2');
        expect(loadedConfig.globals.key2[1]).toContain('value3');
        expect(loadedConfig.globals.key2[2]).toContain('value2');
        expect(loadedConfig.globals.key2[3]).toContain('value6');
        const key3Obj = loadedConfig.globals.key3; // eslint-disable-line @typescript-eslint/no-explicit-any
        expect(Object.keys(key3Obj).length).toBe(3);
        expect(key3Obj.key4).toBe('value7');
        expect(key3Obj.key5).toBe('value5');
        expect(key3Obj.key6).toBe('value8');
        expect(loadedConfig.globals.key7).toBe('value9');
    });
    it('resolves extended package modules', async () => {
        var _a;
        // Because we require the built modules, we need to set our rootDir to be in the 'lib' folder, since transpilation
        // means that we don't run on the built test assets directly
        const rootDir = path.resolve(__dirname, '..', '..', 'lib', 'test', 'project1');
        const loader = JestPlugin_1.JestPlugin._getJestConfigurationLoader(rootDir, 'config/jest.config.json');
        const loadedConfig = await loader.loadConfigurationFileForProjectAsync(terminal, path.resolve(__dirname, '..', '..', 'lib', 'test', 'project2'));
        expect((_a = loadedConfig.setupFiles) === null || _a === void 0 ? void 0 : _a.length).toBe(1);
        expect(loadedConfig.setupFiles[0]).toBe(require.resolve('@jest/core'));
        // Also validate that a test environment that we specified as 'jsdom' (but have not added as a dependency)
        // is resolved, implying it came from Jest directly
        expect(loadedConfig.testEnvironment).toContain('jest-environment-jsdom');
        expect(loadedConfig.testEnvironment).toMatch(/index.js$/);
    });
});
//# sourceMappingURL=JestPlugin.test.js.map