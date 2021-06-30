import * as TEslint from 'eslint';
import { LinterBase, ILinterBaseOptions } from './LinterBase';
import { IExtendedSourceFile } from './internalTypings/TypeScriptInternals';
interface IEslintOptions extends ILinterBaseOptions {
    eslintPackagePath: string;
}
export declare class Eslint extends LinterBase<TEslint.ESLint.LintResult> {
    private readonly _eslintPackagePath;
    private readonly _eslintPackage;
    private readonly _eslintTimings;
    private _eslintCli;
    private _eslint;
    private _eslintBaseConfiguration;
    private _lintResult;
    constructor(options: IEslintOptions);
    printVersionHeader(): void;
    reportFailures(): void;
    protected get cacheVersion(): string;
    protected initializeAsync(): Promise<void>;
    protected lintFile(sourceFile: IExtendedSourceFile): TEslint.ESLint.LintResult[];
    protected lintingFinished(lintFailures: TEslint.ESLint.LintResult[]): void;
    protected isFileExcludedAsync(filePath: string): Promise<boolean>;
    private _patchTimer;
}
export {};
//# sourceMappingURL=Eslint.d.ts.map