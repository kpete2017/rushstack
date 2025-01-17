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
exports.GitEmailPolicy = void 0;
const safe_1 = __importDefault(require("colors/safe"));
const os = __importStar(require("os"));
const node_core_library_1 = require("@rushstack/node-core-library");
const Utilities_1 = require("../../utilities/Utilities");
const Git_1 = require("../Git");
class GitEmailPolicy {
    static validate(rushConfiguration) {
        const git = new Git_1.Git(rushConfiguration);
        if (!git.isGitPresent()) {
            // If Git isn't installed, or this Rush project is not under a Git working folder,
            // then we don't care about the Git email
            console.log(safe_1.default.cyan('Ignoring Git validation because the Git binary was not found in the shell path.') +
                os.EOL);
            return;
        }
        if (!git.isPathUnderGitWorkingTree()) {
            // If Git isn't installed, or this Rush project is not under a Git working folder,
            // then we don't care about the Git email
            console.log(safe_1.default.cyan('Ignoring Git validation because this is not a Git working folder.' + os.EOL));
            return;
        }
        // If there isn't a Git policy, then we don't care whether the person configured
        // a Git email address at all.  This helps people who don't
        if (rushConfiguration.gitAllowedEmailRegExps.length === 0) {
            if (git.tryGetGitEmail() === undefined) {
                return;
            }
            // Otherwise, if an email *is* configured at all, then we still perform the basic
            // sanity checks (e.g. no spaces in the address).
        }
        let userEmail;
        try {
            userEmail = git.getGitEmail();
            // sanity check; a valid email should not contain any whitespace
            // if this fails, then we have another issue to report
            if (!userEmail.match(/^\S+$/g)) {
                console.log([
                    safe_1.default.red('Your Git email address is invalid: ' + JSON.stringify(userEmail)),
                    '',
                    `To configure your Git email address, try something like this:`,
                    '',
                    ...GitEmailPolicy.getEmailExampleLines(rushConfiguration),
                    ''
                ].join(os.EOL));
                throw new node_core_library_1.AlreadyReportedError();
            }
        }
        catch (e) {
            if (e instanceof node_core_library_1.AlreadyReportedError) {
                console.log(safe_1.default.red('Aborting, so you can go fix your settings.  (Or use --bypass-policy to skip.)'));
                throw e;
            }
            else {
                throw e;
            }
        }
        if (rushConfiguration.gitAllowedEmailRegExps.length === 0) {
            // If there is no policy, then we're good
            return;
        }
        console.log('Checking Git policy for this repository.' + os.EOL);
        // If there is a policy, at least one of the RegExp's must match
        for (const pattern of rushConfiguration.gitAllowedEmailRegExps) {
            const regex = new RegExp(`^${pattern}$`, 'i');
            if (userEmail.match(regex)) {
                return;
            }
        }
        // Show the user's name as well.
        // Ex. "Mr. Example <mr@example.com>"
        let fancyEmail = safe_1.default.cyan(userEmail);
        try {
            const userName = Utilities_1.Utilities.executeCommandAndCaptureOutput(git.gitPath, ['config', 'user.name'], '.').trim();
            if (userName) {
                fancyEmail = `${userName} <${fancyEmail}>`;
            }
        }
        catch (e) {
            // but if it fails, this isn't critical, so don't bother them about it
        }
        console.log([
            'Hey there!  To keep things tidy, this repo asks you to submit your Git commits using an email like ' +
                (rushConfiguration.gitAllowedEmailRegExps.length > 1 ? 'one of these patterns:' : 'this pattern:'),
            '',
            ...rushConfiguration.gitAllowedEmailRegExps.map((pattern) => '    ' + safe_1.default.cyan(pattern)),
            '',
            '...but yours is configured like this:',
            '',
            `    ${fancyEmail}`,
            '',
            'To fix it, you can use commands like this:',
            '',
            ...GitEmailPolicy.getEmailExampleLines(rushConfiguration),
            ''
        ].join(os.EOL));
        console.log(safe_1.default.red('Aborting, so you can go fix your settings.  (Or use --bypass-policy to skip.)'));
        throw new node_core_library_1.AlreadyReportedError();
    }
    static getEmailExampleLines(rushConfiguration) {
        return [
            safe_1.default.cyan('    git config --local user.name "Mr. Example"'),
            safe_1.default.cyan(`    git config --local user.email "${rushConfiguration.gitSampleEmail || 'example@contoso.com'}"`)
        ];
    }
}
exports.GitEmailPolicy = GitEmailPolicy;
//# sourceMappingURL=GitEmailPolicy.js.map