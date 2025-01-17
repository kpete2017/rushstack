import { Terminal } from '@rushstack/node-core-library';
import { HeftConfiguration } from '../configuration/HeftConfiguration';
export interface IToolPackageResolution {
    typeScriptPackagePath: string | undefined;
    tslintPackagePath: string | undefined;
    eslintPackagePath: string | undefined;
    apiExtractorPackagePath: string | undefined;
}
export declare class ToolPackageResolver {
    private _packageJsonLookup;
    private _resolverCache;
    resolveToolPackagesAsync(heftConfiguration: HeftConfiguration, terminal: Terminal): Promise<IToolPackageResolution>;
    private _resolveToolPackagesInnerAsync;
    private _tryResolveToolPackageAsync;
}
//# sourceMappingURL=ToolPackageResolver.d.ts.map