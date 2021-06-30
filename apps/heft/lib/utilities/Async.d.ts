import { ScopedLogger } from '../pluginFramework/logging/ScopedLogger';
export declare class Async {
    static forEachLimitAsync<TEntry>(array: TEntry[], parallelismLimit: number, fn: (entry: TEntry) => Promise<void>): Promise<void>;
    static runWatcherWithErrorHandling(fn: () => Promise<void>, scopedLogger: ScopedLogger): void;
}
//# sourceMappingURL=Async.d.ts.map