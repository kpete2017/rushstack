import { CommandLineParameter } from '@rushstack/ts-command-line';
import { BaseRushAction, IBaseRushActionOptions } from '../actions/BaseRushAction';
import { CommandLineConfiguration } from '../../api/CommandLineConfiguration';
/**
 * Constructor parameters for BaseScriptAction
 */
export interface IBaseScriptActionOptions extends IBaseRushActionOptions {
    commandLineConfiguration: CommandLineConfiguration | undefined;
}
/**
 * Base class for command-line actions that are implemented using user-defined scripts.
 *
 * @remarks
 * Compared to the normal built-in actions, these actions are special because (1) they
 * can be discovered dynamically via common/config/command-line.json, and (2)
 * user-defined command-line parameters can be passed through to the script.
 *
 * The two subclasses are BulkScriptAction and GlobalScriptAction.
 */
export declare abstract class BaseScriptAction extends BaseRushAction {
    protected readonly _commandLineConfiguration: CommandLineConfiguration | undefined;
    protected readonly customParameters: CommandLineParameter[];
    constructor(options: IBaseScriptActionOptions);
    protected defineScriptParameters(): void;
}
//# sourceMappingURL=BaseScriptAction.d.ts.map