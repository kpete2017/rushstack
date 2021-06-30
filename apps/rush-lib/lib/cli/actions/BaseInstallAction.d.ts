import { CommandLineFlagParameter, CommandLineIntegerParameter, CommandLineStringParameter } from '@rushstack/ts-command-line';
import { BaseRushAction } from './BaseRushAction';
import { IInstallManagerOptions } from '../../logic/base/BaseInstallManager';
/**
 * This is the common base class for InstallAction and UpdateAction.
 */
export declare abstract class BaseInstallAction extends BaseRushAction {
    protected _variant: CommandLineStringParameter;
    protected _purgeParameter: CommandLineFlagParameter;
    protected _bypassPolicyParameter: CommandLineFlagParameter;
    protected _noLinkParameter: CommandLineFlagParameter;
    protected _networkConcurrencyParameter: CommandLineIntegerParameter;
    protected _debugPackageManagerParameter: CommandLineFlagParameter;
    protected _maxInstallAttempts: CommandLineIntegerParameter;
    protected _ignoreHooksParameter: CommandLineFlagParameter;
    protected onDefineParameters(): void;
    protected abstract buildInstallOptions(): IInstallManagerOptions;
    protected runAsync(): Promise<void>;
    private _collectTelemetry;
}
//# sourceMappingURL=BaseInstallAction.d.ts.map