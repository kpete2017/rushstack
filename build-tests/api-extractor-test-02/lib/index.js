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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
/// <reference path="../typings/tsd.d.ts" />
/**
 * api-extractor-test-02
 *
 * @remarks
 * This library consumes api-extractor-test-01 and is consumed by api-extractor-test-03.
 *
 * @packageDocumentation
 */
var SubclassWithImport_1 = require("./SubclassWithImport");
Object.defineProperty(exports, "SubclassWithImport", { enumerable: true, get: function () { return SubclassWithImport_1.SubclassWithImport; } });
__exportStar(require("./TypeFromImportedModule"), exports);
var ImportDeduping1_1 = require("./ImportDeduping1");
Object.defineProperty(exports, "importDeduping1", { enumerable: true, get: function () { return ImportDeduping1_1.importDeduping1; } });
var ImportDeduping2_1 = require("./ImportDeduping2");
Object.defineProperty(exports, "importDeduping2", { enumerable: true, get: function () { return ImportDeduping2_1.importDeduping2; } });
var api_extractor_test_01_1 = require("api-extractor-test-01");
Object.defineProperty(exports, "RenamedReexportedClass3", { enumerable: true, get: function () { return api_extractor_test_01_1.ReexportedClass; } });
const api_extractor_test_01_2 = require("api-extractor-test-01");
// Test that the ambient types are accessible even though api-extractor-02 doesn't
// import Jest
const x = new api_extractor_test_01_2.AmbientConsumer();
const y = x.definitelyTyped();
const z = y.results;
//# sourceMappingURL=index.js.map