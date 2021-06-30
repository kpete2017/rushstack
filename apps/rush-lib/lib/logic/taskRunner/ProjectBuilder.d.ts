import { Terminal } from '@rushstack/node-core-library';
import { RushConfiguration } from '../../api/RushConfiguration';
import { RushConfigurationProject } from '../../api/RushConfigurationProject';
import { TaskStatus } from './TaskStatus';
import { PackageChangeAnalyzer } from '../PackageChangeAnalyzer';
import { BaseBuilder, IBuilderContext } from './BaseBuilder';
import { BuildCacheConfiguration } from '../../api/BuildCacheConfiguration';
import { CommandLineConfiguration } from '../../api/CommandLineConfiguration';
export interface IProjectBuildDeps {
    files: {
        [filePath: string]: string;
    };
    arguments: string;
}
export interface IProjectBuilderOptions {
    rushProject: RushConfigurationProject;
    rushConfiguration: RushConfiguration;
    buildCacheConfiguration: BuildCacheConfiguration | undefined;
    commandToRun: string;
    commandName: string;
    isIncrementalBuildAllowed: boolean;
    packageChangeAnalyzer: PackageChangeAnalyzer;
    packageDepsFilename: string;
}
/**
 * A `BaseBuilder` subclass that builds a Rush project and updates its package-deps-hash
 * incremental state.
 */
export declare class ProjectBuilder extends BaseBuilder {
    get name(): string;
    readonly isIncrementalBuildAllowed: boolean;
    hadEmptyScript: boolean;
    private readonly _rushProject;
    private readonly _rushConfiguration;
    private readonly _buildCacheConfiguration;
    private readonly _commandName;
    private readonly _commandToRun;
    private readonly _packageChangeAnalyzer;
    private readonly _packageDepsFilename;
    /**
     * UNINITIALIZED === we haven't tried to initialize yet
     * undefined === we didn't create one because the feature is not enabled
     */
    private _projectBuildCache;
    constructor(options: IProjectBuilderOptions);
    /**
     * A helper method to determine the task name of a ProjectBuilder. Used when the task
     * name is required before a task is created.
     */
    static getTaskName(rushProject: RushConfigurationProject): string;
    executeAsync(context: IBuilderContext): Promise<TaskStatus>;
    tryWriteCacheEntryAsync(terminal: Terminal, trackedFilePaths: string[] | undefined, repoCommandLineConfiguration: CommandLineConfiguration | undefined): Promise<boolean | undefined>;
    private _executeTaskAsync;
    private _getProjectBuildCacheAsync;
}
/**
 * When running a command from the "scripts" block in package.json, if the command
 * contains Unix-style path slashes and the OS is Windows, the package managers will
 * convert slashes to backslashes.  This is a complicated undertaking.  For example, they
 * need to convert "node_modules/bin/this && ./scripts/that --name keep/this"
 * to "node_modules\bin\this && .\scripts\that --name keep/this", and they don't want to
 * convert ANY of the slashes in "cmd.exe /c echo a/b".  NPM and PNPM use npm-lifecycle for this,
 * but it unfortunately has a dependency on the entire node-gyp kitchen sink.  Yarn has a
 * simplified implementation in fix-cmd-win-slashes.js, but it's not exposed as a library.
 *
 * Fundamentally NPM's whole feature seems misguided:  They start by inviting people to write
 * shell scripts that will be executed by wildly different shell languages (e.g. cmd.exe and Bash).
 * It's very tricky for a developer to guess what's safe to do without testing every OS.
 * Even simple path separators are not portable, so NPM added heuristics to figure out which
 * slashes are part of a path or not, and convert them.  These workarounds end up having tons
 * of special cases.  They probably could have implemented their own entire minimal cross-platform
 * shell language with less code and less confusion than npm-lifecycle's approach.
 *
 * We've deprecated shell operators inside package.json.  Instead, we advise people to move their
 * scripts into conventional script files, and put only a file path in package.json.  So, for
 * Rush's workaround here, we really only care about supporting the small set of cases seen in the
 * unit tests.  For anything that doesn't fit those patterns, we leave the string untouched
 * (i.e. err on the side of not breaking anything).  We could revisit this later if someone
 * complains about it, but so far nobody has.  :-)
 */
export declare function convertSlashesForWindows(command: string): string;
//# sourceMappingURL=ProjectBuilder.d.ts.map