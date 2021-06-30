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
const EnvironmentConfiguration_1 = require("../EnvironmentConfiguration");
describe('EnvironmentConfiguration', () => {
    let _oldEnv;
    beforeEach(() => {
        EnvironmentConfiguration_1.EnvironmentConfiguration.reset();
        _oldEnv = process.env;
        process.env = {};
    });
    afterEach(() => {
        process.env = _oldEnv;
    });
    describe('initialize', () => {
        it('correctly allows no environment variables', () => {
            expect(EnvironmentConfiguration_1.EnvironmentConfiguration.initialize).not.toThrow();
        });
        it('allows known environment variables', () => {
            process.env['RUSH_TEMP_FOLDER'] = '/var/temp'; // eslint-disable-line dot-notation
            expect(EnvironmentConfiguration_1.EnvironmentConfiguration.initialize).not.toThrow();
        });
        it('does not allow unknown environment variables', () => {
            process.env['rush_foobar'] = 'asdf'; // eslint-disable-line dot-notation
            expect(EnvironmentConfiguration_1.EnvironmentConfiguration.initialize).toThrow();
        });
        it('can be re-initialized', () => {
            process.env['RUSH_TEMP_FOLDER'] = '/var/tempA'; // eslint-disable-line dot-notation
            EnvironmentConfiguration_1.EnvironmentConfiguration.initialize({ doNotNormalizePaths: true });
            expect(EnvironmentConfiguration_1.EnvironmentConfiguration.rushTempFolderOverride).toEqual('/var/tempA');
            process.env['RUSH_TEMP_FOLDER'] = '/var/tempB'; // eslint-disable-line dot-notation
            EnvironmentConfiguration_1.EnvironmentConfiguration.initialize({ doNotNormalizePaths: true });
            expect(EnvironmentConfiguration_1.EnvironmentConfiguration.rushTempFolderOverride).toEqual('/var/tempB');
        });
    });
    describe('rushTempDirOverride', () => {
        it('throws if EnvironmentConfiguration is not initialized', () => {
            expect(() => EnvironmentConfiguration_1.EnvironmentConfiguration.rushTempFolderOverride).toThrow();
        });
        it('returns undefined for unset environment variables', () => {
            EnvironmentConfiguration_1.EnvironmentConfiguration.initialize();
            expect(EnvironmentConfiguration_1.EnvironmentConfiguration.rushTempFolderOverride).not.toBeDefined();
        });
        it('returns the value for a set environment variable', () => {
            const expectedValue = '/var/temp';
            process.env['RUSH_TEMP_FOLDER'] = expectedValue; // eslint-disable-line dot-notation
            EnvironmentConfiguration_1.EnvironmentConfiguration.initialize({ doNotNormalizePaths: true });
            expect(EnvironmentConfiguration_1.EnvironmentConfiguration.rushTempFolderOverride).toEqual(expectedValue);
        });
    });
    describe('pnpmStorePathOverride', () => {
        const ENV_VAR = 'RUSH_PNPM_STORE_PATH';
        it('throws if EnvironmentConfiguration is not initialized', () => {
            expect(() => EnvironmentConfiguration_1.EnvironmentConfiguration.pnpmStorePathOverride).toThrow();
        });
        it('returns undefined for unset environment variable', () => {
            EnvironmentConfiguration_1.EnvironmentConfiguration.initialize();
            expect(EnvironmentConfiguration_1.EnvironmentConfiguration.pnpmStorePathOverride).not.toBeDefined();
        });
        it('returns the expected path from environment variable without normalization', () => {
            const expectedValue = '/var/temp';
            process.env[ENV_VAR] = expectedValue;
            EnvironmentConfiguration_1.EnvironmentConfiguration.initialize({ doNotNormalizePaths: true });
            expect(EnvironmentConfiguration_1.EnvironmentConfiguration.pnpmStorePathOverride).toEqual(expectedValue);
        });
        it('returns expected path from environment variable with normalization', () => {
            const expectedValue = path.resolve(path.join(process.cwd(), 'temp'));
            const envVar = './temp';
            process.env[ENV_VAR] = envVar;
            EnvironmentConfiguration_1.EnvironmentConfiguration.initialize();
            expect(EnvironmentConfiguration_1.EnvironmentConfiguration.pnpmStorePathOverride).toEqual(expectedValue);
        });
    });
});
//# sourceMappingURL=EnvironmentConfiguration.test.js.map