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
exports.DeployScenarioConfiguration = void 0;
const safe_1 = __importDefault(require("colors/safe"));
const path = __importStar(require("path"));
const node_core_library_1 = require("@rushstack/node-core-library");
class DeployScenarioConfiguration {
    constructor(json, projectJsonsByName) {
        this.json = json;
        this.projectJsonsByName = projectJsonsByName;
    }
    /**
     * Validates that the input string conforms to the naming rules for a "rush deploy" scenario name.
     */
    static validateScenarioName(scenarioName) {
        if (!scenarioName) {
            throw new Error('The scenario name cannot be an empty string');
        }
        if (!this._scenarioNameRegExp.test(scenarioName)) {
            throw new Error(`"${scenarioName}" is not a valid scenario name. The name must be comprised of` +
                ' lowercase letters and numbers, separated by single hyphens. Example: "my-scenario"');
        }
    }
    /**
     * Given the --scenarioName value, return the full path of the filename.
     *
     * Example: "ftp-site" --> "...common/config/rush/deploy-ftp-site.json"
     * Example: undefined --> "...common/config/rush/deploy.json"
     */
    static getConfigFilePath(scenarioName, rushConfiguration) {
        let scenarioFileName;
        if (scenarioName) {
            DeployScenarioConfiguration.validateScenarioName(scenarioName);
            scenarioFileName = `deploy-${scenarioName}.json`;
        }
        else {
            scenarioFileName = `deploy.json`;
        }
        return path.join(rushConfiguration.commonRushConfigFolder, scenarioFileName);
    }
    static loadFromFile(scenarioFilePath, rushConfiguration) {
        if (!node_core_library_1.FileSystem.exists(scenarioFilePath)) {
            throw new Error('The scenario config file was not found: ' + scenarioFilePath);
        }
        console.log(safe_1.default.cyan('Loading deployment scenario: ') + scenarioFilePath);
        const deployScenarioJson = node_core_library_1.JsonFile.loadAndValidate(scenarioFilePath, DeployScenarioConfiguration._jsonSchema);
        // Apply the defaults
        if (!deployScenarioJson.linkCreation) {
            deployScenarioJson.linkCreation = 'default';
        }
        const deployScenarioProjectJsonsByName = new Map();
        for (const projectSetting of deployScenarioJson.projectSettings || []) {
            // Validate projectSetting.projectName
            if (!rushConfiguration.getProjectByName(projectSetting.projectName)) {
                throw new Error(`The "projectSettings" section refers to the project name "${projectSetting.projectName}"` +
                    ` which was not found in rush.json`);
            }
            for (const additionalProjectsToInclude of projectSetting.additionalProjectsToInclude || []) {
                if (!rushConfiguration.getProjectByName(projectSetting.projectName)) {
                    throw new Error(`The "additionalProjectsToInclude" setting refers to the` +
                        ` project name "${additionalProjectsToInclude}" which was not found in rush.json`);
                }
            }
            deployScenarioProjectJsonsByName.set(projectSetting.projectName, projectSetting);
        }
        return new DeployScenarioConfiguration(deployScenarioJson, deployScenarioProjectJsonsByName);
    }
}
exports.DeployScenarioConfiguration = DeployScenarioConfiguration;
// Used by validateScenarioName()
// Matches lowercase words separated by dashes.
// Example: "deploy-the-thing123"
DeployScenarioConfiguration._scenarioNameRegExp = /^[a-z0-9]+(-[a-z0-9]+)*$/;
DeployScenarioConfiguration._jsonSchema = node_core_library_1.JsonSchema.fromFile(path.join(__dirname, '../../schemas/deploy-scenario.schema.json'));
//# sourceMappingURL=DeployScenarioConfiguration.js.map