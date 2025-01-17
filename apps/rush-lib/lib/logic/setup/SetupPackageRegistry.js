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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SetupPackageRegistry = void 0;
const path = __importStar(require("path"));
const node_core_library_1 = require("@rushstack/node-core-library");
const terminal_1 = require("@rushstack/terminal");
const Utilities_1 = require("../../utilities/Utilities");
const ArtifactoryConfiguration_1 = require("./ArtifactoryConfiguration");
const WebClient_1 = require("../../utilities/WebClient");
const TerminalInput_1 = require("./TerminalInput");
const defaultMessages = {
    introduction: 'This monorepo consumes packages from an Artifactory private NPM registry.',
    obtainAnAccount: 'Please contact the repository maintainers for help with setting up an Artifactory user account.',
    visitWebsite: 'Please open this URL in your web browser:',
    locateUserName: 'Your user name appears in the upper-right corner of the JFrog website.',
    locateApiKey: 'Click "Edit Profile" on the JFrog website.  Click the "Generate API Key"' +
        " button if you haven't already done so previously."
};
class SetupPackageRegistry {
    constructor(options) {
        this._options = options;
        this.rushConfiguration = options.rushConfiguration;
        this._terminal = new node_core_library_1.Terminal(new node_core_library_1.ConsoleTerminalProvider({
            verboseEnabled: options.isDebug
        }));
        this._artifactoryConfiguration = new ArtifactoryConfiguration_1.ArtifactoryConfiguration(path.join(this.rushConfiguration.commonRushConfigFolder, 'artifactory.json'));
        this._messages = Object.assign(Object.assign({}, defaultMessages), this._artifactoryConfiguration.configuration.packageRegistry.messageOverrides);
    }
    _writeInstructionBlock(message) {
        if (message === '') {
            return;
        }
        this._terminal.writeLine(terminal_1.PrintUtilities.wrapWords(message));
        this._terminal.writeLine();
    }
    /**
     * Test whether the NPM token is valid.
     *
     * @returns - `true` if valid, `false` if not valid
     */
    async checkOnly() {
        var _a;
        const packageRegistry = this._artifactoryConfiguration.configuration.packageRegistry;
        if (!packageRegistry.enabled) {
            this._terminal.writeVerbose('Skipping package registry setup because packageRegistry.enabled=false');
            return true;
        }
        const registryUrl = ((packageRegistry === null || packageRegistry === void 0 ? void 0 : packageRegistry.registryUrl) || '').trim();
        if (registryUrl.length === 0) {
            throw new Error('The "registryUrl" setting in artifactory.json is missing or empty');
        }
        if (!this._options.syncNpmrcAlreadyCalled) {
            Utilities_1.Utilities.syncNpmrc(this.rushConfiguration.commonRushConfigFolder, this.rushConfiguration.commonTempFolder);
        }
        // Artifactory does not implement the "npm ping" protocol or any equivalent REST API.
        // But if we query a package that is known not to exist, Artifactory will only return
        // a 404 error if it is successfully authenticated.  We can use this negative query
        // to validate the credentials.
        const npmArgs = [
            'view',
            '@rushstack/nonexistent-package',
            '--json',
            '--registry=' + packageRegistry.registryUrl
        ];
        this._terminal.writeLine('Testing access to private NPM registry: ' + packageRegistry.registryUrl);
        const result = node_core_library_1.Executable.spawnSync('npm', npmArgs, {
            currentWorkingDirectory: this.rushConfiguration.commonTempFolder,
            stdio: ['ignore', 'pipe', 'pipe'],
            // Wait at most 10 seconds for "npm view" to succeed
            timeoutMs: 10 * 1000
        });
        this._terminal.writeLine();
        // (This is not exactly correct, for example Node.js puts a string in error.errno instead of a string.)
        const error = result.error;
        if (error) {
            if (error.code === 'ETIMEDOUT') {
                // For example, an incorrect "https-proxy" setting can hang for a long time
                throw new Error('The "npm view" command timed out; check your .npmrc file for an incorrect setting');
            }
            throw new Error('Error invoking "npm view": ' + result.error);
        }
        if (result.status === 0) {
            throw new node_core_library_1.InternalError('"npm view" unexpectedly succeeded');
        }
        // NPM 6.x writes to stdout
        let jsonContent = SetupPackageRegistry._tryFindJson(result.stdout);
        if (jsonContent === undefined) {
            // NPM 7.x writes dirty output to stderr; see https://github.com/npm/cli/issues/2740
            jsonContent = SetupPackageRegistry._tryFindJson(result.stderr);
        }
        if (jsonContent === undefined) {
            throw new node_core_library_1.InternalError('The "npm view" command did not return a JSON structure');
        }
        let jsonOutput;
        try {
            jsonOutput = JSON.parse(jsonContent);
        }
        catch (error) {
            this._terminal.writeVerboseLine('NPM response:\n\n--------\n' + jsonContent + '\n--------\n\n');
            throw new node_core_library_1.InternalError('The "npm view" command returned an invalid JSON structure');
        }
        const errorCode = (_a = jsonOutput === null || jsonOutput === void 0 ? void 0 : jsonOutput.error) === null || _a === void 0 ? void 0 : _a.code;
        if (typeof errorCode !== 'string') {
            this._terminal.writeVerboseLine('NPM response:\n' + JSON.stringify(jsonOutput, undefined, 2) + '\n\n');
            throw new node_core_library_1.InternalError('The "npm view" command returned unexpected output');
        }
        switch (errorCode) {
            case 'E404':
                this._terminal.writeLine('NPM credentials are working');
                this._terminal.writeLine();
                return true;
            case 'E401':
            case 'E403':
                this._terminal.writeVerboseLine('NPM response:\n' + JSON.stringify(jsonOutput, undefined, 2) + '\n\n');
                // Credentials are missing or expired
                return false;
            default:
                this._terminal.writeVerboseLine('NPM response:\n' + JSON.stringify(jsonOutput, undefined, 2) + '\n\n');
                throw new Error(`The "npm view" command returned an unexpected error code "${errorCode}"`);
        }
    }
    /**
     * Test whether the NPM token is valid.  If not, prompt to update it.
     */
    async checkAndSetup() {
        if (await this.checkOnly()) {
            return;
        }
        this._terminal.writeWarningLine('NPM credentials are missing or expired');
        this._terminal.writeLine();
        const packageRegistry = this._artifactoryConfiguration.configuration.packageRegistry;
        const fixThisProblem = await TerminalInput_1.TerminalInput.promptYesNo({
            message: 'Fix this problem now?',
            defaultValue: false
        });
        this._terminal.writeLine();
        if (!fixThisProblem) {
            return;
        }
        this._writeInstructionBlock(this._messages.introduction);
        const hasArtifactoryAccount = await TerminalInput_1.TerminalInput.promptYesNo({
            message: 'Do you already have an Artifactory user account?'
        });
        this._terminal.writeLine();
        if (!hasArtifactoryAccount) {
            this._writeInstructionBlock(this._messages.obtainAnAccount);
            throw new node_core_library_1.AlreadyReportedError();
        }
        if (this._messages.visitWebsite) {
            this._writeInstructionBlock(this._messages.visitWebsite);
            const artifactoryWebsiteUrl = this._artifactoryConfiguration.configuration.packageRegistry.artifactoryWebsiteUrl;
            if (artifactoryWebsiteUrl) {
                this._terminal.writeLine('  ', node_core_library_1.Colors.cyan(artifactoryWebsiteUrl));
                this._terminal.writeLine();
            }
        }
        this._writeInstructionBlock(this._messages.locateUserName);
        let artifactoryUser = await TerminalInput_1.TerminalInput.promptLine({
            message: 'What is your Artifactory user name?'
        });
        this._terminal.writeLine();
        artifactoryUser = artifactoryUser.trim();
        if (artifactoryUser.length === 0) {
            this._terminal.writeLine(node_core_library_1.Colors.red('Operation aborted because the input was empty'));
            this._terminal.writeLine();
            throw new node_core_library_1.AlreadyReportedError();
        }
        this._writeInstructionBlock(this._messages.locateApiKey);
        let artifactoryKey = await TerminalInput_1.TerminalInput.promptPasswordLine({
            message: 'What is your Artifactory API key?'
        });
        this._terminal.writeLine();
        artifactoryKey = artifactoryKey.trim();
        if (artifactoryKey.length === 0) {
            this._terminal.writeLine(node_core_library_1.Colors.red('Operation aborted because the input was empty'));
            this._terminal.writeLine();
            throw new node_core_library_1.AlreadyReportedError();
        }
        await this._fetchTokenAndUpdateNpmrc(artifactoryUser, artifactoryKey, packageRegistry);
    }
    /**
     * Fetch a valid NPM token from the Artifactory service and add it to the `~/.npmrc` file,
     * preserving other settings in that file.
     */
    async _fetchTokenAndUpdateNpmrc(artifactoryUser, artifactoryKey, packageRegistry) {
        this._terminal.writeLine('\nFetching an NPM token from the Artifactory service...');
        const webClient = new WebClient_1.WebClient();
        webClient.addBasicAuthHeader(artifactoryUser, artifactoryKey);
        let queryUrl = packageRegistry.registryUrl;
        if (!queryUrl.endsWith('/')) {
            queryUrl += '/';
        }
        // There doesn't seem to be a way to invoke the "/auth" REST endpoint without a resource name.
        // Artifactory's NPM folders always seem to contain a ".npm" folder, so we can use that to obtain
        // our token.
        queryUrl += `auth/.npm`;
        let response;
        try {
            response = await webClient.fetchAsync(queryUrl);
        }
        catch (e) {
            console.log(e.toString());
            return;
        }
        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Authorization failed; the Artifactory user name or API key may be incorrect.');
            }
            throw new Error(`The Artifactory request failed:\n  (${response.status}) ${response.statusText}`);
        }
        // We expect a response like this:
        //
        //   @.npm:registry=https://your-company.jfrog.io/your-artifacts/api/npm/npm-private/
        //   //your-company.jfrog.io/your-artifacts/api/npm/npm-private/:_password=dGhlIHRva2VuIGdvZXMgaGVyZQ==
        //   //your-company.jfrog.io/your-artifacts/api/npm/npm-private/:username=your.name@your-company.com
        //   //your-company.jfrog.io/your-artifacts/api/npm/npm-private/:email=your.name@your-company.com
        //   //your-company.jfrog.io/your-artifacts/api/npm/npm-private/:always-auth=true
        const responseText = await response.text();
        const responseLines = node_core_library_1.Text.convertToLf(responseText).trim().split('\n');
        if (responseLines.length < 2 || !responseLines[0].startsWith('@.npm:')) {
            throw new Error('Unexpected response from Artifactory');
        }
        responseLines.shift(); // Remove the @.npm line
        // These are the lines to be injected in ~/.npmrc
        const linesToAdd = [];
        // Start with userNpmrcLinesToAdd...
        if (packageRegistry.userNpmrcLinesToAdd) {
            linesToAdd.push(...packageRegistry.userNpmrcLinesToAdd);
        }
        // ...then append the stuff we got from the REST API, but discard any junk that isn't a proper key/value
        linesToAdd.push(...responseLines.filter((x) => SetupPackageRegistry._getNpmrcKey(x) !== undefined));
        const npmrcPath = path.join(Utilities_1.Utilities.getHomeFolder(), '.npmrc');
        this._mergeLinesIntoNpmrc(npmrcPath, linesToAdd);
    }
    /**
     * Update the `~/.npmrc` file by adding `linesToAdd` to it.
     * @remarks
     *
     * If the `.npmrc` file has existing content, it gets merged as follows:
     * - If `linesToAdd` contains key/value pairs and the key already appears in .npmrc,
     *   that line will be overwritten in place
     * - If `linesToAdd` contains non-key lines (e.g. a comment) and it exactly matches a
     *   line in .npmrc, then that line will be kept where it is
     * - The remaining `linesToAdd` that weren't handled by one of the two rules above
     *   are simply appended to the end of the file
     * - Under no circumstances is a duplicate key/value added to the file; in the case of
     *   duplicates, the earliest line in `linesToAdd` takes precedence
     */
    _mergeLinesIntoNpmrc(npmrcPath, linesToAdd) {
        // We'll replace entries with "undefined" if they get discarded
        const workingLinesToAdd = [...linesToAdd];
        // Now build a table of .npmrc keys that can be replaced if they already exist in the file.
        // For example, if we are adding "always-auth=false" then we should delete an existing line
        // that says "always-auth=true".
        const keysToReplace = new Map(); // key --> linesToAdd index
        for (let index = 0; index < workingLinesToAdd.length; ++index) {
            const lineToAdd = workingLinesToAdd[index];
            const key = SetupPackageRegistry._getNpmrcKey(lineToAdd);
            if (key !== undefined) {
                // If there are duplicate keys, the first one takes precedence.
                // In particular this means "userNpmrcLinesToAdd" takes precedence over the REST API response
                if (keysToReplace.has(key)) {
                    // Discard the duplicate key
                    workingLinesToAdd[index] = undefined;
                }
                else {
                    keysToReplace.set(key, index);
                }
            }
        }
        this._terminal.writeLine();
        this._terminal.writeLine(node_core_library_1.Colors.green('Adding Artifactory token to: '), npmrcPath);
        const npmrcLines = [];
        if (node_core_library_1.FileSystem.exists(npmrcPath)) {
            const npmrcContent = node_core_library_1.FileSystem.readFile(npmrcPath, { convertLineEndings: "\n" /* Lf */ });
            npmrcLines.push(...npmrcContent.trimRight().split('\n'));
        }
        if (npmrcLines.length === 1 && npmrcLines[0] === '') {
            // Edge case where split() adds a blank line to the start of the file
            npmrcLines.length = 0;
        }
        // Make a set of existing .npmrc lines that are not key/value pairs.
        const npmrcNonKeyLinesSet = new Set();
        for (const npmrcLine of npmrcLines) {
            const trimmed = npmrcLine.trim();
            if (trimmed.length > 0) {
                if (SetupPackageRegistry._getNpmrcKey(trimmed) === undefined) {
                    npmrcNonKeyLinesSet.add(trimmed);
                }
            }
        }
        // Overwrite any existing lines that match a key from "linesToAdd"
        for (let index = 0; index < npmrcLines.length; ++index) {
            const line = npmrcLines[index];
            const key = SetupPackageRegistry._getNpmrcKey(line);
            if (key) {
                const linesToAddIndex = keysToReplace.get(key);
                if (linesToAddIndex !== undefined) {
                    npmrcLines[index] = workingLinesToAdd[linesToAddIndex] || '';
                    // Delete it since it's been replaced
                    keysToReplace.delete(key);
                    // Also remove it from "linesToAdd"
                    workingLinesToAdd[linesToAddIndex] = undefined;
                }
            }
        }
        if (npmrcLines.length > 0 && npmrcLines[npmrcLines.length - 1] !== '') {
            // Append a blank line
            npmrcLines.push('');
        }
        // Add any remaining values that weren't matched above
        for (const lineToAdd of workingLinesToAdd) {
            // If a line is undefined, that means we already used it to replace an existing line above
            if (lineToAdd !== undefined) {
                // If a line belongs to npmrcNonKeyLinesSet, then we should not add it because it's
                // already in the .npmrc file
                if (!npmrcNonKeyLinesSet.has(lineToAdd.trim())) {
                    npmrcLines.push(lineToAdd);
                }
            }
        }
        // Save the result
        node_core_library_1.FileSystem.writeFile(npmrcPath, npmrcLines.join('\n').trimRight() + '\n');
    }
    static _getNpmrcKey(npmrcLine) {
        if (SetupPackageRegistry._isCommentLine(npmrcLine)) {
            return undefined;
        }
        const delimiterIndex = npmrcLine.indexOf('=');
        if (delimiterIndex < 1) {
            return undefined;
        }
        const key = npmrcLine.substring(0, delimiterIndex + 1);
        return key.trim();
    }
    static _isCommentLine(npmrcLine) {
        return /^\s*#/.test(npmrcLine);
    }
    /**
     * This is a workaround for https://github.com/npm/cli/issues/2740 where the NPM tool sometimes
     * mixes together JSON and terminal messages in a single STDERR stream.
     *
     * @remarks
     * Given an input like this:
     * ```
     * npm ERR! 404 Note that you can also install from a
     * npm ERR! 404 tarball, folder, http url, or git url.
     * {
     *   "error": {
     *     "code": "E404",
     *     "summary": "Not Found - GET https://registry.npmjs.org/@rushstack%2fnonexistent-package - Not found"
     *   }
     * }
     * npm ERR! A complete log of this run can be found in:
     * ```
     *
     * @returns the JSON section, or `undefined` if a JSON object could not be detected
     */
    static _tryFindJson(dirtyOutput) {
        const lines = dirtyOutput.split(/\r?\n/g);
        let startIndex;
        let endIndex;
        // Find the first line that starts with "{"
        for (let i = 0; i < lines.length; ++i) {
            const line = lines[i];
            if (/^\s*\{/.test(line)) {
                startIndex = i;
                break;
            }
        }
        if (startIndex === undefined) {
            return undefined;
        }
        // Find the last line that ends with "}"
        for (let i = lines.length - 1; i >= startIndex; --i) {
            const line = lines[i];
            if (/\}\s*$/.test(line)) {
                endIndex = i;
                break;
            }
        }
        if (endIndex === undefined) {
            return undefined;
        }
        return lines.slice(startIndex, endIndex + 1).join('\n');
    }
}
exports.SetupPackageRegistry = SetupPackageRegistry;
//# sourceMappingURL=SetupPackageRegistry.js.map