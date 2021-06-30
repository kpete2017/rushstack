import { HeftSession } from '../../pluginFramework/HeftSession';
import { HeftConfiguration } from '../../configuration/HeftConfiguration';
import { IHeftPlugin } from '../../pluginFramework/IHeftPlugin';
import { CopyFromCacheMode } from '../../stages/BuildStage';
import { ToolPackageResolver } from '../../utilities/ToolPackageResolver';
import { ISharedCopyConfiguration } from '../../utilities/CoreConfigFiles';
interface IEmitModuleKind {
    moduleKind: 'commonjs' | 'amd' | 'umd' | 'system' | 'es2015' | 'esnext';
    outFolderName: string;
    jsExtensionOverride?: string;
}
export interface ISharedTypeScriptConfiguration {
    /**
     * Can be set to 'copy' or 'hardlink'. If set to 'copy', copy files from cache. If set to 'hardlink', files will be
     * hardlinked to the cache location. This option is useful when producing a tarball of build output as TAR files
     * don't handle these hardlinks correctly. 'hardlink' is the default behavior.
     */
    copyFromCacheMode?: CopyFromCacheMode | undefined;
    /**
     * If provided, emit these module kinds in addition to the modules specified in the tsconfig.
     * Note that this option only applies to the main tsconfig.json configuration.
     */
    additionalModuleKindsToEmit?: IEmitModuleKind[] | undefined;
    /**
     * If 'true', emit CommonJS output into the TSConfig outDir with the file extension '.cjs'
     */
    emitCjsExtensionForCommonJS?: boolean | undefined;
    /**
     * If 'true', emit ESModule output into the TSConfig outDir with the file extension '.mjs'
     */
    emitMjsExtensionForESModule?: boolean | undefined;
    /**
     * Specifies the intermediary folder that tests will use.  Because Jest uses the
     * Node.js runtime to execute tests, the module format must be CommonJS.
     *
     * The default value is "lib".
     */
    emitFolderNameForTests?: string;
    /**
     * Configures additional file types that should be copied into the TypeScript compiler's emit folders, for example
     * so that these files can be resolved by import statements.
     */
    staticAssetsToCopy?: ISharedCopyConfiguration;
}
export interface ITypeScriptConfigurationJson extends ISharedTypeScriptConfiguration {
    disableTslint?: boolean;
    maxWriteParallelism: number | undefined;
}
export declare class TypeScriptPlugin implements IHeftPlugin {
    readonly pluginName: string;
    private readonly _taskPackageResolver;
    private _typeScriptConfigurationFileCache;
    constructor(taskPackageResolver: ToolPackageResolver);
    apply(heftSession: HeftSession, heftConfiguration: HeftConfiguration): void;
    private _ensureConfigFileLoadedAsync;
    private _updateCleanOptions;
    private _runTypeScriptAsync;
}
export {};
//# sourceMappingURL=TypeScriptPlugin.d.ts.map