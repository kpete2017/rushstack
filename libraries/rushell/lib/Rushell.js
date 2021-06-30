"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.Rushell = void 0;
const node_core_library_1 = require("@rushstack/node-core-library");
const Parser_1 = require("./Parser");
const Tokenizer_1 = require("./Tokenizer");
const ParseError_1 = require("./ParseError");
/**
 * The shell command interpreter.
 * @beta
 */
class Rushell {
    execute(script) {
        const tokenizer = new Tokenizer_1.Tokenizer(script);
        const parser = new Parser_1.Parser(tokenizer);
        const astScript = parser.parse();
        return this._evaluateNode(astScript);
    }
    _evaluateNode(astNode) {
        switch (astNode.kind) {
            case "CompoundWord" /* CompoundWord */:
                return { value: astNode.parts.map((x) => this._evaluateNode(x).value).join('') };
            case "Text" /* Text */:
                return { value: astNode.token.range.toString() };
            case "Script" /* Script */:
                if (astNode.body) {
                    return this._evaluateNode(astNode.body);
                }
                break;
            case "Command" /* Command */:
                return this._evaluateCommand(astNode);
            default:
                throw new ParseError_1.ParseError('Unsupported operation type: ' + astNode.kind, astNode.getFullRange());
        }
        return { value: '' };
    }
    _evaluateCommand(astCommand) {
        if (!astCommand.commandPath) {
            throw new ParseError_1.ParseError('Missing command path', astCommand.getFullRange());
        }
        const commandPathResult = this._evaluateNode(astCommand.commandPath);
        const commandArgResults = [];
        for (let i = 0; i < astCommand.arguments.length; ++i) {
            commandArgResults.push(this._evaluateNode(astCommand.arguments[i]));
        }
        const commandPath = commandPathResult.value;
        const commandArgs = commandArgResults.map((x) => x.value);
        const result = node_core_library_1.Executable.spawnSync(commandPath, commandArgs);
        return { value: result.stdout };
    }
}
exports.Rushell = Rushell;
//# sourceMappingURL=Rushell.js.map