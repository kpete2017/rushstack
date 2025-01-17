"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
const HeftToolsCommandLineParser_1 = require("./cli/HeftToolsCommandLineParser");
// Launching via lib/start.js bypasses the version selector.  Use that for debugging Heft.
const parser = new HeftToolsCommandLineParser_1.HeftToolsCommandLineParser();
parser
    .execute()
    .then(() => {
    // This should be removed when the issue with aria not tearing down
    process.exit(process.exitCode === undefined ? 0 : process.exitCode);
})
    .catch((error) => {
    parser.terminal.writeErrorLine(error.toString());
    process.exit(1);
});
//# sourceMappingURL=start.js.map