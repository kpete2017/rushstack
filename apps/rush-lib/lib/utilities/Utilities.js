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
exports.Utilities = void 0;
const child_process = __importStar(require("child_process"));
const os = __importStar(require("os"));
const path = __importStar(require("path"));
const node_core_library_1 = require("@rushstack/node-core-library");
const ts_command_line_1 = require("@rushstack/ts-command-line");
class Utilities {
    /**
     * Get the user's home directory. On windows this looks something like "C:\users\username\" and on UNIX
     * this looks something like "/home/username/"
     */
    static getHomeFolder() {
        const unresolvedUserFolder = process.env[process.platform === 'win32' ? 'USERPROFILE' : 'HOME'];
        const dirError = "Unable to determine the current user's home directory";
        if (unresolvedUserFolder === undefined) {
            throw new Error(dirError);
        }
        const homeFolder = path.resolve(unresolvedUserFolder);
        if (!node_core_library_1.FileSystem.exists(homeFolder)) {
            throw new Error(dirError);
        }
        return homeFolder;
    }
    /**
     * Node.js equivalent of performance.now().
     */
    static getTimeInMs() {
        const [seconds, nanoseconds] = process.hrtime();
        return seconds * 1000 + nanoseconds / 1000000;
    }
    /**
     * Returns the values from a Set<T>
     */
    static getSetAsArray(set) {
        // When ES6 is supported, we can use Array.from() instead.
        const result = [];
        set.forEach((value) => {
            result.push(value);
        });
        return result;
    }
    /**
     * Retries a function until a timeout is reached. The function is expected to throw if it failed and
     *  should be retried.
     */
    static retryUntilTimeout(fn, maxWaitTimeMs, getTimeoutError, fnName) {
        const startTime = Utilities.getTimeInMs();
        let looped = false;
        let result;
        for (;;) {
            try {
                result = fn();
                break;
            }
            catch (e) {
                looped = true;
                const currentTime = Utilities.getTimeInMs();
                if (currentTime - startTime > maxWaitTimeMs) {
                    throw getTimeoutError(e);
                }
            }
        }
        if (looped) {
            const currentTime = Utilities.getTimeInMs();
            const totalSeconds = ((currentTime - startTime) / 1000.0).toFixed(2);
            // This logging statement isn't meaningful to the end-user. `fnName` should be updated
            // to something like `operationDescription`
            console.log(`${fnName}() stalled for ${totalSeconds} seconds`);
        }
        return result;
    }
    /**
     * Creates the specified folder by calling FileSystem.ensureFolder(), but using a
     * retry loop to recover from temporary locks that may be held by other processes.
     * If the folder already exists, no error occurs.
     */
    static createFolderWithRetry(folderName) {
        // Note: If a file exists with the same name, then we fall through and report
        // an error.
        if (Utilities.directoryExists(folderName)) {
            return;
        }
        // We need to do a simple "FileSystem.ensureFolder(localModulesFolder)" here,
        // however if the folder we deleted above happened to contain any files,
        // then there seems to be some OS process (virus scanner?) that holds
        // a lock on the folder for a split second, which causes mkdirSync to
        // fail.  To workaround that, retry for up to 7 seconds before giving up.
        const maxWaitTimeMs = 7 * 1000;
        return Utilities.retryUntilTimeout(() => node_core_library_1.FileSystem.ensureFolder(folderName), maxWaitTimeMs, (e) => new Error(`Error: ${e}${os.EOL}Often this is caused by a file lock ` +
            'from a process such as your text editor, command prompt, ' +
            'or a filesystem watcher.'), 'createFolderWithRetry');
    }
    /**
     * Determines if the path points to a file and that it exists.
     */
    static fileExists(filePath) {
        let exists = false;
        try {
            const lstat = node_core_library_1.FileSystem.getLinkStatistics(filePath);
            exists = lstat.isFile();
        }
        catch (e) {
            /* no-op */
        }
        return exists;
    }
    /**
     * Determines if a path points to a directory and that it exists.
     */
    static directoryExists(directoryPath) {
        let exists = false;
        try {
            const lstat = node_core_library_1.FileSystem.getLinkStatistics(directoryPath);
            exists = lstat.isDirectory();
        }
        catch (e) {
            /* no-op */
        }
        return exists;
    }
    /**
     * BE VERY CAREFUL CALLING THIS FUNCTION!
     * If you specify the wrong folderPath (e.g. "/"), it could potentially delete your entire
     * hard disk.
     */
    static dangerouslyDeletePath(folderPath) {
        try {
            node_core_library_1.FileSystem.deleteFolder(folderPath);
        }
        catch (e) {
            throw new Error(`${e.message}${os.EOL}Often this is caused by a file lock from a process ` +
                'such as your text editor, command prompt, or a filesystem watcher');
        }
    }
    /**
     * Attempts to delete a file. If it does not exist, or the path is not a file, it no-ops.
     */
    static deleteFile(filePath) {
        if (Utilities.fileExists(filePath)) {
            console.log(`Deleting: ${filePath}`);
            node_core_library_1.FileSystem.deleteFile(filePath);
        }
    }
    /*
     * Returns true if dateToCompare is more recent than all of the inputFilenames, which
     * would imply that we don't need to rebuild it. Returns false if any of the files
     * does not exist.
     * NOTE: The filenames can also be paths for directories, in which case the directory
     * timestamp is compared.
     */
    static isFileTimestampCurrent(dateToCompare, inputFilenames) {
        for (const inputFilename of inputFilenames) {
            if (!node_core_library_1.FileSystem.exists(inputFilename)) {
                return false;
            }
            const inputStats = node_core_library_1.FileSystem.getStatistics(inputFilename);
            if (dateToCompare < inputStats.mtime) {
                return false;
            }
        }
        return true;
    }
    /**
     * Executes the command with the specified command-line parameters, and waits for it to complete.
     * The current directory will be set to the specified workingDirectory.
     */
    static executeCommand(options) {
        Utilities._executeCommandInternal(options.command, options.args, options.workingDirectory, options.suppressOutput ? undefined : [0, 1, 2], options.environment, options.keepEnvironment);
    }
    /**
     * Executes the command with the specified command-line parameters, and waits for it to complete.
     * The current directory will be set to the specified workingDirectory.
     */
    static executeCommandAndCaptureOutput(command, args, workingDirectory, environment, keepEnvironment = false) {
        const result = Utilities._executeCommandInternal(command, args, workingDirectory, ['pipe', 'pipe', 'pipe'], environment, keepEnvironment);
        return result.stdout.toString();
    }
    /**
     * Attempts to run Utilities.executeCommand() up to maxAttempts times before giving up.
     */
    static executeCommandWithRetry(options, maxAttempts, retryCallback) {
        if (maxAttempts < 1) {
            throw new Error('The maxAttempts parameter cannot be less than 1');
        }
        let attemptNumber = 1;
        for (;;) {
            try {
                Utilities.executeCommand(options);
            }
            catch (error) {
                console.log(os.EOL + 'The command failed:');
                console.log(` ${options.command} ` + options.args.join(' '));
                console.log(`ERROR: ${error.toString()}`);
                if (attemptNumber < maxAttempts) {
                    ++attemptNumber;
                    console.log(`Trying again (attempt #${attemptNumber})...` + os.EOL);
                    if (retryCallback) {
                        retryCallback();
                    }
                    continue;
                }
                else {
                    console.error(`Giving up after ${attemptNumber} attempts` + os.EOL);
                    throw error;
                }
            }
            break;
        }
    }
    /**
     * Executes the command using cmd if running on windows, or using sh if running on a non-windows OS.
     * @param command - the command to run on shell
     * @param options - options for how the command should be run
     */
    static executeLifecycleCommand(command, options) {
        const result = Utilities._executeLifecycleCommandInternal(command, child_process.spawnSync, options);
        if (options.handleOutput) {
            Utilities._processResult(result);
        }
        if (result.status !== null) {
            return result.status;
        }
        else {
            throw result.error || new Error('An unknown error occurred.');
        }
    }
    /**
     * Executes the command using cmd if running on windows, or using sh if running on a non-windows OS.
     * @param command - the command to run on shell
     * @param options - options for how the command should be run
     */
    static executeLifecycleCommandAsync(command, options) {
        return Utilities._executeLifecycleCommandInternal(command, child_process.spawn, options);
    }
    /**
     * Utility to determine if the app should restrict writing to the console.
     */
    static shouldRestrictConsoleOutput() {
        return (ts_command_line_1.CommandLineHelper.isTabCompletionActionRequest(process.argv) || process.argv.indexOf('--json') !== -1);
    }
    /**
     * For strings passed to a shell command, this adds appropriate escaping
     * to avoid misinterpretation of spaces or special characters.
     *
     * Example: 'hello there' --> '"hello there"'
     */
    static escapeShellParameter(parameter) {
        // This approach is based on what NPM 7 now does:
        // https://github.com/npm/run-script/blob/47a4d539fb07220e7215cc0e482683b76407ef9b/lib/run-script-pkg.js#L34
        return JSON.stringify(parameter);
    }
    /**
     * Installs a package by name and version in the specified directory.
     */
    static installPackageInDirectory(options) {
        const directory = path.resolve(options.directory);
        if (node_core_library_1.FileSystem.exists(directory)) {
            console.log('Deleting old files from ' + directory);
        }
        node_core_library_1.FileSystem.ensureEmptyFolder(directory);
        const npmPackageJson = {
            dependencies: {
                [options.packageName]: options.version
            },
            description: 'Temporary file generated by the Rush tool',
            name: options.tempPackageTitle,
            private: true,
            version: '0.0.0'
        };
        node_core_library_1.JsonFile.save(npmPackageJson, path.join(directory, "package.json" /* PackageJson */));
        if (options.commonRushConfigFolder) {
            Utilities.syncNpmrc(options.commonRushConfigFolder, directory);
        }
        console.log(os.EOL + 'Running "npm install" in ' + directory);
        // NOTE: Here we use whatever version of NPM we happen to find in the PATH
        Utilities.executeCommandWithRetry({
            command: 'npm',
            args: ['install'],
            workingDirectory: directory,
            environment: Utilities._createEnvironmentForRushCommand({}),
            suppressOutput: options.suppressOutput
        }, options.maxInstallAttempts);
    }
    /**
     * As a workaround, copyAndTrimNpmrcFile() copies the .npmrc file to the target folder, and also trims
     * unusable lines from the .npmrc file.
     *
     * Why are we trimming the .npmrc lines?  NPM allows environment variables to be specified in
     * the .npmrc file to provide different authentication tokens for different registry.
     * However, if the environment variable is undefined, it expands to an empty string, which
     * produces a valid-looking mapping with an invalid URL that causes an error.  Instead,
     * we'd prefer to skip that line and continue looking in other places such as the user's
     * home directory.
     *
     * IMPORTANT: THIS CODE SHOULD BE KEPT UP TO DATE WITH _copyAndTrimNpmrcFile() FROM scripts/install-run.ts
     */
    static copyAndTrimNpmrcFile(sourceNpmrcPath, targetNpmrcPath) {
        console.log(`Transforming ${sourceNpmrcPath}`); // Verbose
        console.log(`  --> "${targetNpmrcPath}"`);
        let npmrcFileLines = node_core_library_1.FileSystem.readFile(sourceNpmrcPath).split('\n');
        npmrcFileLines = npmrcFileLines.map((line) => (line || '').trim());
        const resultLines = [];
        // This finds environment variable tokens that look like "${VAR_NAME}"
        const expansionRegExp = /\$\{([^\}]+)\}/g;
        // Comment lines start with "#" or ";"
        const commentRegExp = /^\s*[#;]/;
        // Trim out lines that reference environment variables that aren't defined
        for (const line of npmrcFileLines) {
            let lineShouldBeTrimmed = false;
            // Ignore comment lines
            if (!commentRegExp.test(line)) {
                const environmentVariables = line.match(expansionRegExp);
                if (environmentVariables) {
                    for (const token of environmentVariables) {
                        // Remove the leading "${" and the trailing "}" from the token
                        const environmentVariableName = token.substring(2, token.length - 1);
                        // Is the environment variable defined?
                        if (!process.env[environmentVariableName]) {
                            // No, so trim this line
                            lineShouldBeTrimmed = true;
                            break;
                        }
                    }
                }
            }
            if (lineShouldBeTrimmed) {
                // Example output:
                // "; MISSING ENVIRONMENT VARIABLE: //my-registry.com/npm/:_authToken=${MY_AUTH_TOKEN}"
                resultLines.push('; MISSING ENVIRONMENT VARIABLE: ' + line);
            }
            else {
                resultLines.push(line);
            }
        }
        node_core_library_1.FileSystem.writeFile(targetNpmrcPath, resultLines.join(os.EOL));
    }
    /**
     * Copies the file "sourcePath" to "destinationPath", overwriting the target file location.
     * If the source file does not exist, then the target file is deleted.
     */
    static syncFile(sourcePath, destinationPath) {
        if (node_core_library_1.FileSystem.exists(sourcePath)) {
            console.log(`Copying "${sourcePath}"`);
            console.log(`  --> "${destinationPath}"`);
            node_core_library_1.FileSystem.copyFile({ sourcePath, destinationPath });
        }
        else {
            if (node_core_library_1.FileSystem.exists(destinationPath)) {
                // If the source file doesn't exist and there is one in the target, delete the one in the target
                console.log(`Deleting ${destinationPath}`);
                node_core_library_1.FileSystem.deleteFile(destinationPath);
            }
        }
    }
    /**
     * syncNpmrc() copies the .npmrc file to the target folder, and also trims unusable lines from the .npmrc file.
     * If the source .npmrc file not exist, then syncNpmrc() will delete an .npmrc that is found in the target folder.
     *
     * IMPORTANT: THIS CODE SHOULD BE KEPT UP TO DATE WITH _syncNpmrc() FROM scripts/install-run.ts
     */
    static syncNpmrc(sourceNpmrcFolder, targetNpmrcFolder, useNpmrcPublish) {
        const sourceNpmrcPath = path.join(sourceNpmrcFolder, !useNpmrcPublish ? '.npmrc' : '.npmrc-publish');
        const targetNpmrcPath = path.join(targetNpmrcFolder, '.npmrc');
        try {
            if (node_core_library_1.FileSystem.exists(sourceNpmrcPath)) {
                Utilities.copyAndTrimNpmrcFile(sourceNpmrcPath, targetNpmrcPath);
            }
            else if (node_core_library_1.FileSystem.exists(targetNpmrcPath)) {
                // If the source .npmrc doesn't exist and there is one in the target, delete the one in the target
                console.log(`Deleting ${targetNpmrcPath}`); // Verbose
                node_core_library_1.FileSystem.deleteFile(targetNpmrcPath);
            }
        }
        catch (e) {
            throw new Error(`Error syncing .npmrc file: ${e}`);
        }
    }
    static getRushConfigNotFoundError() {
        return new Error('Unable to find rush.json configuration file');
    }
    static getPackageDepsFilenameForCommand(command) {
        return `package-deps_${command}.json`;
    }
    static async usingAsync(getDisposableAsync, doActionAsync) {
        let disposable;
        try {
            disposable = (await getDisposableAsync());
            await doActionAsync(disposable);
        }
        finally {
            disposable === null || disposable === void 0 ? void 0 : disposable.dispose();
        }
    }
    static async readStreamToBufferAsync(stream) {
        return await new Promise((resolve, reject) => {
            const parts = [];
            stream.on('data', (chunk) => parts.push(chunk));
            stream.on('error', (error) => reject(error));
            stream.on('end', () => {
                const result = Buffer.concat(parts);
                resolve(result);
            });
        });
    }
    static _executeLifecycleCommandInternal(command, spawnFunction, options) {
        let shellCommand = process.env.comspec || 'cmd';
        let commandFlags = '/d /s /c';
        let useShell = true;
        if (process.platform !== 'win32') {
            shellCommand = 'sh';
            commandFlags = '-c';
            useShell = false;
        }
        const environment = Utilities._createEnvironmentForRushCommand({
            initCwd: options.initCwd,
            pathOptions: Object.assign(Object.assign({}, options.environmentPathOptions), { projectRoot: options.workingDirectory, commonTempFolder: options.rushConfiguration ? options.rushConfiguration.commonTempFolder : undefined })
        });
        return spawnFunction(shellCommand, [commandFlags, command], {
            cwd: options.workingDirectory,
            shell: useShell,
            env: environment,
            stdio: options.handleOutput ? ['pipe', 'pipe', 'pipe'] : [0, 1, 2]
        });
    }
    /**
     * Returns a process.env environment suitable for executing lifecycle scripts.
     * @param initialEnvironment - an existing environment to copy instead of process.env
     *
     * @remarks
     * Rush._assignRushInvokedFolder() assigns the `RUSH_INVOKED_FOLDER` variable globally
     * via the parent process's environment.
     */
    static _createEnvironmentForRushCommand(options) {
        if (options.initialEnvironment === undefined) {
            options.initialEnvironment = process.env;
        }
        const environment = {};
        for (const key of Object.getOwnPropertyNames(options.initialEnvironment)) {
            const normalizedKey = os.platform() === 'win32' ? key.toUpperCase() : key;
            // If Rush itself was invoked inside a lifecycle script, this may be set and would interfere
            // with Rush's installations.  If we actually want it, we will set it explicitly below.
            if (normalizedKey === 'INIT_CWD') {
                continue;
            }
            // When NPM invokes a lifecycle event, it copies its entire configuration into environment
            // variables.  Rush is supposed to be a deterministic controlled environment, so don't bring
            // this along.
            //
            // NOTE: Longer term we should clean out the entire environment and use rush.json to bring
            // back specific environment variables that the repo maintainer has determined to be safe.
            if (normalizedKey.match(/^NPM_CONFIG_/)) {
                continue;
            }
            // Use the uppercased environment variable name on Windows because environment variable names
            // are case-insensitive on Windows
            environment[normalizedKey] = options.initialEnvironment[key];
        }
        // When NPM invokes a lifecycle script, it sets an environment variable INIT_CWD that remembers
        // the directory that NPM started in.  This allows naive scripts to change their current working directory
        // and invoke NPM operations, while still be able to find a local .npmrc file.  Although Rush recommends
        // for toolchain scripts to be professionally written (versus brittle stuff like
        // "cd ./lib && npm run tsc && cd .."), we support INIT_CWD for compatibility.
        //
        // More about this feature: https://github.com/npm/npm/pull/12356
        if (options.initCwd) {
            environment['INIT_CWD'] = options.initCwd; // eslint-disable-line dot-notation
        }
        if (options.pathOptions) {
            if (options.pathOptions.includeRepoBin && options.pathOptions.commonTempFolder) {
                environment.PATH = Utilities._prependNodeModulesBinToPath(environment.PATH, options.pathOptions.commonTempFolder);
            }
            if (options.pathOptions.includeProjectBin && options.pathOptions.projectRoot) {
                environment.PATH = Utilities._prependNodeModulesBinToPath(environment.PATH, options.pathOptions.projectRoot);
            }
            if (options.pathOptions.additionalPathFolders) {
                environment.PATH = [...options.pathOptions.additionalPathFolders, environment.PATH].join(path.delimiter);
            }
        }
        return environment;
    }
    /**
     * Prepend the node_modules/.bin folder under the specified folder to the specified PATH variable. For example,
     * if `rootDirectory` is "/foobar" and `existingPath` is "/bin", this function will return
     * "/foobar/node_modules/.bin:/bin"
     */
    static _prependNodeModulesBinToPath(existingPath, rootDirectory) {
        const binPath = path.resolve(rootDirectory, 'node_modules', '.bin');
        if (existingPath) {
            return `${binPath}${path.delimiter}${existingPath}`;
        }
        else {
            return binPath;
        }
    }
    /**
     * Executes the command with the specified command-line parameters, and waits for it to complete.
     * The current directory will be set to the specified workingDirectory.
     */
    static _executeCommandInternal(command, args, workingDirectory, stdio, environment, keepEnvironment = false) {
        const options = {
            cwd: workingDirectory,
            shell: true,
            stdio: stdio,
            env: keepEnvironment
                ? environment
                : Utilities._createEnvironmentForRushCommand({ initialEnvironment: environment })
        };
        // This is needed since we specify shell=true below.
        // NOTE: On Windows if we escape "NPM", the spawnSync() function runs something like this:
        //   [ 'C:\\Windows\\system32\\cmd.exe', '/s', '/c', '""NPM" "install""' ]
        //
        // Due to a bug with Windows cmd.exe, the npm.cmd batch file's "%~dp0" variable will
        // return the current working directory instead of the batch file's directory.
        // The workaround is to not escape, npm, i.e. do this instead:
        //   [ 'C:\\Windows\\system32\\cmd.exe', '/s', '/c', '"npm "install""' ]
        //
        // We will come up with a better solution for this when we promote executeCommand()
        // into node-core-library, but for now this hack will unblock people:
        // Only escape the command if it actually contains spaces:
        const escapedCommand = command.indexOf(' ') < 0 ? command : Utilities.escapeShellParameter(command);
        const escapedArgs = args.map((x) => Utilities.escapeShellParameter(x));
        let result = child_process.spawnSync(escapedCommand, escapedArgs, options);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (result.error && result.error.errno === 'ENOENT') {
            // This is a workaround for GitHub issue #25330
            // https://github.com/nodejs/node-v0.x-archive/issues/25330
            //
            // TODO: The fully worked out solution for this problem is now provided by the "Executable" API
            // from @rushstack/node-core-library
            result = child_process.spawnSync(command + '.cmd', args, options);
        }
        Utilities._processResult(result);
        return result;
    }
    static _processResult(result) {
        if (result.error) {
            result.error.message += os.EOL + (result.stderr ? result.stderr.toString() + os.EOL : '');
            throw result.error;
        }
        if (result.status) {
            throw new Error('The command failed with exit code ' +
                result.status +
                os.EOL +
                (result.stderr ? result.stderr.toString() : ''));
        }
    }
}
exports.Utilities = Utilities;
//# sourceMappingURL=Utilities.js.map