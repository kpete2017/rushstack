import { BaseRushAction } from './BaseRushAction';
import { RushCommandLineParser } from '../RushCommandLineParser';
export declare class ChangeAction extends BaseRushAction {
    private readonly _git;
    private _verifyParameter;
    private _noFetchParameter;
    private _targetBranchParameter;
    private _changeEmailParameter;
    private _bulkChangeParameter;
    private _bulkChangeMessageParameter;
    private _bulkChangeBumpTypeParameter;
    private _overwriteFlagParameter;
    private _targetBranchName;
    constructor(parser: RushCommandLineParser);
    onDefineParameters(): void;
    runAsync(): Promise<void>;
    private _generateHostMap;
    private _verify;
    private get _targetBranch();
    private _getChangedPackageNames;
    private _validateChangeFile;
    private _getChangeFiles;
    private _hasProjectChanged;
    /**
     * The main loop which prompts the user for information on changed projects.
     */
    private _promptForChangeFileData;
    /**
     * Asks all questions which are needed to generate changelist for a project.
     */
    private _askQuestions;
    private _promptForComments;
    private _getBumpOptions;
    /**
     * Will determine a user's email by first detecting it from their Git config,
     * or will ask for it if it is not found or the Git config is wrong.
     */
    private _detectOrAskForEmail;
    private _detectEmail;
    /**
     * Detects the user's email address from their Git configuration, prompts the user to approve the
     * detected email. It returns undefined if it cannot be detected.
     */
    private _detectAndConfirmEmail;
    /**
     * Asks the user for their email address
     */
    private _promptForEmail;
    private _warnUncommittedChanges;
    /**
     * Writes change files to the common/changes folder. Will prompt for overwrite if file already exists.
     */
    private _writeChangeFiles;
    private _writeChangeFile;
    private _promptForOverwrite;
    /**
     * Writes a file to disk, ensuring the directory structure up to that point exists
     */
    private _writeFile;
    private _logNoChangeFileRequired;
}
//# sourceMappingURL=ChangeAction.d.ts.map