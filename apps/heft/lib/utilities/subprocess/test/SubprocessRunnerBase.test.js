"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
const SubprocessRunnerBase_1 = require("../SubprocessRunnerBase");
const FileError_1 = require("../../../pluginFramework/logging/FileError");
describe('SubprocessRunnerBase', () => {
    it(`${SubprocessRunnerBase_1.SubprocessRunnerBase.serializeForIpcMessage.name} correctly serializes objects`, () => {
        expect(SubprocessRunnerBase_1.SubprocessRunnerBase.serializeForIpcMessage(1)).toMatchSnapshot();
        expect(SubprocessRunnerBase_1.SubprocessRunnerBase.serializeForIpcMessage(false)).toMatchSnapshot();
        expect(SubprocessRunnerBase_1.SubprocessRunnerBase.serializeForIpcMessage('abc')).toMatchSnapshot();
        expect(SubprocessRunnerBase_1.SubprocessRunnerBase.serializeForIpcMessage(null)).toMatchSnapshot();
        expect(SubprocessRunnerBase_1.SubprocessRunnerBase.serializeForIpcMessage(undefined)).toMatchSnapshot();
        const error = new Error();
        error.stack = 'ERROR STACK';
        expect(SubprocessRunnerBase_1.SubprocessRunnerBase.serializeForIpcMessage(error)).toMatchSnapshot();
        const fileError1 = new FileError_1.FileError('message', 'path/to/file', 4, 29);
        fileError1.stack = 'ERROR STACK';
        expect(SubprocessRunnerBase_1.SubprocessRunnerBase.serializeForIpcMessage(fileError1)).toMatchSnapshot();
        const fileError2 = new FileError_1.FileError('message', 'path/to/file', 4);
        fileError2.stack = 'ERROR STACK';
        expect(SubprocessRunnerBase_1.SubprocessRunnerBase.serializeForIpcMessage(fileError2)).toMatchSnapshot();
        const fileError3 = new FileError_1.FileError('message', 'path/to/file');
        fileError3.stack = 'ERROR STACK';
        expect(SubprocessRunnerBase_1.SubprocessRunnerBase.serializeForIpcMessage(fileError3)).toMatchSnapshot();
    });
    it(`${SubprocessRunnerBase_1.SubprocessRunnerBase.serializeForIpcMessage.name} doesn't handle non-error objects`, () => {
        expect(() => SubprocessRunnerBase_1.SubprocessRunnerBase.serializeForIpcMessage({})).toThrow();
    });
    it('de-serializes serialized objects', () => {
        function testDeserialization(x) {
            expect(SubprocessRunnerBase_1.SubprocessRunnerBase.deserializeFromIpcMessage(SubprocessRunnerBase_1.SubprocessRunnerBase.serializeForIpcMessage(x))).toEqual(x);
        }
        testDeserialization(1);
        testDeserialization(false);
        testDeserialization('abc');
        testDeserialization(null);
        testDeserialization(undefined);
        testDeserialization(new Error());
        const fileError1 = new FileError_1.FileError('message', 'path/to/file', 4, 29);
        testDeserialization(fileError1);
        const fileError2 = new FileError_1.FileError('message', 'path/to/file', 4);
        testDeserialization(fileError2);
        const fileError3 = new FileError_1.FileError('message', 'path/to/file');
        testDeserialization(fileError3);
    });
});
//# sourceMappingURL=SubprocessRunnerBase.test.js.map