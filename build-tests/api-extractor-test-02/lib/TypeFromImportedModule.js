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
exports.ImportedModuleAsBaseClass = exports.importedModuleAsGenericParameter = exports.importedModuleAsReturnType = void 0;
const semver3 = __importStar(require("semver"));
/**
 * This definition references the "semver" module imported from \@types/semver.
 * @public
 */
function importedModuleAsReturnType() {
    return undefined;
}
exports.importedModuleAsReturnType = importedModuleAsReturnType;
/**
 * A generic parameter that references the "semver" module imported from \@types/semver.
 * @public
 */
function importedModuleAsGenericParameter() {
    return undefined;
}
exports.importedModuleAsGenericParameter = importedModuleAsGenericParameter;
/**
 * A class that inherits from a type defined in the "semver" module imported from \@types/semver.
 * @public
 */
class ImportedModuleAsBaseClass extends semver3.SemVer {
}
exports.ImportedModuleAsBaseClass = ImportedModuleAsBaseClass;
//# sourceMappingURL=TypeFromImportedModule.js.map