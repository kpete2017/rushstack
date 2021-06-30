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
const VersionPolicyConfiguration_1 = require("../VersionPolicyConfiguration");
const VersionPolicy_1 = require("../VersionPolicy");
describe('VersionPolicy', () => {
    describe('LockStepVersion', () => {
        const filename = path.resolve(__dirname, 'jsonFiles', 'rushWithLockVersion.json');
        const versionPolicyConfig = new VersionPolicyConfiguration_1.VersionPolicyConfiguration(filename);
        let versionPolicy;
        beforeEach(() => {
            versionPolicy = versionPolicyConfig.getVersionPolicy('testPolicy1');
        });
        it('loads configuration.', () => {
            expect(versionPolicy).toBeInstanceOf(VersionPolicy_1.LockStepVersionPolicy);
            const lockStepVersionPolicy = versionPolicy;
            expect(lockStepVersionPolicy.version).toEqual('1.1.0');
            expect(lockStepVersionPolicy.nextBump).toEqual(VersionPolicy_1.BumpType.patch);
        });
        it('skips packageJson if version is already the locked step version', () => {
            const lockStepVersionPolicy = versionPolicy;
            expect(lockStepVersionPolicy.ensure({
                name: 'a',
                version: '1.1.0'
            })).not.toBeDefined();
        });
        it('updates packageJson if version is lower than the locked step version', () => {
            const lockStepVersionPolicy = versionPolicy;
            const expectedPackageJson = {
                name: 'a',
                version: '1.1.0'
            };
            const originalPackageJson = {
                name: 'a',
                version: '1.0.1'
            };
            expect(lockStepVersionPolicy.ensure(originalPackageJson)).toEqual(expectedPackageJson);
        });
        it('throws exception if version is higher than the locked step version', () => {
            const lockStepVersionPolicy = versionPolicy;
            const originalPackageJson = {
                name: 'a',
                version: '2.1.0'
            };
            expect(() => {
                lockStepVersionPolicy.ensure(originalPackageJson);
            }).toThrow();
        });
        it('update version with force if version is higher than the locked step version', () => {
            const lockStepVersionPolicy = versionPolicy;
            const originalPackageJson = {
                name: 'a',
                version: '2.1.0'
            };
            const expectedPackageJson = {
                name: 'a',
                version: '1.1.0'
            };
            expect(lockStepVersionPolicy.ensure(originalPackageJson, true)).toEqual(expectedPackageJson);
        });
        it('bumps version for preminor release', () => {
            const lockStepVersionPolicy = versionPolicy;
            lockStepVersionPolicy.bump(VersionPolicy_1.BumpType.preminor, 'pr');
            expect(lockStepVersionPolicy.version).toEqual('1.2.0-pr.0');
            expect(lockStepVersionPolicy.nextBump).toEqual(VersionPolicy_1.BumpType.patch);
        });
        it('bumps version for minor release', () => {
            const lockStepVersionPolicy = versionPolicy;
            lockStepVersionPolicy.bump(VersionPolicy_1.BumpType.minor);
            expect(lockStepVersionPolicy.version).toEqual('1.2.0');
            expect(lockStepVersionPolicy.nextBump).toEqual(VersionPolicy_1.BumpType.patch);
        });
        it('can update version directly', () => {
            const lockStepVersionPolicy = versionPolicy;
            const newVersion = '1.5.6-beta.0';
            lockStepVersionPolicy.update(newVersion);
            expect(lockStepVersionPolicy.version).toEqual(newVersion);
        });
    });
    describe('IndividualVersionPolicy', () => {
        const fileName = path.resolve(__dirname, 'jsonFiles', 'rushWithIndividualVersion.json');
        const versionPolicyConfig = new VersionPolicyConfiguration_1.VersionPolicyConfiguration(fileName);
        const versionPolicy = versionPolicyConfig.getVersionPolicy('testPolicy2');
        it('loads configuration', () => {
            expect(versionPolicy).toBeInstanceOf(VersionPolicy_1.IndividualVersionPolicy);
            const individualVersionPolicy = versionPolicy;
            expect(individualVersionPolicy.lockedMajor).toEqual(2);
        });
        it('skips packageJson if no need to change', () => {
            const individualVersionPolicy = versionPolicy;
            expect(individualVersionPolicy.ensure({
                name: 'a',
                version: '2.1.0'
            })).not.toBeDefined();
        });
        it('updates packageJson if version is lower than the locked major', () => {
            const individualVersionPolicy = versionPolicy;
            const expectedPackageJson = {
                name: 'a',
                version: '2.0.0'
            };
            const originalPackageJson = {
                name: 'a',
                version: '1.0.1'
            };
            expect(individualVersionPolicy.ensure(originalPackageJson)).toEqual(expectedPackageJson);
        });
        it('throws exception if version is higher than the locked step version', () => {
            const individualVersionPolicy = versionPolicy;
            const originalPackageJson = {
                name: 'a',
                version: '3.1.0'
            };
            expect(() => {
                individualVersionPolicy.ensure(originalPackageJson);
            }).toThrow();
        });
    });
});
//# sourceMappingURL=VersionPolicy.test.js.map