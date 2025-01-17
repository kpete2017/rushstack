import { RushConfiguration } from '../api/RushConfiguration';
/**
 * This file is used to track the state of various Rush-related features. It is generated
 * and updated by Rush.
 *
 * @public
 */
export declare class RepoStateFile {
    private static _jsonSchema;
    private _repoStateFilePath;
    private _variant;
    private _pnpmShrinkwrapHash;
    private _preferredVersionsHash;
    private _isValid;
    private _modified;
    private constructor();
    /**
     * Get the absolute file path of the repo-state.json file.
     */
    get filePath(): string;
    /**
     * The hash of the pnpm shrinkwrap file at the end of the last update.
     */
    get pnpmShrinkwrapHash(): string | undefined;
    /**
     * The hash of all preferred versions at the end of the last update.
     */
    get preferredVersionsHash(): string | undefined;
    /**
     * If false, the repo-state.json file is not valid and its values cannot be relied upon
     */
    get isValid(): boolean;
    /**
     * Loads the repo-state.json data from the specified file path.
     * If the file has not been created yet, then an empty object is returned.
     *
     * @param jsonFilename - The path to the repo-state.json file.
     * @param variant - The variant currently being used by Rush.
     */
    static loadFromFile(jsonFilename: string, variant: string | undefined): RepoStateFile;
    /**
     * Refresh the data contained in repo-state.json using the current state
     * of the Rush repo, and save the file if changes were made.
     *
     * @param rushConfiguration - The Rush configuration for the repo.
     *
     * @returns true if the file was modified, otherwise false.
     */
    refreshState(rushConfiguration: RushConfiguration): boolean;
    /**
     * Writes the "repo-state.json" file to disk, using the filename that was passed to loadFromFile().
     */
    private _saveIfModified;
    private _serialize;
}
//# sourceMappingURL=RepoStateFile.d.ts.map