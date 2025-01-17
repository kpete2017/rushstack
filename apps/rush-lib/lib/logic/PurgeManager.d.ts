import { AsyncRecycler } from '../utilities/AsyncRecycler';
import { RushConfiguration } from '../api/RushConfiguration';
import { RushGlobalFolder } from '../api/RushGlobalFolder';
/**
 * This class implements the logic for "rush purge"
 */
export declare class PurgeManager {
    private _rushConfiguration;
    private _rushGlobalFolder;
    private _commonTempFolderRecycler;
    private _rushUserFolderRecycler;
    constructor(rushConfiguration: RushConfiguration, rushGlobalFolder: RushGlobalFolder);
    /**
     * Performs the AsyncRecycler.deleteAll() operation.  This should be called before
     * the PurgeManager instance is disposed.
     */
    deleteAll(): void;
    get commonTempFolderRecycler(): AsyncRecycler;
    /**
     * Delete everything from the common/temp folder
     */
    purgeNormal(): void;
    /**
     * In addition to performing the purgeNormal() operation, this method also cleans the
     * .rush folder in the user's home directory.
     */
    purgeUnsafe(): void;
    private _getMembersToExclude;
}
//# sourceMappingURL=PurgeManager.d.ts.map