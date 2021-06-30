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
const os = __importStar(require("os"));
const path = __importStar(require("path"));
const Executable_1 = require("../Executable");
const FileSystem_1 = require("../FileSystem");
const Text_1 = require("../Text");
// The PosixModeBits are intended to be used with bitwise operations.
/* eslint-disable no-bitwise */
// Use src/test/test-data instead of lib/test/test-data
const executableFolder = path.join(__dirname, '..', '..', 'src', 'test', 'test-data', 'executable');
let environment;
if (os.platform() === 'win32') {
    environment = {
        PATH: [
            path.join(executableFolder, 'skipped'),
            path.join(executableFolder, 'success'),
            path.join(executableFolder, 'fail'),
            path.dirname(process.execPath) // the folder where node.exe can be found
        ].join(path.delimiter),
        PATHEXT: '.COM;.EXE;.BAT;.CMD;.VBS',
        TEST_VAR: '123'
    };
}
else {
    environment = {
        PATH: [
            path.join(executableFolder, 'skipped'),
            path.join(executableFolder, 'success'),
            path.join(executableFolder, 'fail'),
            path.dirname(process.execPath),
            // These are needed because our example script needs to find bash
            '/usr/local/bin',
            '/usr/bin',
            '/bin'
        ].join(path.delimiter),
        TEST_VAR: '123'
    };
}
const options = {
    environment: environment,
    currentWorkingDirectory: executableFolder,
    stdio: 'pipe'
};
beforeAll(() => {
    // Make sure the test folder exists where we expect it
    expect(FileSystem_1.FileSystem.exists(executableFolder)).toEqual(true);
    // Git's core.filemode setting wrongly defaults to true on Windows.  This design flaw makes
    // it completely impractical to store POSIX file permissions in a cross-platform Git repo.
    // So instead we set them before the test runs, and then revert them after the test completes.
    if (os.platform() !== 'win32') {
        FileSystem_1.FileSystem.changePosixModeBits(path.join(executableFolder, 'success', 'npm-binary-wrapper'), 292 /* AllRead */ | 146 /* AllWrite */ | 73 /* AllExecute */);
        FileSystem_1.FileSystem.changePosixModeBits(path.join(executableFolder, 'success', 'bash-script.sh'), 292 /* AllRead */ | 146 /* AllWrite */ | 73 /* AllExecute */);
    }
});
afterAll(() => {
    // Revert the permissions to the defaults
    if (os.platform() !== 'win32') {
        FileSystem_1.FileSystem.changePosixModeBits(path.join(executableFolder, 'success', 'npm-binary-wrapper'), 292 /* AllRead */ | 146 /* AllWrite */);
        FileSystem_1.FileSystem.changePosixModeBits(path.join(executableFolder, 'success', 'bash-script.sh'), 292 /* AllRead */ | 146 /* AllWrite */);
    }
});
test('Executable.tryResolve() pathless', () => {
    const resolved = Executable_1.Executable.tryResolve('npm-binary-wrapper', options);
    expect(resolved).toBeDefined();
    const resolvedRelative = Text_1.Text.replaceAll(path.relative(executableFolder, resolved), '\\', '/');
    if (os.platform() === 'win32') {
        // On Windows, we should find npm-binary-wrapper.cmd instead of npm-binary-wrapper
        expect(resolvedRelative).toEqual('success/npm-binary-wrapper.cmd');
    }
    else {
        expect(resolvedRelative).toEqual('success/npm-binary-wrapper');
    }
    // We should not find the "missing-extension" at all, because its file extension
    // is not executable on Windows (and the execute bit is missing on Unix)
    expect(Executable_1.Executable.tryResolve('missing-extension', options)).toBeUndefined();
});
test('Executable.tryResolve() with path', () => {
    const resolved = Executable_1.Executable.tryResolve('./npm-binary-wrapper', options);
    expect(resolved).toBeUndefined();
});
function executeNpmBinaryWrapper(args) {
    const result = Executable_1.Executable.spawnSync('npm-binary-wrapper', args, options);
    expect(result.error).toBeUndefined();
    expect(result.stderr).toBeDefined();
    expect(result.stderr.toString()).toEqual('');
    expect(result.stdout).toBeDefined();
    const outputLines = result.stdout
        .toString()
        .split(/[\r\n]+/g)
        .map((x) => x.trim());
    let lineIndex = 0;
    if (os.platform() === 'win32') {
        expect(outputLines[lineIndex++]).toEqual('Executing npm-binary-wrapper.cmd with args:');
    }
    else {
        expect(outputLines[lineIndex++]).toEqual('Executing npm-binary-wrapper with args:');
    }
    // console.log('npm-binary-wrapper.cmd ARGS: ' + outputLines[lineIndex]);
    ++lineIndex; // skip npm-binary-wrapper's args
    expect(outputLines[lineIndex++]).toEqual('Executing javascript-file.js with args:');
    const stringifiedArgv = outputLines[lineIndex++];
    expect(stringifiedArgv.substr(0, 2)).toEqual('["');
    const argv = JSON.parse(stringifiedArgv);
    // Discard the first two array entries whose path is nondeterministic
    argv.shift(); // the path to node.exe
    argv.shift(); // the path to javascript-file.js
    return argv;
}
test('Executable.spawnSync("npm-binary-wrapper") simple', () => {
    const args = ['arg1', 'arg2', 'arg3'];
    expect(executeNpmBinaryWrapper(args)).toEqual(args);
});
test('Executable.spawnSync("npm-binary-wrapper") edge cases 1', () => {
    // Characters that confuse the CreateProcess() WIN32 API's encoding
    const args = ['', '/', ' \t ', '"a', 'b"', '"c"', '\\"\\d', '!', '!TEST_VAR!'];
    expect(executeNpmBinaryWrapper(args)).toEqual(args);
});
test('Executable.spawnSync("npm-binary-wrapper") edge cases 2', () => {
    // All ASCII punctuation
    const args = [
        // Characters that are impossible to escape for cmd.exe:
        // %^&|<>  newline
        '~!@#$*()_+`={}[]:";\'?,./',
        '~!@#$*()_+`={}[]:";\'?,./'
    ];
    expect(executeNpmBinaryWrapper(args)).toEqual(args);
});
test('Executable.spawnSync("npm-binary-wrapper") edge cases 2', () => {
    // All ASCII punctuation
    const args = [
        // Characters that are impossible to escape for cmd.exe:
        // %^&|<>  newline
        '~!@#$*()_+`={}[]:";\'?,./',
        '~!@#$*()_+`={}[]:";\'?,./'
    ];
    expect(executeNpmBinaryWrapper(args)).toEqual(args);
});
test('Executable.spawnSync("npm-binary-wrapper") bad characters', () => {
    if (os.platform() === 'win32') {
        expect(() => {
            executeNpmBinaryWrapper(['abc%123']);
        }).toThrowError('The command line argument "abc%123" contains a special character "%"' +
            ' that cannot be escaped for the Windows shell');
        expect(() => {
            executeNpmBinaryWrapper(['abc<>123']);
        }).toThrowError('The command line argument "abc<>123" contains a special character "<"' +
            ' that cannot be escaped for the Windows shell');
    }
});
test('Executable.spawn("npm-binary-wrapper")', async () => {
    const executablePath = path.join(executableFolder, 'success', 'npm-binary-wrapper');
    await expect((() => {
        const childProcess = Executable_1.Executable.spawn(executablePath, ['1', '2', '3'], {
            environment,
            currentWorkingDirectory: executableFolder
        });
        return new Promise((resolve, reject) => {
            childProcess.on('exit', (code) => {
                resolve(`Exit with code=${code}`);
            });
            childProcess.on('error', (error) => {
                reject(`Failed with error: ${error.message}`);
            });
        });
    })()).resolves.toBe('Exit with code=0');
});
//# sourceMappingURL=Executable.test.js.map