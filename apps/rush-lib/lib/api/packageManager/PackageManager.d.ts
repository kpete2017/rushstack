/**
 * This represents the available Package Manager tools as a string
 * @public
 */
export declare type PackageManagerName = 'pnpm' | 'npm' | 'yarn';
/**
 * An abstraction for controlling the supported package managers: PNPM, NPM, and Yarn.
 * @beta
 */
export declare abstract class PackageManager {
    /**
     * The package manager.
     */
    readonly packageManager: PackageManagerName;
    /**
     * The SemVer version of the package manager.
     */
    readonly version: string;
    protected _shrinkwrapFilename: string;
    /** @internal */
    protected constructor(version: string, packageManager: PackageManagerName);
    /**
     * The filename of the shrinkwrap file that is used by the package manager.
     *
     * @remarks
     * Example: `npm-shrinkwrap.json` or `pnpm-lock.yaml`
     */
    get shrinkwrapFilename(): string;
}
//# sourceMappingURL=PackageManager.d.ts.map