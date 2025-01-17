"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChangeAction = void 0;
const os = __importStar(require("os"));
const path = __importStar(require("path"));
const child_process = __importStar(require("child_process"));
const safe_1 = __importDefault(require("colors/safe"));
const node_core_library_1 = require("@rushstack/node-core-library");
const ChangeManagement_1 = require("../../api/ChangeManagement");
const ChangeFile_1 = require("../../api/ChangeFile");
const BaseRushAction_1 = require("./BaseRushAction");
const ChangeFiles_1 = require("../../logic/ChangeFiles");
const VersionPolicy_1 = require("../../api/VersionPolicy");
const Git_1 = require("../../logic/Git");
const inquirer = node_core_library_1.Import.lazy('inquirer', require);
class ChangeAction extends BaseRushAction_1.BaseRushAction {
    constructor(parser) {
        console.log("->", "ChangeAction");
        const documentation = [
            'Asks a series of questions and then generates a <branchname>-<timestamp>.json file ' +
                'in the common folder. The `publish` command will consume these files and perform the proper ' +
                'version bumps. Note these changes will eventually be published in a changelog.md file in each package.',
            '',
            'The possible types of changes are: ',
            '',
            'MAJOR - these are breaking changes that are not backwards compatible. ' +
                'Examples are: renaming a public class, adding/removing a non-optional ' +
                'parameter from a public API, or renaming an variable or function that ' +
                'is exported.',
            '',
            'MINOR - these are changes that are backwards compatible (but not ' +
                'forwards compatible). Examples are: adding a new public API or adding an ' +
                'optional parameter to a public API',
            '',
            'PATCH - these are changes that are backwards and forwards compatible. ' +
                'Examples are: Modifying a private API or fixing a bug in the logic ' +
                'of how an existing API works.',
            '',
            'HOTFIX (EXPERIMENTAL) - these are changes that are hotfixes targeting a ' +
                'specific older version of the package. When a hotfix change is added, ' +
                'other changes will not be able to increment the version number. ' +
                "Enable this feature by setting 'hotfixChangeEnabled' in your rush.json.",
            ''
        ];
        super({
            actionName: 'change',
            summary: 'Records changes made to projects, indicating how the package version number should be bumped ' +
                'for the next publish.',
            documentation: documentation.join(os.EOL),
            safeForSimultaneousRushProcesses: true,
            parser
        });
        this._git = new Git_1.Git(this.rushConfiguration);
    }
    onDefineParameters() {
        console.log("->", "ChangeAction onDefineParameters");
        const BULK_LONG_NAME = '--bulk';
        const BULK_MESSAGE_LONG_NAME = '--message';
        const BULK_BUMP_TYPE_LONG_NAME = '--bump-type';
        this._verifyParameter = this.defineFlagParameter({
            parameterLongName: '--verify',
            parameterShortName: '-v',
            description: 'Verify the change file has been generated and that it is a valid JSON file'
        });
        this._noFetchParameter = this.defineFlagParameter({
            parameterLongName: '--no-fetch',
            description: 'Skips fetching the baseline branch before running "git diff" to detect changes.'
        });
        this._targetBranchParameter = this.defineStringParameter({
            parameterLongName: '--target-branch',
            parameterShortName: '-b',
            argumentName: 'BRANCH',
            description: 'If this parameter is specified, compare the checked out branch with the specified branch to ' +
                'determine which projects were changed. If this parameter is not specified, the checked out branch ' +
                'is compared against the "master" branch.'
        });
        this._overwriteFlagParameter = this.defineFlagParameter({
            parameterLongName: '--overwrite',
            description: `If a changefile already exists, overwrite without prompting ` +
                `(or erroring in ${BULK_LONG_NAME} mode).`
        });
        this._changeEmailParameter = this.defineStringParameter({
            parameterLongName: '--email',
            argumentName: 'EMAIL',
            description: 'The email address to use in changefiles. If this parameter is not provided, the email address ' +
                'will be detected or prompted for in interactive mode.'
        });
        this._bulkChangeParameter = this.defineFlagParameter({
            parameterLongName: BULK_LONG_NAME,
            description: 'If this flag is specified, apply the same change message and bump type to all changed projects. ' +
                `The ${BULK_MESSAGE_LONG_NAME} and the ${BULK_BUMP_TYPE_LONG_NAME} parameters must be specified if the ` +
                `${BULK_LONG_NAME} parameter is specified`
        });
        this._bulkChangeMessageParameter = this.defineStringParameter({
            parameterLongName: BULK_MESSAGE_LONG_NAME,
            argumentName: 'MESSAGE',
            description: `The message to apply to all changed projects if the ${BULK_LONG_NAME} flag is provided.`
        });
        this._bulkChangeBumpTypeParameter = this.defineChoiceParameter({
            parameterLongName: BULK_BUMP_TYPE_LONG_NAME,
            alternatives: [...Object.keys(this._getBumpOptions()), ChangeManagement_1.ChangeType[ChangeManagement_1.ChangeType.none]],
            description: `The bump type to apply to all changed projects if the ${BULK_LONG_NAME} flag is provided.`
        });
    }
    async runAsync() {
        console.log(`The target branch is ${this._targetBranch}`);
        console.log("->", "ChangeAction runAsync");
        if (this._verifyParameter.value) {
            const errors = [
                this._bulkChangeParameter,
                this._bulkChangeMessageParameter,
                this._bulkChangeBumpTypeParameter,
                this._overwriteFlagParameter
            ]
                .map((parameter) => {
                return parameter.value
                    ? `The {${this._bulkChangeParameter.longName} parameter cannot be provided with the ` +
                        `${this._verifyParameter.longName} parameter`
                    : '';
            })
                .filter((error) => error !== '');
            if (errors.length > 0) {
                errors.forEach((error) => console.error(error));
                throw new node_core_library_1.AlreadyReportedError();
            }
            this._verify();
            return;
        }
        const sortedProjectList = this._getChangedPackageNames().sort();
        if (sortedProjectList.length === 0) {
            this._logNoChangeFileRequired();
            this._warnUncommittedChanges();
            return;
        }
        this._warnUncommittedChanges();
        const promptModule = inquirer.createPromptModule();
        let changeFileData = new Map();
        let interactiveMode = false;
        if (this._bulkChangeParameter.value) {
            if (!this._bulkChangeBumpTypeParameter.value ||
                (!this._bulkChangeMessageParameter.value &&
                    this._bulkChangeBumpTypeParameter.value !== ChangeManagement_1.ChangeType[ChangeManagement_1.ChangeType.none])) {
                throw new Error(`The ${this._bulkChangeBumpTypeParameter.longName} and ${this._bulkChangeMessageParameter.longName} ` +
                    `"${ChangeManagement_1.ChangeType[ChangeManagement_1.ChangeType.none]}" is provided to the ${this._bulkChangeBumpTypeParameter.longName} ` +
                    `parameter, the ${this._bulkChangeMessageParameter.longName} parameter may be omitted.`);
            }
            const email = this._changeEmailParameter.value || this._detectEmail();
            if (!email) {
                throw new Error("Unable to detect Git email and an email address wasn't provided using the " +
                    `${this._changeEmailParameter.longName} parameter.`);
            }
            const errors = [];
            const comment = this._bulkChangeMessageParameter.value || '';
            const changeType = this._bulkChangeBumpTypeParameter.value;
            for (const packageName of sortedProjectList) {
                const allowedBumpTypes = Object.keys(this._getBumpOptions(packageName));
                let projectChangeType = changeType;
                if (allowedBumpTypes.length === 0) {
                    projectChangeType = ChangeManagement_1.ChangeType[ChangeManagement_1.ChangeType.none];
                }
                else if (projectChangeType !== ChangeManagement_1.ChangeType[ChangeManagement_1.ChangeType.none] &&
                    allowedBumpTypes.indexOf(projectChangeType) === -1) {
                    errors.push(`The "${projectChangeType}" change type is not allowed for package "${packageName}".`);
                }
                changeFileData.set(packageName, {
                    changes: [
                        {
                            comment,
                            type: projectChangeType,
                            packageName
                        }
                    ],
                    packageName,
                    email
                });
            }
            if (errors.length > 0) {
                for (const error of errors) {
                    console.error(error);
                }
                throw new node_core_library_1.AlreadyReportedError();
            }
        }
        else if (this._bulkChangeBumpTypeParameter.value || this._bulkChangeMessageParameter.value) {
            throw new Error(`The ${this._bulkChangeParameter.longName} flag must be provided with the ` +
                `${this._bulkChangeBumpTypeParameter.longName} and ${this._bulkChangeMessageParameter.longName} parameters.`);
        }
        else {
            interactiveMode = true;
            const existingChangeComments = ChangeFiles_1.ChangeFiles.getChangeComments(this._getChangeFiles());
            changeFileData = await this._promptForChangeFileData(promptModule, sortedProjectList, existingChangeComments);
            const email = this._changeEmailParameter.value
                ? this._changeEmailParameter.value
                : await this._detectOrAskForEmail(promptModule);
            changeFileData.forEach((changeFile) => {
                changeFile.email = email;
            });
        }
        try {
            return await this._writeChangeFiles(promptModule, changeFileData, this._overwriteFlagParameter.value, interactiveMode);
        }
        catch (error) {
            throw new Error(`There was an error creating a change file: ${error.toString()}`);
        }
    }
    _generateHostMap() {
        console.log("->", "ChangeAction _generateHostMap");
        const hostMap = new Map();
        this.rushConfiguration.projects.forEach((project) => {
            let hostProjectName = project.packageName;
            if (project.versionPolicy && project.versionPolicy.isLockstepped) {
                const lockstepPolicy = project.versionPolicy;
                hostProjectName = lockstepPolicy.mainProject || project.packageName;
            }
            hostMap.set(project.packageName, hostProjectName);
        });
        return hostMap;
    }
    _verify() {
        console.log("->", "ChangeAction _verify");
        const changedPackages = this._getChangedPackageNames();
        if (changedPackages.length > 0) {
            this._validateChangeFile(changedPackages);
        }
        else {
            this._logNoChangeFileRequired();
        }
    }
    get _targetBranch() {
        if (!this._targetBranchName) {
            this._targetBranchName = this._targetBranchParameter.value || this._git.getRemoteDefaultBranch();
        }
        return this._targetBranchName;
    }
    _getChangedPackageNames() {
        console.log("->", "ChangeAction _getChangedPackageNames");
        const changedFolders = this._git.getChangedFolders(this._targetBranch, !this._noFetchParameter.value);
        if (!changedFolders) {
            return [];
        }
        const changedPackageNames = new Set();
        const git = new Git_1.Git(this.rushConfiguration);
        const repoRootFolder = git.getRepositoryRootPath();
        const projectHostMap = this._generateHostMap();
        this.rushConfiguration.projects
            .filter((project) => project.shouldPublish)
            .filter((project) => !project.versionPolicy || !project.versionPolicy.exemptFromRushChange)
            .filter((project) => {
            const projectFolder = repoRootFolder
                ? path.relative(repoRootFolder, project.projectFolder)
                : project.projectRelativeFolder;
            return this._hasProjectChanged(changedFolders, projectFolder);
        })
            .forEach((project) => {
            const hostName = projectHostMap.get(project.packageName);
            if (hostName) {
                changedPackageNames.add(hostName);
            }
        });
        return [...changedPackageNames];
    }
    _validateChangeFile(changedPackages) {
        console.log("->", "ChangeAction _validateChangeFile");
        const files = this._getChangeFiles();
        ChangeFiles_1.ChangeFiles.validate(files, changedPackages, this.rushConfiguration);
    }
    _getChangeFiles() {
        console.log("->", "ChangeAction _getChangeFiles");
        return this._git.getChangedFiles(this._targetBranch, true, `common/changes/`).map((relativePath) => {
            return path.join(this.rushConfiguration.rushJsonFolder, relativePath);
        });
    }
    _hasProjectChanged(changedFolders, projectFolder) {
        console.log("->", "ChangeAction _hasProjectChanged");
        for (const folder of changedFolders) {
            if (node_core_library_1.Path.isUnderOrEqual(folder, projectFolder)) {
                return true;
            }
        }
        return false;
    }
    /**
     * The main loop which prompts the user for information on changed projects.
     */
    async _promptForChangeFileData(promptModule, sortedProjectList, existingChangeComments) {
        console.log("->", "ChangeAction _promptForChangeFileData");
        const changedFileData = new Map();
        for (const projectName of sortedProjectList) {
            const changeInfo = await this._askQuestions(promptModule, projectName, existingChangeComments);
            if (changeInfo) {
                // Save the info into the change file
                let changeFile = changedFileData.get(changeInfo.packageName);
                if (!changeFile) {
                    changeFile = {
                        changes: [],
                        packageName: changeInfo.packageName,
                        email: undefined
                    };
                    changedFileData.set(changeInfo.packageName, changeFile);
                }
                changeFile.changes.push(changeInfo);
            }
        }
        return changedFileData;
    }
    /**
     * Asks all questions which are needed to generate changelist for a project.
     */
    async _askQuestions(promptModule, packageName, existingChangeComments) {
        console.log("->", "ChangeAction _askQuestion");
        console.log(`${os.EOL}${packageName}`);
        const comments = existingChangeComments.get(packageName);
        if (comments) {
            console.log(`Found existing comments:`);
            comments.forEach((comment) => {
                console.log(`    > ${comment}`);
            });
            const { appendComment } = await promptModule({
                name: 'appendComment',
                type: 'list',
                default: 'skip',
                message: 'Append to existing comments or skip?',
                choices: [
                    {
                        name: 'Skip',
                        value: 'skip'
                    },
                    {
                        name: 'Append',
                        value: 'append'
                    }
                ]
            });
            if (appendComment === 'skip') {
                return undefined;
            }
            else {
                return await this._promptForComments(promptModule, packageName);
            }
        }
        else {
            return await this._promptForComments(promptModule, packageName);
        }
    }
    async _promptForComments(promptModule, packageName) {
        console.log("->", "ChangeAction _promptForComments");
        const bumpOptions = this._getBumpOptions(packageName);
        const { comment } = await promptModule({
            name: 'comment',
            type: 'input',
            message: `Describe changes, or ENTER if no changes:`
        });
        if (Object.keys(bumpOptions).length === 0 || !comment) {
            return {
                packageName: packageName,
                comment: comment || '',
                type: ChangeManagement_1.ChangeType[ChangeManagement_1.ChangeType.none]
            };
        }
        else {
            const { bumpType } = await promptModule({
                choices: Object.keys(bumpOptions).map((option) => {
                    return {
                        value: option,
                        name: bumpOptions[option]
                    };
                }),
                default: 'patch',
                message: 'Select the type of change:',
                name: 'bumpType',
                type: 'list'
            });
            return {
                packageName: packageName,
                comment: comment,
                type: bumpType
            };
        }
    }
    _getBumpOptions(packageName) {
        console.log("->", "ChangeAction _getBumpOptions");
        let bumpOptions = this.rushConfiguration && this.rushConfiguration.hotfixChangeEnabled
            ? {
                [ChangeManagement_1.ChangeType[ChangeManagement_1.ChangeType.hotfix]]: 'hotfix - for changes that need to be published in a separate hotfix package'
            }
            : {
                [ChangeManagement_1.ChangeType[ChangeManagement_1.ChangeType.major]]: 'major - for changes that break compatibility, e.g. removing an API',
                [ChangeManagement_1.ChangeType[ChangeManagement_1.ChangeType.minor]]: 'minor - for backwards compatible changes, e.g. adding a new API',
                [ChangeManagement_1.ChangeType[ChangeManagement_1.ChangeType.patch]]: 'patch - for changes that do not affect compatibility, e.g. fixing a bug'
            };
        if (packageName) {
            const project = this.rushConfiguration.getProjectByName(packageName);
            const versionPolicy = project.versionPolicy;
            if (versionPolicy) {
                if (versionPolicy.definitionName === VersionPolicy_1.VersionPolicyDefinitionName.lockStepVersion) {
                    // No need to ask for bump types if project is lockstep versioned.
                    bumpOptions = {};
                }
                else if (versionPolicy.definitionName === VersionPolicy_1.VersionPolicyDefinitionName.individualVersion) {
                    const individualPolicy = versionPolicy;
                    if (individualPolicy.lockedMajor !== undefined) {
                        delete bumpOptions[ChangeManagement_1.ChangeType[ChangeManagement_1.ChangeType.major]];
                    }
                }
            }
        }
        return bumpOptions;
    }
    /**
     * Will determine a user's email by first detecting it from their Git config,
     * or will ask for it if it is not found or the Git config is wrong.
     */
    async _detectOrAskForEmail(promptModule) {
        console.log("->", "ChangeAction _getBumpOptions");
        return (await this._detectAndConfirmEmail(promptModule)) || (await this._promptForEmail(promptModule));
    }
    _detectEmail() {
        console.log("->", "ChangeAction _detectEmail");
        try {
            return child_process
                .execSync('git config user.email')
                .toString()
                .replace(/(\r\n|\n|\r)/gm, '');
        }
        catch (err) {
            console.log('There was an issue detecting your Git email...');
            return undefined;
        }
    }
    /**
     * Detects the user's email address from their Git configuration, prompts the user to approve the
     * detected email. It returns undefined if it cannot be detected.
     */
    async _detectAndConfirmEmail(promptModule) {
        console.log("->", "ChangeAction _detectAndConfirmEmail");
        const email = this._detectEmail();
        if (email) {
            const { isCorrectEmail } = await promptModule([
                {
                    type: 'confirm',
                    name: 'isCorrectEmail',
                    default: 'Y',
                    message: `Is your email address ${email}?`
                }
            ]);
            return isCorrectEmail ? email : undefined;
        }
        else {
            return undefined;
        }
    }
    /**
     * Asks the user for their email address
     */
    async _promptForEmail(promptModule) {
        console.log("->", "ChangeAction _promptForEmail");
        const { email } = await promptModule([
            {
                type: 'input',
                name: 'email',
                message: 'What is your email address?',
                validate: (input) => {
                    return true; // @todo should be an email
                }
            }
        ]);
        return email;
    }
    _warnUncommittedChanges() {
        console.log("->", "ChangeAction _warnUncommittedChanges");
        try {
            if (this._git.hasUncommittedChanges()) {
                console.log(os.EOL +
                    safe_1.default.yellow('Warning: You have uncommitted changes, which do not trigger prompting for change ' +
                        'descriptions.'));
            }
        }
        catch (error) {
            console.log(`An error occurred when detecting uncommitted changes: ${error}`);
        }
    }
    /**
     * Writes change files to the common/changes folder. Will prompt for overwrite if file already exists.
     */
    async _writeChangeFiles(promptModule, changeFileData, overwrite, interactiveMode) {
        console.log("->", "ChangeAction _writeChangeFiles");
        await changeFileData.forEach(async (changeFile) => {
            await this._writeChangeFile(promptModule, changeFile, overwrite, interactiveMode);
        });
    }
    async _writeChangeFile(promptModule, changeFileData, overwrite, interactiveMode) {
        console.log("->", "ChangeAction _writeChangeFile");
        const output = JSON.stringify(changeFileData, undefined, 2);
        const changeFile = new ChangeFile_1.ChangeFile(changeFileData, this.rushConfiguration);
        const filePath = changeFile.generatePath();
        const fileExists = node_core_library_1.FileSystem.exists(filePath);
        const shouldWrite = !fileExists ||
            overwrite ||
            (interactiveMode ? await this._promptForOverwrite(promptModule, filePath) : false);
        if (!interactiveMode && fileExists && !overwrite) {
            throw new Error(`Changefile ${filePath} already exists`);
        }
        if (shouldWrite) {
            this._writeFile(filePath, output, shouldWrite && fileExists);
        }
    }
    async _promptForOverwrite(promptModule, filePath) {
        console.log("->", "ChangeAction _promptForOverwrite");
        const overwrite = await promptModule([
            {
                name: 'overwrite',
                type: 'confirm',
                message: `Overwrite ${filePath}?`
            }
        ]);
        if (overwrite) {
            return true;
        }
        else {
            console.log(`Not overwriting ${filePath}`);
            return false;
        }
    }
    /**
     * Writes a file to disk, ensuring the directory structure up to that point exists
     */
    _writeFile(fileName, output, isOverwrite) {
        console.log("->", "ChangeAction _writeFile");
        node_core_library_1.FileSystem.writeFile(fileName, output, { ensureFolderExists: true });
        if (isOverwrite) {
            console.log(`Overwrote file: ${fileName}`);
        }
        else {
            console.log(`Created file: ${fileName}`);
        }
    }
    _logNoChangeFileRequired() {
        console.log("->", "ChangeAction _logNoChangeFileRequired");
        console.log('No changes were detected to relevant packages on this branch. Nothing to do.');
    }
}
exports.ChangeAction = ChangeAction;
//# sourceMappingURL=ChangeAction.js.map