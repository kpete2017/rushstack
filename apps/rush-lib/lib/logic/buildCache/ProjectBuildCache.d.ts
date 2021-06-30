import { Terminal } from '@rushstack/node-core-library';
import { PackageChangeAnalyzer } from '../PackageChangeAnalyzer';
import { RushProjectConfiguration } from '../../api/RushProjectConfiguration';
import { BuildCacheConfiguration } from '../../api/BuildCacheConfiguration';
interface IProjectBuildCacheOptions {
    buildCacheConfiguration: BuildCacheConfiguration;
    projectConfiguration: RushProjectConfiguration;
    command: string;
    trackedProjectFiles: string[] | undefined;
    packageChangeAnalyzer: PackageChangeAnalyzer;
    terminal: Terminal;
}
export declare class ProjectBuildCache {
    /**
     * null === we haven't tried to initialize yet
     * undefined === unable to initialize
     */
    private static _tarUtility;
    private readonly _project;
    private readonly _localBuildCacheProvider;
    private readonly _cloudBuildCacheProvider;
    private readonly _buildCacheEnabled;
    private readonly _projectOutputFolderNames;
    private _cacheId;
    private constructor();
    private static _tryGetTarUtility;
    static tryGetProjectBuildCache(options: IProjectBuildCacheOptions): Promise<ProjectBuildCache | undefined>;
    private static _validateProject;
    tryRestoreFromCacheAsync(terminal: Terminal): Promise<boolean>;
    trySetCacheEntryAsync(terminal: Terminal): Promise<boolean>;
    private _tryCollectPathsToCacheAsync;
    private _getPathsInFolder;
    private _getTarLogFilePath;
    private static _getCacheId;
}
export {};
//# sourceMappingURL=ProjectBuildCache.d.ts.map