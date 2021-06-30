"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.AzureStorageBuildCacheProvider = exports.AzureAuthorityHosts = void 0;
const terminal_1 = require("@rushstack/terminal");
const storage_blob_1 = require("@azure/storage-blob");
const identity_1 = require("@azure/identity");
const EnvironmentConfiguration_1 = require("../../api/EnvironmentConfiguration");
const CredentialCache_1 = require("../CredentialCache");
const RushConstants_1 = require("../RushConstants");
const CloudBuildCacheProviderBase_1 = require("./CloudBuildCacheProviderBase");
// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
// TODO: This is a temporary workaround; it should be reverted when we upgrade to "@azure/identity" version 2.x
// import { AzureAuthorityHosts } from '@azure/identity';
var AzureAuthorityHosts;
(function (AzureAuthorityHosts) {
    AzureAuthorityHosts["AzureChina"] = "https://login.chinacloudapi.cn";
    AzureAuthorityHosts["AzureGermany"] = "https://login.microsoftonline.de";
    AzureAuthorityHosts["AzureGovernment"] = "https://login.microsoftonline.us";
    AzureAuthorityHosts["AzurePublicCloud"] = "https://login.microsoftonline.com";
})(AzureAuthorityHosts = exports.AzureAuthorityHosts || (exports.AzureAuthorityHosts = {}));
const SAS_TTL_MILLISECONDS = 7 * 24 * 60 * 60 * 1000; // Seven days
class AzureStorageBuildCacheProvider extends CloudBuildCacheProviderBase_1.CloudBuildCacheProviderBase {
    constructor(options) {
        super();
        this._storageAccountName = options.storageAccountName;
        this._storageContainerName = options.storageContainerName;
        this._azureEnvironment = options.azureEnvironment || 'AzurePublicCloud';
        this._blobPrefix = options.blobPrefix;
        this._environmentCredential = EnvironmentConfiguration_1.EnvironmentConfiguration.buildCacheCredential;
        this._isCacheWriteAllowedByConfiguration = options.isCacheWriteAllowed;
        if (!(this._azureEnvironment in AzureAuthorityHosts)) {
            throw new Error(`The specified Azure Environment ("${this._azureEnvironment}") is invalid. If it is specified, it must ` +
                `be one of: ${Object.keys(AzureAuthorityHosts).join(', ')}`);
        }
    }
    get isCacheWriteAllowed() {
        var _a;
        return (_a = EnvironmentConfiguration_1.EnvironmentConfiguration.buildCacheWriteAllowed) !== null && _a !== void 0 ? _a : this._isCacheWriteAllowedByConfiguration;
    }
    get _credentialCacheId() {
        if (!this.__credentialCacheId) {
            const cacheIdParts = [
                'azure-blob-storage',
                this._azureEnvironment,
                this._storageAccountName,
                this._storageContainerName
            ];
            if (this._isCacheWriteAllowedByConfiguration) {
                cacheIdParts.push('cacheWriteAllowed');
            }
            this.__credentialCacheId = cacheIdParts.join('|');
        }
        return this.__credentialCacheId;
    }
    get _storageAccountUrl() {
        return `https://${this._storageAccountName}.blob.core.windows.net/`;
    }
    async tryGetCacheEntryBufferByIdAsync(terminal, cacheId) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        const blobClient = await this._getBlobClientForCacheIdAsync(cacheId);
        try {
            const blobExists = await blobClient.exists();
            if (blobExists) {
                return await blobClient.downloadToBuffer();
            }
            else {
                return undefined;
            }
        }
        catch (e) {
            const errorMessage = 'Error getting cache entry from Azure Storage: ' +
                [e.name, e.message, (_a = e.response) === null || _a === void 0 ? void 0 : _a.status, (_c = (_b = e.response) === null || _b === void 0 ? void 0 : _b.parsedHeaders) === null || _c === void 0 ? void 0 : _c.errorCode]
                    .filter((piece) => piece)
                    .join(' ');
            if (((_e = (_d = e.response) === null || _d === void 0 ? void 0 : _d.parsedHeaders) === null || _e === void 0 ? void 0 : _e.errorCode) === 'PublicAccessNotPermitted') {
                // This error means we tried to read the cache with no credentials, but credentials are required.
                // We'll assume that the configuration of the cache is correct and the user has to take action.
                terminal.writeWarningLine(`${errorMessage}\n\n` +
                    `You need to configure Azure Storage SAS credentials to access the build cache.\n` +
                    `Update the credentials by running "rush ${RushConstants_1.RushConstants.updateCloudCredentialsCommandName}", \n` +
                    `or provide a SAS in the ` +
                    `${"RUSH_BUILD_CACHE_CREDENTIAL" /* RUSH_BUILD_CACHE_CREDENTIAL */} environment variable.`);
            }
            else if (((_g = (_f = e.response) === null || _f === void 0 ? void 0 : _f.parsedHeaders) === null || _g === void 0 ? void 0 : _g.errorCode) === 'AuthenticationFailed') {
                // This error means the user's credentials are incorrect, but not expired normally. They might have
                // gotten corrupted somehow, or revoked manually in Azure Portal.
                terminal.writeWarningLine(`${errorMessage}\n\n` +
                    `Your Azure Storage SAS credentials are not valid.\n` +
                    `Update the credentials by running "rush ${RushConstants_1.RushConstants.updateCloudCredentialsCommandName}", \n` +
                    `or provide a SAS in the ` +
                    `${"RUSH_BUILD_CACHE_CREDENTIAL" /* RUSH_BUILD_CACHE_CREDENTIAL */} environment variable.`);
            }
            else if (((_j = (_h = e.response) === null || _h === void 0 ? void 0 : _h.parsedHeaders) === null || _j === void 0 ? void 0 : _j.errorCode) === 'AuthorizationPermissionMismatch') {
                // This error is not solvable by the user, so we'll assume it is a configuration error, and revert
                // to providing likely next steps on configuration. (Hopefully this error is rare for a regular
                // developer, more likely this error will appear while someone is configuring the cache for the
                // first time.)
                terminal.writeWarningLine(`${errorMessage}\n\n` +
                    `Your Azure Storage SAS credentials are valid, but do not have permission to read the build cache.\n` +
                    `Make sure you have added the role 'Storage Blob Data Reader' to the appropriate user(s) or group(s)\n` +
                    `on your storage account in the Azure Portal.`);
            }
            else {
                // We don't know what went wrong, hopefully we'll print something useful.
                terminal.writeWarningLine(errorMessage);
            }
            return undefined;
        }
    }
    async trySetCacheEntryBufferAsync(terminal, cacheId, entryStream) {
        var _a, _b, _c;
        if (!this.isCacheWriteAllowed) {
            terminal.writeErrorLine('Writing to Azure Blob Storage cache is not allowed in the current configuration.');
            return false;
        }
        const blobClient = await this._getBlobClientForCacheIdAsync(cacheId);
        const blockBlobClient = blobClient.getBlockBlobClient();
        let blobAlreadyExists = false;
        try {
            blobAlreadyExists = await blockBlobClient.exists();
        }
        catch (e) {
            // If RUSH_BUILD_CACHE_CREDENTIAL is set but is corrupted or has been rotated
            // in Azure Portal, or the user's own cached credentials have been corrupted or
            // invalidated, we'll print the error and continue (this way we don't fail the
            // actual rush build).
            const errorMessage = 'Error checking if cache entry exists in Azure Storage: ' +
                [e.name, e.message, (_a = e.response) === null || _a === void 0 ? void 0 : _a.status, (_c = (_b = e.response) === null || _b === void 0 ? void 0 : _b.parsedHeaders) === null || _c === void 0 ? void 0 : _c.errorCode]
                    .filter((piece) => piece)
                    .join(' ');
            terminal.writeWarningLine(errorMessage);
        }
        if (blobAlreadyExists) {
            terminal.writeVerboseLine('Build cache entry blob already exists.');
            return true;
        }
        else {
            try {
                await blockBlobClient.upload(entryStream, entryStream.length);
                return true;
            }
            catch (e) {
                if (e.statusCode === 409 /* conflict */) {
                    // If something else has written to the blob at the same time,
                    // it's probably a concurrent process that is attempting to write
                    // the same cache entry. That is an effective success.
                    terminal.writeVerboseLine('Azure Storage returned status 409 (conflict). The cache entry has ' +
                        `probably already been set by another builder. Code: "${e.code}".`);
                    return true;
                }
                else {
                    terminal.writeWarningLine(`Error uploading cache entry to Azure Storage: ${e}`);
                    return false;
                }
            }
        }
    }
    async updateCachedCredentialAsync(terminal, credential) {
        await CredentialCache_1.CredentialCache.usingAsync({
            supportEditing: true
        }, async (credentialsCache) => {
            credentialsCache.setCacheEntry(this._credentialCacheId, credential);
            await credentialsCache.saveIfModifiedAsync();
        });
    }
    async updateCachedCredentialInteractiveAsync(terminal) {
        const sasQueryParameters = await this._getSasQueryParametersAsync(terminal);
        const sasString = sasQueryParameters.toString();
        await CredentialCache_1.CredentialCache.usingAsync({
            supportEditing: true
        }, async (credentialsCache) => {
            credentialsCache.setCacheEntry(this._credentialCacheId, sasString, sasQueryParameters.expiresOn);
            await credentialsCache.saveIfModifiedAsync();
        });
    }
    async deleteCachedCredentialsAsync(terminal) {
        await CredentialCache_1.CredentialCache.usingAsync({
            supportEditing: true
        }, async (credentialsCache) => {
            credentialsCache.deleteCacheEntry(this._credentialCacheId);
            await credentialsCache.saveIfModifiedAsync();
        });
    }
    async _getBlobClientForCacheIdAsync(cacheId) {
        const client = await this._getContainerClientAsync();
        const blobName = this._blobPrefix ? `${this._blobPrefix}/${cacheId}` : cacheId;
        return client.getBlobClient(blobName);
    }
    async _getContainerClientAsync() {
        var _a;
        if (!this._containerClient) {
            let sasString = this._environmentCredential;
            if (!sasString) {
                let cacheEntry;
                await CredentialCache_1.CredentialCache.usingAsync({
                    supportEditing: false
                }, (credentialsCache) => {
                    cacheEntry = credentialsCache.tryGetCacheEntry(this._credentialCacheId);
                });
                const expirationTime = (_a = cacheEntry === null || cacheEntry === void 0 ? void 0 : cacheEntry.expires) === null || _a === void 0 ? void 0 : _a.getTime();
                if (expirationTime && expirationTime < Date.now()) {
                    throw new Error('Cached Azure Storage credentials have expired. ' +
                        `Update the credentials by running "rush ${RushConstants_1.RushConstants.updateCloudCredentialsCommandName}".`);
                }
                else {
                    sasString = cacheEntry === null || cacheEntry === void 0 ? void 0 : cacheEntry.credential;
                }
            }
            let blobServiceClient;
            if (sasString) {
                const connectionString = this._getConnectionString(sasString);
                blobServiceClient = storage_blob_1.BlobServiceClient.fromConnectionString(connectionString);
            }
            else if (!this._isCacheWriteAllowedByConfiguration) {
                // If cache write isn't allowed and we don't have a credential, assume the blob supports anonymous read
                blobServiceClient = new storage_blob_1.BlobServiceClient(this._storageAccountUrl);
            }
            else {
                throw new Error("An Azure Storage SAS credential hasn't been provided, or has expired. " +
                    `Update the credentials by running "rush ${RushConstants_1.RushConstants.updateCloudCredentialsCommandName}", ` +
                    `or provide a SAS in the ` +
                    `${"RUSH_BUILD_CACHE_CREDENTIAL" /* RUSH_BUILD_CACHE_CREDENTIAL */} environment variable`);
            }
            this._containerClient = blobServiceClient.getContainerClient(this._storageContainerName);
        }
        return this._containerClient;
    }
    async _getSasQueryParametersAsync(terminal) {
        const authorityHost = AzureAuthorityHosts[this._azureEnvironment];
        if (!authorityHost) {
            throw new Error(`Unexpected Azure environment: ${this._azureEnvironment}`);
        }
        const DeveloperSignOnClientId = '04b07795-8ddb-461a-bbee-02f9e1bf7b46';
        const deviceCodeCredential = new identity_1.DeviceCodeCredential('organizations', DeveloperSignOnClientId, (deviceCodeInfo) => {
            terminal_1.PrintUtilities.printMessageInBox(deviceCodeInfo.message, terminal);
        }, { authorityHost: authorityHost });
        const blobServiceClient = new storage_blob_1.BlobServiceClient(this._storageAccountUrl, deviceCodeCredential);
        const startsOn = new Date();
        const expires = new Date(Date.now() + SAS_TTL_MILLISECONDS);
        const key = await blobServiceClient.getUserDelegationKey(startsOn, expires);
        const containerSasPermissions = new storage_blob_1.ContainerSASPermissions();
        containerSasPermissions.read = true;
        containerSasPermissions.write = this._isCacheWriteAllowedByConfiguration;
        const queryParameters = storage_blob_1.generateBlobSASQueryParameters({
            startsOn: startsOn,
            expiresOn: expires,
            permissions: containerSasPermissions,
            containerName: this._storageContainerName
        }, key, this._storageAccountName);
        return queryParameters;
    }
    _getConnectionString(sasString) {
        const blobEndpoint = `BlobEndpoint=${this._storageAccountUrl}`;
        if (sasString) {
            const connectionString = `${blobEndpoint};SharedAccessSignature=${sasString}`;
            return connectionString;
        }
        else {
            return blobEndpoint;
        }
    }
}
exports.AzureStorageBuildCacheProvider = AzureStorageBuildCacheProvider;
//# sourceMappingURL=AzureStorageBuildCacheProvider.js.map