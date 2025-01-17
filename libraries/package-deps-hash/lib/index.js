"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * This package builds a JSON object containing the git hashes of all files used to produce a given NPM package.
 * The {@link https://rushjs.io/ | Rush} tool uses this library to implement incremental build detection.
 *
 * @remarks
 *
 * For more info, please see the package {@link https://www.npmjs.com/package/@rushstack/package-deps-hash
 * | README}.
 *
 * @packageDocumentation
 */
var getPackageDeps_1 = require("./getPackageDeps");
Object.defineProperty(exports, "getPackageDeps", { enumerable: true, get: function () { return getPackageDeps_1.getPackageDeps; } });
Object.defineProperty(exports, "getGitHashForFiles", { enumerable: true, get: function () { return getPackageDeps_1.getGitHashForFiles; } });
//# sourceMappingURL=index.js.map