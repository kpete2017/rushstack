"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
const FileError_1 = require("../FileError");
describe('FileError', () => {
    it('normalizes slashes in file paths', () => {
        const error1 = new FileError_1.FileError('message', 'path\\to\\file', 0);
        expect(error1.filePath).toEqual('path/to/file');
        const error2 = new FileError_1.FileError('message', 'path/to/file', 0);
        expect(error2.filePath).toEqual('path/to/file');
    });
    it('correctly performs Unix-style file path formatting', () => {
        const error1 = new FileError_1.FileError('message', 'path/to/file', 5, 12);
        expect(error1.toString(0 /* Unix */)).toEqual('path/to/file:5:12 - message');
        const error2 = new FileError_1.FileError('message', 'path/to/file', 5);
        expect(error2.toString(0 /* Unix */)).toEqual('path/to/file:5 - message');
        const error3 = new FileError_1.FileError('message', 'path/to/file');
        expect(error3.toString(0 /* Unix */)).toEqual('path/to/file - message');
    });
    it('correctly performs Unix-style file path formatting', () => {
        const error1 = new FileError_1.FileError('message', 'path/to/file', 5, 12);
        expect(error1.toString(1 /* VisualStudio */)).toEqual('path/to/file(5,12) - message');
        const error2 = new FileError_1.FileError('message', 'path/to/file', 5);
        expect(error2.toString(1 /* VisualStudio */)).toEqual('path/to/file(5) - message');
        const error3 = new FileError_1.FileError('message', 'path/to/file');
        expect(error3.toString(1 /* VisualStudio */)).toEqual('path/to/file - message');
    });
});
//# sourceMappingURL=FileError.test.js.map