import { IModuleMinificationCallback, IModuleMinificationRequest, IModuleMinifier } from './ModuleMinifierPlugin.types';
/**
 * Minifier implementation that does not actually transform the code, for debugging.
 * @public
 */
export declare class NoopMinifier implements IModuleMinifier {
    /**
     * No-op code transform.
     * @param request - The request to process
     * @param callback - The callback to invoke
     */
    minify(request: IModuleMinificationRequest, callback: IModuleMinificationCallback): void;
}
//# sourceMappingURL=NoopMinifier.d.ts.map