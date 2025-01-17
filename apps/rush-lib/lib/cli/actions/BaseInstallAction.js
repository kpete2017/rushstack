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
exports.BaseInstallAction = void 0;
const safe_1 = __importDefault(require("colors/safe"));
const os = __importStar(require("os"));
const node_core_library_1 = require("@rushstack/node-core-library");
const BaseRushAction_1 = require("./BaseRushAction");
const EventHooks_1 = require("../../api/EventHooks");
const PurgeManager_1 = require("../../logic/PurgeManager");
const SetupChecks_1 = require("../../logic/SetupChecks");
const StandardScriptUpdater_1 = require("../../logic/StandardScriptUpdater");
const Stopwatch_1 = require("../../utilities/Stopwatch");
const VersionMismatchFinder_1 = require("../../logic/versionMismatch/VersionMismatchFinder");
const Variants_1 = require("../../api/Variants");
const RushConstants_1 = require("../../logic/RushConstants");
const installManagerFactoryModule = node_core_library_1.Import.lazy('../../logic/InstallManagerFactory', require);
/**
 * This is the common base class for InstallAction and UpdateAction.
 */
class BaseInstallAction extends BaseRushAction_1.BaseRushAction {
    onDefineParameters() {
        this._purgeParameter = this.defineFlagParameter({
            parameterLongName: '--purge',
            parameterShortName: '-p',
            description: 'Perform "rush purge" before starting the installation'
        });
        this._bypassPolicyParameter = this.defineFlagParameter({
            parameterLongName: '--bypass-policy',
            description: 'Overrides enforcement of the "gitPolicy" rules from rush.json (use honorably!)'
        });
        this._noLinkParameter = this.defineFlagParameter({
            parameterLongName: '--no-link',
            description: 'If "--no-link" is specified, then project symlinks will NOT be created' +
                ' after the installation completes.  You will need to run "rush link" manually.' +
                ' This flag is useful for automated builds that want to report stages individually' +
                ' or perform extra operations in between the two stages. This flag is not supported' +
                ' when using workspaces.'
        });
        this._networkConcurrencyParameter = this.defineIntegerParameter({
            parameterLongName: '--network-concurrency',
            argumentName: 'COUNT',
            description: 'If specified, limits the maximum number of concurrent network requests.' +
                '  This is useful when troubleshooting network failures.'
        });
        this._debugPackageManagerParameter = this.defineFlagParameter({
            parameterLongName: '--debug-package-manager',
            description: 'Activates verbose logging for the package manager. You will probably want to pipe' +
                ' the output of Rush to a file when using this command.'
        });
        this._maxInstallAttempts = this.defineIntegerParameter({
            parameterLongName: '--max-install-attempts',
            argumentName: 'NUMBER',
            description: `Overrides the default maximum number of install attempts.`,
            defaultValue: RushConstants_1.RushConstants.defaultMaxInstallAttempts
        });
        this._ignoreHooksParameter = this.defineFlagParameter({
            parameterLongName: '--ignore-hooks',
            description: `Skips execution of the "eventHooks" scripts defined in rush.json. Make sure you know what you are skipping.`
        });
        this._variant = this.defineStringParameter(Variants_1.Variants.VARIANT_PARAMETER);
    }
    async runAsync() {
        VersionMismatchFinder_1.VersionMismatchFinder.ensureConsistentVersions(this.rushConfiguration, {
            variant: this._variant.value
        });
        const stopwatch = Stopwatch_1.Stopwatch.start();
        SetupChecks_1.SetupChecks.validate(this.rushConfiguration);
        let warnAboutScriptUpdate = false;
        if (this.actionName === 'update') {
            warnAboutScriptUpdate = StandardScriptUpdater_1.StandardScriptUpdater.update(this.rushConfiguration);
        }
        else {
            StandardScriptUpdater_1.StandardScriptUpdater.validate(this.rushConfiguration);
        }
        this.eventHooksManager.handle(EventHooks_1.Event.preRushInstall, this.parser.isDebug, this._ignoreHooksParameter.value);
        const purgeManager = new PurgeManager_1.PurgeManager(this.rushConfiguration, this.rushGlobalFolder);
        if (this._purgeParameter.value) {
            console.log('The --purge flag was specified, so performing "rush purge"');
            purgeManager.purgeNormal();
            console.log('');
        }
        if (this._networkConcurrencyParameter.value) {
            if (this.rushConfiguration.packageManager !== 'pnpm') {
                throw new Error(`The "${this._networkConcurrencyParameter.longName}" parameter is` +
                    ` only supported when using the PNPM package manager.`);
            }
        }
        // Because the 'defaultValue' option on the _maxInstallAttempts parameter is set,
        // it is safe to assume that the value is not null
        if (this._maxInstallAttempts.value < 1) {
            throw new Error(`The value of "${this._maxInstallAttempts.longName}" must be positive and nonzero.`);
        }
        const installManagerOptions = this.buildInstallOptions();
        const installManager = installManagerFactoryModule.InstallManagerFactory.getInstallManager(this.rushConfiguration, this.rushGlobalFolder, purgeManager, installManagerOptions);
        let installSuccessful = true;
        try {
            await installManager.doInstallAsync();
            this.eventHooksManager.handle(EventHooks_1.Event.postRushInstall, this.parser.isDebug, this._ignoreHooksParameter.value);
            if (warnAboutScriptUpdate) {
                console.log(os.EOL +
                    safe_1.default.yellow('Rush refreshed some files in the "common/scripts" folder.' +
                        '  Please commit this change to Git.'));
            }
            console.log(os.EOL + safe_1.default.green(`Rush ${this.actionName} finished successfully. (${stopwatch.toString()})`));
        }
        catch (error) {
            installSuccessful = false;
            throw error;
        }
        finally {
            purgeManager.deleteAll();
            stopwatch.stop();
            this._collectTelemetry(stopwatch, installManagerOptions, installSuccessful);
        }
    }
    _collectTelemetry(stopwatch, installManagerOptions, success) {
        if (this.parser.telemetry) {
            this.parser.telemetry.log({
                name: 'install',
                duration: stopwatch.duration,
                result: success ? 'Succeeded' : 'Failed',
                extraData: {
                    mode: this.actionName,
                    clean: (!!this._purgeParameter.value).toString(),
                    full: installManagerOptions.fullUpgrade.toString()
                }
            });
        }
    }
}
exports.BaseInstallAction = BaseInstallAction;
//# sourceMappingURL=BaseInstallAction.js.map