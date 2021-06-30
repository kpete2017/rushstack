/**
 * Schema for heft-jest-data.json
 */
export interface IHeftJestDataFileJson {
    /**
     * The "emitFolderNameForTests" from config/typescript.json
     */
    emitFolderNameForTests: string;
    /**
     * The file extension attached to compiled test files.
     */
    extensionForTests: '.js' | '.cjs' | '.mjs';
    /**
     * Normally the jest-build-transform compares the timestamps of the .js output file and .ts source file
     * to determine whether the TypeScript compiler has completed.  However this heuristic is only necessary
     * in the interactive "--watch" mode, since otherwise Heft doesn't invoke Jest until after the compiler
     * has finished.  Heft improves reliability for a non-watch build by setting skipTimestampCheck=true.
     */
    skipTimestampCheck: boolean;
    /**
     * Whether or not the project being tested is a TypeScript project.
     */
    isTypeScriptProject: boolean;
}
/**
 * Manages loading/saving the "heft-jest-data.json" data file.  This file communicates
 * configuration information from Heft to jest-build-transform.js.  The jest-build-transform.js script gets
 * loaded dynamically by the Jest engine, so it does not have access to the normal HeftConfiguration objects.
 */
export declare class HeftJestDataFile {
    /**
     * Called by JestPlugin to write the file.
     */
    static saveForProjectAsync(projectFolder: string, json?: IHeftJestDataFileJson): Promise<void>;
    /**
     * Called by JestPlugin to load and validate the Heft data file before running Jest.
     */
    static loadAndValidateForProjectAsync(projectFolder: string): Promise<IHeftJestDataFileJson>;
    /**
     * Called by jest-build-transform.js to read the file. No validation is performed because validation
     * should be performed asynchronously in the JestPlugin.
     */
    static loadForProject(projectFolder: string): IHeftJestDataFileJson;
    /**
     * Get the absolute path to the heft-jest-data.json file
     */
    static getConfigFilePath(projectFolder: string): string;
    private static _validateHeftJestDataFileAsync;
}
//# sourceMappingURL=HeftJestDataFile.d.ts.map