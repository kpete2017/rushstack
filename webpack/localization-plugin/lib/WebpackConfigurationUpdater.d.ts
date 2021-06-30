import * as Webpack from 'webpack';
import { NewlineKind } from '@rushstack/node-core-library';
import { LocalizationPlugin } from './LocalizationPlugin';
export interface IWebpackConfigurationUpdaterOptions {
    pluginInstance: LocalizationPlugin;
    configuration: Webpack.Configuration;
    filesToIgnore: Set<string>;
    localeNameOrPlaceholder: string;
    resxNewlineNormalization: NewlineKind | undefined;
}
export declare class WebpackConfigurationUpdater {
    static amendWebpackConfigurationForMultiLocale(options: IWebpackConfigurationUpdaterOptions): void;
    static amendWebpackConfigurationForInPlaceLocFiles(options: IWebpackConfigurationUpdaterOptions): void;
    private static _tryUpdateLocaleTokenInPublicPathPlugin;
    private static _addLoadersForLocFiles;
    private static _addRulesToConfiguration;
    private static _tryUpdateSourceMapFilename;
}
//# sourceMappingURL=WebpackConfigurationUpdater.d.ts.map