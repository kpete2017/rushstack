import { BaseInstallAction } from './BaseInstallAction';
import { IInstallManagerOptions } from '../../logic/base/BaseInstallManager';
import { RushCommandLineParser } from '../RushCommandLineParser';
export declare class UpdateAction extends BaseInstallAction {
    private _fullParameter;
    private _recheckParameter;
    constructor(parser: RushCommandLineParser);
    protected onDefineParameters(): void;
    protected buildInstallOptions(): IInstallManagerOptions;
}
//# sourceMappingURL=UpdateAction.d.ts.map