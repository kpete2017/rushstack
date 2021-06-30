import { CommandLineAction } from '@rushstack/ts-command-line';
export declare class PushAction extends CommandLineAction {
    private _force;
    private _protocol;
    constructor();
    protected onExecute(): Promise<void>;
    protected onDefineParameters(): void;
}
