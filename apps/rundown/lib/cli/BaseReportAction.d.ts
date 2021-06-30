import { CommandLineAction, ICommandLineActionOptions, CommandLineStringParameter, CommandLineFlagParameter } from '@rushstack/ts-command-line';
export declare abstract class BaseReportAction extends CommandLineAction {
    protected scriptParameter: CommandLineStringParameter;
    protected argsParameter: CommandLineStringParameter;
    protected quietParameter: CommandLineFlagParameter;
    protected ignoreExitCodeParameter: CommandLineFlagParameter;
    constructor(options: ICommandLineActionOptions);
    protected onDefineParameters(): void;
}
//# sourceMappingURL=BaseReportAction.d.ts.map