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
exports.RushCommandLineParser = void 0;
const safe_1 = __importDefault(require("colors/safe"));
const os = __importStar(require("os"));
const path = __importStar(require("path"));
const ts_command_line_1 = require("@rushstack/ts-command-line");
const node_core_library_1 = require("@rushstack/node-core-library");
const terminal_1 = require("@rushstack/terminal");
const RushConfiguration_1 = require("../api/RushConfiguration");
const RushConstants_1 = require("../logic/RushConstants");
const CommandLineConfiguration_1 = require("../api/CommandLineConfiguration");
const Utilities_1 = require("../utilities/Utilities");
const BaseScriptAction_1 = require("../cli/scriptActions/BaseScriptAction");
const AddAction_1 = require("./actions/AddAction");
const ChangeAction_1 = require("./actions/ChangeAction");
const CheckAction_1 = require("./actions/CheckAction");
const DeployAction_1 = require("./actions/DeployAction");
const InitAction_1 = require("./actions/InitAction");
const InitAutoinstallerAction_1 = require("./actions/InitAutoinstallerAction");
const InitDeployAction_1 = require("./actions/InitDeployAction");
const InstallAction_1 = require("./actions/InstallAction");
const LinkAction_1 = require("./actions/LinkAction");
const ListAction_1 = require("./actions/ListAction");
const PublishAction_1 = require("./actions/PublishAction");
const PurgeAction_1 = require("./actions/PurgeAction");
const ScanAction_1 = require("./actions/ScanAction");
const UnlinkAction_1 = require("./actions/UnlinkAction");
const UpdateAction_1 = require("./actions/UpdateAction");
const UpdateAutoinstallerAction_1 = require("./actions/UpdateAutoinstallerAction");
const VersionAction_1 = require("./actions/VersionAction");
const UpdateCloudCredentialsAction_1 = require("./actions/UpdateCloudCredentialsAction");
const WriteBuildCacheAction_1 = require("./actions/WriteBuildCacheAction");
const BulkScriptAction_1 = require("./scriptActions/BulkScriptAction");
const GlobalScriptAction_1 = require("./scriptActions/GlobalScriptAction");
const Telemetry_1 = require("../logic/Telemetry");
const RushGlobalFolder_1 = require("../api/RushGlobalFolder");
const NodeJsCompatibility_1 = require("../logic/NodeJsCompatibility");
const SetupAction_1 = require("./actions/SetupAction");
const EnvironmentConfiguration_1 = require("../api/EnvironmentConfiguration");
class RushCommandLineParser extends ts_command_line_1.CommandLineParser {
    constructor(options) {
        super({
            toolFilename: 'rush',
            toolDescription: 'Rush makes life easier for JavaScript developers who develop, build, and publish' +
                ' many packages from a central Git repo.  It is designed to handle very large repositories' +
                ' supporting many projects and people.  Rush provides policies, protections, and customizations' +
                ' that help coordinate teams and safely onboard new contributors.  Rush also generates change logs' +
                ' and automates package publishing.  It can manage decoupled subsets of projects with different' +
                ' release and versioning strategies.  A full API is included to facilitate integration with other' +
                ' automation tools.  If you are looking for a proven turnkey solution for monorepo management,' +
                ' Rush is for you.',
            enableTabCompletionAction: true
        });
        this._rushOptions = this._normalizeOptions(options || {});
        try {
            const rushJsonFilename = RushConfiguration_1.RushConfiguration.tryFindRushJsonLocation({
                startingFolder: this._rushOptions.cwd,
                showVerbose: !Utilities_1.Utilities.shouldRestrictConsoleOutput()
            });
            if (rushJsonFilename) {
                this.rushConfiguration = RushConfiguration_1.RushConfiguration.loadFromConfigurationFile(rushJsonFilename);
            }
        }
        catch (error) {
            this._reportErrorAndSetExitCode(error);
        }
        NodeJsCompatibility_1.NodeJsCompatibility.warnAboutCompatibilityIssues({
            isRushLib: true,
            alreadyReportedNodeTooNewError: this._rushOptions.alreadyReportedNodeTooNewError,
            rushConfiguration: this.rushConfiguration
        });
        this._populateActions();
    }
    get isDebug() {
        return this._debugParameter.value;
    }
    flushTelemetry() {
        if (this.telemetry) {
            this.telemetry.flush();
        }
    }
    onDefineParameters() {
        this._debugParameter = this.defineFlagParameter({
            parameterLongName: '--debug',
            parameterShortName: '-d',
            description: 'Show the full call stack if an error occurs while executing the tool'
        });
    }
    async onExecute() {
        // Defensively set the exit code to 1 so if Rush crashes for whatever reason, we'll have a nonzero exit code.
        // For example, Node.js currently has the inexcusable design of terminating with zero exit code when
        // there is an uncaught promise exception.  This will supposedly be fixed in Node.js 9.
        // Ideally we should do this for all the Rush actions, but "rush build" is the most critical one
        // -- if it falsely appears to succeed, we could merge bad PRs, publish empty packages, etc.
        process.exitCode = 1;
        if (this._debugParameter.value) {
            node_core_library_1.InternalError.breakInDebugger = true;
        }
        try {
            await this._wrapOnExecuteAsync();
            // If we make it here, everything went fine, so reset the exit code back to 0
            process.exitCode = 0;
        }
        catch (error) {
            this._reportErrorAndSetExitCode(error);
        }
    }
    _normalizeOptions(options) {
        return {
            cwd: options.cwd || process.cwd(),
            alreadyReportedNodeTooNewError: options.alreadyReportedNodeTooNewError || false
        };
    }
    async _wrapOnExecuteAsync() {
        if (this.rushConfiguration) {
            this.telemetry = new Telemetry_1.Telemetry(this.rushConfiguration);
        }
        await super.onExecute();
        if (this.telemetry) {
            this.flushTelemetry();
        }
    }
    _populateActions() {
        try {
            this.rushGlobalFolder = new RushGlobalFolder_1.RushGlobalFolder();
            // Alphabetical order
            this.addAction(new AddAction_1.AddAction(this));
            this.addAction(new ChangeAction_1.ChangeAction(this));
            this.addAction(new CheckAction_1.CheckAction(this));
            this.addAction(new DeployAction_1.DeployAction(this));
            this.addAction(new InitAction_1.InitAction(this));
            this.addAction(new InitAutoinstallerAction_1.InitAutoinstallerAction(this));
            this.addAction(new InitDeployAction_1.InitDeployAction(this));
            this.addAction(new InstallAction_1.InstallAction(this));
            this.addAction(new LinkAction_1.LinkAction(this));
            this.addAction(new ListAction_1.ListAction(this));
            this.addAction(new PublishAction_1.PublishAction(this));
            this.addAction(new PurgeAction_1.PurgeAction(this));
            this.addAction(new ScanAction_1.ScanAction(this));
            this.addAction(new SetupAction_1.SetupAction(this));
            this.addAction(new UnlinkAction_1.UnlinkAction(this));
            this.addAction(new UpdateAction_1.UpdateAction(this));
            this.addAction(new UpdateAutoinstallerAction_1.UpdateAutoinstallerAction(this));
            this.addAction(new UpdateCloudCredentialsAction_1.UpdateCloudCredentialsAction(this));
            this.addAction(new VersionAction_1.VersionAction(this));
            this.addAction(new WriteBuildCacheAction_1.WriteBuildCacheAction(this));
            this._populateScriptActions();
        }
        catch (error) {
            this._reportErrorAndSetExitCode(error);
        }
    }
    _populateScriptActions() {
        let commandLineConfiguration = undefined;
        // If there is not a rush.json file, we still want "build" and "rebuild" to appear in the
        // command-line help
        if (this.rushConfiguration) {
            const commandLineConfigFilePath = path.join(this.rushConfiguration.commonRushConfigFolder, RushConstants_1.RushConstants.commandLineFilename);
            commandLineConfiguration = CommandLineConfiguration_1.CommandLineConfiguration.loadFromFileOrDefault(commandLineConfigFilePath);
        }
        // Build actions from the command line configuration supersede default build actions.
        this._addCommandLineConfigActions(commandLineConfiguration);
        this._addDefaultBuildActions(commandLineConfiguration);
        this._validateCommandLineConfigParameterAssociations(commandLineConfiguration);
    }
    _addDefaultBuildActions(commandLineConfiguration) {
        if (!this.tryGetAction(RushConstants_1.RushConstants.buildCommandName)) {
            this._addCommandLineConfigAction(commandLineConfiguration, CommandLineConfiguration_1.CommandLineConfiguration.defaultBuildCommandJson);
        }
        if (!this.tryGetAction(RushConstants_1.RushConstants.rebuildCommandName)) {
            this._addCommandLineConfigAction(commandLineConfiguration, CommandLineConfiguration_1.CommandLineConfiguration.defaultRebuildCommandJson, RushConstants_1.RushConstants.buildCommandName);
        }
    }
    _addCommandLineConfigActions(commandLineConfiguration) {
        if (!commandLineConfiguration) {
            return;
        }
        // Register each custom command
        for (const command of commandLineConfiguration.commands) {
            this._addCommandLineConfigAction(commandLineConfiguration, command);
        }
    }
    _addCommandLineConfigAction(commandLineConfiguration, command, commandToRun) {
        if (this.tryGetAction(command.name)) {
            throw new Error(`${RushConstants_1.RushConstants.commandLineFilename} defines a command "${command.name}"` +
                ` using a name that already exists`);
        }
        this._validateCommandLineConfigCommand(command);
        const overrideAllowWarnings = this.rushConfiguration && EnvironmentConfiguration_1.EnvironmentConfiguration.allowWarningsInSuccessfulBuild;
        switch (command.commandKind) {
            case RushConstants_1.RushConstants.bulkCommandKind:
                this.addAction(new BulkScriptAction_1.BulkScriptAction({
                    actionName: command.name,
                    // By default, the "rebuild" action runs the "build" script. However, if the command-line.json file
                    // overrides "rebuild," the "rebuild" script should be run.
                    commandToRun: commandToRun,
                    summary: command.summary,
                    documentation: command.description || command.summary,
                    safeForSimultaneousRushProcesses: command.safeForSimultaneousRushProcesses,
                    parser: this,
                    commandLineConfiguration: commandLineConfiguration,
                    enableParallelism: command.enableParallelism,
                    ignoreMissingScript: command.ignoreMissingScript || false,
                    ignoreDependencyOrder: command.ignoreDependencyOrder || false,
                    incremental: command.incremental || false,
                    allowWarningsInSuccessfulBuild: overrideAllowWarnings || !!command.allowWarningsInSuccessfulBuild,
                    watchForChanges: command.watchForChanges || false,
                    disableBuildCache: command.disableBuildCache || false
                }));
                break;
            case RushConstants_1.RushConstants.globalCommandKind:
                this.addAction(new GlobalScriptAction_1.GlobalScriptAction({
                    actionName: command.name,
                    summary: command.summary,
                    documentation: command.description || command.summary,
                    safeForSimultaneousRushProcesses: command.safeForSimultaneousRushProcesses,
                    parser: this,
                    commandLineConfiguration: commandLineConfiguration,
                    shellCommand: command.shellCommand,
                    autoinstallerName: command.autoinstallerName
                }));
                break;
            default:
                throw new Error(`${RushConstants_1.RushConstants.commandLineFilename} defines a command "${command.name}"` +
                    ` using an unsupported command kind "${command.commandKind}"`);
        }
    }
    _validateCommandLineConfigParameterAssociations(commandLineConfiguration) {
        if (!commandLineConfiguration) {
            return;
        }
        // Check for any invalid associations
        for (const parameter of commandLineConfiguration.parameters) {
            for (const associatedCommand of parameter.associatedCommands) {
                const action = this.tryGetAction(associatedCommand);
                if (!action) {
                    throw new Error(`${RushConstants_1.RushConstants.commandLineFilename} defines a parameter "${parameter.longName}"` +
                        ` that is associated with a nonexistent command "${associatedCommand}"`);
                }
                if (!(action instanceof BaseScriptAction_1.BaseScriptAction)) {
                    throw new Error(`${RushConstants_1.RushConstants.commandLineFilename} defines a parameter "${parameter.longName}"` +
                        ` that is associated with a command "${associatedCommand}", but that command does not` +
                        ` support custom parameters`);
                }
            }
        }
    }
    _validateCommandLineConfigCommand(command) {
        // There are some restrictions on the 'build' and 'rebuild' commands.
        if (command.name !== RushConstants_1.RushConstants.buildCommandName &&
            command.name !== RushConstants_1.RushConstants.rebuildCommandName) {
            return;
        }
        if (command.commandKind === RushConstants_1.RushConstants.globalCommandKind) {
            throw new Error(`${RushConstants_1.RushConstants.commandLineFilename} defines a command "${command.name}" using ` +
                `the command kind "${RushConstants_1.RushConstants.globalCommandKind}". This command can only be designated as a command ` +
                `kind "${RushConstants_1.RushConstants.bulkCommandKind}".`);
        }
        if (command.safeForSimultaneousRushProcesses) {
            throw new Error(`${RushConstants_1.RushConstants.commandLineFilename} defines a command "${command.name}" using ` +
                `"safeForSimultaneousRushProcesses=true". This configuration is not supported for "${command.name}".`);
        }
    }
    _reportErrorAndSetExitCode(error) {
        if (!(error instanceof node_core_library_1.AlreadyReportedError)) {
            const prefix = 'ERROR: ';
            console.error(os.EOL + safe_1.default.red(terminal_1.PrintUtilities.wrapWords(prefix + error.message)));
        }
        if (this._debugParameter.value) {
            // If catchSyncErrors() called this, then show a call stack similar to what Node.js
            // would show for an uncaught error
            console.error(os.EOL + error.stack);
        }
        this.flushTelemetry();
        // Ideally we want to eliminate all calls to process.exit() from our code, and replace them
        // with normal control flow that properly cleans up its data structures.
        // For this particular call, we have a problem that the RushCommandLineParser constructor
        // performs nontrivial work that can throw an exception.  Either the Rush class would need
        // to handle reporting for those exceptions, or else _populateActions() should be moved
        // to a RushCommandLineParser lifecycle stage that can handle it.
        if (process.exitCode !== undefined) {
            process.exit(process.exitCode);
        }
        else {
            process.exit(1);
        }
    }
}
exports.RushCommandLineParser = RushCommandLineParser;
//# sourceMappingURL=RushCommandLineParser.js.map