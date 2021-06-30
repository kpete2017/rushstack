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
const ChangeManagement_1 = require("../../api/ChangeManagement");
const RushConfiguration_1 = require("../../api/RushConfiguration");
const PublishUtilities_1 = require("../PublishUtilities");
const ChangeFiles_1 = require("../ChangeFiles");
/* eslint-disable dot-notation */
describe('findChangeRequests', () => {
    let packagesRushConfiguration;
    let repoRushConfiguration;
    beforeEach(() => {
        packagesRushConfiguration = RushConfiguration_1.RushConfiguration.loadFromConfigurationFile(path.resolve(__dirname, 'packages', 'rush.json'));
        repoRushConfiguration = RushConfiguration_1.RushConfiguration.loadFromConfigurationFile(path.resolve(__dirname, 'repo', 'rush.json'));
    });
    it('returns no changes in an empty change folder', () => {
        const allPackages = packagesRushConfiguration.projectsByName;
        const allChanges = PublishUtilities_1.PublishUtilities.findChangeRequests(allPackages, packagesRushConfiguration, new ChangeFiles_1.ChangeFiles(path.join(__dirname, 'noChange')));
        expect(Object.keys(allChanges)).toHaveLength(0);
    });
    it('returns 1 change when changing a leaf package', () => {
        const allPackages = packagesRushConfiguration.projectsByName;
        const allChanges = PublishUtilities_1.PublishUtilities.findChangeRequests(allPackages, packagesRushConfiguration, new ChangeFiles_1.ChangeFiles(path.join(__dirname, 'leafChange')));
        expect(Object.keys(allChanges)).toHaveLength(1);
        expect(allChanges).toHaveProperty('d');
        expect(allChanges['d'].changeType).toEqual(ChangeManagement_1.ChangeType.patch);
    });
    it('returns 4 changes when patching a root package', () => {
        const allPackages = packagesRushConfiguration.projectsByName;
        const allChanges = PublishUtilities_1.PublishUtilities.findChangeRequests(allPackages, packagesRushConfiguration, new ChangeFiles_1.ChangeFiles(path.join(__dirname, 'rootPatchChange')));
        expect(Object.keys(allChanges)).toHaveLength(4);
        expect(allChanges).toHaveProperty('a');
        expect(allChanges).toHaveProperty('b');
        expect(allChanges).toHaveProperty('e');
        expect(allChanges).toHaveProperty('g');
        expect(allChanges['a'].changeType).toEqual(ChangeManagement_1.ChangeType.patch);
        expect(allChanges['b'].changeType).toEqual(ChangeManagement_1.ChangeType.dependency);
        expect(allChanges['e'].changeType).toEqual(ChangeManagement_1.ChangeType.dependency);
        expect(allChanges['g'].changeType).toEqual(ChangeManagement_1.ChangeType.dependency);
        expect(allChanges['a'].newVersion).toEqual('1.0.1');
        expect(allChanges['b'].newVersion).toEqual('1.0.0');
        expect(allChanges['e'].newVersion).toEqual('1.0.0');
        expect(allChanges['g'].newVersion).toEqual('1.0.0');
    });
    it('returns 7 changes when hotfixing a root package', () => {
        const allChanges = PublishUtilities_1.PublishUtilities.findChangeRequests(packagesRushConfiguration.projectsByName, packagesRushConfiguration, new ChangeFiles_1.ChangeFiles(path.join(__dirname, 'rootHotfixChange')));
        expect(Object.keys(allChanges)).toHaveLength(7);
        expect(allChanges).toHaveProperty('a');
        expect(allChanges).toHaveProperty('b');
        expect(allChanges).toHaveProperty('c');
        expect(allChanges).toHaveProperty('d');
        expect(allChanges).toHaveProperty('e');
        expect(allChanges).toHaveProperty('f');
        expect(allChanges).toHaveProperty('g');
        expect(allChanges['a'].changeType).toEqual(ChangeManagement_1.ChangeType.hotfix);
        expect(allChanges['b'].changeType).toEqual(ChangeManagement_1.ChangeType.hotfix);
        expect(allChanges['c'].changeType).toEqual(ChangeManagement_1.ChangeType.hotfix);
        expect(allChanges['d'].changeType).toEqual(ChangeManagement_1.ChangeType.hotfix);
        expect(allChanges['e'].changeType).toEqual(ChangeManagement_1.ChangeType.hotfix);
        expect(allChanges['f'].changeType).toEqual(ChangeManagement_1.ChangeType.hotfix);
        expect(allChanges['g'].changeType).toEqual(ChangeManagement_1.ChangeType.hotfix);
        expect(allChanges['a'].newVersion).toEqual('1.0.0-hotfix.0');
        expect(allChanges['b'].newVersion).toEqual('1.0.0-hotfix.0');
        expect(allChanges['c'].newVersion).toEqual('1.0.0-hotfix.0');
        expect(allChanges['d'].newVersion).toEqual('1.0.0-hotfix.0');
        expect(allChanges['e'].newVersion).toEqual('1.0.0-hotfix.0');
        expect(allChanges['f'].newVersion).toEqual('1.0.0-hotfix.0');
        expect(allChanges['g'].newVersion).toEqual('1.0.0-hotfix.0');
    });
    it('returns 6 changes when major bumping a root package', () => {
        const allPackages = packagesRushConfiguration.projectsByName;
        const allChanges = PublishUtilities_1.PublishUtilities.findChangeRequests(allPackages, packagesRushConfiguration, new ChangeFiles_1.ChangeFiles(path.join(__dirname, 'rootMajorChange')));
        expect(Object.keys(allChanges)).toHaveLength(6);
        expect(allChanges).toHaveProperty('a');
        expect(allChanges).toHaveProperty('b');
        expect(allChanges).toHaveProperty('c');
        expect(allChanges).toHaveProperty('e');
        expect(allChanges).toHaveProperty('f');
        expect(allChanges).toHaveProperty('g');
        expect(allChanges['a'].changeType).toEqual(ChangeManagement_1.ChangeType.major);
        expect(allChanges['b'].changeType).toEqual(ChangeManagement_1.ChangeType.patch);
        expect(allChanges['c'].changeType).toEqual(ChangeManagement_1.ChangeType.dependency);
        expect(allChanges['e'].changeType).toEqual(ChangeManagement_1.ChangeType.patch);
        expect(allChanges['f'].changeType).toEqual(ChangeManagement_1.ChangeType.dependency);
        expect(allChanges['g'].changeType).toEqual(ChangeManagement_1.ChangeType.dependency);
        expect(allChanges['a'].newVersion).toEqual('2.0.0');
        expect(allChanges['b'].newVersion).toEqual('1.0.1');
        expect(allChanges['c'].newVersion).toEqual('1.0.0');
        expect(allChanges['e'].newVersion).toEqual('1.0.1');
        expect(allChanges['f'].newVersion).toEqual('1.0.0');
        expect(allChanges['g'].newVersion).toEqual('1.0.0');
    });
    it('returns 2 changes when bumping cyclic dependencies', () => {
        const allPackages = packagesRushConfiguration.projectsByName;
        const allChanges = PublishUtilities_1.PublishUtilities.findChangeRequests(allPackages, packagesRushConfiguration, new ChangeFiles_1.ChangeFiles(path.join(__dirname, 'cyclicDeps')));
        expect(Object.keys(allChanges)).toHaveLength(2);
        expect(allChanges).toHaveProperty('cyclic-dep-1');
        expect(allChanges).toHaveProperty('cyclic-dep-2');
        expect(allChanges['cyclic-dep-1'].changeType).toEqual(ChangeManagement_1.ChangeType.major);
        expect(allChanges['cyclic-dep-2'].changeType).toEqual(ChangeManagement_1.ChangeType.patch);
    });
    it('returns error when mixing hotfix and non-hotfix changes', () => {
        const allPackages = packagesRushConfiguration.projectsByName;
        expect(PublishUtilities_1.PublishUtilities.findChangeRequests.bind(PublishUtilities_1.PublishUtilities, allPackages, packagesRushConfiguration, new ChangeFiles_1.ChangeFiles(path.join(__dirname, 'hotfixWithPatchChanges')))).toThrow('Cannot apply hotfix alongside patch change on same package');
    });
    it('returns error when adding hotfix with config disabled', () => {
        const allPackages = packagesRushConfiguration.projectsByName;
        // Overload hotfixChangeEnabled function
        packagesRushConfiguration['_hotfixChangeEnabled'] = false;
        expect(PublishUtilities_1.PublishUtilities.findChangeRequests.bind(PublishUtilities_1.PublishUtilities, allPackages, packagesRushConfiguration, new ChangeFiles_1.ChangeFiles(path.join(__dirname, 'rootHotfixChange')))).toThrow('Cannot add hotfix change; hotfixChangeEnabled is false in configuration.');
    });
    it('can resolve multiple changes requests on the same package', () => {
        const allPackages = packagesRushConfiguration.projectsByName;
        const allChanges = PublishUtilities_1.PublishUtilities.findChangeRequests(allPackages, packagesRushConfiguration, new ChangeFiles_1.ChangeFiles(path.join(__dirname, 'multipleChanges')));
        expect(Object.keys(allChanges)).toHaveLength(6);
        expect(allChanges).toHaveProperty('a');
        expect(allChanges).toHaveProperty('b');
        expect(allChanges).toHaveProperty('c');
        expect(allChanges).toHaveProperty('e');
        expect(allChanges).toHaveProperty('f');
        expect(allChanges).toHaveProperty('g');
        expect(allChanges['a'].changeType).toEqual(ChangeManagement_1.ChangeType.major);
        expect(allChanges['b'].changeType).toEqual(ChangeManagement_1.ChangeType.patch);
        expect(allChanges['c'].changeType).toEqual(ChangeManagement_1.ChangeType.dependency);
        expect(allChanges['e'].changeType).toEqual(ChangeManagement_1.ChangeType.patch);
        expect(allChanges['f'].changeType).toEqual(ChangeManagement_1.ChangeType.dependency);
        expect(allChanges['g'].changeType).toEqual(ChangeManagement_1.ChangeType.dependency);
        expect(allChanges['a'].newVersion).toEqual('2.0.0');
        expect(allChanges['b'].newVersion).toEqual('1.0.1');
        expect(allChanges['c'].newVersion).toEqual('1.0.0');
        expect(allChanges['e'].newVersion).toEqual('1.0.1');
        expect(allChanges['f'].newVersion).toEqual('1.0.0');
        expect(allChanges['g'].newVersion).toEqual('1.0.0');
    });
    it('can resolve multiple reverse-ordered changes requests on the same package', () => {
        const allPackages = packagesRushConfiguration.projectsByName;
        const allChanges = PublishUtilities_1.PublishUtilities.findChangeRequests(allPackages, packagesRushConfiguration, new ChangeFiles_1.ChangeFiles(path.join(__dirname, 'orderedChanges')));
        expect(Object.keys(allChanges)).toHaveLength(6);
        expect(allChanges).toHaveProperty('a');
        expect(allChanges).toHaveProperty('b');
        expect(allChanges).toHaveProperty('c');
        expect(allChanges).toHaveProperty('e');
        expect(allChanges).toHaveProperty('f');
        expect(allChanges).toHaveProperty('g');
        expect(allChanges['a'].changeType).toEqual(ChangeManagement_1.ChangeType.major);
        expect(allChanges['b'].changeType).toEqual(ChangeManagement_1.ChangeType.patch);
        expect(allChanges['c'].changeType).toEqual(ChangeManagement_1.ChangeType.dependency);
        expect(allChanges['e'].changeType).toEqual(ChangeManagement_1.ChangeType.patch);
        expect(allChanges['f'].changeType).toEqual(ChangeManagement_1.ChangeType.dependency);
        expect(allChanges['g'].changeType).toEqual(ChangeManagement_1.ChangeType.dependency);
        expect(allChanges['a'].newVersion).toEqual('2.0.0');
        expect(allChanges['b'].newVersion).toEqual('1.0.1');
        expect(allChanges['c'].newVersion).toEqual('1.0.0');
        expect(allChanges['e'].newVersion).toEqual('1.0.1');
        expect(allChanges['f'].newVersion).toEqual('1.0.0');
        expect(allChanges['g'].newVersion).toEqual('1.0.0');
    });
    it('can resolve multiple hotfix changes', () => {
        const allPackages = packagesRushConfiguration.projectsByName;
        const allChanges = PublishUtilities_1.PublishUtilities.findChangeRequests(allPackages, packagesRushConfiguration, new ChangeFiles_1.ChangeFiles(path.join(__dirname, 'multipleHotfixChanges')));
        expect(Object.keys(allChanges)).toHaveLength(7);
        expect(allChanges).toHaveProperty('a');
        expect(allChanges).toHaveProperty('b');
        expect(allChanges).toHaveProperty('c');
        expect(allChanges).toHaveProperty('d');
        expect(allChanges).toHaveProperty('e');
        expect(allChanges).toHaveProperty('f');
        expect(allChanges).toHaveProperty('g');
        expect(allChanges['a'].changeType).toEqual(ChangeManagement_1.ChangeType.hotfix);
        expect(allChanges['b'].changeType).toEqual(ChangeManagement_1.ChangeType.hotfix);
        expect(allChanges['c'].changeType).toEqual(ChangeManagement_1.ChangeType.hotfix);
        expect(allChanges['d'].changeType).toEqual(ChangeManagement_1.ChangeType.hotfix);
        expect(allChanges['e'].changeType).toEqual(ChangeManagement_1.ChangeType.hotfix);
        expect(allChanges['f'].changeType).toEqual(ChangeManagement_1.ChangeType.hotfix);
        expect(allChanges['g'].changeType).toEqual(ChangeManagement_1.ChangeType.hotfix);
        expect(allChanges['a'].newVersion).toEqual('1.0.0-hotfix.0');
        expect(allChanges['b'].newVersion).toEqual('1.0.0-hotfix.0');
        expect(allChanges['c'].newVersion).toEqual('1.0.0-hotfix.0');
        expect(allChanges['d'].newVersion).toEqual('1.0.0-hotfix.0');
        expect(allChanges['e'].newVersion).toEqual('1.0.0-hotfix.0');
        expect(allChanges['f'].newVersion).toEqual('1.0.0-hotfix.0');
        expect(allChanges['g'].newVersion).toEqual('1.0.0-hotfix.0');
    });
    it('can update an explicit dependency', () => {
        const allPackages = packagesRushConfiguration.projectsByName;
        const allChanges = PublishUtilities_1.PublishUtilities.findChangeRequests(allPackages, packagesRushConfiguration, new ChangeFiles_1.ChangeFiles(path.join(__dirname, 'explicitVersionChange')));
        expect(Object.keys(allChanges)).toHaveLength(2);
        expect(allChanges).toHaveProperty('c');
        expect(allChanges).toHaveProperty('d');
        expect(allChanges['c'].changeType).toEqual(ChangeManagement_1.ChangeType.patch);
        expect(allChanges['d'].changeType).toEqual(ChangeManagement_1.ChangeType.patch);
    });
    it('can exclude lock step projects', () => {
        const allPackages = repoRushConfiguration.projectsByName;
        const allChanges = PublishUtilities_1.PublishUtilities.findChangeRequests(allPackages, repoRushConfiguration, new ChangeFiles_1.ChangeFiles(path.join(__dirname, 'repo', 'changes')), false, undefined, new Set(['a', 'b', 'e']));
        expect(Object.keys(allChanges)).toHaveLength(5);
        expect(allChanges['a'].newVersion).toEqual('1.0.0');
        expect(allChanges['b'].newVersion).toEqual('2.0.0');
        expect(allChanges['c'].changeType).toEqual(ChangeManagement_1.ChangeType.patch);
        expect(allChanges['c'].newVersion).toEqual('3.1.2');
        expect(allChanges['d'].changeType).toEqual(ChangeManagement_1.ChangeType.patch);
        expect(allChanges['d'].newVersion).toEqual('4.1.2');
        expect(allChanges['e'].newVersion).toEqual(allPackages.get('e').packageJson.version);
    });
});
describe('sortChangeRequests', () => {
    let rushConfiguration;
    beforeEach(() => {
        rushConfiguration = RushConfiguration_1.RushConfiguration.loadFromConfigurationFile(path.resolve(__dirname, 'packages', 'rush.json'));
    });
    it('can return a sorted array of the change requests to be published in the correct order', () => {
        const allPackages = rushConfiguration.projectsByName;
        const allChanges = PublishUtilities_1.PublishUtilities.findChangeRequests(allPackages, rushConfiguration, new ChangeFiles_1.ChangeFiles(path.join(__dirname, 'multipleChanges')));
        const orderedChanges = PublishUtilities_1.PublishUtilities.sortChangeRequests(allChanges);
        expect(orderedChanges).toHaveLength(6);
        expect(orderedChanges[0].packageName).toEqual('a');
        expect(orderedChanges[1].packageName).toEqual('b');
        expect(orderedChanges[2].packageName).toEqual('e');
        expect(orderedChanges[3].packageName).toEqual('g');
        expect(orderedChanges[4].packageName).toEqual('c');
        expect(orderedChanges[5].packageName).toEqual('f');
    });
});
describe('isRangeDependency', () => {
    it('can test ranges', () => {
        expect(PublishUtilities_1.PublishUtilities.isRangeDependency('>=1.0.0 <2.0.0')).toEqual(true);
        expect(PublishUtilities_1.PublishUtilities.isRangeDependency('>=1.0.0-pr.1 <2.0.0')).toEqual(true);
        expect(PublishUtilities_1.PublishUtilities.isRangeDependency('1.0.0')).toEqual(false);
        expect(PublishUtilities_1.PublishUtilities.isRangeDependency('^1.0.0')).toEqual(false);
        expect(PublishUtilities_1.PublishUtilities.isRangeDependency('~1.0.0')).toEqual(false);
    });
});
describe('getNewDependencyVersion', () => {
    it('can update dependency versions', () => {
        const dependencies = {
            a: '~1.0.0',
            b: '^1.0.0',
            c: '>=1.0.0 <2.0.0'
        };
        expect(PublishUtilities_1.PublishUtilities.getNewDependencyVersion(dependencies, 'a', '1.1.0')).toEqual('~1.1.0');
        expect(PublishUtilities_1.PublishUtilities.getNewDependencyVersion(dependencies, 'b', '1.2.0')).toEqual('^1.2.0');
        expect(PublishUtilities_1.PublishUtilities.getNewDependencyVersion(dependencies, 'c', '1.3.0')).toEqual('>=1.3.0 <2.0.0');
    });
    it('can update dependency versions with prereleases', () => {
        const dependencies = {
            a: '~1.0.0-pr.1',
            b: '^1.0.0-pr.1',
            c: '>=1.0.0-pr.1 <2.0.0'
        };
        expect(PublishUtilities_1.PublishUtilities.getNewDependencyVersion(dependencies, 'a', '1.1.0-pr.1')).toEqual('~1.1.0-pr.1');
        expect(PublishUtilities_1.PublishUtilities.getNewDependencyVersion(dependencies, 'b', '1.2.0-pr.2')).toEqual('^1.2.0-pr.2');
        expect(PublishUtilities_1.PublishUtilities.getNewDependencyVersion(dependencies, 'c', '1.3.0-pr.3')).toEqual('>=1.3.0-pr.3 <2.0.0');
    });
    it('can update to prerelease', () => {
        const dependencies = {
            a: '~1.0.0',
            b: '^1.0.0',
            c: '>=1.0.0 <2.0.0'
        };
        expect(PublishUtilities_1.PublishUtilities.getNewDependencyVersion(dependencies, 'a', '1.0.0-hotfix.0')).toEqual('~1.0.0-hotfix.0');
        expect(PublishUtilities_1.PublishUtilities.getNewDependencyVersion(dependencies, 'b', '1.0.0-hotfix.0')).toEqual('^1.0.0-hotfix.0');
        expect(PublishUtilities_1.PublishUtilities.getNewDependencyVersion(dependencies, 'c', '1.0.0-hotfix.0')).toEqual('>=1.0.0-hotfix.0 <2.0.0');
    });
});
describe('findWorkspaceChangeRequests', () => {
    let packagesRushConfiguration;
    let repoRushConfiguration;
    beforeEach(() => {
        packagesRushConfiguration = RushConfiguration_1.RushConfiguration.loadFromConfigurationFile(path.resolve(__dirname, 'workspacePackages', 'rush.json'));
        repoRushConfiguration = RushConfiguration_1.RushConfiguration.loadFromConfigurationFile(path.resolve(__dirname, 'workspaceRepo', 'rush.json'));
    });
    it('returns no changes in an empty change folder', () => {
        const allPackages = packagesRushConfiguration.projectsByName;
        const allChanges = PublishUtilities_1.PublishUtilities.findChangeRequests(allPackages, packagesRushConfiguration, new ChangeFiles_1.ChangeFiles(path.join(__dirname, 'noChange')));
        expect(Object.keys(allChanges)).toHaveLength(0);
    });
    it('returns 1 change when changing a leaf package', () => {
        const allPackages = packagesRushConfiguration.projectsByName;
        const allChanges = PublishUtilities_1.PublishUtilities.findChangeRequests(allPackages, packagesRushConfiguration, new ChangeFiles_1.ChangeFiles(path.join(__dirname, 'leafChange')));
        expect(Object.keys(allChanges)).toHaveLength(1);
        expect(allChanges).toHaveProperty('d');
        expect(allChanges['d'].changeType).toEqual(ChangeManagement_1.ChangeType.patch);
    });
    it('returns 4 changes when patching a root package', () => {
        const allPackages = packagesRushConfiguration.projectsByName;
        const allChanges = PublishUtilities_1.PublishUtilities.findChangeRequests(allPackages, packagesRushConfiguration, new ChangeFiles_1.ChangeFiles(path.join(__dirname, 'rootPatchChange')));
        expect(Object.keys(allChanges)).toHaveLength(4);
        expect(allChanges).toHaveProperty('a');
        expect(allChanges).toHaveProperty('b');
        expect(allChanges).toHaveProperty('e');
        expect(allChanges).toHaveProperty('g');
        expect(allChanges['a'].changeType).toEqual(ChangeManagement_1.ChangeType.patch);
        expect(allChanges['b'].changeType).toEqual(ChangeManagement_1.ChangeType.dependency);
        expect(allChanges['e'].changeType).toEqual(ChangeManagement_1.ChangeType.dependency);
        expect(allChanges['g'].changeType).toEqual(ChangeManagement_1.ChangeType.patch);
        expect(allChanges['a'].newVersion).toEqual('1.0.1');
        expect(allChanges['b'].newVersion).toEqual('1.0.0');
        expect(allChanges['e'].newVersion).toEqual('1.0.0');
        expect(allChanges['g'].newVersion).toEqual('1.0.1');
    });
    it('returns 7 changes when hotfixing a root package', () => {
        const allChanges = PublishUtilities_1.PublishUtilities.findChangeRequests(packagesRushConfiguration.projectsByName, packagesRushConfiguration, new ChangeFiles_1.ChangeFiles(path.join(__dirname, 'rootHotfixChange')));
        expect(Object.keys(allChanges)).toHaveLength(7);
        expect(allChanges).toHaveProperty('a');
        expect(allChanges).toHaveProperty('b');
        expect(allChanges).toHaveProperty('c');
        expect(allChanges).toHaveProperty('d');
        expect(allChanges).toHaveProperty('e');
        expect(allChanges).toHaveProperty('f');
        expect(allChanges).toHaveProperty('g');
        expect(allChanges['a'].changeType).toEqual(ChangeManagement_1.ChangeType.hotfix);
        expect(allChanges['b'].changeType).toEqual(ChangeManagement_1.ChangeType.hotfix);
        expect(allChanges['c'].changeType).toEqual(ChangeManagement_1.ChangeType.hotfix);
        expect(allChanges['d'].changeType).toEqual(ChangeManagement_1.ChangeType.hotfix);
        expect(allChanges['e'].changeType).toEqual(ChangeManagement_1.ChangeType.hotfix);
        expect(allChanges['f'].changeType).toEqual(ChangeManagement_1.ChangeType.hotfix);
        expect(allChanges['g'].changeType).toEqual(ChangeManagement_1.ChangeType.hotfix);
        expect(allChanges['a'].newVersion).toEqual('1.0.0-hotfix.0');
        expect(allChanges['b'].newVersion).toEqual('1.0.0-hotfix.0');
        expect(allChanges['c'].newVersion).toEqual('1.0.0-hotfix.0');
        expect(allChanges['d'].newVersion).toEqual('1.0.0-hotfix.0');
        expect(allChanges['e'].newVersion).toEqual('1.0.0-hotfix.0');
        expect(allChanges['f'].newVersion).toEqual('1.0.0-hotfix.0');
        expect(allChanges['g'].newVersion).toEqual('1.0.0-hotfix.0');
    });
    it('returns 6 changes when major bumping a root package', () => {
        const allPackages = packagesRushConfiguration.projectsByName;
        const allChanges = PublishUtilities_1.PublishUtilities.findChangeRequests(allPackages, packagesRushConfiguration, new ChangeFiles_1.ChangeFiles(path.join(__dirname, 'rootMajorChange')));
        expect(Object.keys(allChanges)).toHaveLength(6);
        expect(allChanges).toHaveProperty('a');
        expect(allChanges).toHaveProperty('b');
        expect(allChanges).toHaveProperty('c');
        expect(allChanges).toHaveProperty('e');
        expect(allChanges).toHaveProperty('f');
        expect(allChanges).toHaveProperty('g');
        expect(allChanges['a'].changeType).toEqual(ChangeManagement_1.ChangeType.major);
        expect(allChanges['b'].changeType).toEqual(ChangeManagement_1.ChangeType.patch);
        expect(allChanges['c'].changeType).toEqual(ChangeManagement_1.ChangeType.dependency);
        expect(allChanges['e'].changeType).toEqual(ChangeManagement_1.ChangeType.patch);
        expect(allChanges['f'].changeType).toEqual(ChangeManagement_1.ChangeType.dependency);
        expect(allChanges['g'].changeType).toEqual(ChangeManagement_1.ChangeType.patch);
        expect(allChanges['a'].newVersion).toEqual('2.0.0');
        expect(allChanges['b'].newVersion).toEqual('1.0.1');
        expect(allChanges['c'].newVersion).toEqual('1.0.0');
        expect(allChanges['e'].newVersion).toEqual('1.0.1');
        expect(allChanges['f'].newVersion).toEqual('1.0.0');
        expect(allChanges['g'].newVersion).toEqual('1.0.1');
    });
    it('returns 2 changes when bumping cyclic dependencies', () => {
        const allPackages = packagesRushConfiguration.projectsByName;
        const allChanges = PublishUtilities_1.PublishUtilities.findChangeRequests(allPackages, packagesRushConfiguration, new ChangeFiles_1.ChangeFiles(path.join(__dirname, 'cyclicDeps')));
        expect(Object.keys(allChanges)).toHaveLength(2);
        expect(allChanges).toHaveProperty('cyclic-dep-1');
        expect(allChanges).toHaveProperty('cyclic-dep-2');
        expect(allChanges['cyclic-dep-1'].changeType).toEqual(ChangeManagement_1.ChangeType.major);
        expect(allChanges['cyclic-dep-2'].changeType).toEqual(ChangeManagement_1.ChangeType.patch);
    });
    it('returns error when mixing hotfix and non-hotfix changes', () => {
        const allPackages = packagesRushConfiguration.projectsByName;
        expect(PublishUtilities_1.PublishUtilities.findChangeRequests.bind(PublishUtilities_1.PublishUtilities, allPackages, packagesRushConfiguration, new ChangeFiles_1.ChangeFiles(path.join(__dirname, 'hotfixWithPatchChanges')))).toThrow('Cannot apply hotfix alongside patch change on same package');
    });
    it('returns error when adding hotfix with config disabled', () => {
        const allPackages = packagesRushConfiguration.projectsByName;
        // Overload hotfixChangeEnabled function
        packagesRushConfiguration['_hotfixChangeEnabled'] = false;
        expect(PublishUtilities_1.PublishUtilities.findChangeRequests.bind(PublishUtilities_1.PublishUtilities, allPackages, packagesRushConfiguration, new ChangeFiles_1.ChangeFiles(path.join(__dirname, 'rootHotfixChange')))).toThrow('Cannot add hotfix change; hotfixChangeEnabled is false in configuration.');
    });
    it('can resolve multiple changes requests on the same package', () => {
        const allPackages = packagesRushConfiguration.projectsByName;
        const allChanges = PublishUtilities_1.PublishUtilities.findChangeRequests(allPackages, packagesRushConfiguration, new ChangeFiles_1.ChangeFiles(path.join(__dirname, 'multipleChanges')));
        expect(Object.keys(allChanges)).toHaveLength(6);
        expect(allChanges).toHaveProperty('a');
        expect(allChanges).toHaveProperty('b');
        expect(allChanges).toHaveProperty('c');
        expect(allChanges).toHaveProperty('e');
        expect(allChanges).toHaveProperty('f');
        expect(allChanges).toHaveProperty('g');
        expect(allChanges['a'].changeType).toEqual(ChangeManagement_1.ChangeType.major);
        expect(allChanges['b'].changeType).toEqual(ChangeManagement_1.ChangeType.patch);
        expect(allChanges['c'].changeType).toEqual(ChangeManagement_1.ChangeType.dependency);
        expect(allChanges['e'].changeType).toEqual(ChangeManagement_1.ChangeType.patch);
        expect(allChanges['f'].changeType).toEqual(ChangeManagement_1.ChangeType.dependency);
        expect(allChanges['g'].changeType).toEqual(ChangeManagement_1.ChangeType.patch);
        expect(allChanges['a'].newVersion).toEqual('2.0.0');
        expect(allChanges['b'].newVersion).toEqual('1.0.1');
        expect(allChanges['c'].newVersion).toEqual('1.0.0');
        expect(allChanges['e'].newVersion).toEqual('1.0.1');
        expect(allChanges['f'].newVersion).toEqual('1.0.0');
        expect(allChanges['g'].newVersion).toEqual('1.0.1');
    });
    it('can resolve multiple reverse-ordered changes requests on the same package', () => {
        const allPackages = packagesRushConfiguration.projectsByName;
        const allChanges = PublishUtilities_1.PublishUtilities.findChangeRequests(allPackages, packagesRushConfiguration, new ChangeFiles_1.ChangeFiles(path.join(__dirname, 'orderedChanges')));
        expect(Object.keys(allChanges)).toHaveLength(6);
        expect(allChanges).toHaveProperty('a');
        expect(allChanges).toHaveProperty('b');
        expect(allChanges).toHaveProperty('c');
        expect(allChanges).toHaveProperty('e');
        expect(allChanges).toHaveProperty('f');
        expect(allChanges).toHaveProperty('g');
        expect(allChanges['a'].changeType).toEqual(ChangeManagement_1.ChangeType.major);
        expect(allChanges['b'].changeType).toEqual(ChangeManagement_1.ChangeType.patch);
        expect(allChanges['c'].changeType).toEqual(ChangeManagement_1.ChangeType.dependency);
        expect(allChanges['e'].changeType).toEqual(ChangeManagement_1.ChangeType.patch);
        expect(allChanges['f'].changeType).toEqual(ChangeManagement_1.ChangeType.dependency);
        expect(allChanges['g'].changeType).toEqual(ChangeManagement_1.ChangeType.patch);
        expect(allChanges['a'].newVersion).toEqual('2.0.0');
        expect(allChanges['b'].newVersion).toEqual('1.0.1');
        expect(allChanges['c'].newVersion).toEqual('1.0.0');
        expect(allChanges['e'].newVersion).toEqual('1.0.1');
        expect(allChanges['f'].newVersion).toEqual('1.0.0');
        expect(allChanges['g'].newVersion).toEqual('1.0.1');
    });
    it('can resolve multiple hotfix changes', () => {
        const allPackages = packagesRushConfiguration.projectsByName;
        const allChanges = PublishUtilities_1.PublishUtilities.findChangeRequests(allPackages, packagesRushConfiguration, new ChangeFiles_1.ChangeFiles(path.join(__dirname, 'multipleHotfixChanges')));
        expect(Object.keys(allChanges)).toHaveLength(7);
        expect(allChanges).toHaveProperty('a');
        expect(allChanges).toHaveProperty('b');
        expect(allChanges).toHaveProperty('c');
        expect(allChanges).toHaveProperty('d');
        expect(allChanges).toHaveProperty('e');
        expect(allChanges).toHaveProperty('f');
        expect(allChanges).toHaveProperty('g');
        expect(allChanges['a'].changeType).toEqual(ChangeManagement_1.ChangeType.hotfix);
        expect(allChanges['b'].changeType).toEqual(ChangeManagement_1.ChangeType.hotfix);
        expect(allChanges['c'].changeType).toEqual(ChangeManagement_1.ChangeType.hotfix);
        expect(allChanges['d'].changeType).toEqual(ChangeManagement_1.ChangeType.hotfix);
        expect(allChanges['e'].changeType).toEqual(ChangeManagement_1.ChangeType.hotfix);
        expect(allChanges['f'].changeType).toEqual(ChangeManagement_1.ChangeType.hotfix);
        expect(allChanges['g'].changeType).toEqual(ChangeManagement_1.ChangeType.hotfix);
        expect(allChanges['a'].newVersion).toEqual('1.0.0-hotfix.0');
        expect(allChanges['b'].newVersion).toEqual('1.0.0-hotfix.0');
        expect(allChanges['c'].newVersion).toEqual('1.0.0-hotfix.0');
        expect(allChanges['d'].newVersion).toEqual('1.0.0-hotfix.0');
        expect(allChanges['e'].newVersion).toEqual('1.0.0-hotfix.0');
        expect(allChanges['f'].newVersion).toEqual('1.0.0-hotfix.0');
        expect(allChanges['g'].newVersion).toEqual('1.0.0-hotfix.0');
    });
    it('can update an explicit dependency', () => {
        const allPackages = packagesRushConfiguration.projectsByName;
        const allChanges = PublishUtilities_1.PublishUtilities.findChangeRequests(allPackages, packagesRushConfiguration, new ChangeFiles_1.ChangeFiles(path.join(__dirname, 'explicitVersionChange')));
        expect(Object.keys(allChanges)).toHaveLength(2);
        expect(allChanges).toHaveProperty('c');
        expect(allChanges).toHaveProperty('d');
        expect(allChanges['c'].changeType).toEqual(ChangeManagement_1.ChangeType.patch);
        expect(allChanges['d'].changeType).toEqual(ChangeManagement_1.ChangeType.patch);
    });
    it('can exclude lock step projects', () => {
        const allPackages = repoRushConfiguration.projectsByName;
        const allChanges = PublishUtilities_1.PublishUtilities.findChangeRequests(allPackages, repoRushConfiguration, new ChangeFiles_1.ChangeFiles(path.join(__dirname, 'repo', 'changes')), false, undefined, new Set(['a', 'b', 'e']));
        expect(Object.keys(allChanges)).toHaveLength(5);
        expect(allChanges['a'].newVersion).toEqual('1.0.0');
        expect(allChanges['b'].newVersion).toEqual('2.0.0');
        expect(allChanges['c'].changeType).toEqual(ChangeManagement_1.ChangeType.patch);
        expect(allChanges['c'].newVersion).toEqual('3.1.2');
        expect(allChanges['d'].changeType).toEqual(ChangeManagement_1.ChangeType.patch);
        expect(allChanges['d'].newVersion).toEqual('4.1.2');
        expect(allChanges['e'].newVersion).toEqual(allPackages.get('e').packageJson.version);
    });
});
describe('getNewWorkspaceDependencyVersion', () => {
    it('can update dependency versions', () => {
        const dependencies = {
            a: 'workspace:~1.0.0',
            b: 'workspace:^1.0.0',
            c: 'workspace:>=1.0.0 <2.0.0',
            d: 'workspace:*'
        };
        expect(PublishUtilities_1.PublishUtilities.getNewDependencyVersion(dependencies, 'a', '1.1.0')).toEqual('workspace:~1.1.0');
        expect(PublishUtilities_1.PublishUtilities.getNewDependencyVersion(dependencies, 'b', '1.2.0')).toEqual('workspace:^1.2.0');
        expect(PublishUtilities_1.PublishUtilities.getNewDependencyVersion(dependencies, 'c', '1.3.0')).toEqual('workspace:>=1.3.0 <2.0.0');
        expect(PublishUtilities_1.PublishUtilities.getNewDependencyVersion(dependencies, 'd', '1.4.0')).toEqual('workspace:*');
    });
    it('can update dependency versions with prereleases', () => {
        const dependencies = {
            a: 'workspace:~1.0.0-pr.1',
            b: 'workspace:^1.0.0-pr.1',
            c: 'workspace:>=1.0.0-pr.1 <2.0.0',
            d: 'workspace:*'
        };
        expect(PublishUtilities_1.PublishUtilities.getNewDependencyVersion(dependencies, 'a', '1.1.0-pr.1')).toEqual('workspace:~1.1.0-pr.1');
        expect(PublishUtilities_1.PublishUtilities.getNewDependencyVersion(dependencies, 'b', '1.2.0-pr.2')).toEqual('workspace:^1.2.0-pr.2');
        expect(PublishUtilities_1.PublishUtilities.getNewDependencyVersion(dependencies, 'c', '1.3.0-pr.3')).toEqual('workspace:>=1.3.0-pr.3 <2.0.0');
        expect(PublishUtilities_1.PublishUtilities.getNewDependencyVersion(dependencies, 'd', '1.3.0-pr.3')).toEqual('workspace:*');
    });
    it('can update to prerelease', () => {
        const dependencies = {
            a: 'workspace:~1.0.0',
            b: 'workspace:^1.0.0',
            c: 'workspace:>=1.0.0 <2.0.0',
            d: 'workspace:*'
        };
        expect(PublishUtilities_1.PublishUtilities.getNewDependencyVersion(dependencies, 'a', '1.0.0-hotfix.0')).toEqual('workspace:~1.0.0-hotfix.0');
        expect(PublishUtilities_1.PublishUtilities.getNewDependencyVersion(dependencies, 'b', '1.0.0-hotfix.0')).toEqual('workspace:^1.0.0-hotfix.0');
        expect(PublishUtilities_1.PublishUtilities.getNewDependencyVersion(dependencies, 'c', '1.0.0-hotfix.0')).toEqual('workspace:>=1.0.0-hotfix.0 <2.0.0');
        expect(PublishUtilities_1.PublishUtilities.getNewDependencyVersion(dependencies, 'd', '1.0.0-hotfix.0')).toEqual('workspace:*');
    });
});
//# sourceMappingURL=PublishUtilities.test.js.map