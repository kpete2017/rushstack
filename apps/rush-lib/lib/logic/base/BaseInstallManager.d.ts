import { AsyncRecycler } from '../../utilities/AsyncRecycler';
import { BaseShrinkwrapFile } from '../base/BaseShrinkwrapFile';
import { PurgeManager } from '../PurgeManager';
import { RushConfiguration } from '../../api/RushConfiguration';
import { RushGlobalFolder } from '../../api/RushGlobalFolder';
export interface IInstallManagerOptions {
    /**
     * Whether the global "--debug" flag was specified.
     */
    debug: boolean;
    /**
     * Whether or not Rush will automatically update the shrinkwrap file.
     * True for "rush update", false for "rush install".
     */
    allowShrinkwrapUpdates: boolean;
    /**
     * Whether to skip policy checks.
     */
    bypassPolicy: boolean;
    /**
     * Whether to skip linking, i.e. require "rush link" to be done manually later.
     */
    noLink: boolean;
    /**
     * Whether to delete the shrinkwrap file before installation, i.e. so that all dependencies
     * will be upgraded to the latest SemVer-compatible version.
     */
    fullUpgrade: boolean;
    /**
     * Whether to force an update to the shrinkwrap file even if it appears to be unnecessary.
     * Normally Rush uses heuristics to determine when "pnpm install" can be skipped,
     * but sometimes the heuristics can be inaccurate due to external influences
     * (pnpmfile.js script logic, registry changes, etc).
     */
    recheckShrinkwrap: boolean;
    /**
     * The value of the "--network-concurrency" command-line parameter, which
     * is a diagnostic option used to troubleshoot network failures.
     *
     * Currently only supported for PNPM.
     */
    networkConcurrency: number | undefined;
    /**
     * Whether or not to collect verbose logs from the package manager.
     * If specified when using PNPM, the logs will be in /common/temp/pnpm.log
     */
    collectLogFile: boolean;
    /**
     * The variant to consider when performing installations and validating shrinkwrap updates.
     */
    variant?: string | undefined;
    /**
     * Retry the install the specified number of times
     */
    maxInstallAttempts: number;
    /**
     * Filters to be passed to PNPM during installation, if applicable.
     * These restrict the scope of a workspace installation.
     */
    pnpmFilterArguments: string[];
}
/**
 * This class implements common logic between "rush install" and "rush update".
 */
export declare abstract class BaseInstallManager {
    private _rushConfiguration;
    private _rushGlobalFolder;
    private _commonTempInstallFlag;
    private _commonTempLinkFlag;
    private _installRecycler;
    private _npmSetupValidated;
    private _syncNpmrcAlreadyCalled;
    private _options;
    constructor(rushConfiguration: RushConfiguration, rushGlobalFolder: RushGlobalFolder, purgeManager: PurgeManager, options: IInstallManagerOptions);
    protected get rushConfiguration(): RushConfiguration;
    protected get rushGlobalFolder(): RushGlobalFolder;
    protected get installRecycler(): AsyncRecycler;
    protected get options(): IInstallManagerOptions;
    doInstallAsync(): Promise<void>;
    protected abstract prepareCommonTempAsync(shrinkwrapFile: BaseShrinkwrapFile | undefined): Promise<{
        shrinkwrapIsUpToDate: boolean;
        shrinkwrapWarnings: string[];
    }>;
    protected abstract installAsync(cleanInstall: boolean): Promise<void>;
    protected abstract postInstallAsync(): Promise<void>;
    protected canSkipInstall(lastModifiedDate: Date): boolean;
    protected prepareAsync(): Promise<{
        variantIsUpToDate: boolean;
        shrinkwrapIsUpToDate: boolean;
    }>;
    /**
     * Used when invoking the NPM tool.  Appends the common configuration options
     * to the command-line.
     */
    protected pushConfigurationArgs(args: string[], options: IInstallManagerOptions): void;
    private _checkIfReleaseIsPublished;
    private _queryIfReleaseIsPublishedAsync;
    private _syncTempShrinkwrap;
    protected validateNpmSetup(): Promise<void>;
}
//# sourceMappingURL=BaseInstallManager.d.ts.map