"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Rush = void 0;
const os_1 = require("os");
const safe_1 = __importDefault(require("colors/safe"));
const node_core_library_1 = require("@rushstack/node-core-library");
const RushCommandLineParser_1 = require("../cli/RushCommandLineParser");
const RushConstants_1 = require("../logic/RushConstants");
const RushXCommandLine_1 = require("../cli/RushXCommandLine");
const CommandLineMigrationAdvisor_1 = require("../cli/CommandLineMigrationAdvisor");
const NodeJsCompatibility_1 = require("../logic/NodeJsCompatibility");
const Utilities_1 = require("../utilities/Utilities");
/**
 * General operations for the Rush engine.
 *
 * @public
 */
class Rush {
    /**
     * This API is used by the `@microsoft/rush` front end to launch the "rush" command-line.
     * Third-party tools should not use this API.  Instead, they should execute the "rush" binary
     * and start a new Node.js process.
     *
     * @param launcherVersion - The version of the `@microsoft/rush` wrapper used to call invoke the CLI.
     *
     * @remarks
     * Earlier versions of the rush frontend used a different API contract. In the old contract,
     * the second argument was the `isManaged` value of the {@link ILaunchOptions} object.
     *
     * Even though this API isn't documented, it is still supported for legacy compatibility.
     */
    static launch(launcherVersion, arg) {
        const options = Rush._normalizeLaunchOptions(arg);
        if (!Utilities_1.Utilities.shouldRestrictConsoleOutput()) {
            Rush._printStartupBanner(options.isManaged);
        }
        if (!CommandLineMigrationAdvisor_1.CommandLineMigrationAdvisor.checkArgv(process.argv)) {
            // The migration advisor recognized an obsolete command-line
            process.exitCode = 1;
            return;
        }
        Rush._assignRushInvokedFolder();
        const parser = new RushCommandLineParser_1.RushCommandLineParser({
            alreadyReportedNodeTooNewError: options.alreadyReportedNodeTooNewError
        });
        parser.execute().catch(console.error); // CommandLineParser.execute() should never reject the promise
    }
    /**
     * This API is used by the `@microsoft/rush` front end to launch the "rushx" command-line.
     * Third-party tools should not use this API.  Instead, they should execute the "rushx" binary
     * and start a new Node.js process.
     *
     * @param launcherVersion - The version of the `@microsoft/rush` wrapper used to call invoke the CLI.
     */
    static launchRushX(launcherVersion, options) {
        options = Rush._normalizeLaunchOptions(options);
        Rush._printStartupBanner(options.isManaged);
        Rush._assignRushInvokedFolder();
        RushXCommandLine_1.RushXCommandLine._launchRushXInternal(launcherVersion, Object.assign({}, options));
    }
    /**
     * The currently executing version of the "rush-lib" library.
     * This is the same as the Rush tool version for that release.
     */
    static get version() {
        if (!this._version) {
            this._version = node_core_library_1.PackageJsonLookup.loadOwnPackageJson(__dirname).version;
        }
        return this._version;
    }
    /**
     * Assign the `RUSH_INVOKED_FOLDER` environment variable during startup.  This is only applied when
     * Rush is invoked via the CLI, not via the `@microsoft/rush-lib` automation API.
     *
     * @remarks
     * Modifying the parent process's environment is not a good design.  The better design is (1) to consolidate
     * Rush's code paths that invoke scripts, and (2) to pass down the invoked folder with each code path,
     * so that it can finally be applied in a centralized helper like `Utilities._createEnvironmentForRushCommand()`.
     * The natural time to do that refactoring is when we rework `Utilities.executeCommand()` to use
     * `Executable.spawn()` or rushell.
     */
    static _assignRushInvokedFolder() {
        process.env["RUSH_INVOKED_FOLDER" /* RUSH_INVOKED_FOLDER */] = process.cwd();
    }
    /**
     * This function normalizes legacy options to the current {@link ILaunchOptions} object.
     */
    static _normalizeLaunchOptions(arg) {
        return typeof arg === 'boolean'
            ? { isManaged: arg } // In older versions of Rush, this the `launch` functions took a boolean arg for "isManaged"
            : arg;
    }
    static _printStartupBanner(isManaged) {
        const nodeVersion = process.versions.node;
        const nodeReleaseLabel = NodeJsCompatibility_1.NodeJsCompatibility.isOddNumberedVersion
            ? 'unstable'
            : NodeJsCompatibility_1.NodeJsCompatibility.isLtsVersion
                ? 'LTS'
                : 'pre-LTS';
        console.log(os_1.EOL +
            safe_1.default.bold(`Rush Multi-Project Build Tool ${Rush.version}` + safe_1.default.yellow(isManaged ? '' : ' (unmanaged)')) +
            safe_1.default.cyan(` - ${RushConstants_1.RushConstants.rushWebSiteUrl}`) +
            os_1.EOL +
            `Node.js version is ${nodeVersion} (${nodeReleaseLabel})` +
            os_1.EOL);
    }
}
exports.Rush = Rush;
Rush._version = undefined;
//# sourceMappingURL=Rush.js.map