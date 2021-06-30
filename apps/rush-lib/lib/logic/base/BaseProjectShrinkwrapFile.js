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
exports.BaseProjectShrinkwrapFile = void 0;
const path = __importStar(require("path"));
const node_core_library_1 = require("@rushstack/node-core-library");
const RushConstants_1 = require("../RushConstants");
/**
 * This class handles creating the project/.rush/temp/shrinkwrap-deps.json file
 * which tracks the direct and indirect dependencies that a project consumes. This is used
 * to better determine which projects should be rebuilt when dependencies are updated.
 */
class BaseProjectShrinkwrapFile {
    constructor(shrinkwrapFile, project) {
        this.project = project;
        this.projectShrinkwrapFilePath = BaseProjectShrinkwrapFile.getFilePathForProject(this.project);
        this._shrinkwrapFile = shrinkwrapFile;
    }
    /**
     * Get the fully-qualified path to the <project>/.rush/temp/shrinkwrap-deps.json
     * for the specified project.
     */
    static getFilePathForProject(project) {
        return path.join(project.projectRushTempFolder, RushConstants_1.RushConstants.projectShrinkwrapFilename);
    }
    /**
     * If the <project>/.rush/temp/shrinkwrap-deps.json file exists, delete it. Otherwise, do nothing.
     */
    async deleteIfExistsAsync() {
        await node_core_library_1.FileSystem.deleteFileAsync(this.projectShrinkwrapFilePath, { throwIfNotExists: false });
    }
    /**
     * The shrinkwrap file that the project shrinkwrap file is based off of.
     */
    get shrinkwrapFile() {
        return this._shrinkwrapFile;
    }
}
exports.BaseProjectShrinkwrapFile = BaseProjectShrinkwrapFile;
//# sourceMappingURL=BaseProjectShrinkwrapFile.js.map