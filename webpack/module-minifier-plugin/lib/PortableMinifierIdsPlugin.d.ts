import { Compiler, Plugin } from 'webpack';
import { IModuleMinifierPluginHooks } from './ModuleMinifierPlugin.types';
/**
 * Plugin responsible for converting the Webpack module ids (of whatever variety) to stable ids before code is handed to the minifier, then back again.
 * Uses the node module identity of the target module. Will emit an error if it encounters multiple versions of the same package in the same compilation.
 * @public
 */
export declare class PortableMinifierModuleIdsPlugin implements Plugin {
    private readonly _minifierHooks;
    constructor(minifierHooks: IModuleMinifierPluginHooks);
    apply(compiler: Compiler): void;
}
//# sourceMappingURL=PortableMinifierIdsPlugin.d.ts.map