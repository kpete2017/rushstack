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
exports.ProjectLogWritable = void 0;
const path = __importStar(require("path"));
const node_core_library_1 = require("@rushstack/node-core-library");
const terminal_1 = require("@rushstack/terminal");
const PackageNameParsers_1 = require("../../api/PackageNameParsers");
class ProjectLogWritable extends terminal_1.TerminalWritable {
    constructor(project, terminal) {
        super();
        this._buildLogWriter = undefined;
        this._errorLogWriter = undefined;
        this._project = project;
        this._terminal = terminal;
        const unscopedProjectName = PackageNameParsers_1.PackageNameParsers.permissive.getUnscopedName(this._project.packageName);
        this._buildLogPath = path.join(this._project.projectFolder, `${unscopedProjectName}.build.log`);
        this._errorLogPath = path.join(this._project.projectFolder, `${unscopedProjectName}.build.error.log`);
        node_core_library_1.FileSystem.deleteFile(this._buildLogPath);
        node_core_library_1.FileSystem.deleteFile(this._errorLogPath);
        this._buildLogWriter = node_core_library_1.FileWriter.open(this._buildLogPath);
    }
    onWriteChunk(chunk) {
        if (!this._buildLogWriter) {
            throw new node_core_library_1.InternalError('Output file was closed');
        }
        // Both stderr and stdout get written to *.build.log
        this._buildLogWriter.write(chunk.text);
        if (chunk.kind === "E" /* Stderr */) {
            // Only stderr gets written to *.build.error.log
            if (!this._errorLogWriter) {
                this._errorLogWriter = node_core_library_1.FileWriter.open(this._errorLogPath);
            }
            this._errorLogWriter.write(chunk.text);
        }
    }
    onClose() {
        if (this._buildLogWriter) {
            try {
                this._buildLogWriter.close();
            }
            catch (error) {
                this._terminal.writeStderrLine('Failed to close file handle for ' + this._buildLogWriter.filePath);
            }
            this._buildLogWriter = undefined;
        }
        if (this._errorLogWriter) {
            try {
                this._errorLogWriter.close();
            }
            catch (error) {
                this._terminal.writeStderrLine('Failed to close file handle for ' + this._errorLogWriter.filePath);
            }
            this._errorLogWriter = undefined;
        }
    }
}
exports.ProjectLogWritable = ProjectLogWritable;
//# sourceMappingURL=ProjectLogWritable.js.map