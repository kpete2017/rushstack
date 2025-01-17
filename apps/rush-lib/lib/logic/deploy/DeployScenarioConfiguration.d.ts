import { RushConfiguration } from '../../api/RushConfiguration';
export interface IDeployScenarioProjectJson {
    projectName: string;
    additionalProjectsToInclude?: string[];
    additionalDependenciesToInclude?: string[];
    dependenciesToExclude?: string[];
}
export interface IDeployScenarioJson {
    deploymentProjectNames: string[];
    includeDevDependencies?: boolean;
    includeNpmIgnoreFiles?: boolean;
    omitPnpmWorkaroundLinks?: boolean;
    linkCreation?: 'default' | 'script' | 'none';
    folderToCopy?: string;
    projectSettings?: IDeployScenarioProjectJson[];
}
export declare class DeployScenarioConfiguration {
    private static _scenarioNameRegExp;
    private static _jsonSchema;
    readonly json: IDeployScenarioJson;
    /**
     * Used to lookup items in IDeployScenarioJson.projectSettings based on their IDeployScenarioProjectJson.projectName
     */
    readonly projectJsonsByName: Map<string, IDeployScenarioProjectJson>;
    private constructor();
    /**
     * Validates that the input string conforms to the naming rules for a "rush deploy" scenario name.
     */
    static validateScenarioName(scenarioName: string): void;
    /**
     * Given the --scenarioName value, return the full path of the filename.
     *
     * Example: "ftp-site" --> "...common/config/rush/deploy-ftp-site.json"
     * Example: undefined --> "...common/config/rush/deploy.json"
     */
    static getConfigFilePath(scenarioName: string | undefined, rushConfiguration: RushConfiguration): string;
    static loadFromFile(scenarioFilePath: string, rushConfiguration: RushConfiguration): DeployScenarioConfiguration;
}
//# sourceMappingURL=DeployScenarioConfiguration.d.ts.map