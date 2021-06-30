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
exports.Constants = void 0;
const path = __importStar(require("path"));
const node_core_library_1 = require("@rushstack/node-core-library");
const lodash = __importStar(require("lodash"));
class Constants {
}
exports.Constants = Constants;
Constants.LOC_JSON_SCHEMA = node_core_library_1.JsonSchema.fromFile(path.resolve(__dirname, '..', 'schemas', 'locJson.schema.json'));
Constants.LOCALE_FILENAME_TOKEN = '[locale]';
Constants.LOCALE_FILENAME_TOKEN_REGEX = new RegExp(lodash.escapeRegExp(Constants.LOCALE_FILENAME_TOKEN), 'gi');
Constants.NO_LOCALE_SOURCE_MAP_FILENAME_TOKEN = '[no-locale-file]';
Constants.NO_LOCALE_SOURCE_MAP_FILENAME_TOKEN_REGEX = new RegExp(lodash.escapeRegExp(Constants.NO_LOCALE_SOURCE_MAP_FILENAME_TOKEN), 'gi');
Constants.STRING_PLACEHOLDER_PREFIX = '_LOCALIZED_STRING_f12dy0i7_n4bo_dqwj_39gf_sasqehjmihz9';
Constants.RESX_REGEX = /\.resx$/i;
Constants.LOC_JSON_REGEX = /\.loc\.json$/i;
Constants.RESX_OR_LOC_JSON_REGEX = /\.(resx|loc\.json)$/i;
Constants.STRING_PLACEHOLDER_LABEL = 'A';
Constants.LOCALE_NAME_PLACEHOLDER_LABEL = 'B';
Constants.JSONP_PLACEHOLDER_LABEL = 'C';
Constants.LOCALE_NAME_PLACEHOLDER = `${Constants.STRING_PLACEHOLDER_PREFIX}__${Constants.LOCALE_NAME_PLACEHOLDER_LABEL}_0`;
Constants.JSONP_PLACEHOLDER = `${Constants.STRING_PLACEHOLDER_PREFIX}__${Constants.JSONP_PLACEHOLDER_LABEL}+chunkId+_0`;
//# sourceMappingURL=Constants.js.map