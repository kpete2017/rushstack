import { CommandLineAction } from '@rushstack/ts-command-line';
export declare class RunAction extends CommandLineAction {
    private _title;
    constructor();
    protected onExecute(): Promise<void>;
    protected onDefineParameters(): void;
}
