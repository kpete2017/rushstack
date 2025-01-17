import { Terminal } from '@rushstack/node-core-library';
import { RigConfig } from '@rushstack/rig-package';
/**
 * @beta
 */
export declare enum InheritanceType {
    /**
     * Append additional elements after elements from the parent file's property
     */
    append = "append",
    /**
     * Discard elements from the parent file's property
     */
    replace = "replace",
    /**
     * Custom inheritance functionality
     */
    custom = "custom"
}
/**
 * @beta
 */
export declare enum PathResolutionMethod {
    /**
     * Resolve a path relative to the configuration file
     */
    resolvePathRelativeToConfigurationFile = 0,
    /**
     * Resolve a path relative to the root of the project containing the configuration file
     */
    resolvePathRelativeToProjectRoot = 1,
    /**
     * Treat the property as a NodeJS-style require/import reference and resolve using standard
     * NodeJS filesystem resolution
     */
    NodeResolve = 2,
    /**
     * Resolve the property using a custom resolver.
     */
    custom = 3
}
/**
 * Used to specify how node(s) in a JSON object should be processed after being loaded.
 *
 * @beta
 */
export interface IJsonPathMetadata {
    /**
     * If `IJsonPathMetadata.pathResolutionMethod` is set to `PathResolutionMethod.custom`,
     * this property be used to resolve the path.
     */
    customResolver?: (configurationFilePath: string, propertyName: string, propertyValue: string) => string;
    /**
     * If this property describes a filesystem path, use this property to describe
     * how the path should be resolved.
     */
    pathResolutionMethod?: PathResolutionMethod;
}
/**
 * @beta
 */
export declare type PropertyInheritanceCustomFunction<TObject> = (currentObject: TObject, parentObject: TObject) => TObject;
/**
 * @beta
 */
export interface IPropertyInheritance<TInheritanceType extends InheritanceType> {
    inheritanceType: TInheritanceType;
}
/**
 * @beta
 */
export interface ICustomPropertyInheritance<TObject> extends IPropertyInheritance<InheritanceType.custom> {
    /**
     * Provides a custom inheritance function. This function takes two arguments: the first is the
     * child file's object, and the second is the parent file's object. The function should return
     * the resulting combined object.
     */
    inheritanceFunction: PropertyInheritanceCustomFunction<TObject>;
}
/**
 * @beta
 */
export declare type IPropertiesInheritance<TConfigurationFile> = {
    [propertyName in keyof TConfigurationFile]?: IPropertyInheritance<InheritanceType.append | InheritanceType.replace> | ICustomPropertyInheritance<TConfigurationFile[propertyName]>;
};
/**
 * Keys in this object are JSONPaths {@link https://jsonpath.com/}, and values are objects
 * that describe how node(s) selected by the JSONPath are processed after loading.
 *
 * @beta
 */
export interface IJsonPathsMetadata {
    [jsonPath: string]: IJsonPathMetadata;
}
/**
 * @beta
 */
export interface IConfigurationFileOptions<TConfigurationFile> {
    /**
     * A project root-relative path to the configuration file that should be loaded.
     */
    projectRelativeFilePath: string;
    /**
     * The path to the schema for the configuration file.
     */
    jsonSchemaPath: string;
    /**
     * Use this property to specify how JSON nodes are postprocessed.
     */
    jsonPathMetadata?: IJsonPathsMetadata;
    /**
     * Use this property to control how root-level properties are handled between parent and child
     * configuration files.
     */
    propertyInheritance?: IPropertiesInheritance<TConfigurationFile>;
}
/**
 * @beta
 */
export interface IOriginalValueOptions<TParentProperty> {
    parentObject: TParentProperty;
    propertyName: keyof TParentProperty;
}
/**
 * @beta
 */
export declare class ConfigurationFile<TConfigurationFile> {
    private readonly _schemaPath;
    /** {@inheritDoc IConfigurationFileOptions.projectRelativeFilePath} */
    readonly projectRelativeFilePath: string;
    private readonly _jsonPathMetadata;
    private readonly _propertyInheritanceTypes;
    private __schema;
    private get _schema();
    private readonly _configPromiseCache;
    private readonly _packageJsonLookup;
    constructor(options: IConfigurationFileOptions<TConfigurationFile>);
    /**
     * Find and return a configuration file for the specified project, automatically resolving
     * `extends` properties and handling rigged configuration files. Will throw an error if a configuration
     * file cannot be found in the rig or project config folder.
     */
    loadConfigurationFileForProjectAsync(terminal: Terminal, projectPath: string, rigConfig?: RigConfig): Promise<TConfigurationFile>;
    /**
     * This function is identical to {@link ConfigurationFile.loadConfigurationFileForProjectAsync}, except
     * that it returns `undefined` instead of throwing an error if the configuration file cannot be found.
     */
    tryLoadConfigurationFileForProjectAsync(terminal: Terminal, projectPath: string, rigConfig?: RigConfig): Promise<TConfigurationFile | undefined>;
    /**
     * @internal
     */
    static _formatPathForLogging: (path: string) => string;
    /**
     * Get the path to the source file that the referenced property was originally
     * loaded from.
     */
    getObjectSourceFilePath<TObject extends object>(obj: TObject): string | undefined;
    /**
     * Get the value of the specified property on the specified object that was originally
     * loaded from a configuration file.
     */
    getPropertyOriginalValue<TParentProperty extends object, TValue>(options: IOriginalValueOptions<TParentProperty>): TValue | undefined;
    private _loadConfigurationFileInnerWithCacheAsync;
    private _loadConfigurationFileInnerAsync;
    private _tryLoadConfigurationFileInRigAsync;
    private _annotateProperties;
    private _annotateProperty;
    private _resolvePathProperty;
    private _getConfigurationFilePathForProject;
}
//# sourceMappingURL=ConfigurationFile.d.ts.map