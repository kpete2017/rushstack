"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.createColorGrid = void 0;
/**
 * This file is a little program that prints all of the colors to the console
 */
const index_1 = require("../../index");
function createColorGrid(attributeFunction) {
    const foregroundFunctions = [
        (text) => index_1.Colors._normalizeStringOrColorableSequence(text),
        index_1.Colors.black,
        index_1.Colors.white,
        index_1.Colors.gray,
        index_1.Colors.magenta,
        index_1.Colors.red,
        index_1.Colors.yellow,
        index_1.Colors.green,
        index_1.Colors.cyan,
        index_1.Colors.blue
    ];
    const backgroundFunctions = [
        (text) => index_1.Colors._normalizeStringOrColorableSequence(text),
        index_1.Colors.blackBackground,
        index_1.Colors.whiteBackground,
        index_1.Colors.grayBackground,
        index_1.Colors.magentaBackground,
        index_1.Colors.redBackground,
        index_1.Colors.yellowBackground,
        index_1.Colors.greenBackground,
        index_1.Colors.cyanBackground,
        index_1.Colors.blueBackground
    ];
    const lines = [];
    for (const backgroundFunction of backgroundFunctions) {
        const sequences = [];
        for (const foregroundFunction of foregroundFunctions) {
            let sequence = backgroundFunction(foregroundFunction('X'));
            if (attributeFunction) {
                sequence = attributeFunction(sequence);
            }
            sequences.push(sequence);
        }
        lines.push(sequences);
    }
    return lines;
}
exports.createColorGrid = createColorGrid;
//# sourceMappingURL=createColorGrid.js.map