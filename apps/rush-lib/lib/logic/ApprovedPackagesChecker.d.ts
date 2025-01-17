import { RushConfiguration } from '../api/RushConfiguration';
export declare class ApprovedPackagesChecker {
    private readonly _rushConfiguration;
    private _approvedPackagesPolicy;
    private _filesAreOutOfDate;
    constructor(rushConfiguration: RushConfiguration);
    /**
     * If true, the files on disk are out of date.
     */
    get approvedPackagesFilesAreOutOfDate(): boolean;
    /**
     * Examines the current dependencies for the projects specified in RushConfiguration,
     * and then adds them to the 'browser-approved-packages.json' and
     * 'nonbrowser-approved-packages.json' config files.  If these files don't exist,
     * they will be created.
     *
     * If the "approvedPackagesPolicy" feature is not enabled, then no action is taken.
     */
    rewriteConfigFiles(): void;
    private _updateApprovedPackagesPolicy;
    private _collectDependencies;
}
//# sourceMappingURL=ApprovedPackagesChecker.d.ts.map