import { CommandLineParser } from '@rushstack/ts-command-line';
export declare class WidgetCommandLine extends CommandLineParser {
    private _verbose;
    constructor();
    protected onDefineParameters(): void;
    protected onExecute(): Promise<void>;
}
