import { ConfigurationFile } from '@rushstack/heft-config-file';
import { IApiExtractorPluginConfiguration } from '../plugins/ApiExtractorPlugin/ApiExtractorPlugin';
import { ITypeScriptConfigurationJson } from '../plugins/TypeScriptPlugin/TypeScriptPlugin';
import { HeftConfiguration } from '../configuration/HeftConfiguration';
import { Terminal } from '@rushstack/node-core-library';
import { ISassConfigurationJson } from '../plugins/SassTypingsPlugin/SassTypingsPlugin';
import { INodeServicePluginConfiguration } from '../plugins/NodeServicePlugin';
export declare enum HeftEvent {
    clean = "clean",
    preCompile = "pre-compile",
    compile = "compile",
    bundle = "bundle",
    postBuild = "post-build",
    test = "test"
}
export interface IHeftConfigurationJsonEventActionBase {
    actionKind: string;
    heftEvent: 'clean' | 'pre-compile' | 'compile' | 'bundle' | 'post-build' | 'test';
    actionId: string;
}
export interface IHeftConfigurationDeleteGlobsEventAction extends IHeftConfigurationJsonEventActionBase {
    actionKind: 'deleteGlobs';
    globsToDelete: string[];
}
export interface IHeftConfigurationRunScriptEventAction extends IHeftConfigurationJsonEventActionBase {
    actionKind: 'runScript';
    scriptPath: string;
    scriptOptions: Record<string, any>;
}
export interface ISharedCopyConfiguration {
    /**
     * File extensions that should be copied from the source folder to the destination folder(s)
     */
    fileExtensions?: string[];
    /**
     * Globs that should be explicitly excluded. This takes precedence over globs listed in "includeGlobs" and
     * files that match the file extensions provided in "fileExtensions".
     */
    excludeGlobs?: string[];
    /**
     * Globs that should be explicitly included.
     */
    includeGlobs?: string[];
    /**
     * Copy only the file and discard the relative path from the source folder.
     */
    flatten?: boolean;
    /**
     * Hardlink files instead of copying.
     */
    hardlink?: boolean;
}
export interface IExtendedSharedCopyConfiguration extends ISharedCopyConfiguration {
    /**
     * The folder from which files should be copied, relative to the project root. For example, "src".
     */
    sourceFolder: string;
    /**
     * Folder(s) to which files should be copied, relative to the project root. For example ["lib", "lib-cjs"].
     */
    destinationFolders: string[];
}
export interface IHeftConfigurationCopyFilesEventAction extends IHeftConfigurationJsonEventActionBase {
    actionKind: 'copyFiles';
    copyOperations: IExtendedSharedCopyConfiguration[];
}
export interface IHeftConfigurationJsonPluginSpecifier {
    plugin: string;
    options?: object;
}
export interface IHeftConfigurationJson {
    eventActions?: IHeftConfigurationJsonEventActionBase[];
    heftPlugins?: IHeftConfigurationJsonPluginSpecifier[];
}
export interface IHeftEventActions {
    copyFiles: Map<HeftEvent, IHeftConfigurationCopyFilesEventAction[]>;
    deleteGlobs: Map<HeftEvent, IHeftConfigurationDeleteGlobsEventAction[]>;
    runScript: Map<HeftEvent, IHeftConfigurationRunScriptEventAction[]>;
}
export declare class CoreConfigFiles {
    private static _heftConfigFileLoader;
    private static _heftConfigFileEventActionsCache;
    private static _apiExtractorTaskConfigurationLoader;
    private static _typeScriptConfigurationFileLoader;
    private static _nodeServiceConfigurationLoader;
    private static _sassConfigurationFileLoader;
    /**
     * Returns the loader for the `config/heft.json` config file.
     */
    static get heftConfigFileLoader(): ConfigurationFile<IHeftConfigurationJson>;
    /**
     * Gets the eventActions from config/heft.json
     */
    static getConfigConfigFileEventActionsAsync(terminal: Terminal, heftConfiguration: HeftConfiguration): Promise<IHeftEventActions>;
    /**
     * Returns the loader for the `config/api-extractor-task.json` config file.
     */
    static get apiExtractorTaskConfigurationLoader(): ConfigurationFile<IApiExtractorPluginConfiguration>;
    /**
     * Returns the loader for the `config/typescript.json` config file.
     */
    static get typeScriptConfigurationFileLoader(): ConfigurationFile<ITypeScriptConfigurationJson>;
    /**
     * Returns the loader for the `config/api-extractor-task.json` config file.
     */
    static get nodeServiceConfigurationLoader(): ConfigurationFile<INodeServicePluginConfiguration>;
    static get sassConfigurationFileLoader(): ConfigurationFile<ISassConfigurationJson>;
    private static _addEventActionToMap;
    private static _parseHeftEvent;
    private static _inheritArray;
}
//# sourceMappingURL=CoreConfigFiles.d.ts.map