import { IModuleMinificationCallback, IModuleMinificationRequest, IModuleMinifier } from './ModuleMinifierPlugin.types';
import { MinifyOptions } from 'terser';
import './OverrideWebpackIdentifierAllocation';
/**
 * Options for configuring the WorkerPoolMinifier
 * @public
 */
export interface IWorkerPoolMinifierOptions {
    /**
     * Maximum number of worker threads to use. Will never use more than there are modules to process.
     * Defaults to os.cpus().length
     */
    maxThreads?: number;
    /**
     * The options to forward to Terser.
     * `output.comments` is currently not configurable and will always extract license comments to a separate file.
     */
    terserOptions?: MinifyOptions;
}
/**
 * Minifier implementation that uses a thread pool for minification.
 * @public
 */
export declare class WorkerPoolMinifier implements IModuleMinifier {
    private readonly _pool;
    private _refCount;
    private _deduped;
    private _minified;
    private readonly _resultCache;
    private readonly _activeRequests;
    constructor(options: IWorkerPoolMinifierOptions);
    get maxThreads(): number;
    set maxThreads(threads: number);
    /**
     * Transform code by farming it out to a worker pool.
     * @param request - The request to process
     * @param callback - The callback to invoke
     */
    minify(request: IModuleMinificationRequest, callback: IModuleMinificationCallback): void;
    ref(): () => Promise<void>;
}
//# sourceMappingURL=WorkerPoolMinifier.d.ts.map