import { Terminal } from '@rushstack/node-core-library';
import { RushConfiguration } from '../api/RushConfiguration';
export declare class PackageChangeAnalyzer {
    /**
     * null === we haven't looked
     * undefined === data isn't available (i.e. - git isn't present)
     */
    private _data;
    private _projectStateCache;
    private _rushConfiguration;
    private readonly _git;
    constructor(rushConfiguration: RushConfiguration);
    getPackageDeps(projectName: string, terminal: Terminal): Promise<Map<string, string> | undefined>;
    /**
     * The project state hash is calculated in the following way:
     * - Project dependencies are collected (see PackageChangeAnalyzer.getPackageDeps)
     *   - If project dependencies cannot be collected (i.e. - if Git isn't available),
     *     this function returns `undefined`
     * - The (path separator normalized) repo-root-relative dependencies' file paths are sorted
     * - A SHA1 hash is created and each (sorted) file path is fed into the hash and then its
     *   Git SHA is fed into the hash
     * - A hex digest of the hash is returned
     */
    getProjectStateHash(projectName: string, terminal: Terminal): Promise<string | undefined>;
    private _getData;
    private _getIgnoreMatcherForProject;
    private _getRepoDeps;
}
//# sourceMappingURL=PackageChangeAnalyzer.d.ts.map