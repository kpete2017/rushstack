"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubclassWithImport = void 0;
const api_extractor_test_01_1 = require("api-extractor-test-01");
const RenamedReexportedClass_1 = require("./RenamedReexportedClass");
/**
 * Example of a class that inherits from an externally imported class.
 * @public
 */
class SubclassWithImport extends RenamedReexportedClass_1.RenamedReexportedClass {
    test() {
        console.log('test');
    }
}
__decorate([
    api_extractor_test_01_1.virtual
], SubclassWithImport.prototype, "test", null);
exports.SubclassWithImport = SubclassWithImport;
//# sourceMappingURL=SubclassWithImport.js.map