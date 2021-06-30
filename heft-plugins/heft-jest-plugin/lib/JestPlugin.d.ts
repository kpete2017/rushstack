import './jestWorkerPatch';
import type { IBuildStageProperties, ITestStageProperties, IHeftPlugin, HeftConfiguration, HeftSession, ScopedLogger } from '@rushstack/heft';
import { Config } from '@jest/types';
import { ConfigurationFile } from '@rushstack/heft-config-file';
import { JsonSchema } from '@rushstack/node-core-library';
export interface IJestPluginOptions {
    disableConfigurationModuleResolution?: boolean;
    configurationPath?: string;
}
export interface IHeftJestConfiguration extends Config.InitialOptions {
}
/**
 * @internal
 */
export declare class JestPlugin implements IHeftPlugin<IJestPluginOptions> {
    readonly pluginName: string;
    readonly optionsSchema: JsonSchema;
    /**
     * Runs required setup before running Jest through the JestPlugin.
     */
    static _setupJestAsync(scopedLogger: ScopedLogger, heftConfiguration: HeftConfiguration, debugMode: boolean, buildStageProperties: IBuildStageProperties, options?: IJestPluginOptions): Promise<void>;
    /**
     * Runs Jest using the provided options.
     */
    static _runJestAsync(scopedLogger: ScopedLogger, heftConfiguration: HeftConfiguration, debugMode: boolean, testStageProperties: ITestStageProperties, options?: IJestPluginOptions): Promise<void>;
    /**
     * Returns the loader for the `config/api-extractor-task.json` config file.
     */
    static _getJestConfigurationLoader(buildFolder: string, projectRelativeFilePath: string): ConfigurationFile<IHeftJestConfiguration>;
    private static _extractHeftJestReporters;
    /**
     * Returns the reporter config using the HeftJestReporter and the provided options.
     */
    private static _getHeftJestReporterConfig;
    /**
     * Resolve all specified properties to an absolute path using Jest resolution. In addition, the following
     * transforms will be applied to the provided propertyValue before resolution:
     *   - replace <rootDir> with the same rootDir
     *   - replace <configDir> with the directory containing the current configuration file
     *   - replace <packageDir:...> with the path to the resolved package (NOT module)
     */
    private static _getJsonPathMetadata;
    /**
     * Finds the indices of jest reporters with a given name
     */
    private static _findIndexes;
    /**
     * Add the jest-cache folder to the list of paths to delete when running the "clean" stage.
     */
    private static _includeJestCacheWhenCleaning;
    /**
     * Returns the absolute path to the jest-cache directory.
     */
    private static _getJestCacheFolder;
    apply(heftSession: HeftSession, heftConfiguration: HeftConfiguration, options?: IJestPluginOptions): void;
}
//# sourceMappingURL=JestPlugin.d.ts.map