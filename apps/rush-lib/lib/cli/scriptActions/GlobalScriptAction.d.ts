import { BaseScriptAction, IBaseScriptActionOptions } from './BaseScriptAction';
/**
 * Constructor parameters for GlobalScriptAction.
 */
export interface IGlobalScriptActionOptions extends IBaseScriptActionOptions {
    shellCommand: string;
    autoinstallerName: string | undefined;
}
/**
 * This class implements custom commands that are run once globally for the entire repo
 * (versus bulk commands, which run separately for each project).  The action executes
 * a user-defined script file.
 *
 * @remarks
 * Bulk commands can be defined via common/config/command-line.json.  Rush's predefined "build"
 * and "rebuild" commands are also modeled as bulk commands, because they essentially just
 * invoke scripts from package.json in the same way as a custom command.
 */
export declare class GlobalScriptAction extends BaseScriptAction {
    private readonly _shellCommand;
    private readonly _autoinstallerName;
    private readonly _autoinstallerFullPath;
    constructor(options: IGlobalScriptActionOptions);
    private _prepareAutoinstallerName;
    runAsync(): Promise<void>;
    protected onDefineParameters(): void;
}
//# sourceMappingURL=GlobalScriptAction.d.ts.map