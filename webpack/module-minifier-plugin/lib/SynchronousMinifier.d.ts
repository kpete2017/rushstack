import { IModuleMinificationCallback, IModuleMinificationRequest, IModuleMinifier } from './ModuleMinifierPlugin.types';
import { MinifyOptions } from 'terser';
import './OverrideWebpackIdentifierAllocation';
/**
 * Options for configuring the SynchronousMinifier
 * @public
 */
export interface ISynchronousMinifierOptions {
    terserOptions?: MinifyOptions;
}
/**
 * Minifier implementation that synchronously minifies code on the main thread.
 * @public
 */
export declare class SynchronousMinifier implements IModuleMinifier {
    readonly terserOptions: MinifyOptions;
    private readonly _resultCache;
    constructor(options: ISynchronousMinifierOptions);
    /**
     * Transform that synchronously invokes Terser
     * @param request - The request to process
     * @param callback - The callback to invoke
     */
    minify(request: IModuleMinificationRequest, callback: IModuleMinificationCallback): void;
}
//# sourceMappingURL=SynchronousMinifier.d.ts.map