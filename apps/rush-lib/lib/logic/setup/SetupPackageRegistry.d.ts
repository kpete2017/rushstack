import { RushConfiguration } from '../../api/RushConfiguration';
export interface ISetupPackageRegistryOptions {
    rushConfiguration: RushConfiguration;
    isDebug: boolean;
    /**
     * Whether Utilities.syncNpmrc() has already been called.
     */
    syncNpmrcAlreadyCalled: boolean;
}
export declare class SetupPackageRegistry {
    private readonly _options;
    readonly rushConfiguration: RushConfiguration;
    private readonly _terminal;
    private readonly _artifactoryConfiguration;
    private readonly _messages;
    constructor(options: ISetupPackageRegistryOptions);
    private _writeInstructionBlock;
    /**
     * Test whether the NPM token is valid.
     *
     * @returns - `true` if valid, `false` if not valid
     */
    checkOnly(): Promise<boolean>;
    /**
     * Test whether the NPM token is valid.  If not, prompt to update it.
     */
    checkAndSetup(): Promise<void>;
    /**
     * Fetch a valid NPM token from the Artifactory service and add it to the `~/.npmrc` file,
     * preserving other settings in that file.
     */
    private _fetchTokenAndUpdateNpmrc;
    /**
     * Update the `~/.npmrc` file by adding `linesToAdd` to it.
     * @remarks
     *
     * If the `.npmrc` file has existing content, it gets merged as follows:
     * - If `linesToAdd` contains key/value pairs and the key already appears in .npmrc,
     *   that line will be overwritten in place
     * - If `linesToAdd` contains non-key lines (e.g. a comment) and it exactly matches a
     *   line in .npmrc, then that line will be kept where it is
     * - The remaining `linesToAdd` that weren't handled by one of the two rules above
     *   are simply appended to the end of the file
     * - Under no circumstances is a duplicate key/value added to the file; in the case of
     *   duplicates, the earliest line in `linesToAdd` takes precedence
     */
    private _mergeLinesIntoNpmrc;
    private static _getNpmrcKey;
    private static _isCommentLine;
    /**
     * This is a workaround for https://github.com/npm/cli/issues/2740 where the NPM tool sometimes
     * mixes together JSON and terminal messages in a single STDERR stream.
     *
     * @remarks
     * Given an input like this:
     * ```
     * npm ERR! 404 Note that you can also install from a
     * npm ERR! 404 tarball, folder, http url, or git url.
     * {
     *   "error": {
     *     "code": "E404",
     *     "summary": "Not Found - GET https://registry.npmjs.org/@rushstack%2fnonexistent-package - Not found"
     *   }
     * }
     * npm ERR! A complete log of this run can be found in:
     * ```
     *
     * @returns the JSON section, or `undefined` if a JSON object could not be detected
     */
    private static _tryFindJson;
}
//# sourceMappingURL=SetupPackageRegistry.d.ts.map