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
exports.RushStackFeature = void 0;
const path = __importStar(require("path"));
const yaml = require("js-yaml");
const node_core_library_1 = require("@rushstack/node-core-library");
const api_documenter_1 = require("@microsoft/api-documenter");
class RushStackFeature extends api_documenter_1.MarkdownDocumenterFeature {
    constructor() {
        super(...arguments);
        this._apiItemsWithPages = new Set();
    }
    onInitialized() {
        console.log('RushStackFeature: onInitialized()');
    }
    onBeforeWritePage(eventArgs) {
        // Add the Jekyll header
        const header = [
            '---',
            'layout: page',
            'navigation_source: api_nav',
            'improve_this_button: false',
            '---',
            ''
        ].join('\n');
        eventArgs.pageContent = header + eventArgs.pageContent;
        this._apiItemsWithPages.add(eventArgs.apiItem);
    }
    onFinished(eventArgs) {
        const navigationFile = {
            api_nav: [
                {
                    title: 'API Reference',
                    url: '/pages/api/'
                }
            ]
        };
        this._buildNavigation(navigationFile.api_nav, this.context.apiModel);
        const navFilePath = path.join(this.context.outputFolder, '..', 'api_nav.yaml');
        const navFileContent = yaml.safeDump(navigationFile, { lineWidth: 120 });
        node_core_library_1.FileSystem.writeFile(navFilePath, navFileContent, { ensureFolderExists: true });
    }
    _buildNavigation(parentNodes, parentApiItem) {
        for (const apiItem of parentApiItem.members) {
            if (this._apiItemsWithPages.has(apiItem)) {
                const newNode = {
                    title: apiItem.displayName,
                    url: path.posix
                        .join('/pages/api/', this.context.documenter.getLinkForApiItem(apiItem))
                        .replace(/\.md$/, '')
                };
                parentNodes.push(newNode);
                const newNodeSubitems = [];
                this._buildNavigation(newNodeSubitems, apiItem);
                if (newNodeSubitems.length > 0) {
                    newNode.subitems = newNodeSubitems;
                }
            }
            else {
                this._buildNavigation(parentNodes, apiItem);
            }
        }
    }
}
exports.RushStackFeature = RushStackFeature;
//# sourceMappingURL=RushStackFeature.js.map