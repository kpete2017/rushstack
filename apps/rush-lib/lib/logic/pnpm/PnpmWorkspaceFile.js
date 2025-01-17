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
exports.PnpmWorkspaceFile = void 0;
const path = __importStar(require("path"));
const node_core_library_1 = require("@rushstack/node-core-library");
const BaseWorkspaceFile_1 = require("../base/BaseWorkspaceFile");
const PnpmYamlCommon_1 = require("./PnpmYamlCommon");
const yamlModule = node_core_library_1.Import.lazy('js-yaml', require);
const globEscape = require('glob-escape'); // No @types/glob-escape package exists
class PnpmWorkspaceFile extends BaseWorkspaceFile_1.BaseWorkspaceFile {
    /**
     * The PNPM workspace file is used to specify the location of workspaces relative to the root
     * of your PNPM install.
     */
    constructor(workspaceYamlFilename) {
        super();
        this.workspaceFilename = workspaceYamlFilename;
        // Ignore any existing file since this file is generated and we need to handle deleting packages
        // If we need to support manual customization, that should be an additional parameter for "base file"
        this._workspacePackages = new Set();
    }
    /** @override */
    addPackage(packagePath) {
        // Ensure the path is relative to the pnpm-workspace.yaml file
        if (path.isAbsolute(packagePath)) {
            packagePath = path.relative(path.dirname(this.workspaceFilename), packagePath);
        }
        // Glob can't handle Windows paths
        const globPath = node_core_library_1.Path.convertToSlashes(packagePath);
        this._workspacePackages.add(globEscape(globPath));
    }
    /** @override */
    serialize() {
        // Ensure stable sort order when serializing
        node_core_library_1.Sort.sortSet(this._workspacePackages);
        const workspaceYaml = {
            packages: Array.from(this._workspacePackages)
        };
        return yamlModule.safeDump(workspaceYaml, PnpmYamlCommon_1.PNPM_SHRINKWRAP_YAML_FORMAT);
    }
}
exports.PnpmWorkspaceFile = PnpmWorkspaceFile;
//# sourceMappingURL=PnpmWorkspaceFile.js.map