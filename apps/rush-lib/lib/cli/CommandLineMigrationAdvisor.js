"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandLineMigrationAdvisor = void 0;
const safe_1 = __importDefault(require("colors/safe"));
const terminal_1 = require("@rushstack/terminal");
const RushConstants_1 = require("../logic/RushConstants");
class CommandLineMigrationAdvisor {
    // NOTE: THIS RUNS BEFORE THE REAL COMMAND-LINE PARSING.
    // TAKE EXTREME CARE THAT THE HEURISTICS CANNOT FALSELY MATCH A VALID COMMAND LINE.
    static checkArgv(argv) {
        // 0=node.exe, 1=script name
        const args = process.argv.slice(2);
        if (args.length > 0) {
            if (args[0] === 'generate') {
                CommandLineMigrationAdvisor._reportDeprecated('Instead of "rush generate", use "rush update" or "rush update --full".');
                return false;
            }
            if (args[0] === 'install') {
                if (args.indexOf('--full-clean') >= 0) {
                    CommandLineMigrationAdvisor._reportDeprecated('Instead of "rush install --full-clean", use "rush purge --unsafe".');
                    return false;
                }
                if (args.indexOf('-C') >= 0) {
                    CommandLineMigrationAdvisor._reportDeprecated('Instead of "rush install -C", use "rush purge --unsafe".');
                    return false;
                }
                if (args.indexOf('--clean') >= 0) {
                    CommandLineMigrationAdvisor._reportDeprecated('Instead of "rush install --clean", use "rush install --purge".');
                    return false;
                }
                if (args.indexOf('-c') >= 0) {
                    CommandLineMigrationAdvisor._reportDeprecated('Instead of "rush install -c", use "rush install --purge".');
                    return false;
                }
            }
        }
        // Everything is okay
        return true;
    }
    static _reportDeprecated(message) {
        console.error(safe_1.default.red(terminal_1.PrintUtilities.wrapWords('ERROR: You specified an outdated command-line that is no longer supported by this version of Rush:')));
        console.error(safe_1.default.yellow(terminal_1.PrintUtilities.wrapWords(message)));
        console.error();
        console.error(terminal_1.PrintUtilities.wrapWords(`For command-line help, type "rush -h".  For migration instructions,` +
            ` please visit ${RushConstants_1.RushConstants.rushWebSiteUrl}`));
    }
}
exports.CommandLineMigrationAdvisor = CommandLineMigrationAdvisor;
//# sourceMappingURL=CommandLineMigrationAdvisor.js.map