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
exports.GlobalScriptAction = void 0;
const safe_1 = __importDefault(require("colors/safe"));
const os = __importStar(require("os"));
const path = __importStar(require("path"));
const node_core_library_1 = require("@rushstack/node-core-library");
const BaseScriptAction_1 = require("./BaseScriptAction");
const Utilities_1 = require("../../utilities/Utilities");
const InstallHelpers_1 = require("../../logic/installManager/InstallHelpers");
const RushConstants_1 = require("../../logic/RushConstants");
const LastInstallFlag_1 = require("../../api/LastInstallFlag");
const Autoinstaller_1 = require("../../logic/Autoinstaller");
/**
 * This class implements custom commands that are run once globally for the entire repo
 * (versus bulk commands, which run separately for each project).  The action executes
 * a user-defined script file.
 *
 * @remarks
 * Bulk commands can be defined via common/config/command-line.json.  Rush's predefined "build"
 * and "rebuild" commands are also modeled as bulk commands, because they essentially just
 * invoke scripts from package.json in the same way as a custom command.
 */
class GlobalScriptAction extends BaseScriptAction_1.BaseScriptAction {
    constructor(options) {
        super(options);
        this._shellCommand = options.shellCommand;
        this._autoinstallerName = options.autoinstallerName || '';
        if (this._autoinstallerName) {
            Autoinstaller_1.Autoinstaller.validateName(this._autoinstallerName);
            // Example: .../common/autoinstallers/my-task
            this._autoinstallerFullPath = path.join(this.rushConfiguration.commonAutoinstallersFolder, this._autoinstallerName);
            if (!node_core_library_1.FileSystem.exists(this._autoinstallerFullPath)) {
                throw new Error(`The custom command "${this.actionName}" specifies an "autoinstallerName" setting` +
                    ' but the path does not exist: ' +
                    this._autoinstallerFullPath);
            }
            // Example: .../common/autoinstallers/my-task/package.json
            const packageJsonPath = path.join(this._autoinstallerFullPath, 'package.json');
            if (!node_core_library_1.FileSystem.exists(packageJsonPath)) {
                throw new Error(`The custom command "${this.actionName}" specifies an "autoinstallerName" setting` +
                    ` whose package.json file was not found: ` +
                    packageJsonPath);
            }
            const packageJson = node_core_library_1.JsonFile.load(packageJsonPath);
            if (packageJson.name !== this._autoinstallerName) {
                throw new Error(`The custom command "${this.actionName}" specifies an "autoinstallerName" setting,` +
                    ` but the package.json file's "name" field is not "${this._autoinstallerName}": ` +
                    packageJsonPath);
            }
        }
        else {
            this._autoinstallerFullPath = '';
        }
    }
    async _prepareAutoinstallerName() {
        await InstallHelpers_1.InstallHelpers.ensureLocalPackageManager(this.rushConfiguration, this.rushGlobalFolder, RushConstants_1.RushConstants.defaultMaxInstallAttempts);
        // Example: common/autoinstallers/my-task/package.json
        const relativePathForLogs = path.relative(this.rushConfiguration.rushJsonFolder, this._autoinstallerFullPath);
        console.log(`Acquiring lock for "${relativePathForLogs}" folder...`);
        const lock = await node_core_library_1.LockFile.acquire(this._autoinstallerFullPath, 'autoinstaller');
        // Example: .../common/autoinstallers/my-task/.rush/temp
        const lastInstallFlagPath = path.join(this._autoinstallerFullPath, RushConstants_1.RushConstants.projectRushFolderName, 'temp');
        const packageJsonPath = path.join(this._autoinstallerFullPath, 'package.json');
        const packageJson = node_core_library_1.JsonFile.load(packageJsonPath);
        const lastInstallFlag = new LastInstallFlag_1.LastInstallFlag(lastInstallFlagPath, {
            node: process.versions.node,
            packageManager: this.rushConfiguration.packageManager,
            packageManagerVersion: this.rushConfiguration.packageManagerToolVersion,
            packageJson: packageJson
        });
        if (!lastInstallFlag.isValid() || lock.dirtyWhenAcquired) {
            // Example: ../common/autoinstallers/my-task/node_modules
            const nodeModulesFolder = path.join(this._autoinstallerFullPath, 'node_modules');
            if (node_core_library_1.FileSystem.exists(nodeModulesFolder)) {
                console.log('Deleting old files from ' + nodeModulesFolder);
                node_core_library_1.FileSystem.ensureEmptyFolder(nodeModulesFolder);
            }
            // Copy: .../common/autoinstallers/my-task/.npmrc
            Utilities_1.Utilities.syncNpmrc(this.rushConfiguration.commonRushConfigFolder, this._autoinstallerFullPath);
            console.log(`Installing dependencies under ${this._autoinstallerFullPath}...\n`);
            Utilities_1.Utilities.executeCommand({
                command: this.rushConfiguration.packageManagerToolFilename,
                args: ['install', '--frozen-lockfile'],
                workingDirectory: this._autoinstallerFullPath,
                keepEnvironment: true
            });
            // Create file: ../common/autoinstallers/my-task/.rush/temp/last-install.flag
            lastInstallFlag.create();
            console.log('Autoinstall completed successfully\n');
        }
        else {
            console.log('Autoinstaller folder is already up to date\n');
        }
        lock.release();
    }
    async runAsync() {
        const additionalPathFolders = [];
        if (this._autoinstallerName) {
            await this._prepareAutoinstallerName();
            const autoinstallerNameBinPath = path.join(this._autoinstallerFullPath, 'node_modules', '.bin');
            additionalPathFolders.push(autoinstallerNameBinPath);
        }
        // Collect all custom parameter values
        const customParameterValues = [];
        for (const customParameter of this.customParameters) {
            customParameter.appendToArgList(customParameterValues);
        }
        let shellCommand = this._shellCommand;
        if (customParameterValues.length > 0) {
            shellCommand += ' ' + customParameterValues.join(' ');
        }
        const exitCode = Utilities_1.Utilities.executeLifecycleCommand(shellCommand, {
            rushConfiguration: this.rushConfiguration,
            workingDirectory: this.rushConfiguration.rushJsonFolder,
            initCwd: this.rushConfiguration.commonTempFolder,
            handleOutput: false,
            environmentPathOptions: {
                includeRepoBin: true,
                additionalPathFolders: additionalPathFolders
            }
        });
        process.exitCode = exitCode;
        if (exitCode > 0) {
            console.log(os.EOL + safe_1.default.red(`The script failed with exit code ${exitCode}`));
            throw new node_core_library_1.AlreadyReportedError();
        }
    }
    onDefineParameters() {
        this.defineScriptParameters();
    }
}
exports.GlobalScriptAction = GlobalScriptAction;
//# sourceMappingURL=GlobalScriptAction.js.map