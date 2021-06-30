import { BaseRushAction } from './BaseRushAction';
import { RushCommandLineParser } from '../RushCommandLineParser';
export declare class WriteBuildCacheAction extends BaseRushAction {
    private _command;
    private _verboseFlag;
    constructor(parser: RushCommandLineParser);
    onDefineParameters(): void;
    runAsync(): Promise<void>;
}
//# sourceMappingURL=WriteBuildCacheAction.d.ts.map