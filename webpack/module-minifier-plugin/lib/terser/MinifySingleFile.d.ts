import { MinifyOptions } from 'terser';
import './Base54';
declare module 'terser' {
    interface SourceMapOptions {
        asObject?: boolean;
    }
}
import { IModuleMinificationRequest, IModuleMinificationResult } from '../ModuleMinifierPlugin.types';
/**
 * Minifies a single chunk of code. Factored out for reuse between ThreadPoolMinifier and SynchronousMinifier
 * Mutates terserOptions.output.comments to support comment extraction
 * @internal
 */
export declare function minifySingleFile(request: IModuleMinificationRequest, terserOptions: MinifyOptions): IModuleMinificationResult;
//# sourceMappingURL=MinifySingleFile.d.ts.map