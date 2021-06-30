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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Autoinstaller = void 0;
const safe_1 = __importDefault(require("colors/safe"));
const path = __importStar(require("path"));
const node_core_library_1 = require("@rushstack/node-core-library");
const Utilities_1 = require("../utilities/Utilities");
const node_core_library_2 = require("@rushstack/node-core-library");
const PackageJsonEditor_1 = require("../api/PackageJsonEditor");
class Autoinstaller {
    constructor(autoinstallerName, rushConfiguration) {
        this._rushConfiguration = rushConfiguration;
        Autoinstaller.validateName(autoinstallerName);
        this.name = autoinstallerName;
    }
    // Example: .../common/autoinstallers/my-task
    get folderFullPath() {
        return path.join(this._rushConfiguration.commonAutoinstallersFolder, this.name);
    }
    // Example: .../common/autoinstallers/my-task/package-lock.yaml
    get shrinkwrapFilePath() {
        return path.join(this._rushConfiguration.commonAutoinstallersFolder, this.name, this._rushConfiguration.shrinkwrapFilename);
    }
    // Example: .../common/autoinstallers/my-task/package.json
    get packageJsonPath() {
        return path.join(this._rushConfiguration.commonAutoinstallersFolder, this.name, 'package.json');
    }
    static validateName(autoinstallerName) {
        const nameOrError = node_core_library_2.PackageName.tryParse(autoinstallerName);
        if (nameOrError.error) {
            throw new Error(`The specified name "${autoinstallerName}" is invalid: ` + nameOrError.error);
        }
        if (nameOrError.scope) {
            throw new Error(`The specified name "${autoinstallerName}" must not contain an NPM scope`);
        }
    }
    update() {
        const autoinstallerPackageJsonPath = path.join(this.folderFullPath, 'package.json');
        if (!node_core_library_1.FileSystem.exists(autoinstallerPackageJsonPath)) {
            throw new Error(`The specified autoinstaller path does not exist: ` + autoinstallerPackageJsonPath);
        }
        console.log(`Updating autoinstaller package: ${autoinstallerPackageJsonPath}`);
        let oldFileContents = '';
        if (node_core_library_1.FileSystem.exists(this.shrinkwrapFilePath)) {
            oldFileContents = node_core_library_1.FileSystem.readFile(this.shrinkwrapFilePath, { convertLineEndings: "\n" /* Lf */ });
            console.log('Deleting ' + this.shrinkwrapFilePath);
            node_core_library_1.FileSystem.deleteFile(this.shrinkwrapFilePath);
        }
        // Detect a common mistake where PNPM prints "Already up-to-date" without creating a shrinkwrap file
        const packageJsonEditor = PackageJsonEditor_1.PackageJsonEditor.load(this.packageJsonPath);
        if (packageJsonEditor.dependencyList.length === 0 && packageJsonEditor.dependencyList.length === 0) {
            throw new Error('You must add at least one dependency to the autoinstaller package' +
                ' before invoking this command:\n' +
                this.packageJsonPath);
        }
        console.log();
        Utilities_1.Utilities.executeCommand({
            command: this._rushConfiguration.packageManagerToolFilename,
            args: ['install'],
            workingDirectory: this.folderFullPath,
            keepEnvironment: true
        });
        console.log();
        if (!node_core_library_1.FileSystem.exists(this.shrinkwrapFilePath)) {
            throw new Error('The package manager did not create the expected shrinkwrap file: ' + this.shrinkwrapFilePath);
        }
        const newFileContents = node_core_library_1.FileSystem.readFile(this.shrinkwrapFilePath, {
            convertLineEndings: "\n" /* Lf */
        });
        if (oldFileContents !== newFileContents) {
            console.log(safe_1.default.green('The shrinkwrap file has been updated.') + '  Please commit the updated file:');
            console.log(`\n  ${this.shrinkwrapFilePath}`);
        }
        else {
            console.log(safe_1.default.green('Already up to date.'));
        }
    }
}
exports.Autoinstaller = Autoinstaller;
//# sourceMappingURL=Autoinstaller.js.map