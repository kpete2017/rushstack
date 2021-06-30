import { Terminal } from '@rushstack/node-core-library';
import { RushConfigurationProject } from './RushConfigurationProject';
import { CommandLineConfiguration } from './CommandLineConfiguration';
export interface IBuildCacheOptionsBase {
    /**
     * Disable caching for this project. The project will never be restored from cache.
     * This may be useful if this project affects state outside of its folder.
     *
     * This option is only used when the cloud build cache is enabled for the repo. You can set
     * disableBuildCache=true to disable caching for a specific project. This is a useful workaround
     * if that project's build scripts violate the assumptions of the cache, for example by writing
     * files outside the project folder. Where possible, a better solution is to improve the build scripts
     * to be compatible with caching.
     */
    disableBuildCache?: boolean;
}
export interface IBuildCacheOptions extends IBuildCacheOptionsBase {
    /**
     * Allows for fine-grained control of cache for individual commands.
     */
    optionsForCommandsByName: Map<string, ICacheOptionsForCommand>;
}
export interface ICacheOptionsForCommand {
    /**
     * The command name.
     */
    name: string;
    /**
     * Disable caching for this command.
     * This may be useful if this command for this project affects state outside of this project folder.
     *
     * This option is only used when the cloud build cache is enabled for the repo. You can set
     * disableBuildCache=true to disable caching for a command in a specific project. This is a useful workaround
     * if that project's build scripts violate the assumptions of the cache, for example by writing
     * files outside the project folder. Where possible, a better solution is to improve the build scripts
     * to be compatible with caching.
     */
    disableBuildCache?: boolean;
}
/**
 * Use this class to load the "config/rush-project.json" config file.
 *
 * This file provides project-specific configuration options.
 * @public
 */
export declare class RushProjectConfiguration {
    private static _projectBuildCacheConfigurationFile;
    readonly project: RushConfigurationProject;
    /**
     * A list of folder names under the project root that should be cached.
     *
     * These folders should not be tracked by git.
     */
    readonly projectOutputFolderNames?: string[];
    /**
     * The incremental analyzer can skip Rush commands for projects whose input files have
     * not changed since the last build. Normally, every Git-tracked file under the project
     * folder is assumed to be an input. Set incrementalBuildIgnoredGlobs to ignore specific
     * files, specified as globs relative to the project folder. The list of file globs will
     * be interpreted the same way your .gitignore file is.
     */
    readonly incrementalBuildIgnoredGlobs?: string[];
    /**
     * Project-specific cache options.
     */
    readonly cacheOptions: IBuildCacheOptions;
    private constructor();
    /**
     * Loads the rush-project.json data for the specified project.
     */
    static tryLoadForProjectAsync(project: RushConfigurationProject, repoCommandLineConfiguration: CommandLineConfiguration | undefined, terminal: Terminal): Promise<RushProjectConfiguration | undefined>;
    private static _validateConfiguration;
}
//# sourceMappingURL=RushProjectConfiguration.d.ts.map