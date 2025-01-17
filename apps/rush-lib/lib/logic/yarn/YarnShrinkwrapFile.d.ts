import { BaseShrinkwrapFile } from '../base/BaseShrinkwrapFile';
import { DependencySpecifier } from '../DependencySpecifier';
import { RushConfigurationProject } from '../../api/RushConfigurationProject';
import { BaseProjectShrinkwrapFile } from '../base/BaseProjectShrinkwrapFile';
/**
 * Support for consuming the "yarn.lock" file.
 *
 * Yarn refers to its shrinkwrap file as a "lock file", even though it has nothing to do
 * with file locking.  Apparently this was based on a convention of the Ruby bundler.
 * Since Rush has to work interchangeably with 3 different package managers, here we refer
 * generically to yarn.lock as a "shrinkwrap file".
 *
 * If Rush's Yarn support gains popularity, we will try to improve the wording of
 * logging messages to use terminology more consistent with Yarn's own documentation.
 */
export declare class YarnShrinkwrapFile extends BaseShrinkwrapFile {
    readonly isWorkspaceCompatible: boolean;
    private static _packageNameAndSemVerRegExp;
    private _shrinkwrapJson;
    private _tempProjectNames;
    private constructor();
    static loadFromFile(shrinkwrapFilename: string): YarnShrinkwrapFile | undefined;
    /**
     * The `@yarnpkg/lockfile` API only partially deserializes its data, and expects the caller
     * to parse the yarn.lock lookup keys (sometimes called a "pattern").
     *
     * Example input:  "js-tokens@^3.0.0 || ^4.0.0"
     * Example output: { packageName: "js-tokens", semVerRange: "^3.0.0 || ^4.0.0" }
     */
    private static _decodePackageNameAndSemVer;
    /**
     * This is the inverse of _decodePackageNameAndSemVer():
     * Given an IPackageNameAndSemVer object, recreate the yarn.lock lookup key
     * (sometimes called a "pattern").
     */
    private static _encodePackageNameAndSemVer;
    /** @override */
    getTempProjectNames(): ReadonlyArray<string>;
    /** @override */
    hasCompatibleTopLevelDependency(dependencySpecifier: DependencySpecifier): boolean;
    /** @override */
    tryEnsureCompatibleDependency(dependencySpecifier: DependencySpecifier, tempProjectName: string): boolean;
    /** @override */
    protected serialize(): string;
    /** @override */
    protected getTopLevelDependencyVersion(dependencyName: string): DependencySpecifier | undefined;
    /** @override */
    protected tryEnsureDependencyVersion(dependencySpecifier: DependencySpecifier, tempProjectName: string): DependencySpecifier | undefined;
    /** @override */
    getProjectShrinkwrap(project: RushConfigurationProject): BaseProjectShrinkwrapFile | undefined;
    /** @override */
    isWorkspaceProjectModified(project: RushConfigurationProject, variant?: string): boolean;
}
//# sourceMappingURL=YarnShrinkwrapFile.d.ts.map