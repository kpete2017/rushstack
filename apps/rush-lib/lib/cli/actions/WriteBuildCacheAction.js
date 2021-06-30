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
exports.WriteBuildCacheAction = void 0;
const path = __importStar(require("path"));
const node_core_library_1 = require("@rushstack/node-core-library");
const BaseRushAction_1 = require("./BaseRushAction");
const BuildCacheConfiguration_1 = require("../../api/BuildCacheConfiguration");
const ProjectBuilder_1 = require("../../logic/taskRunner/ProjectBuilder");
const PackageChangeAnalyzer_1 = require("../../logic/PackageChangeAnalyzer");
const Utilities_1 = require("../../utilities/Utilities");
const TaskSelector_1 = require("../../logic/TaskSelector");
const RushConstants_1 = require("../../logic/RushConstants");
const CommandLineConfiguration_1 = require("../../api/CommandLineConfiguration");
class WriteBuildCacheAction extends BaseRushAction_1.BaseRushAction {
    constructor(parser) {
        super({
            actionName: 'write-build-cache',
            summary: 'Writes the current state of the current project to the cache.',
            documentation: '(EXPERIMENTAL) If the build cache is configured, when this command is run in the folder of ' +
                'a project, write the current state of the project to the cache.',
            safeForSimultaneousRushProcesses: true,
            parser
        });
    }
    onDefineParameters() {
        this._command = this.defineStringParameter({
            parameterLongName: '--command',
            parameterShortName: '-c',
            required: true,
            argumentName: 'COMMAND',
            description: '(Required) The command run in the current project that produced the current project state.'
        });
        this._verboseFlag = this.defineFlagParameter({
            parameterLongName: '--verbose',
            parameterShortName: '-v',
            description: 'Display verbose log information.'
        });
    }
    async runAsync() {
        const project = this.rushConfiguration.tryGetProjectForPath(process.cwd());
        if (!project) {
            throw new Error(`The "rush ${this.actionName}" command must be invoked under a project` +
                ` folder that is registered in rush.json.`);
        }
        const terminal = new node_core_library_1.Terminal(new node_core_library_1.ConsoleTerminalProvider({ verboseEnabled: this._verboseFlag.value }));
        const buildCacheConfiguration = await BuildCacheConfiguration_1.BuildCacheConfiguration.loadAndRequireEnabledAsync(terminal, this.rushConfiguration);
        const command = this._command.value;
        const commandToRun = TaskSelector_1.TaskSelector.getScriptToRun(project, command, []);
        const packageChangeAnalyzer = new PackageChangeAnalyzer_1.PackageChangeAnalyzer(this.rushConfiguration);
        const projectBuilder = new ProjectBuilder_1.ProjectBuilder({
            rushProject: project,
            rushConfiguration: this.rushConfiguration,
            buildCacheConfiguration,
            commandName: command,
            commandToRun: commandToRun || '',
            isIncrementalBuildAllowed: false,
            packageChangeAnalyzer,
            packageDepsFilename: Utilities_1.Utilities.getPackageDepsFilenameForCommand(command)
        });
        const trackedFiles = Array.from((await packageChangeAnalyzer.getPackageDeps(project.packageName, terminal)).keys());
        const commandLineConfigFilePath = path.join(this.rushConfiguration.commonRushConfigFolder, RushConstants_1.RushConstants.commandLineFilename);
        const repoCommandLineConfiguration = CommandLineConfiguration_1.CommandLineConfiguration.loadFromFileOrDefault(commandLineConfigFilePath);
        const cacheWriteSuccess = await projectBuilder.tryWriteCacheEntryAsync(terminal, trackedFiles, repoCommandLineConfiguration);
        if (cacheWriteSuccess === undefined) {
            terminal.writeErrorLine('This project does not support caching or Git is not present.');
            throw new node_core_library_1.AlreadyReportedError();
        }
        else if (cacheWriteSuccess === false) {
            terminal.writeErrorLine('Writing cache entry failed.');
        }
    }
}
exports.WriteBuildCacheAction = WriteBuildCacheAction;
//# sourceMappingURL=WriteBuildCacheAction.js.map