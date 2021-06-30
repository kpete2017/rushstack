import { Configuration as WebpackDevServerConfiguration } from 'webpack-dev-server';
import * as webpack from 'webpack';
import type { IBuildStageProperties, IBundleSubstageProperties } from '@rushstack/heft';
/**
 * @public
 */
export interface IWebpackConfigurationWithDevServer extends webpack.Configuration {
    devServer?: WebpackDevServerConfiguration;
}
/**
 * @public
 */
export declare type IWebpackConfiguration = IWebpackConfigurationWithDevServer | IWebpackConfigurationWithDevServer[] | undefined;
/**
 * @public
 */
export interface IWebpackBundleSubstageProperties extends IBundleSubstageProperties {
    /**
     * The configuration used by the Webpack plugin. This must be populated
     * for Webpack to run. If webpackConfigFilePath is specified,
     * this will be populated automatically with the exports of the
     * config file referenced in that property.
     */
    webpackConfiguration?: webpack.Configuration | webpack.Configuration[];
}
/**
 * @public
 */
export interface IWebpackBuildStageProperties extends IBuildStageProperties {
    webpackStats?: webpack.Stats | webpack.MultiStats;
}
export interface IWebpackVersions {
    webpackVersion: string;
    webpackDevServerVersion: string;
}
export declare function getWebpackVersions(): IWebpackVersions;
//# sourceMappingURL=shared.d.ts.map