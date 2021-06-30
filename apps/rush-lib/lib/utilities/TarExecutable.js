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
exports.TarExecutable = void 0;
const path = __importStar(require("path"));
const node_core_library_1 = require("@rushstack/node-core-library");
const events = __importStar(require("events"));
class TarExecutable {
    constructor(tarExecutablePath) {
        this._tarExecutablePath = tarExecutablePath;
    }
    static tryInitialize(terminal) {
        terminal.writeVerboseLine('Trying to find "tar" binary');
        const tarExecutablePath = node_core_library_1.Executable.tryResolve('tar');
        if (!tarExecutablePath) {
            terminal.writeVerboseLine('"tar" was not found on the PATH');
            return undefined;
        }
        return new TarExecutable(tarExecutablePath);
    }
    /**
     * @returns
     * The "tar" exit code
     */
    async tryUntarAsync(options) {
        return await this._spawnTarWithLoggingAsync(
        // These parameters are chosen for compatibility with the very primitive bsdtar 3.3.2 shipped with Windows 10.
        [
            // [Windows bsdtar 3.3.2] Extract: tar -x [options] [<patterns>]
            '-x',
            // [Windows bsdtar 3.3.2] -m    Don't restore modification times
            '-m',
            // [Windows bsdtar 3.3.2] -f <filename>  Location of archive (default \\.\tape0)
            '-f',
            options.archivePath
        ], options.outputFolderPath, options.logFilePath);
    }
    /**
     * @returns
     * The "tar" exit code
     */
    async tryCreateArchiveFromProjectPathsAsync(options) {
        const { project, archivePath, paths, logFilePath } = options;
        const pathsListFilePath = `${project.projectRushTempFolder}/tarPaths_${Date.now()}`;
        await node_core_library_1.FileSystem.writeFileAsync(pathsListFilePath, paths.join('\n'));
        // On Windows, tar.exe will report a "Failed to clean up compressor" error if the target folder
        // does not exist (GitHub #2622)
        await node_core_library_1.FileSystem.ensureFolderAsync(path.dirname(archivePath));
        const projectFolderPath = project.projectFolder;
        const tarExitCode = await this._spawnTarWithLoggingAsync(
        // These parameters are chosen for compatibility with the very primitive bsdtar 3.3.2 shipped with Windows 10.
        [
            // [Windows bsdtar 3.3.2] -c Create
            '-c',
            // [Windows bsdtar 3.3.2] -f <filename>  Location of archive (default \\.\tape0)
            '-f',
            archivePath,
            // [Windows bsdtar 3.3.2] -z, -j, -J, --lzma  Compress archive with gzip/bzip2/xz/lzma
            '-z',
            // [Windows bsdtar 3.3.2] -C <dir>  Change to <dir> before processing remaining files
            '-C',
            projectFolderPath,
            // [GNU tar 1.33] -T, --files-from=FILE      get names to extract or create from FILE
            //
            // Windows bsdtar does not document this parameter, but seems to accept it.
            '--files-from',
            pathsListFilePath
        ], projectFolderPath, logFilePath);
        await node_core_library_1.FileSystem.deleteFileAsync(pathsListFilePath);
        return tarExitCode;
    }
    async _spawnTarWithLoggingAsync(args, currentWorkingDirectory, logFilePath) {
        // Runs "tar" with the specified args and logs its output to the specified location.
        // The log file looks like this:
        //
        // Windows:
        // Start time: Mon Apr 19 2021 13:06:40 GMT-0700 (Pacific Daylight Time)
        // Invoking "C:\WINDOWS\system32\tar.exe -x -f E:\rush-cache\d18105f7f83eb610b468be4e2421681f4a52e44d"
        //
        // ======= BEGIN PROCESS OUTPUT =======
        // [stdout] <tar stdout output>
        // [stderr] <tar stderr output>
        // ======== END PROCESS OUTPUT ========
        //
        // Exited with code "0"
        //
        // Linux:
        // Start time: Mon Apr 19 2021 13:06:40 GMT-0700 (Pacific Daylight Time)
        // Invoking "/bin/tar -x -f /home/username/rush-cache/d18105f7f83eb610b468be4e2421681f4a52e44d"
        //
        // ======= BEGIN PROCESS OUTPUT =======
        // [stdout] <tar stdout output>
        // [stderr] <tar stderr output>
        // ======== END PROCESS OUTPUT ========
        //
        // Exited with code "0"
        await node_core_library_1.FileSystem.ensureFolderAsync(path.dirname(logFilePath));
        const fileWriter = node_core_library_1.FileWriter.open(logFilePath);
        fileWriter.write([
            `Start time: ${new Date().toString()}`,
            `Invoking "${this._tarExecutablePath} ${args.join(' ')}"`,
            '',
            '======= BEGIN PROCESS OUTPUT =======',
            ''
        ].join('\n'));
        const childProcess = node_core_library_1.Executable.spawn(this._tarExecutablePath, args, {
            currentWorkingDirectory: currentWorkingDirectory
        });
        childProcess.stdout.on('data', (chunk) => fileWriter.write(`[stdout] ${chunk}`));
        childProcess.stderr.on('data', (chunk) => fileWriter.write(`[stderr] ${chunk}`));
        const [tarExitCode] = await events.once(childProcess, 'exit');
        fileWriter.write(['======== END PROCESS OUTPUT ========', '', `Exited with code "${tarExitCode}"`].join('\n'));
        fileWriter.close();
        return tarExitCode;
    }
}
exports.TarExecutable = TarExecutable;
//# sourceMappingURL=TarExecutable.js.map