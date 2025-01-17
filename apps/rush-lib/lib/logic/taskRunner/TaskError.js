"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuildTaskError = exports.TaskError = void 0;
/**
 * Encapsulates information about an error
 */
class TaskError extends Error {
    constructor(type, message) {
        super(message);
        this._type = type;
    }
    get message() {
        return `[${this._type}] '${super.message}'`;
    }
    toString() {
        return this.message;
    }
}
exports.TaskError = TaskError;
/**
 * TestTaskError extends TaskError
 */
class BuildTaskError extends TaskError {
    constructor(type, message, file, line, offset) {
        super(type, message);
        this._file = file;
        this._line = line;
        this._offset = offset;
    }
    get message() {
        // Example: "C:\Project\Blah.ts(123,1): [tslint] error no-any: 'any' is not allowed"
        return `${this._file}(${this._line},${this._offset}): ${super.message}`;
    }
    toString() {
        return this.message;
    }
}
exports.BuildTaskError = BuildTaskError;
//# sourceMappingURL=TaskError.js.map