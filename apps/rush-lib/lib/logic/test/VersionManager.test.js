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
const VersionPolicy_1 = require("../../api/VersionPolicy");
const ChangeManagement_1 = require("../../api/ChangeManagement");
const RushConfiguration_1 = require("../../api/RushConfiguration");
const VersionManager_1 = require("../VersionManager");
function _getChanges(changeFiles, packageName) {
    const changeFile = changeFiles.get(packageName);
    if (!changeFile) {
        return undefined;
    }
    return changeFile.getChanges(packageName);
}
describe('VersionManager', () => {
    const rushJsonFile = path.resolve(__dirname, 'repo', 'rush.json');
    const rushConfiguration = RushConfiguration_1.RushConfiguration.loadFromConfigurationFile(rushJsonFile);
    let versionManager;
    beforeEach(() => {
        versionManager = new VersionManager_1.VersionManager(rushConfiguration, 'test@microsoft.com', rushConfiguration.versionPolicyConfiguration);
    });
    /* eslint-disable dot-notation */
    describe('ensure', () => {
        it('fixes lock step versions', () => {
            versionManager.ensure('testPolicy1');
            const updatedPackages = versionManager.updatedProjects;
            const expectedVersion = '10.10.0';
            expect(updatedPackages.size).toEqual(6);
            expect(updatedPackages.get('a').version).toEqual(expectedVersion);
            expect(updatedPackages.get('b').version).toEqual(expectedVersion);
            expect(updatedPackages.get('b').dependencies['a']).toEqual(`~${expectedVersion}`);
            expect(updatedPackages.get('c').version).toEqual('3.1.1');
            expect(updatedPackages.get('c').dependencies['b']).toEqual(`>=10.10.0 <11.0.0`);
            expect(updatedPackages.get('d').version).toEqual('4.1.1');
            expect(updatedPackages.get('d').dependencies['b']).toEqual(`>=10.10.0 <11.0.0`);
            expect(updatedPackages.get('f').version).toEqual('1.0.0');
            expect(updatedPackages.get('f').dependencies['a']).toEqual(`~10.10.0`);
            expect(updatedPackages.get('g').devDependencies['a']).toEqual(`~10.10.0`);
            const changeFiles = versionManager.changeFiles;
            expect(changeFiles.size).toEqual(4);
            expect(_getChanges(changeFiles, 'a')).toHaveLength(1);
            expect(_getChanges(changeFiles, 'a')[0].changeType).toEqual(ChangeManagement_1.ChangeType.none);
            expect(_getChanges(changeFiles, 'b')).toHaveLength(1);
            expect(_getChanges(changeFiles, 'b')[0].changeType).toEqual(ChangeManagement_1.ChangeType.none);
            expect(_getChanges(changeFiles, 'c')).toHaveLength(2);
            expect(_getChanges(changeFiles, 'c')[0].changeType).toEqual(ChangeManagement_1.ChangeType.patch);
            expect(_getChanges(changeFiles, 'c')[1].changeType).toEqual(ChangeManagement_1.ChangeType.dependency);
            expect(_getChanges(changeFiles, 'd')).toHaveLength(2);
            expect(_getChanges(changeFiles, 'd')[0].changeType).toEqual(ChangeManagement_1.ChangeType.patch);
            expect(_getChanges(changeFiles, 'd')[1].changeType).toEqual(ChangeManagement_1.ChangeType.dependency);
        });
        it('fixes major version for individual version policy', () => {
            versionManager.ensure('testPolicy2');
            const updatedPackages = versionManager.updatedProjects;
            expect(updatedPackages.size).toEqual(2);
            expect(updatedPackages.get('c').version).toEqual('5.0.0');
            expect(updatedPackages.get('c').dependencies['b']).toEqual(`>=2.0.0 <3.0.0`);
            expect(updatedPackages.get('e').version).toEqual('10.10.0');
            expect(updatedPackages.get('e').dependencies['c']).toEqual('~5.0.0');
        });
        it('does not change packageJson if not needed by individual version policy', () => {
            versionManager.ensure('testPolicy3');
            const updatedPackages = versionManager.updatedProjects;
            expect(updatedPackages.size).toEqual(0);
        });
    });
    describe('bump', () => {
        it('bumps to prerelease version', async () => {
            await versionManager.bumpAsync('testPolicy1', VersionPolicy_1.BumpType.prerelease, 'dev', false);
            const updatedPackages = versionManager.updatedProjects;
            const expectedVersion = '10.10.1-dev.0';
            const changeFiles = versionManager.changeFiles;
            expect(updatedPackages.get('a').version).toEqual(expectedVersion);
            expect(updatedPackages.get('b').version).toEqual(expectedVersion);
            expect(updatedPackages.get('e').version).toEqual(expectedVersion);
            expect(updatedPackages.get('g').devDependencies['a']).toEqual(`~${expectedVersion}`);
            expect(_getChanges(changeFiles, 'a')).not.toBeDefined();
            expect(_getChanges(changeFiles, 'b')).not.toBeDefined();
        });
    });
    /* eslint-enable dot-notation */
});
describe('WorkspaceVersionManager', () => {
    const rushJsonFile = path.resolve(__dirname, 'workspaceRepo', 'rush.json');
    const rushConfiguration = RushConfiguration_1.RushConfiguration.loadFromConfigurationFile(rushJsonFile);
    let versionManager;
    beforeEach(() => {
        versionManager = new VersionManager_1.VersionManager(rushConfiguration, 'test@microsoft.com', rushConfiguration.versionPolicyConfiguration);
    });
    /* eslint-disable dot-notation */
    describe('ensure', () => {
        it('fixes lock step versions', () => {
            versionManager.ensure('testPolicy1');
            const updatedPackages = versionManager.updatedProjects;
            const expectedVersion = '10.10.0';
            expect(updatedPackages.size).toEqual(6);
            expect(updatedPackages.get('a').version).toEqual(expectedVersion);
            expect(updatedPackages.get('b').version).toEqual(expectedVersion);
            expect(updatedPackages.get('b').dependencies['a']).toEqual(`workspace:~${expectedVersion}`);
            expect(updatedPackages.get('c').version).toEqual('3.1.1');
            expect(updatedPackages.get('c').dependencies['b']).toEqual(`workspace:>=10.10.0 <11.0.0`);
            expect(updatedPackages.get('d').version).toEqual('4.1.1');
            expect(updatedPackages.get('d').dependencies['b']).toEqual(`workspace:>=10.10.0 <11.0.0`);
            expect(updatedPackages.get('f').version).toEqual('1.0.0');
            expect(updatedPackages.get('f').dependencies['a']).toEqual(`workspace:~10.10.0`);
            expect(updatedPackages.get('g').devDependencies['a']).toEqual(`workspace:~10.10.0`);
            const changeFiles = versionManager.changeFiles;
            expect(changeFiles.size).toEqual(4);
            expect(_getChanges(changeFiles, 'a')).toHaveLength(1);
            expect(_getChanges(changeFiles, 'a')[0].changeType).toEqual(ChangeManagement_1.ChangeType.none);
            expect(_getChanges(changeFiles, 'b')).toHaveLength(1);
            expect(_getChanges(changeFiles, 'b')[0].changeType).toEqual(ChangeManagement_1.ChangeType.none);
            expect(_getChanges(changeFiles, 'c')).toHaveLength(2);
            expect(_getChanges(changeFiles, 'c')[0].changeType).toEqual(ChangeManagement_1.ChangeType.patch);
            expect(_getChanges(changeFiles, 'c')[1].changeType).toEqual(ChangeManagement_1.ChangeType.dependency);
            expect(_getChanges(changeFiles, 'd')).toHaveLength(2);
            expect(_getChanges(changeFiles, 'd')[0].changeType).toEqual(ChangeManagement_1.ChangeType.patch);
            expect(_getChanges(changeFiles, 'd')[1].changeType).toEqual(ChangeManagement_1.ChangeType.dependency);
        });
        it('fixes major version for individual version policy', () => {
            versionManager.ensure('testPolicy2');
            const updatedPackages = versionManager.updatedProjects;
            expect(updatedPackages.size).toEqual(2);
            expect(updatedPackages.get('c').version).toEqual('5.0.0');
            expect(updatedPackages.get('c').dependencies['b']).toEqual(`workspace:>=2.0.0 <3.0.0`);
            expect(updatedPackages.get('e').version).toEqual('10.10.0');
            expect(updatedPackages.get('e').dependencies['c']).toEqual('workspace:~5.0.0');
        });
        it('does not change packageJson if not needed by individual version policy', () => {
            versionManager.ensure('testPolicy3');
            const updatedPackages = versionManager.updatedProjects;
            expect(updatedPackages.size).toEqual(0);
        });
    });
    describe('bump', () => {
        it('bumps to prerelease version', async () => {
            await versionManager.bumpAsync('testPolicy1', VersionPolicy_1.BumpType.prerelease, 'dev', false);
            const updatedPackages = versionManager.updatedProjects;
            const expectedVersion = '10.10.1-dev.0';
            const changeFiles = versionManager.changeFiles;
            expect(updatedPackages.get('a').version).toEqual(expectedVersion);
            expect(updatedPackages.get('b').version).toEqual(expectedVersion);
            expect(updatedPackages.get('e').version).toEqual(expectedVersion);
            expect(updatedPackages.get('g').devDependencies['a']).toEqual(`workspace:~${expectedVersion}`);
            expect(_getChanges(changeFiles, 'a')).not.toBeDefined();
            expect(_getChanges(changeFiles, 'b')).not.toBeDefined();
        });
    });
    /* eslint-enable dot-notation */
});
//# sourceMappingURL=VersionManager.test.js.map