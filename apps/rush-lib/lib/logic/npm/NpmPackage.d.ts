import readPackageTree = require('read-package-tree');
import { BasePackage } from '../base/BasePackage';
/**
 * Used by the linking algorithm when doing NPM package resolution.
 */
export interface IResolveOrCreateResult {
    found: BasePackage | undefined;
    parentForCreate: BasePackage | undefined;
}
/**
 * The type of dependency; used by IPackageDependency.
 */
export declare enum PackageDependencyKind {
    Normal = 0,
    /**
     * The dependency was listed in the optionalDependencies section of package.json.
     */
    Optional = 1,
    /**
     * The dependency should be a symlink to a project that is locally built by Rush..
     */
    LocalLink = 2
}
export interface IPackageDependency {
    /**
     * The name of the dependency
     */
    name: string;
    /**
     * The requested version, which may be a pattern such as "^1.2.3"
     */
    versionRange: string;
    /**
     * The kind of dependency
     */
    kind: PackageDependencyKind;
}
export declare class NpmPackage extends BasePackage {
    /**
     * Names of packages that we explicitly depend on.  The actual dependency
     * package may be found in this.children, or possibly in this.children of
     * one of the parents.
     * If a dependency is listed in the "optionalDependencies" section of package.json
     * then its name here will be prepended with a "?" character, which means that Rush
     * will not report an error if the module cannot be found in the Common folder.
     */
    dependencies: IPackageDependency[];
    private constructor();
    /**
     * Used by "npm link" when creating a Package object that represents symbolic links to be created.
     */
    static createLinkedNpmPackage(name: string, version: string | undefined, dependencies: IPackageDependency[], folderPath: string): NpmPackage;
    /**
     * Used by "npm link" to simulate a temp project that is missing from the common/node_modules
     * folder (e.g. because it was added after the shrinkwrap file was regenerated).
     * @param packageJsonFilename - Filename of the source package.json
     *        Example: `C:\MyRepo\common\temp\projects\project1\package.json`
     * @param targetFolderName - Filename where it should have been installed
     *        Example: `C:\MyRepo\common\temp\node_modules\@rush-temp\project1`
     */
    static createVirtualTempPackage(packageJsonFilename: string, installFolderName: string): NpmPackage;
    /**
     * Recursive constructs a tree of NpmPackage objects using information returned
     * by the "read-package-tree" library.
     */
    static createFromNpm(npmPackage: readPackageTree.Node): NpmPackage;
    /**
     * Searches the node_modules hierarchy for the nearest matching package with the
     * given name.  Note that the nearest match may have an incompatible version.
     * If a match is found, then the "found" result will not be undefined.
     * In either case, the parentForCreate result indicates where the missing
     * dependency can be added, i.e. if the requested dependency was not found
     * or was found with an incompatible version.
     *
     * "cyclicSubtreeRoot" is a special optional parameter that specifies a different
     * root for the tree; the cyclicDependencyProjects feature uses this to isolate
     * certain devDependencies in their own subtree.
     */
    resolveOrCreate(dependencyName: string, cyclicSubtreeRoot?: NpmPackage): IResolveOrCreateResult;
    /**
     * Searches the node_modules hierarchy for the nearest matching package with the
     * given name.  If no match is found, then undefined is returned.
     */
    resolve(dependencyName: string): NpmPackage | undefined;
}
//# sourceMappingURL=NpmPackage.d.ts.map