import { BaseRushAction } from './BaseRushAction';
import { RushCommandLineParser } from '../RushCommandLineParser';
export declare class AddAction extends BaseRushAction {
    private _allFlag;
    private _exactFlag;
    private _caretFlag;
    private _devDependencyFlag;
    private _makeConsistentFlag;
    private _skipUpdateFlag;
    private _packageName;
    constructor(parser: RushCommandLineParser);
    onDefineParameters(): void;
    runAsync(): Promise<void>;
}
//# sourceMappingURL=AddAction.d.ts.map