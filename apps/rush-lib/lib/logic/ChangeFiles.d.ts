import { IChangelog } from '../api/Changelog';
import { RushConfiguration } from '../api/RushConfiguration';
/**
 * This class represents the collection of change files existing in the repo and provides operations
 * for those change files.
 */
export declare class ChangeFiles {
    /**
     * Change file path relative to changes folder.
     */
    private _files;
    private _changesPath;
    constructor(changesPath: string);
    /**
     * Validate if the newly added change files match the changed packages.
     */
    static validate(newChangeFilePaths: string[], changedPackages: string[], rushConfiguration: RushConfiguration): void;
    static getChangeComments(newChangeFilePaths: string[]): Map<string, string[]>;
    /**
     * Get the array of absolute paths of change files.
     */
    getFiles(): string[];
    /**
     * Get the path of changes folder.
     */
    getChangesPath(): string;
    /**
     * Delete all change files
     */
    deleteAll(shouldDelete: boolean, updatedChangelogs?: IChangelog[]): number;
    private _deleteFiles;
}
//# sourceMappingURL=ChangeFiles.d.ts.map