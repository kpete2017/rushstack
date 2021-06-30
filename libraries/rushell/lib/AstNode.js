"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.AstText = exports.AstVariableExpansion = exports.AstCompoundWord = exports.AstCommand = exports.AstAndIf = exports.AstScript = exports.AstBaseNode = void 0;
const TextRange_1 = require("./TextRange");
/**
 * Base class for all AST nodes.
 */
class AstBaseNode {
    constructor() {
        this.kind = "None" /* None */;
    }
    /**
     * Returns a diagnostic dump of the tree, showing the prefix/suffix/separator for
     * each node.
     */
    getDump(indent = '') {
        const nestedIndent = indent + '  ';
        let result = indent + `- ${this.kind}:\n`;
        const dumpText = this.getDumpText();
        if (dumpText) {
            result += nestedIndent + 'Value=' + JSON.stringify(dumpText) + '\n';
        }
        const fullRange = this.getFullRange();
        if (!fullRange.isEmpty()) {
            result += nestedIndent + 'Range=' + JSON.stringify(fullRange.toString()) + '\n';
        }
        const childNodes = this.getChildNodes();
        for (const child of childNodes) {
            result += child.getDump(nestedIndent);
        }
        return result;
    }
    getChildNodes() {
        const nodes = [];
        this.collectChildNodesInto(nodes);
        return nodes;
    }
    getFullRange() {
        if (this.range) {
            return this.range;
        }
        let encompassingRange = TextRange_1.TextRange.empty;
        for (const child of this.getChildNodes()) {
            encompassingRange = encompassingRange.getEncompassingRange(child.getFullRange());
        }
        return encompassingRange;
    }
    getDumpText() {
        return undefined;
    }
}
exports.AstBaseNode = AstBaseNode;
/**
 * Represents a complete script that can be executed.
 */
class AstScript extends AstBaseNode {
    constructor() {
        super(...arguments);
        this.kind = "Script" /* Script */;
    }
    /** @override */
    collectChildNodesInto(nodes) {
        if (this.body) {
            nodes.push(this.body);
        }
    }
}
exports.AstScript = AstScript;
/**
 * Represents the "&&" operator, which is used to join two individual commands.
 */
class AstAndIf extends AstBaseNode {
    constructor() {
        super(...arguments);
        this.kind = "AndIf" /* AndIf */;
    }
    /** @override */
    collectChildNodesInto(nodes) {
        if (this.firstCommand) {
            nodes.push(this.firstCommand);
        }
        if (this.secondCommand) {
            nodes.push(this.secondCommand);
        }
    }
}
exports.AstAndIf = AstAndIf;
/**
 * Represents a command.  For example, the name of an executable to be started.
 */
class AstCommand extends AstBaseNode {
    constructor() {
        super(...arguments);
        this.kind = "Command" /* Command */;
        this.arguments = [];
    }
    /** @override */
    collectChildNodesInto(nodes) {
        if (this.commandPath) {
            nodes.push(this.commandPath);
        }
        nodes.push(...this.arguments);
    }
}
exports.AstCommand = AstCommand;
/**
 * Represents a compound word, e.g. "--the-thing" or "./the/thing".
 */
class AstCompoundWord extends AstBaseNode {
    constructor() {
        super(...arguments);
        this.kind = "CompoundWord" /* CompoundWord */;
        this.parts = [];
    }
    /** @override */
    collectChildNodesInto(nodes) {
        nodes.push(...this.parts);
    }
}
exports.AstCompoundWord = AstCompoundWord;
/**
 * Represents an environment variable expansion expression, e.g. "${VARIABLE}"
 */
class AstVariableExpansion extends AstBaseNode {
    constructor() {
        super(...arguments);
        this.kind = "VariableExpansion" /* VariableExpansion */;
    }
    /** @override */
    collectChildNodesInto(nodes) {
        // no children
    }
}
exports.AstVariableExpansion = AstVariableExpansion;
/**
 * Represents some plain text.
 */
class AstText extends AstBaseNode {
    constructor() {
        super(...arguments);
        this.kind = "Text" /* Text */;
    }
    /** @override */
    collectChildNodesInto(nodes) {
        // no children
    }
    /** @override */
    getDumpText() {
        if (this.token) {
            return this.token.text;
        }
        return undefined;
    }
}
exports.AstText = AstText;
//# sourceMappingURL=AstNode.js.map