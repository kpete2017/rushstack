import { BuildAction } from './BuildAction';
import { IHeftActionBaseOptions } from './HeftActionBase';
export declare class TestAction extends BuildAction {
    private _noTestFlag;
    private _noBuildFlag;
    private _updateSnapshotsFlag;
    private _findRelatedTests;
    private _silent;
    private _testNamePattern;
    private _testPathPattern;
    private _testTimeout;
    private _detectOpenHandles;
    private _debugHeftReporter;
    private _maxWorkers;
    constructor(heftActionOptions: IHeftActionBaseOptions);
    onDefineParameters(): void;
    protected actionExecuteAsync(): Promise<void>;
}
//# sourceMappingURL=TestAction.d.ts.map