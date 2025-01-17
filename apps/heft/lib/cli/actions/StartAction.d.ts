import { IHeftActionBaseOptions, HeftActionBase } from './HeftActionBase';
export declare class StartAction extends HeftActionBase {
    private _buildStandardParameters;
    private _cleanFlag;
    constructor(heftActionOptions: IHeftActionBaseOptions);
    onDefineParameters(): void;
    protected actionExecuteAsync(): Promise<void>;
    protected afterExecuteAsync(): Promise<void>;
}
//# sourceMappingURL=StartAction.d.ts.map