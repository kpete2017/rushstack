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
const node_core_library_1 = require("@rushstack/node-core-library");
const RushConfiguration_1 = require("../RushConfiguration");
const Utilities_1 = require("../../utilities/Utilities");
const EnvironmentConfiguration_1 = require("../EnvironmentConfiguration");
function normalizePathForComparison(pathToNormalize) {
    return node_core_library_1.Text.replaceAll(pathToNormalize, '\\', '/').toUpperCase();
}
function assertPathProperty(validatedPropertyName, absolutePath, relativePath) {
    const resolvedRelativePath = path.resolve(__dirname, relativePath);
    expect(normalizePathForComparison(absolutePath)).toEqual(normalizePathForComparison(resolvedRelativePath));
}
describe('RushConfiguration', () => {
    let _oldEnv;
    beforeEach(() => {
        _oldEnv = process.env;
        process.env = {};
        process.env['USERPROFILE'] = _oldEnv['USERPROFILE']; // eslint-disable-line dot-notation
        process.env['HOME'] = _oldEnv['HOME']; // eslint-disable-line dot-notation
    });
    afterEach(() => {
        process.env = _oldEnv;
    });
    it("can't load too new rush", (done) => {
        const rushFilename = path.resolve(__dirname, 'repo', 'rush-too-new.json');
        expect(() => {
            RushConfiguration_1.RushConfiguration.loadFromConfigurationFile(rushFilename);
        }).toThrow('Unable to load rush-too-new.json because its RushVersion is 99.0.0');
        done();
    });
    it('can load repo/rush-npm.json', (done) => {
        const rushFilename = path.resolve(__dirname, 'repo', 'rush-npm.json');
        const rushConfiguration = RushConfiguration_1.RushConfiguration.loadFromConfigurationFile(rushFilename);
        expect(rushConfiguration.packageManager).toEqual('npm');
        assertPathProperty('committedShrinkwrapFilename', rushConfiguration.committedShrinkwrapFilename, './repo/common/config/rush/npm-shrinkwrap.json');
        assertPathProperty('commonFolder', rushConfiguration.commonFolder, './repo/common');
        assertPathProperty('commonRushConfigFolder', rushConfiguration.commonRushConfigFolder, './repo/common/config/rush');
        assertPathProperty('commonTempFolder', rushConfiguration.commonTempFolder, './repo/common/temp');
        assertPathProperty('npmCacheFolder', rushConfiguration.npmCacheFolder, './repo/common/temp/npm-cache');
        assertPathProperty('npmTmpFolder', rushConfiguration.npmTmpFolder, './repo/common/temp/npm-tmp');
        expect(rushConfiguration.pnpmOptions.pnpmStore).toEqual('local');
        assertPathProperty('pnpmStorePath', rushConfiguration.pnpmOptions.pnpmStorePath, './repo/common/temp/pnpm-store');
        assertPathProperty('packageManagerToolFilename', rushConfiguration.packageManagerToolFilename, './repo/common/temp/npm-local/node_modules/.bin/npm');
        assertPathProperty('rushJsonFolder', rushConfiguration.rushJsonFolder, './repo');
        expect(rushConfiguration.packageManagerToolVersion).toEqual('4.5.0');
        expect(rushConfiguration.repositoryUrl).toEqual('someFakeUrl');
        expect(rushConfiguration.projectFolderMaxDepth).toEqual(99);
        expect(rushConfiguration.projectFolderMinDepth).toEqual(1);
        expect(rushConfiguration.hotfixChangeEnabled).toEqual(true);
        expect(rushConfiguration.projects).toHaveLength(3);
        // "approvedPackagesPolicy" feature
        const approvedPackagesPolicy = rushConfiguration.approvedPackagesPolicy;
        expect(approvedPackagesPolicy.enabled).toEqual(true);
        expect(Utilities_1.Utilities.getSetAsArray(approvedPackagesPolicy.reviewCategories)).toEqual([
            'first-party',
            'third-party',
            'prototype'
        ]);
        expect(Utilities_1.Utilities.getSetAsArray(approvedPackagesPolicy.ignoredNpmScopes)).toEqual(['@types', '@internal']);
        expect(approvedPackagesPolicy.browserApprovedPackages.items[0].packageName).toEqual('example');
        expect(approvedPackagesPolicy.browserApprovedPackages.items[0].allowedCategories.size).toEqual(3);
        expect(rushConfiguration.telemetryEnabled).toBe(false);
        // Validate project1 settings
        const project1 = rushConfiguration.getProjectByName('project1');
        expect(project1).toBeDefined();
        expect(project1.packageName).toEqual('project1');
        assertPathProperty('project1.projectFolder', project1.projectFolder, './repo/project1');
        expect(project1.tempProjectName).toEqual('@rush-temp/project1');
        expect(project1.unscopedTempProjectName).toEqual('project1');
        expect(project1.skipRushCheck).toEqual(false);
        // Validate project2 settings
        const project2 = rushConfiguration.getProjectByName('project2');
        expect(project2.skipRushCheck).toEqual(true);
        done();
    });
    it('can load repo/rush-pnpm.json', (done) => {
        const rushFilename = path.resolve(__dirname, 'repo', 'rush-pnpm.json');
        const rushConfiguration = RushConfiguration_1.RushConfiguration.loadFromConfigurationFile(rushFilename);
        expect(rushConfiguration.packageManager).toEqual('pnpm');
        expect(rushConfiguration.shrinkwrapFilename).toEqual('pnpm-lock.yaml');
        assertPathProperty('committedShrinkwrapFilename', rushConfiguration.getCommittedShrinkwrapFilename(), './repo/common/config/rush/pnpm-lock.yaml');
        assertPathProperty('getPnpmfilePath', rushConfiguration.getPnpmfilePath(), './repo/common/config/rush/.pnpmfile.cjs');
        assertPathProperty('commonFolder', rushConfiguration.commonFolder, './repo/common');
        assertPathProperty('commonRushConfigFolder', rushConfiguration.commonRushConfigFolder, './repo/common/config/rush');
        assertPathProperty('commonTempFolder', rushConfiguration.commonTempFolder, './repo/common/temp');
        assertPathProperty('npmCacheFolder', rushConfiguration.npmCacheFolder, './repo/common/temp/npm-cache');
        assertPathProperty('npmTmpFolder', rushConfiguration.npmTmpFolder, './repo/common/temp/npm-tmp');
        expect(rushConfiguration.pnpmOptions.pnpmStore).toEqual('local');
        assertPathProperty('pnpmStorePath', rushConfiguration.pnpmOptions.pnpmStorePath, './repo/common/temp/pnpm-store');
        assertPathProperty('packageManagerToolFilename', rushConfiguration.packageManagerToolFilename, './repo/common/temp/pnpm-local/node_modules/.bin/pnpm');
        assertPathProperty('rushJsonFolder', rushConfiguration.rushJsonFolder, './repo');
        expect(rushConfiguration.packageManagerToolVersion).toEqual('6.0.0');
        expect(rushConfiguration.repositoryUrl).toEqual('someFakeUrl');
        expect(rushConfiguration.projectFolderMaxDepth).toEqual(99);
        expect(rushConfiguration.projectFolderMinDepth).toEqual(1);
        expect(rushConfiguration.projects).toHaveLength(3);
        // "approvedPackagesPolicy" feature
        const approvedPackagesPolicy = rushConfiguration.approvedPackagesPolicy;
        expect(approvedPackagesPolicy.enabled).toBe(true);
        expect(Utilities_1.Utilities.getSetAsArray(approvedPackagesPolicy.reviewCategories)).toEqual([
            'first-party',
            'third-party',
            'prototype'
        ]);
        expect(Utilities_1.Utilities.getSetAsArray(approvedPackagesPolicy.ignoredNpmScopes)).toEqual(['@types', '@internal']);
        expect(approvedPackagesPolicy.browserApprovedPackages.items[0].packageName).toEqual('example');
        expect(approvedPackagesPolicy.browserApprovedPackages.items[0].allowedCategories.size).toEqual(3);
        expect(rushConfiguration.telemetryEnabled).toBe(false);
        // Validate project1 settings
        const project1 = rushConfiguration.getProjectByName('project1');
        expect(project1).toBeDefined();
        expect(project1.packageName).toEqual('project1');
        assertPathProperty('project1.projectFolder', project1.projectFolder, './repo/project1');
        expect(project1.tempProjectName).toEqual('@rush-temp/project1');
        expect(project1.unscopedTempProjectName).toEqual('project1');
        done();
    });
    it('can load repo/rush-pnpm-5.json', (done) => {
        const rushFilename = path.resolve(__dirname, 'repo', 'rush-pnpm-5.json');
        const rushConfiguration = RushConfiguration_1.RushConfiguration.loadFromConfigurationFile(rushFilename);
        expect(rushConfiguration.packageManager).toEqual('pnpm');
        expect(rushConfiguration.packageManagerToolVersion).toEqual('5.0.0');
        expect(rushConfiguration.shrinkwrapFilename).toEqual('pnpm-lock.yaml');
        assertPathProperty('getPnpmfilePath', rushConfiguration.getPnpmfilePath(), './repo/common/config/rush/pnpmfile.js');
        done();
    });
    it('allows the temp directory to be set via environment variable', () => {
        const expectedValue = path.resolve('/var/temp');
        process.env['RUSH_TEMP_FOLDER'] = expectedValue; // eslint-disable-line dot-notation
        const rushFilename = path.resolve(__dirname, 'repo', 'rush-pnpm.json');
        const rushConfiguration = RushConfiguration_1.RushConfiguration.loadFromConfigurationFile(rushFilename);
        assertPathProperty('commonTempFolder', rushConfiguration.commonTempFolder, expectedValue);
        assertPathProperty('npmCacheFolder', rushConfiguration.npmCacheFolder, path.join(expectedValue, 'npm-cache'));
        assertPathProperty('npmTmpFolder', rushConfiguration.npmTmpFolder, path.join(expectedValue, 'npm-tmp'));
        expect(rushConfiguration.pnpmOptions.pnpmStore).toEqual('local');
        assertPathProperty('pnpmStorePath', rushConfiguration.pnpmOptions.pnpmStorePath, path.join(expectedValue, 'pnpm-store'));
        assertPathProperty('packageManagerToolFilename', rushConfiguration.packageManagerToolFilename, `${expectedValue}/pnpm-local/node_modules/.bin/pnpm`);
    });
    describe('PNPM Store Paths', () => {
        afterEach(() => {
            EnvironmentConfiguration_1.EnvironmentConfiguration['_pnpmStorePathOverride'] = undefined;
        });
        const PNPM_STORE_PATH_ENV = 'RUSH_PNPM_STORE_PATH';
        describe('Loading repo/rush-pnpm-local.json', () => {
            const RUSH_JSON_FILENAME = path.resolve(__dirname, 'repo', 'rush-pnpm-local.json');
            it(`loads the correct path when pnpmStore = "local"`, (done) => {
                const EXPECT_STORE_PATH = path.resolve(__dirname, 'repo', 'common', 'temp', 'pnpm-store');
                const rushConfiguration = RushConfiguration_1.RushConfiguration.loadFromConfigurationFile(RUSH_JSON_FILENAME);
                expect(rushConfiguration.packageManager).toEqual('pnpm');
                expect(rushConfiguration.pnpmOptions.pnpmStore).toEqual('local');
                expect(rushConfiguration.pnpmOptions.pnpmStorePath).toEqual(EXPECT_STORE_PATH);
                expect(path.isAbsolute(rushConfiguration.pnpmOptions.pnpmStorePath)).toEqual(true);
                done();
            });
            it('loads the correct path when environment variable is defined', (done) => {
                const EXPECT_STORE_PATH = path.resolve('/var/temp');
                process.env[PNPM_STORE_PATH_ENV] = EXPECT_STORE_PATH;
                const rushConfiguration = RushConfiguration_1.RushConfiguration.loadFromConfigurationFile(RUSH_JSON_FILENAME);
                expect(rushConfiguration.packageManager).toEqual('pnpm');
                expect(rushConfiguration.pnpmOptions.pnpmStore).toEqual('local');
                expect(rushConfiguration.pnpmOptions.pnpmStorePath).toEqual(EXPECT_STORE_PATH);
                expect(path.isAbsolute(rushConfiguration.pnpmOptions.pnpmStorePath)).toEqual(true);
                done();
            });
        });
        describe('Loading repo/rush-pnpm-global.json', () => {
            const RUSH_JSON_FILENAME = path.resolve(__dirname, 'repo', 'rush-pnpm-global.json');
            it(`loads the correct path when pnpmStore = "global"`, (done) => {
                const EXPECT_STORE_PATH = '';
                const rushConfiguration = RushConfiguration_1.RushConfiguration.loadFromConfigurationFile(RUSH_JSON_FILENAME);
                expect(rushConfiguration.packageManager).toEqual('pnpm');
                expect(rushConfiguration.pnpmOptions.pnpmStore).toEqual('global');
                expect(rushConfiguration.pnpmOptions.pnpmStorePath).toEqual(EXPECT_STORE_PATH);
                done();
            });
            it('loads the correct path when environment variable is defined', (done) => {
                const EXPECT_STORE_PATH = path.resolve('/var/temp');
                process.env[PNPM_STORE_PATH_ENV] = EXPECT_STORE_PATH;
                const rushConfiguration = RushConfiguration_1.RushConfiguration.loadFromConfigurationFile(RUSH_JSON_FILENAME);
                expect(rushConfiguration.packageManager).toEqual('pnpm');
                expect(rushConfiguration.pnpmOptions.pnpmStore).toEqual('global');
                expect(rushConfiguration.pnpmOptions.pnpmStorePath).toEqual(EXPECT_STORE_PATH);
                done();
            });
        });
        it(`throws an error when invalid pnpmStore is defined`, (done) => {
            const RUSH_JSON_FILENAME = path.resolve(__dirname, 'repo', 'rush-pnpm-invalid-store.json');
            expect(() => {
                // @ts-ignore
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const rushConfiguration = RushConfiguration_1.RushConfiguration.loadFromConfigurationFile(RUSH_JSON_FILENAME);
            }).toThrow();
            done();
        });
    });
});
//# sourceMappingURL=RushConfiguration.test.js.map