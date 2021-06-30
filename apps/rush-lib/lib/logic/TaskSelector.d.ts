import { BuildCacheConfiguration } from '../api/BuildCacheConfiguration';
import { RushConfiguration } from '../api/RushConfiguration';
import { RushConfigurationProject } from '../api/RushConfigurationProject';
import { PackageChangeAnalyzer } from './PackageChangeAnalyzer';
import { TaskCollection } from './taskRunner/TaskCollection';
export interface ITaskSelectorConstructor {
    rushConfiguration: RushConfiguration;
    buildCacheConfiguration: BuildCacheConfiguration | undefined;
    selection: ReadonlySet<RushConfigurationProject>;
    commandName: string;
    commandToRun: string;
    customParameterValues: string[];
    isQuietMode: boolean;
    isIncrementalBuildAllowed: boolean;
    ignoreMissingScript: boolean;
    ignoreDependencyOrder: boolean;
    packageDepsFilename: string;
    packageChangeAnalyzer?: PackageChangeAnalyzer;
}
/**
 * This class is responsible for:
 *  - based on to/from flags, solving the dependency graph and figuring out which projects need to be run
 *  - creating a ProjectBuilder for each project that needs to be built
 *  - registering the necessary ProjectBuilders with the TaskRunner, which actually orchestrates execution
 */
export declare class TaskSelector {
    private _options;
    private _packageChangeAnalyzer;
    constructor(options: ITaskSelectorConstructor);
    static getScriptToRun(rushProject: RushConfigurationProject, commandToRun: string, customParameterValues: string[]): string | undefined;
    registerTasks(): TaskCollection;
    private _registerTask;
    private static _getScriptCommand;
}
//# sourceMappingURL=TaskSelector.d.ts.map