"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
const node_core_library_1 = require("@rushstack/node-core-library");
const RundownCommandLine_1 = require("./cli/RundownCommandLine");
const toolVersion = node_core_library_1.PackageJsonLookup.loadOwnPackageJson(__dirname).version;
console.log();
console.log(`Rundown ${toolVersion} - https://rushstack.io`);
console.log();
const commandLine = new RundownCommandLine_1.RundownCommandLine();
commandLine.execute().catch((error) => {
    console.error(error);
});
//# sourceMappingURL=start.js.map