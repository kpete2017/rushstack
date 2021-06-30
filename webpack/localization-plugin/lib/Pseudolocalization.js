"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Pseudolocalization = void 0;
const decache_1 = __importDefault(require("decache"));
class Pseudolocalization {
    static getPseudolocalizer(options) {
        // pseudolocale maintains static state, so we need to load it as isolated modules
        decache_1.default('pseudolocale');
        const pseudolocale = require('pseudolocale'); // eslint-disable-line
        pseudolocale.option = Object.assign(Object.assign({}, pseudolocale.option), options);
        return pseudolocale.str;
    }
}
exports.Pseudolocalization = Pseudolocalization;
//# sourceMappingURL=Pseudolocalization.js.map