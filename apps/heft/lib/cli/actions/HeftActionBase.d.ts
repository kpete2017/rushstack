import { CommandLineAction, CommandLineFlagParameter, ICommandLineActionOptions, ICommandLineFlagDefinition, ICommandLineChoiceDefinition, CommandLineChoiceParameter, CommandLineIntegerParameter, ICommandLineIntegerDefinition, CommandLineStringParameter, ICommandLineStringDefinition, CommandLineStringListParameter, ICommandLineStringListDefinition } from '@rushstack/ts-command-line';
import { Terminal } from '@rushstack/node-core-library';
import { MetricsCollector } from '../../metrics/MetricsCollector';
import { HeftConfiguration } from '../../configuration/HeftConfiguration';
import { BuildStage } from '../../stages/BuildStage';
import { CleanStage } from '../../stages/CleanStage';
import { TestStage } from '../../stages/TestStage';
import { LoggingManager } from '../../pluginFramework/logging/LoggingManager';
export interface IStages {
    buildStage: BuildStage;
    cleanStage: CleanStage;
    testStage: TestStage;
}
export interface IHeftActionBaseOptions {
    terminal: Terminal;
    loggingManager: LoggingManager;
    metricsCollector: MetricsCollector;
    heftConfiguration: HeftConfiguration;
    stages: IStages;
}
export declare abstract class HeftActionBase extends CommandLineAction {
    protected readonly terminal: Terminal;
    protected readonly loggingManager: LoggingManager;
    protected readonly metricsCollector: MetricsCollector;
    protected readonly heftConfiguration: HeftConfiguration;
    protected readonly stages: IStages;
    protected verboseFlag: CommandLineFlagParameter;
    constructor(commandLineOptions: ICommandLineActionOptions, heftActionOptions: IHeftActionBaseOptions);
    onDefineParameters(): void;
    defineChoiceParameter(options: ICommandLineChoiceDefinition): CommandLineChoiceParameter;
    defineFlagParameter(options: ICommandLineFlagDefinition): CommandLineFlagParameter;
    defineIntegerParameter(options: ICommandLineIntegerDefinition): CommandLineIntegerParameter;
    defineStringParameter(options: ICommandLineStringDefinition): CommandLineStringParameter;
    defineStringListParameter(options: ICommandLineStringListDefinition): CommandLineStringListParameter;
    setStartTime(): void;
    recordMetrics(): void;
    onExecute(): Promise<void>;
    protected abstract actionExecuteAsync(): Promise<void>;
    /**
     * @virtual
     */
    protected afterExecuteAsync(): Promise<void>;
    private _validateDefinedParameter;
}
//# sourceMappingURL=HeftActionBase.d.ts.map