"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
/// <reference path="../typings/tsd.d.ts" />
/**
 * api-extractor-test-03
 *
 * Test scenarios for consuming a library (api-extractor-test-02) that consumes
 * an indirect dependency (api-extractor-test-01).
 */
const api_extractor_test_02_1 = require("api-extractor-test-02");
const subclassWithImport = new api_extractor_test_02_1.SubclassWithImport();
subclassWithImport.test();
console.log(subclassWithImport.getSelfReference().getValue());
//# sourceMappingURL=index.js.map