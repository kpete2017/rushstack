export declare const enum LauncherAction {
    Snapshot = "snapshot",
    Inspect = "inspect"
}
export interface IIpcTraceRecord {
    importedModule: string;
    callingModule: string;
}
export interface IIpcTrace {
    id: 'trace';
    records: IIpcTraceRecord[];
}
export interface IIpcDone {
    id: 'done';
}
export declare type IpcMessage = IIpcTrace | IIpcDone;
//# sourceMappingURL=LauncherTypes.d.ts.map