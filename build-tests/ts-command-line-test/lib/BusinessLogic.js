"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusinessLogic = void 0;
class BusinessLogic {
    static doTheWork(force, protocol) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`Received parameters: force=${force}, protocol="${protocol}"`);
            console.log(`Business logic did the work.`);
        });
    }
    static configureLogger(verbose) {
        console.log(`Business logic configured the logger: verbose=${verbose}`);
    }
}
exports.BusinessLogic = BusinessLogic;
//# sourceMappingURL=BusinessLogic.js.map