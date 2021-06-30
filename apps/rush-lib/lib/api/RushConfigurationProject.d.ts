import { IPackageJson } from '@rushstack/node-core-library';
import { RushConfiguration } from '../api/RushConfiguration';
import { VersionPolicy } from './VersionPolicy';
import { PackageJsonEditor } from './PackageJsonEditor';
/**
 * This represents the JSON data object for a project entry in the rush.json configuration file.
 */
export interface IRushConfigurationProjectJson {
    packageName: string;
    projectFolder: string;
    reviewCategory?: string;
    cyclicDependencyProjects: string[];
    versionPolicyName?: string;
    shouldPublish?: boolean;
    skipRushCheck?: boolean;
    publishFolder?: string;
}
/**
 * This represents the configuration of a project that is built by Rush, based on
 * the Rush.json configuration file.
 * @public
 */
export declare class RushConfigurationProject {
    private _packageName;
    private _projectFolder;
    private _projectRelativeFolder;
    private _projectRushConfigFolder;
    private _projectRushTempFolder;
    private _reviewCategory;
    private _packageJson;
    private _packageJsonEditor;
    private _tempProjectName;
    private _unscopedTempProjectName;
    private _cyclicDependencyProjects;
    private _versionPolicyName;
    private _versionPolicy;
    private _shouldPublish;
    private _skipRushCheck;
    private _publishFolder;
    private _dependencyProjects;
    private _consumingProjects;
    private readonly _rushConfiguration;
    /**
     * A set of projects within the Rush configuration which directly consume this package.
     *
     * @remarks
     * Writable because it is mutated by RushConfiguration during initialization.
     * @internal
     */
    readonly _consumingProjectNames: Set<string>;
    /** @internal */
    constructor(projectJson: IRushConfigurationProjectJson, rushConfiguration: RushConfiguration, tempProjectName: string);
    /**
     * The name of the NPM package.  An error is reported if this name is not
     * identical to packageJson.name.
     *
     * Example: `@scope/MyProject`
     */
    get packageName(): string;
    /**
     * The full path of the folder that contains the project to be built by Rush.
     *
     * Example: `C:\MyRepo\libraries\my-project`
     */
    get projectFolder(): string;
    /**
     * The relative path of the folder that contains the project to be built by Rush.
     *
     * Example: `libraries/my-project`
     */
    get projectRelativeFolder(): string;
    /**
     * The project-specific Rush configuration folder.
     *
     * Example: `C:\MyRepo\libraries\my-project\config\rush`
     */
    get projectRushConfigFolder(): string;
    /**
     * The project-specific Rush temp folder. This folder is used to store Rush-specific temporary files.
     *
     * Example: `C:\MyRepo\libraries\my-project\.rush\temp`
     */
    get projectRushTempFolder(): string;
    /**
     * The Rush configuration for the monorepo that the project belongs to.
     */
    get rushConfiguration(): RushConfiguration;
    /**
     * The review category name, or undefined if no category was assigned.
     * This name must be one of the valid choices listed in RushConfiguration.reviewCategories.
     */
    get reviewCategory(): string | undefined;
    /**
     * A list of local projects that appear as devDependencies for this project, but cannot be
     * locally linked because it would create a cyclic dependency; instead, the last published
     * version will be installed in the Common folder.
     *
     * These are package names that would be found by RushConfiguration.getProjectByName().
     */
    get cyclicDependencyProjects(): Set<string>;
    /**
     * An array of projects within the Rush configuration which directly depend on this package.
     * @deprecated Use `consumingProjectNames` instead, as it has Set semantics, which better reflect the nature
     * of the data.
     */
    get downstreamDependencyProjects(): string[];
    /**
     * An array of projects within the Rush configuration which this project declares as dependencies.
     * @deprecated Use `dependencyProjects` instead, as it has Set semantics, which better reflect the nature
     * of the data.
     */
    get localDependencyProjects(): ReadonlyArray<RushConfigurationProject>;
    /**
     * The set of projects within the Rush configuration which this project declares as dependencies.
     *
     * @remarks
     * Can be used recursively to walk the project dependency graph to find all projects that are directly or indirectly
     * referenced from this project.
     */
    get dependencyProjects(): ReadonlySet<RushConfigurationProject>;
    /**
     * The set of projects within the Rush configuration which declare this project as a dependency.
     * Excludes those that declare this project as a `cyclicDependencyProject`.
     *
     * @remarks
     * This field is the counterpart to `dependencyProjects`, and can be used recursively to walk the project dependency
     * graph to find all projects which will be impacted by changes to this project.
     */
    get consumingProjects(): ReadonlySet<RushConfigurationProject>;
    /**
     * The parsed NPM "package.json" file from projectFolder.
     * @deprecated Use packageJsonEditor instead
     */
    get packageJson(): IPackageJson;
    /**
     * A useful wrapper around the package.json file for making modifications
     * @beta
     */
    get packageJsonEditor(): PackageJsonEditor;
    /**
     * The unique name for the temporary project that will be generated in the Common folder.
     * For example, if the project name is `@scope/MyProject`, the temporary project name
     * might be `@rush-temp/MyProject-2`.
     *
     * Example: `@rush-temp/MyProject-2`
     */
    get tempProjectName(): string;
    /**
     * The unscoped temporary project name
     *
     * Example: `my-project-2`
     */
    get unscopedTempProjectName(): string;
    /**
     * A flag which indicates whether changes to this project should be published. This controls
     * whether or not the project would show up when running `rush change`, and whether or not it
     * should be published during `rush publish`.
     */
    get shouldPublish(): boolean;
    /**
     * If true, then this project will be ignored by the "rush check" command.
     * The default value is false.
     */
    get skipRushCheck(): boolean;
    /**
     * Name of the version policy used by this project.
     * @beta
     */
    get versionPolicyName(): string | undefined;
    /**
     * The full path of the folder that will get published by Rush.
     *
     * @remarks
     * By default this is the same as the project folder, but a custom folder can be specified
     * using the the "publishFolder" setting in rush.json.
     *
     * Example: `C:\MyRepo\libraries\my-project\temp\publish`
     */
    get publishFolder(): string;
    /**
     * Version policy of the project
     * @beta
     */
    get versionPolicy(): VersionPolicy | undefined;
    /**
     * Indicate whether this project is the main project for the related version policy.
     *
     * False if the project is not for publishing.
     * True if the project is individually versioned or if its lockstep version policy does not specify main project.
     * False if the project is lockstepped and is not the main project for its version policy.
     *
     * @beta
     */
    get isMainProject(): boolean;
    /**
     * Compute the local rush projects that this project immediately depends on,
     * according to the specific dependency group from package.json
     */
    private _getDependencyProjects;
    /**
     * Compute the local rush projects that declare this project as a dependency
     */
    private _getConsumingProjects;
}
//# sourceMappingURL=RushConfigurationProject.d.ts.map