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
exports.CertificateStore = void 0;
const path = __importStar(require("path"));
const os_1 = require("os");
const node_core_library_1 = require("@rushstack/node-core-library");
/**
 * Store to retrieve and save debug certificate data.
 * @public
 */
class CertificateStore {
    constructor() {
        const unresolvedUserFolder = os_1.homedir();
        this._userProfilePath = path.resolve(unresolvedUserFolder);
        if (!node_core_library_1.FileSystem.exists(this._userProfilePath)) {
            throw new Error("Unable to determine the current user's home directory");
        }
        this._serveDataPath = path.join(this._userProfilePath, '.rushstack');
        node_core_library_1.FileSystem.ensureFolder(this._serveDataPath);
        this._certificatePath = path.join(this._serveDataPath, 'rushstack-serve.pem');
        this._keyPath = path.join(this._serveDataPath, 'rushstack-serve.key');
    }
    /**
     * Path to the saved debug certificate
     */
    get certificatePath() {
        return this._certificatePath;
    }
    /**
     * Debug certificate pem file contents.
     */
    get certificateData() {
        if (!this._certificateData) {
            if (node_core_library_1.FileSystem.exists(this._certificatePath)) {
                this._certificateData = node_core_library_1.FileSystem.readFile(this._certificatePath);
            }
            else {
                return undefined;
            }
        }
        return this._certificateData;
    }
    set certificateData(certificate) {
        if (certificate) {
            node_core_library_1.FileSystem.writeFile(this._certificatePath, certificate);
        }
        else if (node_core_library_1.FileSystem.exists(this._certificatePath)) {
            node_core_library_1.FileSystem.deleteFile(this._certificatePath);
        }
        this._certificateData = certificate;
    }
    /**
     * Key used to sign the debug pem certificate.
     */
    get keyData() {
        if (!this._keyData) {
            if (node_core_library_1.FileSystem.exists(this._keyPath)) {
                this._keyData = node_core_library_1.FileSystem.readFile(this._keyPath);
            }
            else {
                return undefined;
            }
        }
        return this._keyData;
    }
    set keyData(key) {
        if (key) {
            node_core_library_1.FileSystem.writeFile(this._keyPath, key);
        }
        else if (node_core_library_1.FileSystem.exists(this._keyPath)) {
            node_core_library_1.FileSystem.deleteFile(this._keyPath);
        }
        this._keyData = key;
    }
}
exports.CertificateStore = CertificateStore;
//# sourceMappingURL=CertificateStore.js.map