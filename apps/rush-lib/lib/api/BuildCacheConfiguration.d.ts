import { Terminal } from '@rushstack/node-core-library';
import { RushConfiguration } from './RushConfiguration';
import { FileSystemBuildCacheProvider } from '../logic/buildCache/FileSystemBuildCacheProvider';
import { CloudBuildCacheProviderBase } from '../logic/buildCache/CloudBuildCacheProviderBase';
import { GetCacheEntryIdFunction } from '../logic/buildCache/CacheEntryId';
/**
 * Use this class to load and save the "common/config/rush/build-cache.json" config file.
 * This file provides configuration options for cached project build output.
 * @public
 */
export declare class BuildCacheConfiguration {
    private static _jsonSchema;
    /**
     * Indicates whether the build cache feature is enabled.
     * Typically it is enabled in the build-cache.json config file.
     */
    readonly buildCacheEnabled: boolean;
    readonly getCacheEntryId: GetCacheEntryIdFunction;
    readonly localCacheProvider: FileSystemBuildCacheProvider;
    readonly cloudCacheProvider: CloudBuildCacheProviderBase | undefined;
    private constructor();
    /**
     * Attempts to load the build-cache.json data from the standard file path `common/config/rush/build-cache.json`.
     * If the file has not been created yet, then undefined is returned.
     */
    static tryLoadAsync(terminal: Terminal, rushConfiguration: RushConfiguration): Promise<BuildCacheConfiguration | undefined>;
    /**
     * Loads the build-cache.json data from the standard file path `common/config/rush/build-cache.json`.
     * If the file has not been created yet, or if the feature is not enabled, then an error is reported.
     */
    static loadAndRequireEnabledAsync(terminal: Terminal, rushConfiguration: RushConfiguration): Promise<BuildCacheConfiguration>;
    private static _loadAsync;
    static getBuildCacheConfigFilePath(rushConfiguration: RushConfiguration): string;
    private _createAzureStorageBuildCacheProvider;
    private _createAmazonS3BuildCacheProvider;
}
//# sourceMappingURL=BuildCacheConfiguration.d.ts.map