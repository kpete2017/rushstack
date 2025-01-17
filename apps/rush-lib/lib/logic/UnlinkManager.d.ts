import { RushConfiguration } from '../api/RushConfiguration';
/**
 * This class implements the logic for "rush unlink"
 */
export declare class UnlinkManager {
    private _rushConfiguration;
    constructor(rushConfiguration: RushConfiguration);
    /**
     * Delete flag file and all the existing node_modules symlinks and all
     * project/.rush/temp/shrinkwrap-deps.json files
     *
     * Returns true if anything was deleted.
     */
    unlink(force?: boolean): boolean;
    /**
     * Delete:
     *  - all the node_modules symlinks of configured Rush projects
     *  - all of the project/.rush/temp/shrinkwrap-deps.json files of configured Rush projects
     *
     * Returns true if anything was deleted
     * */
    private _deleteProjectFiles;
}
//# sourceMappingURL=UnlinkManager.d.ts.map