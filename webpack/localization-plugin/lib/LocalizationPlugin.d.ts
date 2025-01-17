import { Terminal } from '@rushstack/node-core-library';
import * as Webpack from 'webpack';
import { ILocalizationPluginOptions, ILocalizationFile, ILocaleElementMap } from './interfaces';
/**
 * @internal
 */
export interface IStringPlaceholder {
    value: string;
    suffix: string;
}
/**
 * @internal
 */
export interface IAddDefaultLocFileResult {
    /**
     * A list of paths to translation files that were loaded
     */
    additionalLoadedFilePaths: string[];
    errors: Error[];
}
/**
 * @internal
 */
export interface IStringSerialNumberData {
    values: ILocaleElementMap;
    locFilePath: string;
    stringName: string;
}
/**
 * This plugin facilitates localization in webpack.
 *
 * @public
 */
export declare class LocalizationPlugin implements Webpack.Plugin {
    /**
     * @internal
     */
    stringKeys: Map<string, IStringPlaceholder>;
    private _options;
    private _resolvedTranslatedStringsFromOptions;
    private _filesToIgnore;
    private _stringPlaceholderCounter;
    private _stringPlaceholderMap;
    private _locales;
    private _passthroughLocaleName;
    private _defaultLocale;
    private _noStringsLocaleName;
    private _fillMissingTranslationStrings;
    private _pseudolocalizers;
    private _resxNewlineNormalization;
    /**
     * The outermost map's keys are the locale names.
     * The middle map's keys are the resolved, file names.
     * The innermost map's keys are the string identifiers and its values are the string values.
     */
    private _resolvedLocalizedStrings;
    constructor(options: ILocalizationPluginOptions);
    apply(compiler: Webpack.Compiler): void;
    /**
     * @internal
     *
     * @returns
     */
    addDefaultLocFile(terminal: Terminal, localizedResourcePath: string, localizedResourceData: ILocalizationFile): IAddDefaultLocFileResult;
    /**
     * @internal
     */
    getDataForSerialNumber(serialNumber: string): IStringSerialNumberData | undefined;
    private _addLocFile;
    private _initializeAndValidateOptions;
    private _getPlaceholderString;
    private _chunkHasLocalizedModules;
    private _convertLocalizationFileToLocData;
}
//# sourceMappingURL=LocalizationPlugin.d.ts.map