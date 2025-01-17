import { MinifyOptions } from 'terser';
export interface IParallelWebpackOptions {
    cacheDirectory?: string;
    configFilePath: string;
    maxCompilationThreads?: number;
    sourceMap?: boolean | undefined;
    terserOptions?: MinifyOptions;
    usePortableModules?: boolean;
}
export declare function runParallel(options: IParallelWebpackOptions): Promise<void>;
//# sourceMappingURL=ParallelCompiler.d.ts.map