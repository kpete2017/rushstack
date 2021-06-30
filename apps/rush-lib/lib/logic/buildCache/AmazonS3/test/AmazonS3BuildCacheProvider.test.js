"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
const node_core_library_1 = require("@rushstack/node-core-library");
const EnvironmentConfiguration_1 = require("../../../../api/EnvironmentConfiguration");
const AmazonS3BuildCacheProvider_1 = require("../AmazonS3BuildCacheProvider");
const RushUserConfiguration_1 = require("../../../../api/RushUserConfiguration");
const CredentialCache_1 = require("../../../CredentialCache");
describe('AmazonS3BuildCacheProvider', () => {
    beforeEach(() => {
        jest.spyOn(EnvironmentConfiguration_1.EnvironmentConfiguration, 'buildCacheCredential', 'get').mockReturnValue(undefined);
        jest.spyOn(EnvironmentConfiguration_1.EnvironmentConfiguration, 'buildCacheEnabled', 'get').mockReturnValue(undefined);
        jest.spyOn(EnvironmentConfiguration_1.EnvironmentConfiguration, 'buildCacheWriteAllowed', 'get').mockReturnValue(undefined);
    });
    afterEach(() => {
        jest.resetAllMocks();
    });
    describe('isCacheWriteAllowed', () => {
        function prepareSubject(optionValue, envVarValue) {
            jest.spyOn(EnvironmentConfiguration_1.EnvironmentConfiguration, 'buildCacheWriteAllowed', 'get').mockReturnValue(envVarValue);
            return new AmazonS3BuildCacheProvider_1.AmazonS3BuildCacheProvider({
                s3Region: 'region-name',
                s3Bucket: 'bucket-name',
                isCacheWriteAllowed: optionValue
            });
        }
        it('is false if isCacheWriteAllowed is false', () => {
            const subject = prepareSubject(false, undefined);
            expect(subject.isCacheWriteAllowed).toBe(false);
        });
        it('is true if isCacheWriteAllowed is true', () => {
            const subject = prepareSubject(true, undefined);
            expect(subject.isCacheWriteAllowed).toBe(true);
        });
        it('is false if isCacheWriteAllowed is true but the env var is false', () => {
            const subject = prepareSubject(true, false);
            expect(subject.isCacheWriteAllowed).toBe(false);
        });
        it('is true if the env var is true', () => {
            const subject = prepareSubject(false, true);
            expect(subject.isCacheWriteAllowed).toBe(true);
        });
    });
    async function testCredentialCache(isCacheWriteAllowed) {
        const cacheProvider = new AmazonS3BuildCacheProvider_1.AmazonS3BuildCacheProvider({
            s3Region: 'region-name',
            s3Bucket: 'bucket-name',
            isCacheWriteAllowed
        });
        // Mock the user folder to the current folder so a real .rush-user folder doesn't interfere with the test
        jest.spyOn(RushUserConfiguration_1.RushUserConfiguration, 'getRushUserFolderPath').mockReturnValue(__dirname);
        let setCacheEntryArgs = [];
        const credentialsCacheSetCacheEntrySpy = jest
            .spyOn(CredentialCache_1.CredentialCache.prototype, 'setCacheEntry')
            .mockImplementation((...args) => {
            setCacheEntryArgs = args;
        });
        const credentialsCacheSaveSpy = jest
            .spyOn(CredentialCache_1.CredentialCache.prototype, 'saveIfModifiedAsync')
            .mockImplementation(() => Promise.resolve());
        const terminal = new node_core_library_1.Terminal(new node_core_library_1.StringBufferTerminalProvider());
        await cacheProvider.updateCachedCredentialAsync(terminal, 'credential');
        expect(credentialsCacheSetCacheEntrySpy).toHaveBeenCalledTimes(1);
        expect(setCacheEntryArgs).toMatchSnapshot();
        expect(credentialsCacheSaveSpy).toHaveBeenCalledTimes(1);
    }
    it('Has an expected cached credential name (write not allowed)', async () => {
        await testCredentialCache(false);
    });
    it('Has an expected cached credential name (write allowed)', async () => {
        await testCredentialCache(true);
    });
});
//# sourceMappingURL=AmazonS3BuildCacheProvider.test.js.map