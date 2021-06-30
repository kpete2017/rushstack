"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.minifySingleFile = void 0;
const terser_1 = require("terser");
require("./Base54");
/**
 * The logic for Terser's default "some" comments setting for preservation
 * @see https://github.com/terser/terser/blob/8d8200c2331c695d37f139b5850b10b595bce1d8/lib/output.js#L164-170
 */
function isSomeComments(comment) {
    // multiline comment
    return ((comment.type === 'comment2' || comment.type === 'comment1') &&
        /@preserve|@lic|@cc_on|^\**!/i.test(comment.value));
}
/**
 * Minifies a single chunk of code. Factored out for reuse between ThreadPoolMinifier and SynchronousMinifier
 * Mutates terserOptions.output.comments to support comment extraction
 * @internal
 */
function minifySingleFile(request, terserOptions) {
    const extractedComments = [];
    const output = terserOptions.output || {};
    const { mangle: originalMangle } = terserOptions;
    const mangle = originalMangle === false ? false : typeof originalMangle === 'object' ? { ...originalMangle } : {};
    const finalOptions = {
        ...terserOptions,
        output,
        mangle
    };
    if (output.comments !== false) {
        /**
         * Comment extraction as performed by terser-webpack-plugin to ensure output parity in default configuration
         * @see https://github.com/webpack-contrib/terser-webpack-plugin/blob/master/src/minify.js#L129-142
         */
        output.comments = (astNode, comment) => {
            if (isSomeComments(comment)) {
                const commentText = comment.type === 'comment2' ? `/*${comment.value}*/\n` : `//${comment.value}\n`;
                extractedComments.push(commentText);
            }
            return false;
        };
    }
    const { code, nameForMap, hash, externals } = request;
    if (mangle && externals) {
        mangle.reserved = mangle.reserved ? externals.concat(mangle.reserved) : externals;
    }
    finalOptions.sourceMap = nameForMap
        ? {
            asObject: true
        }
        : false;
    const minified = terser_1.minify({
        [nameForMap || 'code']: code
    }, finalOptions);
    if (minified.error) {
        return {
            error: minified.error,
            code: undefined,
            map: undefined,
            hash,
            extractedComments: undefined
        };
    }
    return {
        error: undefined,
        code: minified.code,
        map: minified.map,
        hash,
        extractedComments
    };
}
exports.minifySingleFile = minifySingleFile;
//# sourceMappingURL=MinifySingleFile.js.map