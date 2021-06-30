"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const process_1 = __importDefault(require("process"));
const Npm_1 = require("../Npm");
const Utilities_1 = require("../Utilities");
describe('npm', () => {
    const packageName = '@microsoft/rush-lib-never';
    let stub;
    beforeEach(() => {
        stub = jest.spyOn(Utilities_1.Utilities, 'executeCommandAndCaptureOutput');
    });
    afterEach(() => {
        stub.mockReset();
        stub.mockRestore();
    });
    it('publishedVersions gets versions when package time is available.', () => {
        const json = `{
      "modified": "2017-03-30T18:37:27.757Z",
      "created": "2017-01-03T20:28:10.342Z",
      "0.0.0": "2017-01-03T20:28:10.342Z",
      "1.4.0": "2017-01-03T21:55:21.249Z",
      "1.4.1": "2017-01-09T19:22:00.488Z",
      "2.4.0-alpha.1": "2017-03-30T18:37:27.757Z"
    }`;
        stub.mockImplementationOnce(() => json);
        const versions = Npm_1.Npm.publishedVersions(packageName, __dirname, process_1.default.env);
        expect(stub).toHaveBeenCalledWith('npm', `view ${packageName} time --json`.split(' '), expect.anything(), expect.anything(), expect.anything());
        expect(versions).toHaveLength(4);
        expect(versions).toMatchObject(['0.0.0', '1.4.0', '1.4.1', '2.4.0-alpha.1']);
    });
    it('publishedVersions gets versions when package time is not available', () => {
        const json = `[
      "0.0.0",
      "1.4.0",
      "1.4.1",
      "2.4.0-alpha.1"
    ]`;
        stub.mockImplementationOnce(() => '');
        stub.mockImplementationOnce(() => json);
        const versions = Npm_1.Npm.publishedVersions(packageName, __dirname, process_1.default.env);
        expect(stub).toHaveBeenCalledWith('npm', `view ${packageName} time --json`.split(' '), expect.anything(), expect.anything(), expect.anything());
        expect(stub).toHaveBeenCalledWith('npm', `view ${packageName} versions --json`.split(' '), expect.anything(), expect.anything(), expect.anything());
        expect(versions).toHaveLength(4);
        expect(versions).toMatchObject(['0.0.0', '1.4.0', '1.4.1', '2.4.0-alpha.1']);
    });
});
//# sourceMappingURL=Npm.test.js.map