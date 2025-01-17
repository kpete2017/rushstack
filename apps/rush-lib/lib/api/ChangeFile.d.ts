import { RushConfiguration } from './RushConfiguration';
import { IChangeFile, IChangeInfo } from './ChangeManagement';
/**
 * This class represents a single change file.
 */
export declare class ChangeFile {
    private _changeFileData;
    private _rushConfiguration;
    /**
     * @internal
     */
    constructor(changeFileData: IChangeFile, rushConfiguration: RushConfiguration);
    /**
     * Adds a change entry into the change file
     * @param data - change information
     */
    addChange(data: IChangeInfo): void;
    /**
     * Gets all the change entries about the specified package from the change file.
     * @param packageName - package name
     */
    getChanges(packageName: string): IChangeInfo[];
    /**
     * Writes the change file to disk in sync mode.
     * Returns the file path.
     * @returns the path to the file that was written (based on generatePath())
     */
    writeSync(): string;
    /**
     * Generates a file path for storing the change file to disk.
     * Note that this value may change if called twice in a row,
     * as it is partially based on the current date/time.
     */
    generatePath(): string;
    /**
     * Gets the current time, formatted as YYYY-MM-DD-HH-MM
     * Optionally will include seconds
     */
    private _getTimestamp;
    private _escapeFilename;
}
//# sourceMappingURL=ChangeFile.d.ts.map