"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InitAutoinstallerAction = void 0;
const safe_1 = __importDefault(require("colors/safe"));
const node_core_library_1 = require("@rushstack/node-core-library");
const BaseRushAction_1 = require("./BaseRushAction");
const Autoinstaller_1 = require("../../logic/Autoinstaller");
class InitAutoinstallerAction extends BaseRushAction_1.BaseRushAction {
    constructor(parser) {
        super({
            actionName: 'init-autoinstaller',
            summary: 'Initializes a new autoinstaller',
            documentation: 'Use this command to initialize a new autoinstaller folder.  Autoinstallers provide a way to' +
                ' manage a set of related dependencies that are used for scripting scenarios outside of the usual' +
                ' "rush install" context.  See the command-line.json documentation for an example.',
            parser
        });
    }
    onDefineParameters() {
        this._name = this.defineStringParameter({
            parameterLongName: '--name',
            argumentName: 'AUTOINSTALLER_NAME',
            required: true,
            description: 'Specifies the name of the autoinstaller folder, which must conform to the naming rules for NPM packages.'
        });
    }
    async runAsync() {
        const autoinstallerName = this._name.value;
        const autoinstaller = new Autoinstaller_1.Autoinstaller(autoinstallerName, this.rushConfiguration);
        if (node_core_library_1.FileSystem.exists(autoinstaller.folderFullPath)) {
            // It's okay if the folder is empty
            if (node_core_library_1.FileSystem.readFolder(autoinstaller.folderFullPath).length > 0) {
                throw new Error('The target folder already exists: ' + autoinstaller.folderFullPath);
            }
        }
        const packageJson = {
            name: autoinstallerName,
            version: '1.0.0',
            private: true,
            dependencies: {}
        };
        console.log(safe_1.default.green('Creating package: ') + autoinstaller.packageJsonPath);
        node_core_library_1.JsonFile.save(packageJson, autoinstaller.packageJsonPath, {
            ensureFolderExists: true,
            newlineConversion: "os" /* OsDefault */
        });
        console.log('\nFile successfully written. Add your dependencies before committing.');
    }
}
exports.InitAutoinstallerAction = InitAutoinstallerAction;
//# sourceMappingURL=InitAutoinstallerAction.js.map