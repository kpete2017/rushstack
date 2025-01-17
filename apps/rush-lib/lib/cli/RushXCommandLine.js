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
exports.RushXCommandLine = void 0;
const safe_1 = __importDefault(require("colors/safe"));
const os = __importStar(require("os"));
const path = __importStar(require("path"));
const node_core_library_1 = require("@rushstack/node-core-library");
const terminal_1 = require("@rushstack/terminal");
const Utilities_1 = require("../utilities/Utilities");
const ProjectCommandSet_1 = require("../logic/ProjectCommandSet");
const RushConfiguration_1 = require("../api/RushConfiguration");
const NodeJsCompatibility_1 = require("../logic/NodeJsCompatibility");
class RushXCommandLine {
    static launchRushX(launcherVersion, isManaged) {
        RushXCommandLine._launchRushXInternal(launcherVersion, { isManaged });
    }
    /**
     * @internal
     */
    static _launchRushXInternal(launcherVersion, options) {
        // Node.js can sometimes accidentally terminate with a zero exit code  (e.g. for an uncaught
        // promise exception), so we start with the assumption that the exit code is 1
        // and set it to 0 only on success.
        process.exitCode = 1;
        try {
            // Are we in a Rush repo?
            let rushConfiguration = undefined;
            if (RushConfiguration_1.RushConfiguration.tryFindRushJsonLocation()) {
                rushConfiguration = RushConfiguration_1.RushConfiguration.loadFromDefaultLocation({ showVerbose: true });
            }
            NodeJsCompatibility_1.NodeJsCompatibility.warnAboutCompatibilityIssues({
                isRushLib: true,
                alreadyReportedNodeTooNewError: !!options.alreadyReportedNodeTooNewError,
                rushConfiguration
            });
            // Find the governing package.json for this folder:
            const packageJsonLookup = new node_core_library_1.PackageJsonLookup();
            const packageJsonFilePath = packageJsonLookup.tryGetPackageJsonFilePathFor(process.cwd());
            if (!packageJsonFilePath) {
                console.log(safe_1.default.red('This command should be used inside a project folder.'));
                console.log(`Unable to find a package.json file in the current working directory or any of its parents.`);
                return;
            }
            if (rushConfiguration && !rushConfiguration.tryGetProjectForPath(process.cwd())) {
                // GitHub #2713: Users reported confusion resulting from a situation where "rush install"
                // did not install the project's dependencies, because the project was not registered.
                console.log(safe_1.default.yellow('Warning: You are invoking "rushx" inside a Rush repository, but this project is not registered in rush.json.'));
            }
            const packageJson = packageJsonLookup.loadPackageJson(packageJsonFilePath);
            const projectCommandSet = new ProjectCommandSet_1.ProjectCommandSet(packageJson);
            // 0 = node.exe
            // 1 = rushx
            const args = process.argv.slice(2);
            // Check for the following types of things:
            //   rush
            //   rush --help
            //   rush -h
            //   rush --unrecognized-option
            if (args.length === 0 || args[0][0] === '-') {
                RushXCommandLine._showUsage(packageJson, projectCommandSet);
                return;
            }
            const commandName = args[0];
            const scriptBody = projectCommandSet.tryGetScriptBody(commandName);
            if (scriptBody === undefined) {
                console.log(safe_1.default.red(`Error: The command "${commandName}" is not defined in the` +
                    ` package.json file for this project.`));
                if (projectCommandSet.commandNames.length > 0) {
                    console.log(os.EOL +
                        'Available commands for this project are: ' +
                        projectCommandSet.commandNames.map((x) => `"${x}"`).join(', '));
                }
                console.log(`Use ${safe_1.default.yellow('"rushx --help"')} for more information.`);
                return;
            }
            const remainingArgs = args.slice(1);
            let commandWithArgs = scriptBody;
            let commandWithArgsForDisplay = scriptBody;
            if (remainingArgs.length > 0) {
                // This approach is based on what NPM 7 now does:
                // https://github.com/npm/run-script/blob/47a4d539fb07220e7215cc0e482683b76407ef9b/lib/run-script-pkg.js#L34
                const escapedRemainingArgs = remainingArgs.map((x) => Utilities_1.Utilities.escapeShellParameter(x));
                commandWithArgs += ' ' + escapedRemainingArgs.join(' ');
                // Display it nicely without the extra quotes
                commandWithArgsForDisplay += ' ' + remainingArgs.join(' ');
            }
            console.log('Executing: ' + JSON.stringify(commandWithArgsForDisplay) + os.EOL);
            const packageFolder = path.dirname(packageJsonFilePath);
            const exitCode = Utilities_1.Utilities.executeLifecycleCommand(commandWithArgs, {
                rushConfiguration,
                workingDirectory: packageFolder,
                // If there is a rush.json then use its .npmrc from the temp folder.
                // Otherwise look for npmrc in the project folder.
                initCwd: rushConfiguration ? rushConfiguration.commonTempFolder : packageFolder,
                handleOutput: false,
                environmentPathOptions: {
                    includeProjectBin: true
                }
            });
            if (exitCode > 0) {
                console.log(safe_1.default.red(`The script failed with exit code ${exitCode}`));
            }
            process.exitCode = exitCode;
        }
        catch (error) {
            console.log(safe_1.default.red('Error: ' + error.message));
        }
    }
    static _showUsage(packageJson, projectCommandSet) {
        console.log('usage: rushx [-h]');
        console.log('       rushx <command> ...' + os.EOL);
        console.log('Optional arguments:');
        console.log('  -h, --help            Show this help message and exit.' + os.EOL);
        if (projectCommandSet.commandNames.length > 0) {
            console.log(`Project commands for ${safe_1.default.cyan(packageJson.name)}:`);
            // Calculate the length of the longest script name, for formatting
            let maxLength = 0;
            for (const commandName of projectCommandSet.commandNames) {
                maxLength = Math.max(maxLength, commandName.length);
            }
            for (const commandName of projectCommandSet.commandNames) {
                const escapedScriptBody = JSON.stringify(projectCommandSet.getScriptBody(commandName));
                // The length of the string e.g. "  command: "
                const firstPartLength = 2 + maxLength + 2;
                // The length for truncating the escaped escapedScriptBody so it doesn't wrap
                // to the next line
                const consoleWidth = terminal_1.PrintUtilities.getConsoleWidth() || terminal_1.DEFAULT_CONSOLE_WIDTH;
                const truncateLength = Math.max(0, consoleWidth - firstPartLength) - 1;
                console.log(
                // Example: "  command: "
                '  ' +
                    safe_1.default.cyan(node_core_library_1.Text.padEnd(commandName + ':', maxLength + 2)) +
                    // Example: "do some thin..."
                    node_core_library_1.Text.truncateWithEllipsis(escapedScriptBody, truncateLength));
            }
            if (projectCommandSet.malformedScriptNames.length > 0) {
                console.log(os.EOL +
                    safe_1.default.yellow('Warning: Some "scripts" entries in the package.json file' +
                        ' have malformed names: ' +
                        projectCommandSet.malformedScriptNames.map((x) => `"${x}"`).join(', ')));
            }
        }
        else {
            console.log(safe_1.default.yellow('Warning: No commands are defined yet for this project.'));
            console.log('You can define a command by adding a "scripts" table to the project\'s package.json file.');
        }
    }
}
exports.RushXCommandLine = RushXCommandLine;
//# sourceMappingURL=RushXCommandLine.js.map