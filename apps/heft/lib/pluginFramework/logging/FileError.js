"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileError = void 0;
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
const node_core_library_1 = require("@rushstack/node-core-library");
const uuidFileError = '37a4c772-2dc8-4c66-89ae-262f8cc1f0c1';
/**
 * An `Error` subclass that should be thrown to report an unexpected state that specifically references
 * a location in a file.
 *
 * @public
 */
class FileError extends Error {
    /**
     * Constructs a new instance of the {@link FileError} class.
     *
     * @param message - A message describing the error.
     */
    constructor(message, filePath, line, column) {
        super(message);
        this.filePath = node_core_library_1.Path.convertToSlashes(filePath);
        this.line = line;
        this.column = column;
        // Manually set the prototype, as we can no longer extend built-in classes like Error, Array, Map, etc.
        // https://github.com/microsoft/TypeScript-wiki/blob/master/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work
        //
        // Note: the prototype must also be set on any classes which extend this one
        this.__proto__ = FileError.prototype; // eslint-disable-line @typescript-eslint/no-explicit-any
    }
    /** @override */
    toString(format = 0 /* Unix */) {
        let formattedFileLocation;
        switch (format) {
            case 0 /* Unix */: {
                if (this.column !== undefined) {
                    formattedFileLocation = `:${this.line}:${this.column}`;
                }
                else if (this.line !== undefined) {
                    formattedFileLocation = `:${this.line}`;
                }
                else {
                    formattedFileLocation = '';
                }
                break;
            }
            case 1 /* VisualStudio */: {
                if (this.column !== undefined) {
                    formattedFileLocation = `(${this.line},${this.column})`;
                }
                else if (this.line !== undefined) {
                    formattedFileLocation = `(${this.line})`;
                }
                else {
                    formattedFileLocation = '';
                }
                break;
            }
            default: {
                throw new Error(`Unknown format: ${format}`);
            }
        }
        return `${this.filePath}${formattedFileLocation} - ${this.message}`;
    }
    static [Symbol.hasInstance](instance) {
        return node_core_library_1.TypeUuid.isInstanceOf(instance, uuidFileError);
    }
}
exports.FileError = FileError;
node_core_library_1.TypeUuid.registerClass(FileError, uuidFileError);
//# sourceMappingURL=FileError.js.map