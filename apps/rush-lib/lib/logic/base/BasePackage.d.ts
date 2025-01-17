import { IPackageJson } from '@rushstack/node-core-library';
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
/**
 * Represents a "@rush-temp" scoped package, which has our additional custom field
 * for tracking the dependency graph.
 */
export interface IRushTempPackageJson extends IPackageJson {
    /**
     * An extra setting written into package.json for temp packages, to track
     * references to locally built projects.
     */
    rushDependencies?: {
        [key: string]: string;
    };
}
/**
 * Represents an NPM package being processed by the linking algorithm.
 */
export declare class BasePackage {
    /**
     * The "name" field from package.json
     */
    name: string;
    /**
     * The package.json name can differ from the installation folder name, in the case of an NPM package alias
     * such as this:
     *
     * ```
     * "dependencies": {
     *   "@alias-scope/alias-name": "npm:target-name@^1.2.3"
     * }
     * ```
     *
     * In this case the folder will be `node_modules/@alias-scope/alias-name`
     * instead of `node_modules/target-name`.
     */
    installedName: string;
    /**
     * The "version" field from package.json. This is expensive to read
     * because we have to open the package.json file.  Only when DEBUG=true
     */
    version: string | undefined;
    /**
     * The absolute path to the folder that contains package.json.
     */
    folderPath: string;
    /**
     * The parent package, or undefined if this is the root of the tree.
     */
    parent: BasePackage | undefined;
    /**
     * The raw package.json information for this Package
     */
    packageJson: IRushTempPackageJson | undefined;
    /**
     * If this is a local path that we are planning to symlink to a target folder,
     * then symlinkTargetFolderPath keeps track of the intended target.
     */
    symlinkTargetFolderPath: string | undefined;
    /**
     * Packages that were placed in node_modules subfolders of this package.
     * The child packages are not necessarily dependencies of this package.
     */
    children: BasePackage[];
    private _childrenByName;
    protected constructor(name: string, version: string | undefined, folderPath: string, packageJson: IRushTempPackageJson | undefined);
    /**
     * Used by link managers, creates a virtual Package object that represents symbolic links
     * which will be created later
     */
    static createLinkedPackage(name: string, version: string | undefined, folderPath: string, packageJson?: IRushTempPackageJson): BasePackage;
    /**
     * Used by "npm link" to simulate a temp project that is missing from the common/node_modules
     * folder (e.g. because it was added after the shrinkwrap file was regenerated).
     * @param packageJsonFilename - Filename of the source package.json
     *        Example: `C:\MyRepo\common\temp\projects\project1\package.json`
     * @param targetFolderName - Filename where it should have been installed
     *        Example: `C:\MyRepo\common\temp\node_modules\@rush-temp\project1`
     */
    static createVirtualTempPackage(packageJsonFilename: string, installFolderName: string): BasePackage;
    get nameAndVersion(): string;
    addChild<T extends BasePackage>(child: T): void;
    getChildByName(childPackageName: string): BasePackage | undefined;
    printTree(indent?: string): void;
}
//# sourceMappingURL=BasePackage.d.ts.map