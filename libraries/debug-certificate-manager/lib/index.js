"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * This package is used to manage debug certificates for development servers.
 * It is used by
 * [\@microsoft/gulp-core-build-serve](https://www.npmjs.com/package/\@microsoft/gulp-core-build-serve)
 * to generate and trust a certificate when HTTPS is turned on.
 *
 * This package provides the following utilities:
 * - `CertificateStore` to handle retrieving and saving a debug certificate.
 * - `CertificateManager` is a utility class containing the following public methods:
 * | - `ensureCertificate` will find or optionally create a debug certificate and trust it.
 * | - `untrustCertificate` will untrust a debug certificate.
 *
 * @packageDocumentation
 */
var CertificateManager_1 = require("./CertificateManager");
Object.defineProperty(exports, "CertificateManager", { enumerable: true, get: function () { return CertificateManager_1.CertificateManager; } });
var CertificateStore_1 = require("./CertificateStore");
Object.defineProperty(exports, "CertificateStore", { enumerable: true, get: function () { return CertificateStore_1.CertificateStore; } });
//# sourceMappingURL=index.js.map