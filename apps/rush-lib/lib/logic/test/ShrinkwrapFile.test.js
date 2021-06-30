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
const ShrinkwrapFileFactory_1 = require("../ShrinkwrapFileFactory");
const PnpmShrinkwrapFile_1 = require("../pnpm/PnpmShrinkwrapFile");
const DependencySpecifier_1 = require("../DependencySpecifier");
describe('npm ShrinkwrapFile', () => {
    const filename = path.resolve(path.join(__dirname, './shrinkwrapFile/npm-shrinkwrap.json'));
    const shrinkwrapFile = ShrinkwrapFileFactory_1.ShrinkwrapFileFactory.getShrinkwrapFile('npm', {}, filename);
    it('verifies root-level dependency', () => {
        expect(shrinkwrapFile.hasCompatibleTopLevelDependency(new DependencySpecifier_1.DependencySpecifier('q', '~1.5.0'))).toEqual(true);
    });
    it('verifies temp project dependencies', () => {
        // Found locally
        expect(shrinkwrapFile.tryEnsureCompatibleDependency(new DependencySpecifier_1.DependencySpecifier('jquery', '>=2.2.4 <3.0.0'), '@rush-temp/project2')).toEqual(true);
        // Found at root
        expect(shrinkwrapFile.tryEnsureCompatibleDependency(new DependencySpecifier_1.DependencySpecifier('q', '~1.5.0'), '@rush-temp/project2')).toEqual(true);
    });
    it('extracts temp projects successfully', () => {
        const tempProjectNames = shrinkwrapFile.getTempProjectNames();
        expect(tempProjectNames).toEqual(['@rush-temp/project1', '@rush-temp/project2']);
    });
});
describe('pnpm ShrinkwrapFile', () => {
    const filename = path.resolve(path.join(__dirname, '../../../src/logic/test/shrinkwrapFile/pnpm-lock.yaml'));
    const shrinkwrapFile = ShrinkwrapFileFactory_1.ShrinkwrapFileFactory.getShrinkwrapFile('pnpm', {}, filename);
    it('verifies root-level dependency', () => {
        expect(shrinkwrapFile.hasCompatibleTopLevelDependency(new DependencySpecifier_1.DependencySpecifier('q', '~1.5.0'))).toEqual(false);
    });
    it('verifies temp project dependencies', () => {
        expect(shrinkwrapFile.tryEnsureCompatibleDependency(new DependencySpecifier_1.DependencySpecifier('jquery', '>=2.0.0 <3.0.0'), '@rush-temp/project1')).toEqual(true);
        expect(shrinkwrapFile.tryEnsureCompatibleDependency(new DependencySpecifier_1.DependencySpecifier('q', '~1.5.0'), '@rush-temp/project2')).toEqual(true);
        expect(shrinkwrapFile.tryEnsureCompatibleDependency(new DependencySpecifier_1.DependencySpecifier('left-pad', '~9.9.9'), '@rush-temp/project1')).toEqual(false);
        expect(shrinkwrapFile.tryEnsureCompatibleDependency(new DependencySpecifier_1.DependencySpecifier('@scope/testDep', '>=1.0.0 <2.0.0'), '@rush-temp/project3')).toEqual(true);
    });
    it('extracts temp projects successfully', () => {
        const tempProjectNames = shrinkwrapFile.getTempProjectNames();
        expect(tempProjectNames).toEqual(['@rush-temp/project1', '@rush-temp/project2', '@rush-temp/project3']);
    });
});
function testParsePnpmDependencyKey(packageName, key) {
    const specifier = PnpmShrinkwrapFile_1.parsePnpmDependencyKey(packageName, key);
    if (!specifier) {
        return undefined;
    }
    return specifier.versionSpecifier;
}
describe('extractVersionFromPnpmVersionSpecifier', () => {
    it('extracts a simple version with no slashes', () => {
        expect(testParsePnpmDependencyKey('anonymous', '0.0.5')).toEqual('0.0.5');
    });
    it('extracts a simple package name', () => {
        expect(testParsePnpmDependencyKey('isarray', '/isarray/2.0.5')).toEqual('2.0.5');
        expect(testParsePnpmDependencyKey('@scope/test-dep', '/@scope/test-dep/1.2.3-beta.3')).toEqual('1.2.3-beta.3');
    });
    it('extracts a registry-qualified path', () => {
        expect(testParsePnpmDependencyKey('@scope/test-dep', 'example.pkgs.visualstudio.com/@scope/test-dep/1.0.0')).toEqual('1.0.0');
        expect(testParsePnpmDependencyKey('@scope/test-dep', 'example.pkgs.visualstudio.com/@scope/test-dep/1.2.3-beta.3')).toEqual('1.2.3-beta.3');
    });
    it('extracts a V3 peer dependency path', () => {
        expect(testParsePnpmDependencyKey('gulp-karma', '/gulp-karma/0.0.5/karma@0.13.22')).toEqual('0.0.5');
        expect(testParsePnpmDependencyKey('sinon-chai', '/sinon-chai/2.8.0/chai@3.5.0+sinon@1.17.7')).toEqual('2.8.0');
        expect(testParsePnpmDependencyKey('@ms/sp-client-utilities', '/@ms/sp-client-utilities/3.1.1/foo@13.1.0')).toEqual('3.1.1');
        expect(testParsePnpmDependencyKey('tslint-microsoft-contrib', '/tslint-microsoft-contrib/6.2.0/tslint@5.18.0+typescript@3.5.3')).toEqual('6.2.0');
    });
    it('extracts a V5 peer dependency path', () => {
        expect(testParsePnpmDependencyKey('anonymous', '23.6.0_babel-core@6.26.3')).toEqual('23.6.0');
        expect(testParsePnpmDependencyKey('anonymous', '1.0.7_request@2.88.0')).toEqual('1.0.7');
        expect(testParsePnpmDependencyKey('anonymous', '1.0.3_@pnpm+logger@1.0.2')).toEqual('1.0.3');
        expect(testParsePnpmDependencyKey('tslint-microsoft-contrib', '/tslint-microsoft-contrib/6.2.0_tslint@5.18.0+typescript@3.5.3')).toEqual('6.2.0');
    });
    it('detects NPM package aliases', () => {
        expect(testParsePnpmDependencyKey('alias1', '/isarray/2.0.5')).toEqual('npm:isarray@2.0.5');
        expect(testParsePnpmDependencyKey('alias2', '/@ms/sp-client-utilities/3.1.1/foo@13.1.0')).toEqual('npm:@ms/sp-client-utilities@3.1.1');
    });
    it('detects urls', () => {
        expect(testParsePnpmDependencyKey('example', '@github.com/abc/def/abcdef2fbd0260e6e56ed5ba34df0f5b6599bbe64')).toEqual('@github.com/abc/def/abcdef2fbd0260e6e56ed5ba34df0f5b6599bbe64');
        expect(testParsePnpmDependencyKey('example', 'github.com/abc/def/abcdef2fbd0260e6e56ed5ba34df0f5b6599bbe64')).toEqual('github.com/abc/def/abcdef2fbd0260e6e56ed5ba34df0f5b6599bbe64');
        expect(testParsePnpmDependencyKey('example', 'bitbucket.com/abc/def/abcdef2fbd0260e6e56ed5ba34df0f5b6599bbe64')).toEqual('bitbucket.com/abc/def/abcdef2fbd0260e6e56ed5ba34df0f5b6599bbe64');
        expect(testParsePnpmDependencyKey('example', 'microsoft.github.com/abc/def/abcdef2fbd0260e6e56ed5ba34df0f5b6599bbe64')).toEqual('microsoft.github.com/abc/def/abcdef2fbd0260e6e56ed5ba34df0f5b6599bbe64');
        expect(testParsePnpmDependencyKey('example', 'microsoft.github/.com/abc/def/abcdef2fbd0260e6e56ed5ba34df0f5b6599bbe64')).toEqual('microsoft.github/.com/abc/def/abcdef2fbd0260e6e56ed5ba34df0f5b6599bbe64');
        expect(testParsePnpmDependencyKey('example', 'ab.cd.ef.gh/ijkl/abcdef2fbd0260e6e56ed5ba34df0f5b6599bbe64')).toEqual('ab.cd.ef.gh/ijkl/abcdef2fbd0260e6e56ed5ba34df0f5b6599bbe64');
        expect(testParsePnpmDependencyKey('example', 'ab.cd/ef')).toEqual('ab.cd/ef');
    });
    it('handles bad cases', () => {
        expect(testParsePnpmDependencyKey('example', '/foo/gulp-karma/0.0.5/karma@0.13.22')).toEqual(undefined);
        expect(testParsePnpmDependencyKey('example', '/@ms/3.1.1/foo@13.1.0')).toEqual(undefined);
        expect(testParsePnpmDependencyKey('example', 'file:projects/my-app.tgz')).toEqual(undefined);
        expect(testParsePnpmDependencyKey('example', '')).toEqual(undefined);
        expect(testParsePnpmDependencyKey('example', '/')).toEqual(undefined);
        expect(testParsePnpmDependencyKey('example', '//')).toEqual(undefined);
        expect(testParsePnpmDependencyKey('example', '/@/')).toEqual(undefined);
        expect(testParsePnpmDependencyKey('example', 'example.pkgs.visualstudio.com/@scope/testDep/')).toEqual(undefined);
        expect(testParsePnpmDependencyKey('example', 'microsoft.github.com/abc\\def/abcdef2fbd0260e6e56ed5ba34df0f5b6599bbe64')).toEqual(undefined);
        expect(testParsePnpmDependencyKey('example', 'microsoft.github.com/abc/def//abcdef2fbd0260e6e56ed5ba34df0f5b6599bbe64')).toEqual(undefined);
        expect(testParsePnpmDependencyKey('example', 'microsoft./github.com/abc/def/abcdef2fbd0260e6e56ed5ba34df0f5b6599bbe64')).toEqual(undefined);
        expect(testParsePnpmDependencyKey('example', 'microsoft/abc/github/abc/def/abcdef2fbd0260e6e56ed5ba34df0f5b6599bbe64')).toEqual(undefined);
        expect(testParsePnpmDependencyKey('example', 'ab.cd/ef/')).toEqual(undefined);
    });
});
//# sourceMappingURL=ShrinkwrapFile.test.js.map