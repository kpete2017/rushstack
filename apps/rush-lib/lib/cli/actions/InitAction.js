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
exports.InitAction = void 0;
const safe_1 = __importDefault(require("colors/safe"));
const os = __importStar(require("os"));
const path = __importStar(require("path"));
const BaseRushAction_1 = require("./BaseRushAction");
const node_core_library_1 = require("@rushstack/node-core-library");
const Rush_1 = require("../../api/Rush");
class InitAction extends BaseRushAction_1.BaseConfiglessRushAction {
    constructor(parser) {
        super({
            actionName: 'init',
            summary: 'Initializes a new repository to be managed by Rush',
            documentation: 'When invoked in an empty folder, this command provisions a standard' +
                ' set of config file templates to start managing projects using Rush.',
            parser
        });
        // template section name --> whether it should be commented out
        this._commentedBySectionName = new Map();
    }
    onDefineParameters() {
        // abstract
        this._overwriteParameter = this.defineFlagParameter({
            parameterLongName: '--overwrite-existing',
            description: 'By default "rush init" will not overwrite existing config files.' +
                ' Specify this switch to override that. This can be useful when upgrading' +
                ' your repo to a newer release of Rush. WARNING: USE WITH CARE!'
        });
        this._rushExampleParameter = this.defineFlagParameter({
            parameterLongName: '--rush-example-repo',
            description: 'When copying the template config files, this uncomments fragments that are used' +
                ' by the "rush-example" GitHub repo, which is a sample monorepo that illustrates many Rush' +
                ' features. This option is primarily intended for maintaining that example.'
        });
    }
    async runAsync() {
        const initFolder = process.cwd();
        if (!this._overwriteParameter.value) {
            if (!this._validateFolderIsEmpty(initFolder)) {
                throw new node_core_library_1.AlreadyReportedError();
            }
        }
        this._defineMacroSections();
        this._copyTemplateFiles(initFolder);
    }
    _defineMacroSections() {
        this._commentedBySectionName.clear();
        // The "HYPOTHETICAL" sections are always commented out by "rush init".
        // They are uncommented in the "assets" source folder so that we can easily validate
        // that they conform to their JSON schema.
        this._commentedBySectionName.set('HYPOTHETICAL', true);
        // The "DEMO" sections are uncommented only when "--rush-example-repo" is specified.
        this._commentedBySectionName.set('DEMO', !this._rushExampleParameter.value);
    }
    // Check whether it's safe to run "rush init" in the current working directory.
    _validateFolderIsEmpty(initFolder) {
        if (this.rushConfiguration !== undefined) {
            console.error(safe_1.default.red('ERROR: Found an existing configuration in: ' + this.rushConfiguration.rushJsonFile));
            console.log(os.EOL +
                'The "rush init" command must be run in a new folder without ' +
                'an existing Rush configuration.');
            return false;
        }
        for (const itemName of node_core_library_1.FileSystem.readFolder(initFolder)) {
            if (itemName.substr(0, 1) === '.') {
                // Ignore any items that start with ".", for example ".git"
                continue;
            }
            const itemPath = path.join(initFolder, itemName);
            const stats = node_core_library_1.FileSystem.getStatistics(itemPath);
            // Ignore any loose files in the current folder, e.g. "README.md"
            // or "CONTRIBUTING.md"
            if (stats.isDirectory()) {
                console.error(safe_1.default.red(`ERROR: Found a subdirectory: "${itemName}"`));
                console.log(os.EOL + 'The "rush init" command must be run in a new folder with no projects added yet.');
                return false;
            }
            else {
                if (itemName.toLowerCase() === 'package.json') {
                    console.error(safe_1.default.red(`ERROR: Found a package.json file in this folder`));
                    console.log(os.EOL + 'The "rush init" command must be run in a new folder with no projects added yet.');
                    return false;
                }
            }
        }
        return true;
    }
    _copyTemplateFiles(initFolder) {
        // The "[dot]" base name is used for hidden files to prevent various tools from interpreting them.
        // For example, "npm publish" will always exclude the filename ".gitignore"
        const templateFilePaths = [
            'rush.json',
            '[dot]gitattributes',
            '[dot]gitignore',
            '[dot]travis.yml',
            'common/config/rush/[dot]npmrc',
            'common/config/rush/[dot]npmrc-publish',
            'common/config/rush/artifactory.json',
            'common/config/rush/build-cache.json',
            'common/config/rush/command-line.json',
            'common/config/rush/common-versions.json',
            'common/config/rush/experiments.json',
            'common/config/rush/.pnpmfile.cjs',
            'common/config/rush/version-policies.json',
            'common/git-hooks/commit-msg.sample'
        ];
        const assetsSubfolder = path.resolve(__dirname, '../../../assets/rush-init');
        for (const templateFilePath of templateFilePaths) {
            const sourcePath = path.join(assetsSubfolder, templateFilePath);
            if (!node_core_library_1.FileSystem.exists(sourcePath)) {
                // If this happens, please report a Rush bug
                throw new node_core_library_1.InternalError('Unable to find template input file: ' + sourcePath);
            }
            const destinationPath = path.join(initFolder, templateFilePath).replace('[dot]', '.');
            this._copyTemplateFile(sourcePath, destinationPath);
        }
    }
    // Copy the template from sourcePath, transform any macros, and write the output to destinationPath.
    //
    // We implement a simple template engine.  "Single-line section" macros have this form:
    //
    //     /*[LINE "NAME"]*/ (content goes here)
    //
    // ...and when commented out will look like this:
    //
    //     // (content goes here)
    //
    // "Block section" macros have this form:
    //
    //     /*[BEGIN "NAME"]*/
    //     (content goes
    //     here)
    //     /*[END "NAME"]*/
    //
    // ...and when commented out will look like this:
    //
    //     // (content goes
    //     // here)
    //
    // Lastly, a variable expansion has this form:
    //
    //     // The value is [%NAME%].
    //
    // ...and when expanded with e.g. "123" will look like this:
    //
    //     // The value is 123.
    //
    // The section names must be one of the predefined names used by "rush init".
    // A single-line section may appear inside a block section, in which case it will get
    // commented twice.
    _copyTemplateFile(sourcePath, destinationPath) {
        if (!this._overwriteParameter.value) {
            if (node_core_library_1.FileSystem.exists(destinationPath)) {
                console.log(safe_1.default.yellow('Not overwriting already existing file: ') + destinationPath);
                return;
            }
        }
        if (node_core_library_1.FileSystem.exists(destinationPath)) {
            console.log(safe_1.default.yellow(`Overwriting: ${destinationPath}`));
        }
        else {
            console.log(`Generating: ${destinationPath}`);
        }
        const outputLines = [];
        const lines = node_core_library_1.FileSystem.readFile(sourcePath, { convertLineEndings: "\n" /* Lf */ }).split('\n');
        let activeBlockSectionName = undefined;
        let activeBlockIndent = '';
        for (const line of lines) {
            let match;
            // Check for a block section start
            // Example:  /*[BEGIN "DEMO"]*/
            match = line.match(InitAction._beginMacroRegExp);
            if (match) {
                if (activeBlockSectionName) {
                    // If this happens, please report a Rush bug
                    throw new node_core_library_1.InternalError(`The template contains an unmatched BEGIN macro for "${activeBlockSectionName}"`);
                }
                activeBlockSectionName = match[2];
                activeBlockIndent = match[1];
                // Remove the entire line containing the macro
                continue;
            }
            // Check for a block section end
            // Example:  /*[END "DEMO"]*/
            match = line.match(InitAction._endMacroRegExp);
            if (match) {
                if (activeBlockSectionName === undefined) {
                    // If this happens, please report a Rush bug
                    throw new node_core_library_1.InternalError(`The template contains an unmatched END macro for "${activeBlockSectionName}"`);
                }
                if (activeBlockSectionName !== match[2]) {
                    // If this happens, please report a Rush bug
                    throw new node_core_library_1.InternalError(`The template contains an mismatched END macro for "${activeBlockSectionName}"`);
                }
                if (activeBlockIndent !== match[1]) {
                    // If this happens, please report a Rush bug
                    throw new node_core_library_1.InternalError(`The template contains an inconsistently indented section "${activeBlockSectionName}"`);
                }
                activeBlockSectionName = undefined;
                // Remove the entire line containing the macro
                continue;
            }
            let transformedLine = line;
            // Check for a single-line section
            // Example:  /*[LINE "HYPOTHETICAL"]*/
            match = transformedLine.match(InitAction._lineMacroRegExp);
            if (match) {
                const sectionName = match[1];
                const replacement = this._isSectionCommented(sectionName) ? '// ' : '';
                transformedLine = transformedLine.replace(InitAction._lineMacroRegExp, replacement);
            }
            // Check for variable expansions
            // Example:  [%RUSH_VERSION%]
            while ((match = transformedLine.match(InitAction._variableMacroRegExp))) {
                const variableName = match[1];
                const replacement = this._expandMacroVariable(variableName);
                transformedLine = transformedLine.replace(InitAction._variableMacroRegExp, replacement);
            }
            // Verify that all macros were handled
            match = transformedLine.match(InitAction._anyMacroRegExp);
            if (match) {
                // If this happens, please report a Rush bug
                throw new node_core_library_1.InternalError('The template contains a malformed macro expression: ' + JSON.stringify(match[0]));
            }
            // If we are inside a block section that is commented out, then insert the "//" after indentation
            if (activeBlockSectionName !== undefined) {
                if (this._isSectionCommented(activeBlockSectionName)) {
                    // Is the line indented properly?
                    if (transformedLine.substr(0, activeBlockIndent.length).trim().length > 0) {
                        // If this happens, please report a Rush bug
                        throw new node_core_library_1.InternalError(`The template contains inconsistently indented lines inside` +
                            ` the "${activeBlockSectionName}" section`);
                    }
                    // Insert comment characters after the indentation
                    const contentAfterIndent = transformedLine.substr(activeBlockIndent.length);
                    transformedLine = activeBlockIndent + '// ' + contentAfterIndent;
                }
            }
            outputLines.push(transformedLine);
        }
        // Write the output
        node_core_library_1.FileSystem.writeFile(destinationPath, outputLines.join('\r\n'), {
            ensureFolderExists: true
        });
    }
    _isSectionCommented(sectionName) {
        const value = this._commentedBySectionName.get(sectionName);
        if (value === undefined) {
            // If this happens, please report a Rush bug
            throw new node_core_library_1.InternalError(`The template references an undefined section name ${sectionName}`);
        }
        return value;
    }
    _expandMacroVariable(variableName) {
        switch (variableName) {
            case '%RUSH_VERSION%':
                return Rush_1.Rush.version;
            default:
                throw new node_core_library_1.InternalError(`The template references an undefined variable "${variableName}"`);
        }
    }
}
exports.InitAction = InitAction;
// Matches a well-formed BEGIN macro starting a block section.
// Example:  /*[BEGIN "DEMO"]*/
//
// Group #1 is the indentation spaces before the macro
// Group #2 is the section name
InitAction._beginMacroRegExp = /^(\s*)\/\*\[BEGIN "([A-Z]+)"\]\s*\*\/\s*$/;
// Matches a well-formed END macro ending a block section.
// Example:  /*[END "DEMO"]*/
//
// Group #1 is the indentation spaces before the macro
// Group #2 is the section name
InitAction._endMacroRegExp = /^(\s*)\/\*\[END "([A-Z]+)"\]\s*\*\/\s*$/;
// Matches a well-formed single-line section, including the space character after it
// if present.
// Example:  /*[LINE "HYPOTHETICAL"]*/
//
// Group #1 is the section name
InitAction._lineMacroRegExp = /\/\*\[LINE "([A-Z]+)"\]\s*\*\/\s?/;
// Matches a variable expansion.
// Example:  [%RUSH_VERSION%]
//
// Group #1 is the variable name including the dollar sign
InitAction._variableMacroRegExp = /\[(%[A-Z0-9_]+%)\]/;
// Matches anything that starts with "/*[" and ends with "]*/"
// Used to catch malformed macro expressions
InitAction._anyMacroRegExp = /\/\*\s*\[.*\]\s*\*\//;
//# sourceMappingURL=InitAction.js.map