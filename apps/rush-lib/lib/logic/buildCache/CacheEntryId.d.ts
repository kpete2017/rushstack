export interface IGenerateCacheEntryIdOptions {
    projectName: string;
    projectStateHash: string;
}
export declare type GetCacheEntryIdFunction = (options: IGenerateCacheEntryIdOptions) => string;
export declare class CacheEntryId {
    private constructor();
    static parsePattern(pattern?: string): GetCacheEntryIdFunction;
}
//# sourceMappingURL=CacheEntryId.d.ts.map