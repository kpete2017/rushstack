"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
const LoadThemedStylesLoader_1 = require("./../LoadThemedStylesLoader");
const LoadThemedStylesMock = require("./testData/LoadThemedStylesMock");
function wrapResult(loaderResult) {
    return `var module = { id: 'testId', exports: {} };
  ${loaderResult}
  module;`;
}
describe('LoadThemedStylesLoader', () => {
    beforeEach(() => {
        LoadThemedStylesLoader_1.LoadThemedStylesLoader.resetLoadedThemedStylesPath();
        LoadThemedStylesMock.loadedData = [];
        LoadThemedStylesMock.calledWithAsync = [];
    });
    it('follows the Webpack loader interface', () => {
        expect(LoadThemedStylesLoader_1.LoadThemedStylesLoader).toBeDefined();
        expect(LoadThemedStylesLoader_1.LoadThemedStylesLoader.pitch).toBeDefined();
        expect(() => new LoadThemedStylesLoader_1.LoadThemedStylesLoader()).toThrow();
    });
    it('it correctly resolves load-themed-styles', () => {
        const expectedPath = require.resolve('@microsoft/load-themed-styles');
        expect(LoadThemedStylesLoader_1.LoadThemedStylesLoader.loadedThemedStylesPath).toEqual(expectedPath);
    });
    it('it inserts the resolved load-themed-styles path', () => {
        const expectedPath = require.resolve('@microsoft/load-themed-styles');
        const loaderResult = LoadThemedStylesLoader_1.LoadThemedStylesLoader.pitch.call({}, '');
        expect(loaderResult.indexOf(expectedPath)).not.toBeNull();
    });
    it('it allows for override of load-themed-styles path', () => {
        let expectedPath = './testData/LoadThemedStylesMock';
        LoadThemedStylesLoader_1.LoadThemedStylesLoader.loadedThemedStylesPath = expectedPath;
        expect(LoadThemedStylesLoader_1.LoadThemedStylesLoader.loadedThemedStylesPath).toEqual(expectedPath);
        LoadThemedStylesLoader_1.LoadThemedStylesLoader.resetLoadedThemedStylesPath();
        expectedPath = require.resolve('@microsoft/load-themed-styles');
        expect(LoadThemedStylesLoader_1.LoadThemedStylesLoader.loadedThemedStylesPath).toEqual(expectedPath);
    });
    it('it inserts the overridden load-themed-styles path', () => {
        const expectedPath = './testData/LoadThemedStylesMock';
        const loaderResult = LoadThemedStylesLoader_1.LoadThemedStylesLoader.pitch.call({}, '');
        expect(loaderResult.indexOf(expectedPath)).not.toBeNull();
    });
    it('correctly calls loadStyles in load-themed-styles with a module reference', () => {
        LoadThemedStylesLoader_1.LoadThemedStylesLoader.loadedThemedStylesPath = './testData/LoadThemedStylesMock';
        let loaderResult = LoadThemedStylesLoader_1.LoadThemedStylesLoader.pitch.call({}, './testData/MockStyle1');
        loaderResult = loaderResult.replace(/require\(\"!!/, 'require("');
        loaderResult = wrapResult(loaderResult);
        const returnedModule = eval(loaderResult); // eslint-disable-line no-eval
        expect(LoadThemedStylesMock.loadedData.indexOf('STYLE 1') !== -1).toEqual(true);
        expect(LoadThemedStylesMock.loadedData.indexOf('STYLE 2') !== -1).toEqual(true);
        expect(LoadThemedStylesMock.loadedData).toHaveLength(2);
        expect(LoadThemedStylesMock.calledWithAsync[0]).toEqual(false);
        expect(LoadThemedStylesMock.calledWithAsync[1]).toEqual(false);
        expect(LoadThemedStylesMock.calledWithAsync).toHaveLength(2);
        expect(returnedModule.exports).toEqual('locals');
    });
    it('correctly calls loadStyles in load-themed-styles with a string reference', () => {
        LoadThemedStylesLoader_1.LoadThemedStylesLoader.loadedThemedStylesPath = './testData/LoadThemedStylesMock';
        let loaderResult = LoadThemedStylesLoader_1.LoadThemedStylesLoader.pitch.call({}, './testData/MockStyle2');
        loaderResult = loaderResult.replace(/require\(\"!!/, 'require("');
        loaderResult = wrapResult(loaderResult);
        const returnedModule = eval(loaderResult); // eslint-disable-line no-eval
        expect(LoadThemedStylesMock.loadedData.indexOf('styles') !== -1).toEqual(true);
        expect(LoadThemedStylesMock.loadedData).toHaveLength(1);
        expect(returnedModule.exports).toEqual({});
    });
    it('correctly handles the namedExport option', () => {
        LoadThemedStylesLoader_1.LoadThemedStylesLoader.loadedThemedStylesPath = './testData/LoadThemedStylesMock';
        const query = { namedExport: 'default' };
        let loaderResult = LoadThemedStylesLoader_1.LoadThemedStylesLoader.pitch.call({ query }, './testData/MockStyle1');
        loaderResult = loaderResult.replace(/require\(\"!!/, 'require("');
        loaderResult = wrapResult(loaderResult);
        const returnedModule = eval(loaderResult); // eslint-disable-line no-eval
        expect(LoadThemedStylesMock.loadedData.indexOf('STYLE 1') !== -1).toEqual(true);
        expect(LoadThemedStylesMock.loadedData.indexOf('STYLE 2') !== -1).toEqual(true);
        expect(LoadThemedStylesMock.loadedData).toHaveLength(2);
        expect(LoadThemedStylesMock.calledWithAsync[0]).toEqual(false);
        expect(LoadThemedStylesMock.calledWithAsync[1]).toEqual(false);
        expect(LoadThemedStylesMock.calledWithAsync).toHaveLength(2);
        expect(returnedModule.exports).toEqual({ default: 'locals' });
    });
    it('correctly handles the async option set to "true"', () => {
        LoadThemedStylesLoader_1.LoadThemedStylesLoader.loadedThemedStylesPath = './testData/LoadThemedStylesMock';
        const query = { async: true };
        let loaderResult = LoadThemedStylesLoader_1.LoadThemedStylesLoader.pitch.call({ query }, './testData/MockStyle1');
        loaderResult = loaderResult.replace(/require\(\"!!/, 'require("');
        loaderResult = wrapResult(loaderResult);
        const returnedModule = eval(loaderResult); // eslint-disable-line no-eval
        expect(LoadThemedStylesMock.loadedData.indexOf('STYLE 1') !== -1).toEqual(true);
        expect(LoadThemedStylesMock.loadedData.indexOf('STYLE 2') !== -1).toEqual(true);
        expect(LoadThemedStylesMock.loadedData).toHaveLength(2);
        expect(LoadThemedStylesMock.calledWithAsync[0]).toEqual(true);
        expect(LoadThemedStylesMock.calledWithAsync[1]).toEqual(true);
        expect(LoadThemedStylesMock.calledWithAsync).toHaveLength(2);
        expect(returnedModule.exports).toEqual('locals');
    });
    it('correctly handles the async option set to a non-boolean', () => {
        LoadThemedStylesLoader_1.LoadThemedStylesLoader.loadedThemedStylesPath = './testData/LoadThemedStylesMock';
        let loaderResult = LoadThemedStylesLoader_1.LoadThemedStylesLoader.pitch.call({}, './testData/MockStyle1');
        loaderResult = loaderResult.replace(/require\(\"!!/, 'require("');
        loaderResult = wrapResult(loaderResult);
        const returnedModule = eval(loaderResult); // eslint-disable-line no-eval
        expect(LoadThemedStylesMock.loadedData.indexOf('STYLE 1') !== -1).toEqual(true);
        expect(LoadThemedStylesMock.loadedData.indexOf('STYLE 2') !== -1).toEqual(true);
        expect(LoadThemedStylesMock.loadedData).toHaveLength(2);
        expect(LoadThemedStylesMock.calledWithAsync[0]).toEqual(false);
        expect(LoadThemedStylesMock.calledWithAsync[1]).toEqual(false);
        expect(LoadThemedStylesMock.calledWithAsync).toHaveLength(2);
        expect(returnedModule.exports).toEqual('locals');
    });
});
//# sourceMappingURL=LoadThemedStylesLoader.test.js.map