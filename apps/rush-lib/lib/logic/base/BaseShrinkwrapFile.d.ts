import { DependencySpecifier } from '../DependencySpecifier';
import { IShrinkwrapFilePolicyValidatorOptions } from '../policy/ShrinkwrapFilePolicy';
import { PackageManagerOptionsConfigurationBase, RushConfiguration } from '../../api/RushConfiguration';
import { IExperimentsJson } from '../../api/ExperimentsConfiguration';
import { RushConfigurationProject } from '../../api/RushConfigurationProject';
import { BaseProjectShrinkwrapFile } from './BaseProjectShrinkwrapFile';
/**
 * This class is a parser for both npm's npm-shrinkwrap.json and pnpm's pnpm-lock.yaml file formats.
 */
export declare abstract class BaseShrinkwrapFile {
    abstract readonly isWorkspaceCompatible: boolean;
    protected _alreadyWarnedSpecs: Set<string>;
    protected static tryGetValue<T>(dictionary: {
        [key2: string]: T;
    }, key: string): T | undefined;
    /**
     * Validate the shrinkwrap using the provided policy options.
     *
     * @virtual
     */
    validate(packageManagerOptionsConfig: PackageManagerOptionsConfigurationBase, policyOptions: IShrinkwrapFilePolicyValidatorOptions, experimentsConfig?: IExperimentsJson): void;
    /**
     * Returns true if the shrinkwrap file includes a top-level package that would satisfy the specified
     * package name and SemVer version range
     *
     * @virtual
     */
    hasCompatibleTopLevelDependency(dependencySpecifier: DependencySpecifier): boolean;
    /**
     * Returns true if the shrinkwrap file includes a package that would satisfying the specified
     * package name and SemVer version range.  By default, the dependencies are resolved by looking
     * at the root of the node_modules folder described by the shrinkwrap file.  However, if
     * tempProjectName is specified, then the resolution will start in that subfolder.
     *
     * Consider this example:
     *
     * - node_modules\
     *   - temp-project\
     *     - lib-a@1.2.3
     *     - lib-b@1.0.0
     *   - lib-b@2.0.0
     *
     * In this example, hasCompatibleDependency("lib-b", ">= 1.1.0", "temp-project") would fail
     * because it finds lib-b@1.0.0 which does not satisfy the pattern ">= 1.1.0".
     *
     * @virtual
     */
    tryEnsureCompatibleDependency(dependencySpecifier: DependencySpecifier, tempProjectName: string): boolean;
    /**
     * Returns the list of temp projects defined in this file.
     * Example: [ '@rush-temp/project1', '@rush-temp/project2' ]
     *
     * @virtual
     */
    abstract getTempProjectNames(): ReadonlyArray<string>;
    /** @virtual */
    protected abstract tryEnsureDependencyVersion(dependencySpecifier: DependencySpecifier, tempProjectName: string): DependencySpecifier | undefined;
    /** @virtual */
    protected abstract getTopLevelDependencyVersion(dependencyName: string): DependencySpecifier | undefined;
    /**
     * Check for projects that exist in the shrinkwrap file, but don't exist
     * in rush.json.  This might occur, e.g. if a project was recently deleted or renamed.
     *
     * @returns a list of orphaned projects.
     */
    findOrphanedProjects(rushConfiguration: RushConfiguration): ReadonlyArray<string>;
    /**
     * Returns a project shrinkwrap file for the specified project that contains all dependencies and transitive
     * dependencies.
     *
     * @virtual
     **/
    abstract getProjectShrinkwrap(project: RushConfigurationProject): BaseProjectShrinkwrapFile | undefined;
    /**
     * Returns whether or not the workspace specified by the shrinkwrap matches the state of
     * a given package.json. Returns true if any dependencies are not aligned with the shrinkwrap.
     *
     * @param project - the Rush project that is being validated against the shrinkwrap
     * @param variant - the variant that is being validated
     *
     * @virtual
     */
    abstract isWorkspaceProjectModified(project: RushConfigurationProject, variant?: string): boolean;
    /** @virtual */
    protected abstract serialize(): string;
    protected _getTempProjectNames(dependencies: {
        [key: string]: {};
    }): ReadonlyArray<string>;
    private _checkDependencyVersion;
}
//# sourceMappingURL=BaseShrinkwrapFile.d.ts.map