import type * as TTypescript from 'typescript';
import { ExtendedTypeScript, IExtendedSourceFile } from './internalTypings/TypeScriptInternals';
export interface ICachedEmitModuleKind {
    moduleKind: TTypescript.ModuleKind;
    outFolderPath: string;
    /**
     * TypeScript's output is placed in the \<project root\>/.heft/build-cache folder.
     * This is the the path to the subfolder in the build-cache folder that this emit kind
     * written to.
     */
    cacheOutFolderPath: string;
    /**
     * File extension to use instead of '.js' for emitted ECMAScript files.
     * For example, '.cjs' to indicate commonjs content, or '.mjs' to indicate ECMAScript modules.
     */
    jsExtensionOverride: string | undefined;
    /**
     * Set to true if this is the emit kind that is specified in the tsconfig.json.
     * Declarations are only emitted for the primary module kind.
     */
    isPrimary: boolean;
}
export declare class EmitFilesPatch {
    private static _patchedTs;
    private static _baseEmitFiles;
    private static _originalOutDir;
    private static _redirectedOutDir;
    static install(ts: ExtendedTypeScript, tsconfig: TTypescript.ParsedCommandLine, moduleKindsToEmit: ICachedEmitModuleKind[], useBuildCache: boolean, changedFiles?: Set<IExtendedSourceFile>): void;
    static get isInstalled(): boolean;
    /**
     * Wraps the writeFile callback on the IEmitHost to override the .js extension, if applicable
     */
    static wrapWriteFile(baseWriteFile: TTypescript.WriteFileCallback, jsExtensionOverride: string | undefined): TTypescript.WriteFileCallback;
    static getRedirectedFilePath(filePath: string): string;
    static uninstall(ts: ExtendedTypeScript): void;
}
//# sourceMappingURL=EmitFilesPatch.d.ts.map