/// <reference types="node" />
import type * as TTslint from 'tslint';
import * as crypto from 'crypto';
import { Terminal } from '@rushstack/node-core-library';
import { LinterBase, ILinterBaseOptions } from './LinterBase';
import { IExtendedSourceFile, IExtendedProgram } from './internalTypings/TypeScriptInternals';
import { TypeScriptCachedFileSystem } from '../../utilities/fileSystem/TypeScriptCachedFileSystem';
interface ITslintOptions extends ILinterBaseOptions {
    tslintPackagePath: string;
    cachedFileSystem: TypeScriptCachedFileSystem;
}
export declare class Tslint extends LinterBase<TTslint.RuleFailure> {
    private readonly _tslint;
    private readonly _cachedFileSystem;
    private _tslintConfiguration;
    private _linter;
    private _enabledRules;
    private _ruleSeverityMap;
    protected _lintResult: TTslint.LintResult;
    constructor(options: ITslintOptions);
    /**
     * Returns the sha1 hash of the contents of the config file at the provided path and the
     * the configs files that the referenced file extends.
     *
     * @param previousHash - If supplied, the hash is updated with the contents of the
     * file's extended configs and itself before being returned. Passing a digested hash to
     * this parameter will result in an error.
     */
    static getConfigHash(configFilePath: string, terminal: Terminal, cachedFileSystem: TypeScriptCachedFileSystem, previousHash?: crypto.Hash): crypto.Hash;
    printVersionHeader(): void;
    reportFailures(): void;
    protected get cacheVersion(): string;
    protected initializeAsync(tsProgram: IExtendedProgram): Promise<void>;
    protected lintFile(sourceFile: IExtendedSourceFile): TTslint.RuleFailure[];
    protected lintingFinished(failures: TTslint.RuleFailure[]): void;
    protected isFileExcludedAsync(filePath: string): Promise<boolean>;
}
export {};
//# sourceMappingURL=Tslint.d.ts.map