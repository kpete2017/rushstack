import { ApprovedPackagesConfiguration } from './ApprovedPackagesConfiguration';
import { RushConfiguration, IRushConfigurationJson } from './RushConfiguration';
/**
 * This is a helper object for RushConfiguration.
 * It exposes the "approvedPackagesPolicy" feature from rush.json.
 * @public
 */
export declare class ApprovedPackagesPolicy {
    private _enabled;
    private _ignoredNpmScopes;
    private _reviewCategories;
    private _browserApprovedPackages;
    private _nonbrowserApprovedPackages;
    /** @internal */
    constructor(rushConfiguration: RushConfiguration, rushConfigurationJson: IRushConfigurationJson);
    /**
     * Whether the feature is enabled.  The feature is enabled if the "approvedPackagesPolicy"
     * field is assigned in rush.json.
     */
    get enabled(): boolean;
    /**
     * A list of NPM package scopes that will be excluded from review (e.g. `@types`)
     */
    get ignoredNpmScopes(): Set<string>;
    /**
     * A list of category names that are valid for usage as the RushConfigurationProject.reviewCategory field.
     * This array will never be undefined.
     */
    get reviewCategories(): Set<string>;
    /**
     * Packages approved for usage in a web browser.  This is the stricter of the two types, so by default
     * all new packages are added to this file.
     *
     * @remarks
     *
     * This is part of an optional approval workflow, whose purpose is to review any new dependencies
     * that are introduced (e.g. maybe a legal review is required, or maybe we are trying to minimize bloat).
     * When Rush discovers a new dependency has been added to package.json, it will update the file.
     * The intent is that the file will be stored in Git and tracked by a branch policy that notifies
     * reviewers when a PR attempts to modify the file.
     *
     * Example filename: `C:\MyRepo\common\config\rush\browser-approved-packages.json`
     */
    get browserApprovedPackages(): ApprovedPackagesConfiguration;
    /**
     * Packages approved for usage everywhere *except* in a web browser.
     *
     * @remarks
     *
     * This is part of an optional approval workflow, whose purpose is to review any new dependencies
     * that are introduced (e.g. maybe a legal review is required, or maybe we are trying to minimize bloat).
     * The intent is that the file will be stored in Git and tracked by a branch policy that notifies
     * reviewers when a PR attempts to modify the file.
     *
     * Example filename: `C:\MyRepo\common\config\rush\browser-approved-packages.json`
     */
    get nonbrowserApprovedPackages(): ApprovedPackagesConfiguration;
}
//# sourceMappingURL=ApprovedPackagesPolicy.d.ts.map