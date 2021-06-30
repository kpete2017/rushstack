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
const path = __importStar(require("path"));
const LockFile_1 = require("../LockFile");
const FileSystem_1 = require("../FileSystem");
const FileWriter_1 = require("../FileWriter");
function setLockFileGetProcessStartTime(fn) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    LockFile_1.LockFile._getStartTime = fn;
}
describe('LockFile', () => {
    afterEach(() => {
        setLockFileGetProcessStartTime(LockFile_1.getProcessStartTime);
    });
    describe('getLockFilePath', () => {
        test('only accepts alphabetical characters for resource name', () => {
            expect(() => {
                LockFile_1.LockFile.getLockFilePath(process.cwd(), 'foo123');
            }).not.toThrow();
            expect(() => {
                LockFile_1.LockFile.getLockFilePath(process.cwd(), 'bar.123');
            }).not.toThrow();
            expect(() => {
                LockFile_1.LockFile.getLockFilePath(process.cwd(), 'foo.bar');
            }).not.toThrow();
            expect(() => {
                LockFile_1.LockFile.getLockFilePath(process.cwd(), 'lock-file.123');
            }).not.toThrow();
            expect(() => {
                LockFile_1.LockFile.getLockFilePath(process.cwd(), '.foo123');
            }).toThrow();
            expect(() => {
                LockFile_1.LockFile.getLockFilePath(process.cwd(), 'foo123.');
            }).toThrow();
            expect(() => {
                LockFile_1.LockFile.getLockFilePath(process.cwd(), '-foo123');
            }).toThrow();
            expect(() => {
                LockFile_1.LockFile.getLockFilePath(process.cwd(), 'foo123-');
            }).toThrow();
            expect(() => {
                LockFile_1.LockFile.getLockFilePath(process.cwd(), '');
            }).toThrow();
        });
    });
    describe('getProcessStartTimeFromProcStat', () => {
        function createStatOutput(value2, n) {
            let statOutput = `0 ${value2} S`;
            for (let i = 0; i < n; i++) {
                statOutput += ' 0';
            }
            return statOutput;
        }
        test('returns undefined if too few values are contained in /proc/[pid]/stat (1)', () => {
            const stat = createStatOutput('(bash)', 1);
            const ret = LockFile_1.getProcessStartTimeFromProcStat(stat);
            expect(ret).toBeUndefined();
        });
        test('returns undefined if too few values are contained in /proc/[pid]/stat (2)', () => {
            const stat = createStatOutput('(bash)', 0);
            const ret = LockFile_1.getProcessStartTimeFromProcStat(stat);
            expect(ret).toBeUndefined();
        });
        test('returns the correct start time if the second value in /proc/[pid]/stat contains spaces', () => {
            let stat = createStatOutput('(bash 2)', 18);
            const value22 = '12345';
            stat += ` ${value22}`;
            const ret = LockFile_1.getProcessStartTimeFromProcStat(stat);
            expect(ret).toEqual(value22);
        });
        test('returns the correct start time if there are 22 values in /proc/[pid]/stat, including a trailing line ' +
            'terminator', () => {
            let stat = createStatOutput('(bash)', 18);
            const value22 = '12345';
            stat += ` ${value22}\n`;
            const ret = LockFile_1.getProcessStartTimeFromProcStat(stat);
            expect(ret).toEqual(value22);
        });
        test('returns the correct start time if the second value in /proc/[pid]/stat does not contain spaces', () => {
            let stat = createStatOutput('(bash)', 18);
            const value22 = '12345';
            stat += ` ${value22}`;
            const ret = LockFile_1.getProcessStartTimeFromProcStat(stat);
            expect(ret).toEqual(value22);
        });
    });
    if (process.platform === 'darwin' || process.platform === 'linux') {
        describe('Linux and Mac', () => {
            describe('getLockFilePath()', () => {
                test('returns a resolved path containing the pid', () => {
                    expect(path.join(process.cwd(), `test#${process.pid}.lock`)).toEqual(LockFile_1.LockFile.getLockFilePath('./', 'test'));
                });
                test('allows for overridden pid', () => {
                    expect(path.join(process.cwd(), `test#99.lock`)).toEqual(LockFile_1.LockFile.getLockFilePath('./', 'test', 99));
                });
            });
            test('can acquire and close a clean lockfile', () => {
                // ensure test folder is clean
                const testFolder = path.join(__dirname, '1');
                FileSystem_1.FileSystem.ensureEmptyFolder(testFolder);
                const resourceName = 'test';
                const pidLockFileName = LockFile_1.LockFile.getLockFilePath(testFolder, resourceName);
                const lock = LockFile_1.LockFile.tryAcquire(testFolder, resourceName);
                // The lockfile should exist and be in a clean state
                expect(lock).toBeDefined();
                expect(lock.dirtyWhenAcquired).toEqual(false);
                expect(lock.isReleased).toEqual(false);
                expect(FileSystem_1.FileSystem.exists(pidLockFileName)).toEqual(true);
                // Ensure that we can release the "clean" lockfile
                lock.release();
                expect(FileSystem_1.FileSystem.exists(pidLockFileName)).toEqual(false);
                expect(lock.isReleased).toEqual(true);
                // Ensure we cannot release the lockfile twice
                expect(() => {
                    lock.release();
                }).toThrow();
            });
            test('cannot acquire a lock if another valid lock exists', () => {
                // ensure test folder is clean
                const testFolder = path.join(__dirname, '2');
                FileSystem_1.FileSystem.ensureEmptyFolder(testFolder);
                const otherPid = 999999999;
                const otherPidStartTime = '2012-01-02 12:53:12';
                const resourceName = 'test';
                const otherPidLockFileName = LockFile_1.LockFile.getLockFilePath(testFolder, resourceName, otherPid);
                setLockFileGetProcessStartTime((pid) => {
                    return pid === process.pid ? LockFile_1.getProcessStartTime(process.pid) : otherPidStartTime;
                });
                // create an open lockfile
                const lockFileHandle = FileWriter_1.FileWriter.open(otherPidLockFileName);
                lockFileHandle.write(otherPidStartTime);
                lockFileHandle.close();
                FileSystem_1.FileSystem.updateTimes(otherPidLockFileName, {
                    accessedTime: 10000,
                    modifiedTime: 10000
                });
                const lock = LockFile_1.LockFile.tryAcquire(testFolder, resourceName);
                // this lock should be undefined since there is an existing lock
                expect(lock).toBeUndefined();
            });
        });
    }
    if (process.platform === 'win32') {
        describe('getLockFilePath()', () => {
            test("returns a resolved path that doesn't contain", () => {
                expect(path.join(process.cwd(), `test.lock`)).toEqual(LockFile_1.LockFile.getLockFilePath('./', 'test'));
            });
            test('ignores pid that is passed in', () => {
                expect(path.join(process.cwd(), `test.lock`)).toEqual(LockFile_1.LockFile.getLockFilePath('./', 'test', 99));
            });
        });
        test('will not acquire if existing lock is there', () => {
            // ensure test folder is clean
            const testFolder = path.join(__dirname, '1');
            FileSystem_1.FileSystem.deleteFolder(testFolder);
            FileSystem_1.FileSystem.ensureFolder(testFolder);
            // create an open lockfile
            const resourceName = 'test';
            const lockFileName = LockFile_1.LockFile.getLockFilePath(testFolder, resourceName);
            const lockFileHandle = FileWriter_1.FileWriter.open(lockFileName, { exclusive: true });
            const lock = LockFile_1.LockFile.tryAcquire(testFolder, resourceName);
            // this lock should be undefined since there is an existing lock
            expect(lock).toBeUndefined();
            lockFileHandle.close();
        });
        test('can acquire and close a dirty lockfile', () => {
            // ensure test folder is clean
            const testFolder = path.join(__dirname, '1');
            FileSystem_1.FileSystem.deleteFolder(testFolder);
            FileSystem_1.FileSystem.ensureFolder(testFolder);
            // Create a lockfile that is still hanging around on disk,
            const resourceName = 'test';
            const lockFileName = LockFile_1.LockFile.getLockFilePath(testFolder, resourceName);
            FileWriter_1.FileWriter.open(lockFileName, { exclusive: true }).close();
            const lock = LockFile_1.LockFile.tryAcquire(testFolder, resourceName);
            expect(lock).toBeDefined();
            expect(lock.dirtyWhenAcquired).toEqual(true);
            expect(lock.isReleased).toEqual(false);
            expect(FileSystem_1.FileSystem.exists(lockFileName)).toEqual(true);
            // Ensure that we can release the "dirty" lockfile
            lock.release();
            expect(FileSystem_1.FileSystem.exists(lockFileName)).toEqual(false);
            expect(lock.isReleased).toEqual(true);
        });
        test('can acquire and close a clean lockfile', () => {
            // ensure test folder is clean
            const testFolder = path.join(__dirname, '1');
            FileSystem_1.FileSystem.deleteFolder(testFolder);
            FileSystem_1.FileSystem.ensureFolder(testFolder);
            const resourceName = 'test';
            const lockFileName = LockFile_1.LockFile.getLockFilePath(testFolder, resourceName);
            const lock = LockFile_1.LockFile.tryAcquire(testFolder, resourceName);
            // The lockfile should exist and be in a clean state
            expect(lock).toBeDefined();
            expect(lock.dirtyWhenAcquired).toEqual(false);
            expect(lock.isReleased).toEqual(false);
            expect(FileSystem_1.FileSystem.exists(lockFileName)).toEqual(true);
            // Ensure that we can release the "clean" lockfile
            lock.release();
            expect(FileSystem_1.FileSystem.exists(lockFileName)).toEqual(false);
            expect(lock.isReleased).toEqual(true);
            // Ensure we cannot release the lockfile twice
            expect(() => {
                lock.release();
            }).toThrow();
        });
    }
});
//# sourceMappingURL=LockFile.test.js.map