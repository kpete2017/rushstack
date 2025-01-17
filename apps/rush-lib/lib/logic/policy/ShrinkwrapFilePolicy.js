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
exports.ShrinkwrapFilePolicy = void 0;
const os = __importStar(require("os"));
const ShrinkwrapFileFactory_1 = require("../ShrinkwrapFileFactory");
/**
 *  A policy that validates shrinkwrap files used by package managers.
 */
class ShrinkwrapFilePolicy {
    static validate(rushConfiguration, options) {
        console.log('Validating package manager shrinkwrap file.' + os.EOL);
        const shrinkwrapFile = ShrinkwrapFileFactory_1.ShrinkwrapFileFactory.getShrinkwrapFile(rushConfiguration.packageManager, rushConfiguration.packageManagerOptions, rushConfiguration.getCommittedShrinkwrapFilename(options.shrinkwrapVariant));
        if (!shrinkwrapFile) {
            console.log('Shrinkwrap file could not be found, skipping validation.' + os.EOL);
            return;
        }
        // Run shrinkwrap-specific validation
        shrinkwrapFile.validate(rushConfiguration.packageManagerOptions, Object.assign(Object.assign({}, options), { repoState: rushConfiguration.getRepoState(options.shrinkwrapVariant) }), rushConfiguration.experimentsConfiguration.configuration);
    }
}
exports.ShrinkwrapFilePolicy = ShrinkwrapFilePolicy;
//# sourceMappingURL=ShrinkwrapFilePolicy.js.map