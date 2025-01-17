/**
 * Part of IApprovedPackagesJson.
 */
export interface IApprovedPackagesItemJson {
    name: string;
    allowedCategories: string[];
}
/**
 * This represents the JSON data structure for the "browser-approved-packages.json"
 * and "nonbrowser-approved-packages.json" configuration files.  See "approved-packages.schema.json"
 * for documentation.
 */
export interface IApprovedPackagesJson {
    $schema?: string;
    packages: IApprovedPackagesItemJson[];
}
/**
 * An item returned by ApprovedPackagesConfiguration
 * @public
 */
export declare class ApprovedPackagesItem {
    /**
     * The NPM package name
     */
    packageName: string;
    /**
     * The project categories that are allowed to use this package.
     */
    allowedCategories: Set<string>;
    /**
     * @internal
     */
    constructor(packageName: string);
}
/**
 * This represents the JSON file specified via the "approvedPackagesFile" option in rush.json.
 * @public
 */
export declare class ApprovedPackagesConfiguration {
    private static _jsonSchema;
    items: ApprovedPackagesItem[];
    private _itemsByName;
    private _loadedJson;
    private _jsonFilename;
    constructor(jsonFilename: string);
    /**
     * Clears all the settings, returning to an empty state.
     */
    clear(): void;
    getItemByName(packageName: string): ApprovedPackagesItem | undefined;
    addOrUpdatePackage(packageName: string, reviewCategory: string): boolean;
    /**
     * If the file exists, calls loadFromFile().
     */
    tryLoadFromFile(approvedPackagesPolicyEnabled: boolean): boolean;
    /**
     * Loads the configuration data from the filename that was passed to the constructor.
     */
    loadFromFile(): void;
    /**
     * Loads the configuration data to the filename that was passed to the constructor.
     */
    saveToFile(): void;
    /**
     * Helper function only used by the constructor when loading the file.
     */
    private _addItemJson;
    /**
     * Helper function that adds an already created ApprovedPackagesItem to the
     * list and set.
     */
    private _addItem;
}
//# sourceMappingURL=ApprovedPackagesConfiguration.d.ts.map