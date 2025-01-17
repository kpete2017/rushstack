/**
 * This interface represents the raw experiments.json file which allows repo
 * maintainers to enable and disable experimental Rush features.
 * @beta
 */
export interface IExperimentsJson {
    /**
     * By default, 'rush install' passes --no-prefer-frozen-lockfile to 'pnpm install'.
     * Set this option to true to pass '--frozen-lockfile' instead.
     */
    usePnpmFrozenLockfileForRushInstall?: boolean;
    /**
     * By default, 'rush update' passes --no-prefer-frozen-lockfile to 'pnpm install'.
     * Set this option to true to pass '--prefer-frozen-lockfile' instead.
     */
    usePnpmPreferFrozenLockfileForRushUpdate?: boolean;
    /**
     * If using the 'preventManualShrinkwrapChanges' option, restricts the hash to only include the layout of external dependencies.
     * Used to allow links between workspace projects or the addition/removal of references to existing dependency versions to not
     * cause hash changes.
     */
    omitImportersFromPreventManualShrinkwrapChanges?: boolean;
    /**
     * If true, the chmod field in temporary project tar headers will not be normalized.
     * This normalization can help ensure consistent tarball integrity across platforms.
     */
    noChmodFieldInTarHeaderNormalization?: boolean;
}
/**
 * Use this class to load the "common/config/rush/experiments.json" config file.
 * This file allows repo maintainers to enable and disable experimental Rush features.
 * @beta
 */
export declare class ExperimentsConfiguration {
    private static _jsonSchema;
    private _experimentConfiguration;
    private _jsonFileName;
    /**
     * @internal
     */
    constructor(jsonFileName: string);
    /**
     * Get the experiments configuration.
     */
    get configuration(): Readonly<IExperimentsJson>;
}
//# sourceMappingURL=ExperimentsConfiguration.d.ts.map