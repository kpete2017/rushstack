/**
 * This interface is part of the IPackageJson file format.  It is used for the
 * "dependencies", "optionalDependencies", and "devDependencies" fields.
 * @public
 */
export interface IPackageJsonDependencyTable {
    /**
     * The key is the name of a dependency.  The value is a Semantic Versioning (SemVer)
     * range specifier.
     */
    [dependencyName: string]: string;
}
/**
 * This interface is part of the IPackageJson file format.  It is used for the
 * "scripts" field.
 * @public
 */
export interface IPackageJsonScriptTable {
    /**
     * The key is the name of the script hook.  The value is the script body which may
     * be a file path or shell script command.
     */
    [scriptName: string]: string;
}
/**
 * An interface for accessing common fields from a package.json file whose version field may be missing.
 *
 * @remarks
 * This interface is the same as {@link IPackageJson}, except that the `version` field is optional.
 * According to the {@link https://docs.npmjs.com/files/package.json | NPM documentation}
 * and {@link http://wiki.commonjs.org/wiki/Packages/1.0 | CommonJS Packages specification}, the `version` field
 * is normally a required field for package.json files.
 *
 * However, NodeJS relaxes this requirement for its `require()` API.  The
 * {@link https://nodejs.org/dist/latest-v10.x/docs/api/modules.html#modules_folders_as_modules
 * | "Folders as Modules" section} from the NodeJS documentation gives an example of a package.json file
 * that has only the `name` and `main` fields.  NodeJS does not consider the `version` field during resolution,
 * so it can be omitted.  Some libraries do this.
 *
 * Use the `INodePackageJson` interface when loading such files.  Use `IPackageJson` for package.json files
 * that are installed from an NPM registry, or are otherwise known to have a `version` field.
 *
 * @public
 */
export interface INodePackageJson {
    /**
     * The name of the package.
     */
    name: string;
    /**
     * A version number conforming to the Semantic Versioning (SemVer) standard.
     */
    version?: string;
    /**
     * Indicates whether this package is allowed to be published or not.
     */
    private?: boolean;
    /**
     * A brief description of the package.
     */
    description?: string;
    /**
     * The URL of the project's repository.
     */
    repository?: string;
    /**
     * The URL to the project's web page.
     */
    homepage?: string;
    /**
     * The name of the license.
     */
    license?: string;
    /**
     * The path to the module file that will act as the main entry point.
     */
    main?: string;
    /**
     * The path to the TypeScript *.d.ts file describing the module file
     * that will act as the main entry point.
     */
    types?: string;
    /**
     * Alias for `types`
     */
    typings?: string;
    /**
     * The path to the TSDoc metadata file.
     * This is still being standardized: https://github.com/microsoft/tsdoc/issues/7#issuecomment-442271815
     * @beta
     */
    tsdocMetadata?: string;
    /**
     * The main entry point for the package.
     */
    bin?: string;
    /**
     * An array of dependencies that must always be installed for this package.
     */
    dependencies?: IPackageJsonDependencyTable;
    /**
     * An array of optional dependencies that may be installed for this package.
     */
    optionalDependencies?: IPackageJsonDependencyTable;
    /**
     * An array of dependencies that must only be installed for developers who will
     * build this package.
     */
    devDependencies?: IPackageJsonDependencyTable;
    /**
     * An array of dependencies that must be installed by a consumer of this package,
     * but which will not be automatically installed by this package.
     */
    peerDependencies?: IPackageJsonDependencyTable;
    /**
     * A table of script hooks that a package manager or build tool may invoke.
     */
    scripts?: IPackageJsonScriptTable;
    /**
     * A table of package version resolutions. This feature is only implemented by the Yarn package manager.
     *
     * @remarks
     * See the {@link https://github.com/yarnpkg/rfcs/blob/master/implemented/0000-selective-versions-resolutions.md
     * | 0000-selective-versions-resolutions.md RFC} for details.
     */
    resolutions?: Record<string, string>;
}
/**
 * An interface for accessing common fields from a package.json file.
 *
 * @remarks
 * This interface describes a package.json file format whose `name` and `version` field are required.
 * In some situations, the `version` field is optional; in that case, use the {@link INodePackageJson}
 * interface instead.
 *
 * More fields may be added to this interface in the future.  For documentation about the package.json file format,
 * see the {@link http://wiki.commonjs.org/wiki/Packages/1.0 | CommonJS Packages specification}
 * and the {@link https://docs.npmjs.com/files/package.json | NPM manual page}.
 *
 * @public
 */
export interface IPackageJson extends INodePackageJson {
    /** {@inheritDoc INodePackageJson.version} */
    version: string;
}
//# sourceMappingURL=IPackageJson.d.ts.map