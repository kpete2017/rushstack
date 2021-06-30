"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListAction = void 0;
const node_core_library_1 = require("@rushstack/node-core-library");
const BaseRushAction_1 = require("./BaseRushAction");
const cliTable = node_core_library_1.Import.lazy('cli-table', require);
class ListAction extends BaseRushAction_1.BaseRushAction {
    constructor(parser) {
        super({
            actionName: 'list',
            summary: 'List package information for all projects in the repo',
            documentation: 'List package names, and optionally version (--version) and ' +
                'path (--path) or full path (--full-path), for projects in the ' +
                'current rush config.',
            parser
        });
    }
    onDefineParameters() {
        this._version = this.defineFlagParameter({
            parameterLongName: '--version',
            parameterShortName: '-v',
            description: 'If this flag is specified, the project version will be ' +
                'displayed in a column along with the package name.'
        });
        this._path = this.defineFlagParameter({
            parameterLongName: '--path',
            parameterShortName: '-p',
            description: 'If this flag is specified, the project path will be ' +
                'displayed in a column along with the package name.'
        });
        this._fullPath = this.defineFlagParameter({
            parameterLongName: '--full-path',
            parameterShortName: '-f',
            description: 'If this flag is specified, the project full path will ' +
                'be displayed in a column along with the package name.'
        });
        this._jsonFlag = this.defineFlagParameter({
            parameterLongName: '--json',
            description: 'If this flag is specified, output will be in JSON format.'
        });
    }
    async runAsync() {
        const allPackages = this.rushConfiguration.projectsByName;
        if (this._jsonFlag.value) {
            this._printJson(allPackages);
        }
        else if (this._version.value || this._path.value || this._fullPath.value) {
            this._printListTable(allPackages);
        }
        else {
            this._printList(allPackages);
        }
    }
    _printJson(allPackages) {
        const projects = [];
        allPackages.forEach((config, name) => {
            const project = {
                name: name,
                version: config.packageJson.version,
                path: config.projectRelativeFolder,
                fullPath: config.projectFolder
            };
            projects.push(project);
        });
        const output = {
            projects
        };
        console.log(JSON.stringify(output, undefined, 2));
    }
    _printList(allPackages) {
        allPackages.forEach((config, name) => {
            console.log(name);
        });
    }
    _printListTable(allPackages) {
        const tableHeader = ['Project'];
        if (this._version.value) {
            tableHeader.push('Version');
        }
        if (this._path.value) {
            tableHeader.push('Path');
        }
        if (this._fullPath.value) {
            tableHeader.push('Full Path');
        }
        // eslint-disable-next-line @typescript-eslint/typedef
        const table = new cliTable({
            head: tableHeader
        });
        allPackages.forEach((config, name) => {
            const packageRow = [name];
            if (this._version.value) {
                packageRow.push(config.packageJson.version);
            }
            if (this._path.value) {
                packageRow.push(config.projectRelativeFolder);
            }
            if (this._fullPath.value) {
                packageRow.push(config.projectFolder);
            }
            table.push(packageRow);
        });
        console.log(table.toString());
    }
}
exports.ListAction = ListAction;
//# sourceMappingURL=ListAction.js.map