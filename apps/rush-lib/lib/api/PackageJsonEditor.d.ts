import { IPackageJson } from '@rushstack/node-core-library';
/**
 * @beta
 */
export declare const enum DependencyType {
    Regular = "dependencies",
    Dev = "devDependencies",
    Optional = "optionalDependencies",
    Peer = "peerDependencies",
    YarnResolutions = "resolutions"
}
/**
 * @beta
 */
export declare class PackageJsonDependency {
    private _type;
    private _name;
    private _version;
    private _onChange;
    constructor(name: string, version: string, type: DependencyType, onChange: () => void);
    get name(): string;
    get version(): string;
    setVersion(newVersion: string): void;
    get dependencyType(): DependencyType;
}
/**
 * @beta
 */
export declare class PackageJsonEditor {
    private readonly _filePath;
    private readonly _dependencies;
    private readonly _devDependencies;
    private readonly _resolutions;
    private _modified;
    private _sourceData;
    private constructor();
    static load(filePath: string): PackageJsonEditor;
    static fromObject(object: IPackageJson, filename: string): PackageJsonEditor;
    get name(): string;
    get version(): string;
    get filePath(): string;
    /**
     * The list of dependencies of type DependencyType.Regular, DependencyType.Optional, or DependencyType.Peer.
     */
    get dependencyList(): ReadonlyArray<PackageJsonDependency>;
    /**
     * The list of dependencies of type DependencyType.Dev.
     */
    get devDependencyList(): ReadonlyArray<PackageJsonDependency>;
    /**
     * This field is a Yarn-specific feature that allows overriding of package resolution.
     *
     * @remarks
     * See the {@link https://github.com/yarnpkg/rfcs/blob/master/implemented/0000-selective-versions-resolutions.md
     * | 0000-selective-versions-resolutions.md RFC} for details.
     */
    get resolutionsList(): ReadonlyArray<PackageJsonDependency>;
    tryGetDependency(packageName: string): PackageJsonDependency | undefined;
    tryGetDevDependency(packageName: string): PackageJsonDependency | undefined;
    addOrUpdateDependency(packageName: string, newVersion: string, dependencyType: DependencyType): void;
    saveIfModified(): boolean;
    /**
     * Get the normalized package.json that represents the current state of the
     * PackageJsonEditor. This method does not save any changes that were made to the
     * package.json, but instead returns the object representation of what would be saved
     * if saveIfModified() is called.
     */
    saveToObject(): IPackageJson;
    private _onChange;
    /**
     * Create a normalized shallow copy of the provided package.json without modifying the
     * original. If the result of this method is being returned via a public facing method,
     * it will still need to be deep-cloned to avoid propogating changes back to the
     * original dataset.
     */
    private _normalize;
}
//# sourceMappingURL=PackageJsonEditor.d.ts.map