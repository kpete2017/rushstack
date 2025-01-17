import * as Webpack from 'webpack';
import { LocalizationPlugin } from './LocalizationPlugin';
export interface IProcessAssetOptionsBase {
    plugin: LocalizationPlugin;
    compilation: Webpack.compilation.Compilation;
    assetName: string;
    asset: IAsset;
    chunk: Webpack.compilation.Chunk;
    noStringsLocaleName: string;
    chunkHasLocalizedModules: (chunk: Webpack.compilation.Chunk) => boolean;
}
export interface IProcessNonLocalizedAssetOptions extends IProcessAssetOptionsBase {
}
export interface IProcessLocalizedAssetOptions extends IProcessAssetOptionsBase {
    locales: Set<string>;
    fillMissingTranslationStrings: boolean;
    defaultLocale: string;
}
export interface IAsset {
    size(): number;
    source(): string;
}
export interface IProcessAssetResult {
    filename: string;
    asset: IAsset;
}
export declare const PLACEHOLDER_REGEX: RegExp;
export declare class AssetProcessor {
    static processLocalizedAsset(options: IProcessLocalizedAssetOptions): Map<string, IProcessAssetResult>;
    static processNonLocalizedAsset(options: IProcessNonLocalizedAssetOptions): IProcessAssetResult;
    private static _reconstructLocalized;
    private static _reconstructNonLocalized;
    private static _parseStringToReconstructionSequence;
    private static _getJsonpFunction;
}
//# sourceMappingURL=AssetProcessor.d.ts.map