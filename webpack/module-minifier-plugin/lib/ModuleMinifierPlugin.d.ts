import * as webpack from 'webpack';
import { IModuleMinifier, IModuleMinifierPluginOptions, IModuleMinifierPluginHooks } from './ModuleMinifierPlugin.types';
/**
 * Webpack plugin that minifies code on a per-module basis rather than per-asset. The actual minification is handled by the input `minifier` object.
 * @public
 */
export declare class ModuleMinifierPlugin implements webpack.Plugin {
    readonly hooks: IModuleMinifierPluginHooks;
    minifier: IModuleMinifier;
    private readonly _portableIdsPlugin;
    private readonly _sourceMap;
    constructor(options: IModuleMinifierPluginOptions);
    apply(compiler: webpack.Compiler): void;
}
//# sourceMappingURL=ModuleMinifierPlugin.d.ts.map