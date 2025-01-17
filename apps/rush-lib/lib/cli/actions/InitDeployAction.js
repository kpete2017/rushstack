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
exports.InitDeployAction = void 0;
const path = __importStar(require("path"));
const safe_1 = __importDefault(require("colors/safe"));
const BaseRushAction_1 = require("./BaseRushAction");
const node_core_library_1 = require("@rushstack/node-core-library");
const DeployScenarioConfiguration_1 = require("../../logic/deploy/DeployScenarioConfiguration");
class InitDeployAction extends BaseRushAction_1.BaseRushAction {
    constructor(parser) {
        super({
            actionName: 'init-deploy',
            summary: 'Creates a deployment scenario config file for use with "rush deploy".',
            documentation: 'Use this command to initialize a new scenario config file for use with "rush deploy".' +
                ' The default filename is common/config/rush/deploy.json. However, if you need to manage multiple' +
                ' deployments with different settings, you can use use "--scenario" to create additional config files.',
            parser
        });
    }
    onDefineParameters() {
        this._project = this.defineStringParameter({
            parameterLongName: '--project',
            parameterShortName: '-p',
            argumentName: 'PROJECT_NAME',
            required: true,
            description: 'Specifies the name of the main Rush project to be deployed in this scenario.' +
                ' It will be added to the "deploymentProjectNames" setting.'
        });
        this._scenario = this.defineStringParameter({
            parameterLongName: '--scenario',
            parameterShortName: '-s',
            argumentName: 'SCENARIO',
            description: 'By default, the deployment configuration will be written to "common/config/rush/deploy.json".' +
                ' You can use "--scenario" to specify an alternate name. The name must be lowercase and separated by dashes.' +
                ' For example, if the name is "web", then the config file would be "common/config/rush/deploy-web.json".'
        });
    }
    async runAsync() {
        const scenarioFilePath = DeployScenarioConfiguration_1.DeployScenarioConfiguration.getConfigFilePath(this._scenario.value, this.rushConfiguration);
        if (node_core_library_1.FileSystem.exists(scenarioFilePath)) {
            throw new Error('The target file already exists:\n' +
                scenarioFilePath +
                '\nIf you intend to replace it, please delete the old file first.');
        }
        console.log(safe_1.default.green('Creating scenario file: ') + scenarioFilePath);
        const shortProjectName = this._project.value;
        const rushProject = this.rushConfiguration.findProjectByShorthandName(shortProjectName);
        if (!rushProject) {
            throw new Error(`The specified project was not found in rush.json: "${shortProjectName}"`);
        }
        const templateContent = node_core_library_1.FileSystem.readFile(InitDeployAction._CONFIG_TEMPLATE_PATH);
        const expandedContent = templateContent.replace('[%PROJECT_NAME_TO_DEPLOY%]', rushProject.packageName);
        node_core_library_1.FileSystem.writeFile(scenarioFilePath, expandedContent, {
            ensureFolderExists: true,
            convertLineEndings: "os" /* OsDefault */
        });
        console.log('\nFile successfully written. Please review the file contents before committing.');
    }
}
exports.InitDeployAction = InitDeployAction;
InitDeployAction._CONFIG_TEMPLATE_PATH = path.join(__dirname, '../../../assets/rush-init-deploy/scenario-template.json');
//# sourceMappingURL=InitDeployAction.js.map