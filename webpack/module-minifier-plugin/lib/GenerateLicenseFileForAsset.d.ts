import * as webpack from 'webpack';
import { IAssetInfo, IModuleMap } from './ModuleMinifierPlugin.types';
/**
 * Generates a companion asset containing all extracted comments. If it is non-empty, returns a banner comment directing users to said companion asset.
 *
 * @param compilation - The webpack compilation
 * @param asset - The asset to process
 * @param minifiedModules - The minified modules to pull comments from
 * @param assetName - The name of the asset
 * @public
 */
export declare function generateLicenseFileForAsset(compilation: webpack.compilation.Compilation, asset: IAssetInfo, minifiedModules: IModuleMap): string;
//# sourceMappingURL=GenerateLicenseFileForAsset.d.ts.map