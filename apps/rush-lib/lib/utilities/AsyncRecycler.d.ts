/**
 * For deleting large folders, AsyncRecycler is significantly faster than Utilities.dangerouslyDeletePath().
 * It works by moving one or more folders into a temporary "recycler" folder, and then launches a separate
 * background process to recursively delete that folder.
 */
export declare class AsyncRecycler {
    private _recyclerFolder;
    private _movedFolderCount;
    private _deleting;
    constructor(recyclerFolder: string);
    /**
     * The full path of the recycler folder.
     * Example: `C:\MyRepo\common\rush-recycler`
     */
    get recyclerFolder(): string;
    /**
     * Synchronously moves the specified folder into the recycler folder.  If the specified folder
     * does not exist, then no operation is performed.  After calling this function one or more times,
     * deleteAll() must be called to actually delete the contents of the recycler folder.
     */
    moveFolder(folderPath: string): void;
    /**
     * This deletes all items under the specified folder, except for the items in the membersToExclude.
     * To be conservative, a case-insensitive comparison is used for membersToExclude.
     * The membersToExclude must be file/folder names that would match readdir() results.
     */
    moveAllItemsInFolder(folderPath: string, membersToExclude?: ReadonlyArray<string>): void;
    /**
     * Starts an asynchronous process to delete the recycler folder.  Deleting will continue
     * even if the current Node.js process is killed.
     *
     * NOTE: To avoid spawning multiple instances of the same command, moveFolder()
     * MUST NOT be called again after deleteAll() has started.
     */
    deleteAll(): void;
}
//# sourceMappingURL=AsyncRecycler.d.ts.map