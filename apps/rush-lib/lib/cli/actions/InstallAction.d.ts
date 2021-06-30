import { BaseInstallAction } from './BaseInstallAction';
import { IInstallManagerOptions } from '../../logic/base/BaseInstallManager';
import { RushCommandLineParser } from '../RushCommandLineParser';
import { SelectionParameterSet } from '../SelectionParameterSet';
export declare class InstallAction extends BaseInstallAction {
    protected _selectionParameters: SelectionParameterSet;
    constructor(parser: RushCommandLineParser);
    /**
     * @override
     */
    protected onDefineParameters(): void;
    protected buildInstallOptions(): IInstallManagerOptions;
}
//# sourceMappingURL=InstallAction.d.ts.map