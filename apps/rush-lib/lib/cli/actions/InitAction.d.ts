import { RushCommandLineParser } from '../RushCommandLineParser';
import { BaseConfiglessRushAction } from './BaseRushAction';
export declare class InitAction extends BaseConfiglessRushAction {
    private static _beginMacroRegExp;
    private static _endMacroRegExp;
    private static _lineMacroRegExp;
    private static _variableMacroRegExp;
    private static _anyMacroRegExp;
    private _overwriteParameter;
    private _rushExampleParameter;
    private _commentedBySectionName;
    constructor(parser: RushCommandLineParser);
    protected onDefineParameters(): void;
    protected runAsync(): Promise<void>;
    private _defineMacroSections;
    private _validateFolderIsEmpty;
    private _copyTemplateFiles;
    private _copyTemplateFile;
    private _isSectionCommented;
    private _expandMacroVariable;
}
//# sourceMappingURL=InitAction.d.ts.map