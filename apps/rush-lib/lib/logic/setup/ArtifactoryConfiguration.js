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
exports.ArtifactoryConfiguration = void 0;
const path = __importStar(require("path"));
const node_core_library_1 = require("@rushstack/node-core-library");
/**
 * Use this class to load the "common/config/rush/artifactory.json" config file.
 * It configures the "rush setup" command.
 */
class ArtifactoryConfiguration {
    /**
     * @internal
     */
    constructor(jsonFileName) {
        this._jsonFileName = jsonFileName;
        this._setupJson = {
            packageRegistry: {
                enabled: false,
                registryUrl: '',
                artifactoryWebsiteUrl: ''
            }
        };
        if (node_core_library_1.FileSystem.exists(this._jsonFileName)) {
            this._setupJson = node_core_library_1.JsonFile.loadAndValidate(this._jsonFileName, ArtifactoryConfiguration._jsonSchema);
        }
    }
    /**
     * Get the experiments configuration.
     */
    get configuration() {
        return this._setupJson;
    }
}
exports.ArtifactoryConfiguration = ArtifactoryConfiguration;
ArtifactoryConfiguration._jsonSchema = node_core_library_1.JsonSchema.fromFile(path.resolve(__dirname, '..', '..', 'schemas', 'artifactory.schema.json'));
//# sourceMappingURL=ArtifactoryConfiguration.js.map