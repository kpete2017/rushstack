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
exports.CommandLineConfiguration = void 0;
const path = __importStar(require("path"));
const node_core_library_1 = require("@rushstack/node-core-library");
const RushConstants_1 = require("../logic/RushConstants");
/**
 * Custom Commands and Options for the Rush Command Line
 */
class CommandLineConfiguration {
    /**
     * Use CommandLineConfiguration.loadFromFile()
     */
    constructor(commandLineJson) {
        this.commands = [];
        this.parameters = [];
        if (commandLineJson) {
            if (commandLineJson.commands) {
                for (const command of commandLineJson.commands) {
                    this.commands.push(command);
                }
            }
            if (commandLineJson.parameters) {
                for (const parameter of commandLineJson.parameters) {
                    this.parameters.push(parameter);
                    // Do some basic validation
                    switch (parameter.parameterKind) {
                        case 'choice':
                            const alternativeNames = parameter.alternatives.map((x) => x.name);
                            if (parameter.defaultValue && alternativeNames.indexOf(parameter.defaultValue) < 0) {
                                throw new Error(`In ${RushConstants_1.RushConstants.commandLineFilename}, the parameter "${parameter.longName}",` +
                                    ` specifies a default value "${parameter.defaultValue}"` +
                                    ` which is not one of the defined alternatives: "${alternativeNames.toString()}"`);
                            }
                            break;
                    }
                }
            }
        }
    }
    /**
     * Loads the configuration from the specified file and applies any omitted default build
     * settings.  If the file does not exist, then an empty default instance is returned.
     * If the file contains errors, then an exception is thrown.
     */
    static loadFromFileOrDefault(jsonFilename) {
        let commandLineJson = undefined;
        if (node_core_library_1.FileSystem.exists(jsonFilename)) {
            commandLineJson = node_core_library_1.JsonFile.load(jsonFilename);
            // merge commands specified in command-line.json and default (re)build settings
            // Ensure both build commands are included and preserve any other commands specified
            if (commandLineJson && commandLineJson.commands) {
                for (let i = 0; i < commandLineJson.commands.length; i++) {
                    const command = commandLineJson.commands[i];
                    // Determine if we have a set of default parameters
                    let commandDefaultDefinition = {};
                    switch (command.commandKind) {
                        case RushConstants_1.RushConstants.bulkCommandKind: {
                            switch (command.name) {
                                case RushConstants_1.RushConstants.buildCommandName: {
                                    commandDefaultDefinition = CommandLineConfiguration.defaultBuildCommandJson;
                                    break;
                                }
                                case RushConstants_1.RushConstants.rebuildCommandName: {
                                    commandDefaultDefinition = CommandLineConfiguration.defaultRebuildCommandJson;
                                    break;
                                }
                            }
                            break;
                        }
                    }
                    // Merge the default parameters into the repo-specified parameters
                    commandLineJson.commands[i] = Object.assign(Object.assign({}, commandDefaultDefinition), command);
                }
                CommandLineConfiguration._jsonSchema.validateObject(commandLineJson, jsonFilename);
            }
        }
        return new CommandLineConfiguration(commandLineJson);
    }
}
exports.CommandLineConfiguration = CommandLineConfiguration;
CommandLineConfiguration._jsonSchema = node_core_library_1.JsonSchema.fromFile(path.join(__dirname, '../schemas/command-line.schema.json'));
CommandLineConfiguration.defaultBuildCommandJson = {
    commandKind: RushConstants_1.RushConstants.bulkCommandKind,
    name: RushConstants_1.RushConstants.buildCommandName,
    summary: "Build all projects that haven't been built, or have changed since they were last built.",
    description: 'This command is similar to "rush rebuild", except that "rush build" performs' +
        ' an incremental build. In other words, it only builds projects whose source files have changed' +
        ' since the last successful build. The analysis requires a Git working tree, and only considers' +
        ' source files that are tracked by Git and whose path is under the project folder. (For more details' +
        ' about this algorithm, see the documentation for the "package-deps-hash" NPM package.) The incremental' +
        ' build state is tracked in a per-project folder called ".rush/temp" which should NOT be added to Git. The' +
        ' build command is tracked by the "arguments" field in the "package-deps_build.json" file contained' +
        ' therein; a full rebuild is forced whenever the command has changed (e.g. "--production" or not).',
    enableParallelism: true,
    ignoreMissingScript: false,
    ignoreDependencyOrder: false,
    incremental: true,
    allowWarningsInSuccessfulBuild: false,
    safeForSimultaneousRushProcesses: false
};
CommandLineConfiguration.defaultRebuildCommandJson = {
    commandKind: RushConstants_1.RushConstants.bulkCommandKind,
    name: RushConstants_1.RushConstants.rebuildCommandName,
    summary: 'Clean and rebuild the entire set of projects',
    description: 'This command assumes that the package.json file for each project contains' +
        ' a "scripts" entry for "npm run build" that performs a full clean build.' +
        ' Rush invokes this script to build each project that is registered in rush.json.' +
        ' Projects are built in parallel where possible, but always respecting the dependency' +
        ' graph for locally linked projects.  The number of simultaneous processes will be' +
        ' based on the number of machine cores unless overridden by the --parallelism flag.' +
        ' (For an incremental build, see "rush build" instead of "rush rebuild".)',
    enableParallelism: true,
    ignoreMissingScript: false,
    ignoreDependencyOrder: false,
    incremental: false,
    allowWarningsInSuccessfulBuild: false,
    safeForSimultaneousRushProcesses: false
};
//# sourceMappingURL=CommandLineConfiguration.js.map