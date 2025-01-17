"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoadThemedStylesLoader = void 0;
const loaderUtils = require("loader-utils");
const loadedThemedStylesPath = require.resolve('@microsoft/load-themed-styles');
/**
 * This simple loader wraps the loading of CSS in script equivalent to
 *  require("load-themed-styles").loadStyles('... css text ...').
 *
 * @public
 */
class LoadThemedStylesLoader {
    constructor() {
        throw new Error('Constructing "LoadThemedStylesLoader" is not supported.');
    }
    static set loadedThemedStylesPath(value) {
        LoadThemedStylesLoader._loadedThemedStylesPath = value;
    }
    /**
     * Use this property to override the path to the `@microsoft/load-themed-styles` package.
     */
    static get loadedThemedStylesPath() {
        return LoadThemedStylesLoader._loadedThemedStylesPath;
    }
    /**
     * Reset the path to the `@microsoft/load-themed-styles package` to the default.
     */
    static resetLoadedThemedStylesPath() {
        LoadThemedStylesLoader._loadedThemedStylesPath = loadedThemedStylesPath;
    }
    static pitch(remainingRequest) {
        const { namedExport, async = false } = loaderUtils.getOptions(this) || {};
        let exportName = 'module.exports';
        if (namedExport) {
            exportName += `.${namedExport}`;
        }
        return [
            `var content = require(${loaderUtils.stringifyRequest(this, '!!' + remainingRequest)});`,
            `var loader = require(${JSON.stringify(LoadThemedStylesLoader._loadedThemedStylesPath)});`,
            '',
            'if(typeof content === "string") content = [[module.id, content]];',
            '',
            '// add the styles to the DOM',
            `for (var i = 0; i < content.length; i++) loader.loadStyles(content[i][1], ${async === true});`,
            '',
            `if(content.locals) ${exportName} = content.locals;`
        ].join('\n');
    }
}
exports.LoadThemedStylesLoader = LoadThemedStylesLoader;
LoadThemedStylesLoader._loadedThemedStylesPath = loadedThemedStylesPath;
//# sourceMappingURL=LoadThemedStylesLoader.js.map