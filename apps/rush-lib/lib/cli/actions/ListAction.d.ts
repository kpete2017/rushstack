import { BaseRushAction } from './BaseRushAction';
import { RushCommandLineParser } from '../RushCommandLineParser';
export interface IJsonEntry {
    name: string;
    version: string;
    path: string;
    fullPath: string;
}
export interface IJsonOutput {
    projects: IJsonEntry[];
}
export declare class ListAction extends BaseRushAction {
    private _version;
    private _path;
    private _fullPath;
    private _jsonFlag;
    constructor(parser: RushCommandLineParser);
    protected onDefineParameters(): void;
    protected runAsync(): Promise<void>;
    private _printJson;
    private _printList;
    private _printListTable;
}
//# sourceMappingURL=ListAction.d.ts.map