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
exports.RushProjectConfiguration = void 0;
const path = __importStar(require("path"));
const heft_config_file_1 = require("@rushstack/heft-config-file");
const rig_package_1 = require("@rushstack/rig-package");
const RushConstants_1 = require("../logic/RushConstants");
/**
 * Use this class to load the "config/rush-project.json" config file.
 *
 * This file provides project-specific configuration options.
 * @public
 */
class RushProjectConfiguration {
    constructor(project, rushProjectJson) {
        var _a, _b;
        this.project = project;
        this.projectOutputFolderNames = rushProjectJson.projectOutputFolderNames;
        this.incrementalBuildIgnoredGlobs = rushProjectJson.incrementalBuildIgnoredGlobs;
        const optionsForCommandsByName = new Map();
        if ((_a = rushProjectJson.buildCacheOptions) === null || _a === void 0 ? void 0 : _a.optionsForCommands) {
            for (const cacheOptionsForCommand of rushProjectJson.buildCacheOptions.optionsForCommands) {
                optionsForCommandsByName.set(cacheOptionsForCommand.name, cacheOptionsForCommand);
            }
        }
        this.cacheOptions = {
            disableBuildCache: (_b = rushProjectJson.buildCacheOptions) === null || _b === void 0 ? void 0 : _b.disableBuildCache,
            optionsForCommandsByName
        };
    }
    /**
     * Loads the rush-project.json data for the specified project.
     */
    static async tryLoadForProjectAsync(project, repoCommandLineConfiguration, terminal) {
        const rigConfig = await rig_package_1.RigConfig.loadForProjectFolderAsync({
            projectFolderPath: project.projectFolder
        });
        const rushProjectJson = await this._projectBuildCacheConfigurationFile.tryLoadConfigurationFileForProjectAsync(terminal, project.projectFolder, rigConfig);
        if (rushProjectJson) {
            RushProjectConfiguration._validateConfiguration(project, rushProjectJson, repoCommandLineConfiguration, terminal);
            return new RushProjectConfiguration(project, rushProjectJson);
        }
        else {
            return undefined;
        }
    }
    static _validateConfiguration(project, rushProjectJson, repoCommandLineConfiguration, terminal) {
        var _a;
        const invalidFolderNames = [];
        for (const projectOutputFolder of rushProjectJson.projectOutputFolderNames || []) {
            if (projectOutputFolder.match(/[\/\\]/)) {
                invalidFolderNames.push(projectOutputFolder);
            }
        }
        if (invalidFolderNames.length > 0) {
            terminal.writeErrorLine(`Invalid project configuration for project "${project.packageName}". Entries in ` +
                '"projectOutputFolderNames" must not contain slashes and the following entries do: ' +
                invalidFolderNames.join(', '));
        }
        const duplicateCommandNames = new Set();
        const invalidCommandNames = [];
        if ((_a = rushProjectJson.buildCacheOptions) === null || _a === void 0 ? void 0 : _a.optionsForCommands) {
            const commandNames = new Set([
                RushConstants_1.RushConstants.buildCommandName,
                RushConstants_1.RushConstants.rebuildCommandName
            ]);
            if (repoCommandLineConfiguration) {
                for (const command of repoCommandLineConfiguration.commands) {
                    if (command.commandKind === RushConstants_1.RushConstants.bulkCommandKind) {
                        commandNames.add(command.name);
                    }
                }
            }
            const alreadyEncounteredCommandNames = new Set();
            for (const cacheOptionsForCommand of rushProjectJson.buildCacheOptions.optionsForCommands) {
                const commandName = cacheOptionsForCommand.name;
                if (!commandNames.has(commandName)) {
                    invalidCommandNames.push(commandName);
                }
                else if (alreadyEncounteredCommandNames.has(commandName)) {
                    duplicateCommandNames.add(commandName);
                }
                else {
                    alreadyEncounteredCommandNames.add(commandName);
                }
            }
        }
        if (invalidCommandNames.length > 0) {
            terminal.writeErrorLine(`Invalid project configuration fpr project "${project.packageName}". The following ` +
                'command names in cacheOptions.optionsForCommands are not specified in this repo: ' +
                invalidCommandNames.join(', '));
        }
        if (duplicateCommandNames.size > 0) {
            terminal.writeErrorLine(`Invalid project configuration fpr project "${project.packageName}". The following ` +
                'command names in cacheOptions.optionsForCommands are specified more than once: ' +
                Array.from(duplicateCommandNames).join(', '));
        }
    }
}
exports.RushProjectConfiguration = RushProjectConfiguration;
RushProjectConfiguration._projectBuildCacheConfigurationFile = new heft_config_file_1.ConfigurationFile({
    projectRelativeFilePath: `config/${RushConstants_1.RushConstants.rushProjectConfigFilename}`,
    jsonSchemaPath: path.resolve(__dirname, '..', 'schemas', 'rush-project.schema.json'),
    propertyInheritance: {
        projectOutputFolderNames: {
            inheritanceType: heft_config_file_1.InheritanceType.append
        },
        incrementalBuildIgnoredGlobs: {
            inheritanceType: heft_config_file_1.InheritanceType.replace
        },
        buildCacheOptions: {
            inheritanceType: heft_config_file_1.InheritanceType.custom,
            inheritanceFunction: (current, parent) => {
                if (!current) {
                    return parent;
                }
                else if (!parent) {
                    return current;
                }
                else {
                    return Object.assign(Object.assign(Object.assign({}, parent), current), { optionsForCommands: [
                            ...(parent.optionsForCommands || []),
                            ...(current.optionsForCommands || [])
                        ] });
                }
            }
        }
    }
});
//# sourceMappingURL=RushProjectConfiguration.js.map