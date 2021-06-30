import { Terminal } from '@rushstack/node-core-library';
import { IExtendedSourceFile, IExtendedProgram, IExtendedTypeScript } from './internalTypings/TypeScriptInternals';
import { PerformanceMeasurer } from '../../utilities/Performance';
import { IScopedLogger } from '../../pluginFramework/logging/ScopedLogger';
export interface ILinterBaseOptions {
    ts: IExtendedTypeScript;
    scopedLogger: IScopedLogger;
    buildFolderPath: string;
    buildCacheFolderPath: string;
    linterConfigFilePath: string;
    /**
     * A performance measurer for the lint run.
     */
    measurePerformance: PerformanceMeasurer;
}
export interface IRunLinterOptions {
    tsProgram: IExtendedProgram;
    /**
     * All of the files that the TypeScript compiler processed.
     */
    typeScriptFilenames: Set<string>;
    /**
     * The set of files that TypeScript has compiled since the last compilation.
     */
    changedFiles: Set<IExtendedSourceFile>;
}
export interface ITiming {
    duration: number;
    hitCount: number;
}
export declare abstract class LinterBase<TLintResult> {
    protected readonly _scopedLogger: IScopedLogger;
    protected readonly _terminal: Terminal;
    protected readonly _buildFolderPath: string;
    protected readonly _buildCacheFolderPath: string;
    protected readonly _linterConfigFilePath: string;
    protected readonly _measurePerformance: PerformanceMeasurer;
    private readonly _ts;
    private readonly _linterName;
    constructor(linterName: string, options: ILinterBaseOptions);
    protected abstract get cacheVersion(): string;
    abstract printVersionHeader(): void;
    performLintingAsync(options: IRunLinterOptions): Promise<void>;
    abstract reportFailures(): void;
    protected getTiming(timingName: string): ITiming;
    protected abstract initializeAsync(tsProgram: IExtendedProgram): void;
    protected abstract lintFile(sourceFile: IExtendedSourceFile): TLintResult[];
    protected abstract lintingFinished(lintFailures: TLintResult[]): void;
    protected abstract isFileExcludedAsync(filePath: string): Promise<boolean>;
}
//# sourceMappingURL=LinterBase.d.ts.map