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
exports.CertificateManager = void 0;
const forge = __importStar(require("node-forge"));
const path = __importStar(require("path"));
const child_process = __importStar(require("child_process"));
const os_1 = require("os");
const node_core_library_1 = require("@rushstack/node-core-library");
const exec_1 = require("./exec");
const CertificateStore_1 = require("./CertificateStore");
const SERIAL_NUMBER = '731c321744e34650a202e3ef91c3c1b0';
const FRIENDLY_NAME = 'debug-certificate-manager Development Certificate';
const MAC_KEYCHAIN = '/Library/Keychains/System.keychain';
const CERTUTIL_EXE_NAME = 'certutil';
/**
 * A utility class to handle generating, trusting, and untrustring a debug certificate.
 * Contains two public methods to `ensureCertificate` and `untrustCertificate`.
 * @public
 */
class CertificateManager {
    constructor() {
        this._certificateStore = new CertificateStore_1.CertificateStore();
    }
    /**
     * Get a dev certificate from the store, or optionally, generate a new one
     * and trust it if one doesn't exist in the store.
     *
     * @public
     */
    async ensureCertificateAsync(canGenerateNewCertificate, terminal) {
        if (this._certificateStore.certificateData && this._certificateStore.keyData) {
            if (!this._certificateHasSubjectAltName()) {
                let warningMessage = 'The existing development certificate is missing the subjectAltName ' +
                    'property and will not work with the latest versions of some browsers. ';
                if (canGenerateNewCertificate) {
                    warningMessage += ' Attempting to untrust the certificate and generate a new one.';
                }
                else {
                    warningMessage += ' Untrust the certificate and generate a new one.';
                }
                terminal.writeWarningLine(warningMessage);
                if (canGenerateNewCertificate) {
                    await this.untrustCertificateAsync(terminal);
                    await this._ensureCertificateInternalAsync(terminal);
                }
            }
        }
        else if (canGenerateNewCertificate) {
            await this._ensureCertificateInternalAsync(terminal);
        }
        return {
            pemCertificate: this._certificateStore.certificateData,
            pemKey: this._certificateStore.keyData
        };
    }
    /**
     * Attempt to locate a previously generated debug certificate and untrust it.
     *
     * @public
     */
    async untrustCertificateAsync(terminal) {
        switch (process.platform) {
            case 'win32':
                const winUntrustResult = child_process.spawnSync(CERTUTIL_EXE_NAME, ['-user', '-delstore', 'root', SERIAL_NUMBER]);
                if (winUntrustResult.status !== 0) {
                    terminal.writeErrorLine(`Error: ${winUntrustResult.stdout.toString()}`);
                    return false;
                }
                else {
                    terminal.writeVerboseLine('Successfully untrusted development certificate.');
                    return true;
                }
            case 'darwin':
                terminal.writeVerboseLine('Trying to find the signature of the dev cert');
                const macFindCertificateResult = child_process.spawnSync('security', ['find-certificate', '-c', 'localhost', '-a', '-Z', MAC_KEYCHAIN]);
                if (macFindCertificateResult.status !== 0) {
                    terminal.writeErrorLine(`Error finding the dev certificate: ${macFindCertificateResult.output.join(' ')}`);
                    return false;
                }
                const outputLines = macFindCertificateResult.stdout.toString().split(os_1.EOL);
                let found = false;
                let shaHash = '';
                for (let i = 0; i < outputLines.length; i++) {
                    const line = outputLines[i];
                    const shaMatch = line.match(/^SHA-1 hash: (.+)$/);
                    if (shaMatch) {
                        shaHash = shaMatch[1];
                    }
                    const snbrMatch = line.match(/^\s*"snbr"<blob>=0x([^\s]+).+$/);
                    if (snbrMatch && (snbrMatch[1] || '').toLowerCase() === SERIAL_NUMBER) {
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    terminal.writeErrorLine('Unable to find the dev certificate.');
                    return false;
                }
                terminal.writeVerboseLine(`Found the dev cert. SHA is ${shaHash}`);
                const macUntrustResult = await exec_1.runSudoAsync('security', [
                    'delete-certificate',
                    '-Z',
                    shaHash,
                    MAC_KEYCHAIN
                ]);
                if (macUntrustResult.code === 0) {
                    terminal.writeVerboseLine('Successfully untrusted dev certificate.');
                    return true;
                }
                else {
                    terminal.writeErrorLine(macUntrustResult.stderr.join(' '));
                    return false;
                }
            default:
                // Linux + others: Have the user manually untrust the cert
                terminal.writeLine('Automatic certificate untrust is only implemented for debug-certificate-manager on Windows ' +
                    'and macOS. To untrust the development certificate, remove this certificate from your trusted ' +
                    `root certification authorities: "${this._certificateStore.certificatePath}". The ` +
                    `certificate has serial number "${SERIAL_NUMBER}".`);
                return false;
        }
    }
    _createDevelopmentCertificate() {
        const keys = forge.pki.rsa.generateKeyPair(2048);
        const certificate = forge.pki.createCertificate();
        certificate.publicKey = keys.publicKey;
        certificate.serialNumber = SERIAL_NUMBER;
        const now = new Date();
        certificate.validity.notBefore = now;
        // Valid for 3 years
        certificate.validity.notAfter.setFullYear(certificate.validity.notBefore.getFullYear() + 3);
        const attrs = [
            {
                name: 'commonName',
                value: 'localhost'
            }
        ];
        certificate.setSubject(attrs);
        certificate.setIssuer(attrs);
        certificate.setExtensions([
            {
                name: 'subjectAltName',
                altNames: [
                    {
                        type: 2,
                        value: 'localhost'
                    }
                ]
            },
            {
                name: 'keyUsage',
                digitalSignature: true,
                keyEncipherment: true,
                dataEncipherment: true
            },
            {
                name: 'extKeyUsage',
                serverAuth: true
            },
            {
                name: 'friendlyName',
                value: FRIENDLY_NAME
            }
        ]);
        // self-sign certificate
        certificate.sign(keys.privateKey, forge.md.sha256.create());
        // convert a Forge certificate to PEM
        const pem = forge.pki.certificateToPem(certificate);
        const pemKey = forge.pki.privateKeyToPem(keys.privateKey);
        return {
            pemCertificate: pem,
            pemKey: pemKey
        };
    }
    async _tryTrustCertificateAsync(certificatePath, terminal) {
        switch (process.platform) {
            case 'win32':
                terminal.writeLine('Attempting to trust a dev certificate. This self-signed certificate only points to localhost ' +
                    'and will be stored in your local user profile to be used by other instances of ' +
                    'debug-certificate-manager. If you do not consent to trust this certificate, click "NO" in the dialog.');
                const winTrustResult = await exec_1.runAsync(CERTUTIL_EXE_NAME, [
                    '-user',
                    '-addstore',
                    'root',
                    certificatePath
                ]);
                if (winTrustResult.code !== 0) {
                    terminal.writeErrorLine(`Error: ${winTrustResult.stdout.toString()}`);
                    const errorLines = winTrustResult.stdout
                        .toString()
                        .split(os_1.EOL)
                        .map((line) => line.trim());
                    // Not sure if this is always the status code for "cancelled" - should confirm.
                    if (winTrustResult.code === 2147943623 ||
                        errorLines[errorLines.length - 1].indexOf('The operation was canceled by the user.') > 0) {
                        terminal.writeLine('Certificate trust cancelled.');
                    }
                    else {
                        terminal.writeErrorLine('Certificate trust failed with an unknown error.');
                    }
                    return false;
                }
                else {
                    terminal.writeVerboseLine('Successfully trusted development certificate.');
                    return true;
                }
            case 'darwin':
                terminal.writeLine('Attempting to trust a dev certificate. This self-signed certificate only points to localhost ' +
                    'and will be stored in your local user profile to be used by other instances of ' +
                    'debug-certificate-manager. If you do not consent to trust this certificate, do not enter your ' +
                    'root password in the prompt.');
                const result = await exec_1.runSudoAsync('security', [
                    'add-trusted-cert',
                    '-d',
                    '-r',
                    'trustRoot',
                    '-k',
                    MAC_KEYCHAIN,
                    certificatePath
                ]);
                if (result.code === 0) {
                    terminal.writeVerboseLine('Successfully trusted development certificate.');
                    return true;
                }
                else {
                    if (result.stderr.some((value) => !!value.match(/The authorization was cancelled by the user\./))) {
                        terminal.writeLine('Certificate trust cancelled.');
                        return false;
                    }
                    else {
                        terminal.writeErrorLine(`Certificate trust failed with an unknown error. Exit code: ${result.code}. ` +
                            `Error: ${result.stderr.join(' ')}`);
                        return false;
                    }
                }
            default:
                // Linux + others: Have the user manually trust the cert if they want to
                terminal.writeLine('Automatic certificate trust is only implemented for debug-certificate-manager on Windows ' +
                    'and macOS. To trust the development certificate, add this certificate to your trusted root ' +
                    `certification authorities: "${certificatePath}".`);
                return true;
        }
    }
    async _trySetFriendlyNameAsync(certificatePath, terminal) {
        if (process.platform === 'win32') {
            const basePath = path.dirname(certificatePath);
            const fileName = path.basename(certificatePath, path.extname(certificatePath));
            const friendlyNamePath = path.join(basePath, `${fileName}.inf`);
            const friendlyNameFile = [
                '[Version]',
                'Signature = "$Windows NT$"',
                '[Properties]',
                `11 = "{text}${FRIENDLY_NAME}"`,
                ''
            ].join(os_1.EOL);
            await node_core_library_1.FileSystem.writeFileAsync(friendlyNamePath, friendlyNameFile);
            const commands = ['–repairstore', '–user', 'root', SERIAL_NUMBER, friendlyNamePath];
            const repairStoreResult = child_process.spawnSync(CERTUTIL_EXE_NAME, commands);
            if (repairStoreResult.status !== 0) {
                terminal.writeErrorLine(`CertUtil Error: ${repairStoreResult.stdout.toString()}`);
                return false;
            }
            else {
                terminal.writeVerboseLine('Successfully set certificate name.');
                return true;
            }
        }
        else {
            // No equivalent concept outside of Windows
            return true;
        }
    }
    async _ensureCertificateInternalAsync(terminal) {
        const certificateStore = this._certificateStore;
        const generatedCertificate = this._createDevelopmentCertificate();
        const now = new Date();
        const certificateName = now.getTime().toString();
        const tempDirName = path.join(__dirname, '..', 'temp');
        const tempCertificatePath = path.join(tempDirName, `${certificateName}.pem`);
        const pemFileContents = generatedCertificate.pemCertificate;
        if (pemFileContents) {
            node_core_library_1.FileSystem.writeFile(tempCertificatePath, pemFileContents, {
                ensureFolderExists: true
            });
        }
        const trustCertificateResult = await this._tryTrustCertificateAsync(tempCertificatePath, terminal);
        if (trustCertificateResult) {
            certificateStore.certificateData = generatedCertificate.pemCertificate;
            certificateStore.keyData = generatedCertificate.pemKey;
            // Try to set the friendly name, and warn if we can't
            if (!this._trySetFriendlyNameAsync(tempCertificatePath, terminal)) {
                terminal.writeWarningLine("Unable to set the certificate's friendly name.");
            }
        }
        else {
            // Clear out the existing store data, if any exists
            certificateStore.certificateData = undefined;
            certificateStore.keyData = undefined;
        }
        await node_core_library_1.FileSystem.deleteFileAsync(tempCertificatePath);
    }
    _certificateHasSubjectAltName() {
        const certificateData = this._certificateStore.certificateData;
        if (!certificateData) {
            return false;
        }
        const certificate = forge.pki.certificateFromPem(certificateData);
        return !!certificate.getExtension('subjectAltName');
    }
}
exports.CertificateManager = CertificateManager;
//# sourceMappingURL=CertificateManager.js.map