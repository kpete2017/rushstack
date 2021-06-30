export declare class Rundown {
    private _importedModuleMap;
    invokeAsync(scriptPath: string, args: string | undefined, quiet: boolean, ignoreExitCode: boolean): Promise<void>;
    writeSnapshotReport(): void;
    writeInspectReport(traceImports: boolean): void;
    private _spawnLauncherAsync;
}
//# sourceMappingURL=Rundown.d.ts.map