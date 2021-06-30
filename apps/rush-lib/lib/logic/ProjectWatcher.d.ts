import { Terminal } from '@rushstack/node-core-library';
import { PackageChangeAnalyzer } from './PackageChangeAnalyzer';
import { RushConfiguration } from '../api/RushConfiguration';
import { RushConfigurationProject } from '../api/RushConfigurationProject';
export interface IProjectWatcherOptions {
    debounceMilliseconds?: number;
    rushConfiguration: RushConfiguration;
    projectsToWatch: ReadonlySet<RushConfigurationProject>;
    terminal: Terminal;
}
export interface IProjectChangeResult {
    /**
     * The set of projects that have changed since the last iteration
     */
    changedProjects: ReadonlySet<RushConfigurationProject>;
    /**
     * Contains the git hashes for all tracked files in the repo
     */
    state: PackageChangeAnalyzer;
}
/**
 * This class is for incrementally watching a set of projects in the repository for changes.
 *
 * Calling `waitForChange()` will return a promise that resolves when the package-deps of one or
 * more projects differ from the value the previous time it was invoked. The first time will always resolve with the full selection.
 */
export declare class ProjectWatcher {
    private readonly _debounceMilliseconds;
    private readonly _rushConfiguration;
    private readonly _projectsToWatch;
    private readonly _terminal;
    private _initialState;
    private _previousState;
    constructor(options: IProjectWatcherOptions);
    /**
     * Waits for a change to the package-deps of one or more of the selected projects, since the previous invocation.
     * Will return immediately the first time it is invoked, since no state has been recorded.
     * If no change is currently present, watches the source tree of all selected projects for file changes.
     */
    waitForChange(): Promise<IProjectChangeResult>;
    /**
     * Determines which, if any, projects (within the selection) have new hashes for files that are not in .gitignore
     */
    private _computeChanged;
    private _commitChanges;
    /**
     * Tests for inequality of the passed Maps. Order invariant.
     *
     * @returns `true` if the maps are different, `false` otherwise
     */
    private static _haveProjectDepsChanged;
}
//# sourceMappingURL=ProjectWatcher.d.ts.map