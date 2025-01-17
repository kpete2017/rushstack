import { BaseInstallManager, IInstallManagerOptions } from '../base/BaseInstallManager';
import { BaseShrinkwrapFile } from '../../logic/base/BaseShrinkwrapFile';
import { RushGlobalFolder } from '../../api/RushGlobalFolder';
import { RushConfiguration } from '../..';
import { PurgeManager } from '../PurgeManager';
/**
 * The "noMtime" flag is new in tar@4.4.1 and not available yet for \@types/tar.
 * As a temporary workaround, augment the type.
 */
declare module 'tar' {
    interface CreateOptions {
        /**
         * "Set to true to omit writing mtime values for entries. Note that this prevents using other
         * mtime-based features like tar.update or the keepNewer option with the resulting tar archive."
         */
        noMtime?: boolean;
    }
}
/**
 * This class implements common logic between "rush install" and "rush update".
 */
export declare class RushInstallManager extends BaseInstallManager {
    private _tempProjectHelper;
    constructor(rushConfiguration: RushConfiguration, rushGlobalFolder: RushGlobalFolder, purgeManager: PurgeManager, options: IInstallManagerOptions);
    /**
     * Regenerates the common/package.json and all temp_modules projects.
     * If shrinkwrapFile is provided, this function also validates whether it contains
     * everything we need to install and returns true if so; in all other cases,
     * the return value is false.
     *
     * @override
     */
    prepareCommonTempAsync(shrinkwrapFile: BaseShrinkwrapFile | undefined): Promise<{
        shrinkwrapIsUpToDate: boolean;
        shrinkwrapWarnings: string[];
    }>;
    private _revertWorkspaceNotation;
    private _validateRushProjectTarballIntegrityAsync;
    /**
     * Check whether or not the install is already valid, and therefore can be skipped.
     *
     * @override
     */
    protected canSkipInstall(lastModifiedDate: Date): boolean;
    /**
     * Runs "npm/pnpm/yarn install" in the "common/temp" folder.
     *
     * @override
     */
    protected installAsync(cleanInstall: boolean): Promise<void>;
    protected postInstallAsync(): Promise<void>;
    /**
     * This is a workaround for a bug introduced in NPM 5 (and still unfixed as of NPM 5.5.1):
     * https://github.com/npm/npm/issues/19006
     *
     * The regression is that "npm install" sets the package.json "version" field for the
     * @rush-temp projects to a value like "file:projects/example.tgz", when it should be "0.0.0".
     * This causes linking to fail later, when read-package-tree tries to parse the bad version.
     * The error looks like this:
     *
     * ERROR: Failed to parse package.json for foo: Invalid version: "file:projects/example.tgz"
     *
     * Our workaround is to rewrite the package.json files for each of the @rush-temp projects
     * in the node_modules folder, after "npm install" completes.
     */
    private _fixupNpm5Regression;
    /**
     * Checks for temp projects that exist in the shrinkwrap file, but don't exist
     * in rush.json.  This might occur, e.g. if a project was recently deleted or renamed.
     *
     * @returns true if orphans were found, or false if everything is okay
     */
    private _findMissingTempProjects;
}
//# sourceMappingURL=RushInstallManager.d.ts.map