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
const ChangeManagement_1 = require("../../api/ChangeManagement");
const RushConfiguration_1 = require("../../api/RushConfiguration");
const ChangelogGenerator_1 = require("../ChangelogGenerator");
const path = __importStar(require("path"));
describe('updateIndividualChangelog', () => {
    const rushJsonFile = path.resolve(__dirname, 'packages', 'rush.json');
    let rushConfiguration;
    beforeEach(() => {
        rushConfiguration = RushConfiguration_1.RushConfiguration.loadFromConfigurationFile(rushJsonFile);
    });
    it('can translate a single change request into a new changelog object', () => {
        const actualResult = ChangelogGenerator_1.ChangelogGenerator.updateIndividualChangelog({
            packageName: 'a',
            newVersion: '1.0.0',
            changeType: ChangeManagement_1.ChangeType.major,
            changes: [
                {
                    packageName: 'a',
                    type: 'major',
                    changeType: ChangeManagement_1.ChangeType.major,
                    comment: 'Patching a'
                }
            ]
        }, 'rootMajorChange', false, rushConfiguration);
        const expectedResult = {
            name: 'a',
            entries: [
                {
                    version: '1.0.0',
                    tag: 'a_v1.0.0',
                    date: '',
                    comments: {
                        major: [
                            {
                                author: undefined,
                                comment: 'Patching a',
                                commit: undefined
                            }
                        ]
                    }
                }
            ]
        };
        // Ignore comparing date.
        expectedResult.entries[0].date = actualResult.entries[0].date;
        expect(actualResult).toEqual(expectedResult);
    });
    it('can merge a new change request into an existing changelog', () => {
        const actualResult = ChangelogGenerator_1.ChangelogGenerator.updateIndividualChangelog({
            packageName: 'a',
            newVersion: '1.0.0',
            changeType: ChangeManagement_1.ChangeType.major,
            changes: [
                {
                    packageName: 'a',
                    type: 'major',
                    changeType: ChangeManagement_1.ChangeType.major,
                    comment: 'Patching a'
                }
            ]
        }, path.resolve(__dirname, 'exampleChangelog'), false, rushConfiguration);
        const expectedResult = {
            name: 'a',
            entries: [
                {
                    version: '1.0.0',
                    tag: 'a_v1.0.0',
                    date: '',
                    comments: {
                        major: [
                            {
                                author: undefined,
                                comment: 'Patching a',
                                commit: undefined
                            }
                        ]
                    }
                },
                {
                    version: '0.0.1',
                    tag: 'a_v0.0.1',
                    date: 'Wed, 30 Nov 2016 18:37:45 GMT',
                    comments: {
                        patch: [
                            {
                                comment: 'Patching a'
                            }
                        ]
                    }
                }
            ]
        };
        // Ignore comparing date.
        expectedResult.entries[0].date = actualResult.entries[0].date;
        expect(actualResult).toEqual(expectedResult);
    });
    it('can avoid adding duplicate entries', () => {
        const actualResult = ChangelogGenerator_1.ChangelogGenerator.updateIndividualChangelog({
            packageName: 'a',
            newVersion: '0.0.1',
            changeType: ChangeManagement_1.ChangeType.patch,
            changes: [
                {
                    packageName: 'a',
                    type: 'patch',
                    changeType: ChangeManagement_1.ChangeType.patch,
                    comment: 'Patching a'
                }
            ]
        }, path.resolve(__dirname, 'exampleChangelog'), false, rushConfiguration);
        expect(actualResult).not.toBeDefined();
    });
    it('can handle dependency bumps', () => {
        const actualResult = ChangelogGenerator_1.ChangelogGenerator.updateIndividualChangelog({
            packageName: 'a',
            newVersion: '0.0.2',
            changeType: ChangeManagement_1.ChangeType.dependency,
            changes: [
                {
                    packageName: 'a',
                    type: 'dependency',
                    changeType: ChangeManagement_1.ChangeType.dependency,
                    comment: 'Updating a'
                }
            ]
        }, path.resolve(__dirname, 'exampleChangelog'), false, rushConfiguration);
        const expectedResult = {
            name: 'a',
            entries: [
                {
                    version: '0.0.2',
                    tag: 'a_v0.0.2',
                    date: undefined,
                    comments: {
                        dependency: [
                            {
                                author: undefined,
                                comment: 'Updating a',
                                commit: undefined
                            }
                        ]
                    }
                },
                {
                    version: '0.0.1',
                    tag: 'a_v0.0.1',
                    date: 'Wed, 30 Nov 2016 18:37:45 GMT',
                    comments: {
                        patch: [
                            {
                                comment: 'Patching a'
                            }
                        ]
                    }
                }
            ]
        };
        // Remove date.
        actualResult.entries[0].date = undefined;
        expect(actualResult).toEqual(expectedResult);
    });
    it('skip empty comment', () => {
        const actualResult = ChangelogGenerator_1.ChangelogGenerator.updateIndividualChangelog({
            packageName: 'a',
            newVersion: '0.0.2',
            changeType: ChangeManagement_1.ChangeType.none,
            changes: [
                {
                    packageName: 'a',
                    type: 'none',
                    changeType: ChangeManagement_1.ChangeType.none,
                    comment: ''
                }
            ]
        }, path.resolve(__dirname, 'exampleChangelog'), false, rushConfiguration);
        const expectedResult = {
            name: 'a',
            entries: [
                {
                    version: '0.0.2',
                    tag: 'a_v0.0.2',
                    date: undefined,
                    comments: {}
                },
                {
                    version: '0.0.1',
                    tag: 'a_v0.0.1',
                    date: 'Wed, 30 Nov 2016 18:37:45 GMT',
                    comments: {
                        patch: [
                            {
                                comment: 'Patching a'
                            }
                        ]
                    }
                }
            ]
        };
        // Remove date.
        actualResult.entries[0].date = undefined;
        expect(actualResult).toEqual(expectedResult);
    });
});
describe('updateChangelogs', () => {
    const rushJsonFile = path.resolve(__dirname, 'packages', 'rush.json');
    let rushConfiguration;
    beforeEach(() => {
        rushConfiguration = RushConfiguration_1.RushConfiguration.loadFromConfigurationFile(rushJsonFile);
    });
    /* eslint-disable dot-notation */
    it('skips changes logs if the project version is not changed.', () => {
        const changeHash = {};
        // Package a does not have version change.
        changeHash['a'] = {
            packageName: 'a',
            changeType: ChangeManagement_1.ChangeType.dependency,
            newVersion: '1.0.0',
            changes: []
        };
        // Package b has version change.
        changeHash['b'] = {
            packageName: 'b',
            changeType: ChangeManagement_1.ChangeType.patch,
            newVersion: '1.0.1',
            changes: []
        };
        const updatedChangeLogs = ChangelogGenerator_1.ChangelogGenerator.updateChangelogs(changeHash, rushConfiguration.projectsByName, rushConfiguration, false);
        expect(updatedChangeLogs).toHaveLength(1);
        expect(updatedChangeLogs[0].name).toEqual('b');
    });
    it('skips changes logs if the project is in pre-release', () => {
        const changeHash = {};
        // Package a is a prerelease
        changeHash['a'] = {
            packageName: 'a',
            changeType: ChangeManagement_1.ChangeType.dependency,
            newVersion: '1.0.1-pre.1',
            changes: []
        };
        // Package b is not a prerelease
        changeHash['b'] = {
            packageName: 'b',
            changeType: ChangeManagement_1.ChangeType.patch,
            newVersion: '1.0.1',
            changes: []
        };
        // Makes package 'a' prerelease package.
        const rushProjectA = rushConfiguration.projectsByName.get('a');
        rushProjectA.packageJson.version = '1.0.1-pre.1';
        const updatedChangeLogs = ChangelogGenerator_1.ChangelogGenerator.updateChangelogs(changeHash, rushConfiguration.projectsByName, rushConfiguration, false);
        expect(updatedChangeLogs).toHaveLength(1);
        expect(updatedChangeLogs[0].name).toEqual('b');
    });
    it('writes changelog for hotfix changes', () => {
        const changeHash = {};
        // Package a is a hotfix
        changeHash['a'] = {
            packageName: 'a',
            changeType: ChangeManagement_1.ChangeType.hotfix,
            newVersion: '1.0.1-hotfix.1',
            changes: []
        };
        // Package b is not a hotfix
        changeHash['b'] = {
            packageName: 'b',
            changeType: ChangeManagement_1.ChangeType.patch,
            newVersion: '1.0.1',
            changes: []
        };
        // Makes package 'a' hotfix package.
        const rushProjectA = rushConfiguration.projectsByName.get('a');
        rushProjectA.packageJson.version = '1.0.1-hotfix.1';
        const updatedChangeLogs = ChangelogGenerator_1.ChangelogGenerator.updateChangelogs(changeHash, rushConfiguration.projectsByName, rushConfiguration, false);
        expect(updatedChangeLogs).toHaveLength(2);
        expect(updatedChangeLogs[0].name).toEqual('a');
        expect(updatedChangeLogs[1].name).toEqual('b');
    });
    /* eslint-enable dot-notation */
});
//# sourceMappingURL=ChangelogGenerator.test.js.map