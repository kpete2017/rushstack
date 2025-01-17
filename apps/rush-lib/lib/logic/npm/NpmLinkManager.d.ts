import { BaseLinkManager } from '../base/BaseLinkManager';
export declare class NpmLinkManager extends BaseLinkManager {
    protected _linkProjects(): Promise<void>;
    /**
     * This is called once for each local project from Rush.json.
     * @param project             The local project that we will create symlinks for
     * @param commonRootPackage   The common/temp/package.json package
     * @param commonPackageLookup A dictionary for finding packages under common/temp/node_modules
     */
    private _linkProject;
}
//# sourceMappingURL=NpmLinkManager.d.ts.map