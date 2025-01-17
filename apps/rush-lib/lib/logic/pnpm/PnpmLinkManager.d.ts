import { BaseLinkManager } from '../base/BaseLinkManager';
export declare class PnpmLinkManager extends BaseLinkManager {
    private readonly _pnpmVersion;
    /**
     * @override
     */
    createSymlinksForProjects(force: boolean): Promise<void>;
    protected _linkProjects(): Promise<void>;
    /**
     * This is called once for each local project from Rush.json.
     * @param project             The local project that we will create symlinks for
     * @param rushLinkJson        The common/temp/rush-link.json output file
     */
    private _linkProject;
    private _getPathToLocalInstallation;
    private _createLocalPackageForDependency;
}
//# sourceMappingURL=PnpmLinkManager.d.ts.map