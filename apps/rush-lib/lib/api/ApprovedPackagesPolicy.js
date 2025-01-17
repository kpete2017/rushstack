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
exports.ApprovedPackagesPolicy = void 0;
const path = __importStar(require("path"));
const ApprovedPackagesConfiguration_1 = require("./ApprovedPackagesConfiguration");
const RushConstants_1 = require("../logic/RushConstants");
/**
 * This is a helper object for RushConfiguration.
 * It exposes the "approvedPackagesPolicy" feature from rush.json.
 * @public
 */
class ApprovedPackagesPolicy {
    /** @internal */
    constructor(rushConfiguration, rushConfigurationJson) {
        const approvedPackagesPolicy = rushConfigurationJson.approvedPackagesPolicy || {};
        this._enabled = !!rushConfigurationJson.approvedPackagesPolicy;
        this._ignoredNpmScopes = new Set(approvedPackagesPolicy.ignoredNpmScopes);
        this._reviewCategories = new Set(approvedPackagesPolicy.reviewCategories);
        if (this._enabled) {
            if (!this.reviewCategories.size) {
                throw new Error(`The "approvedPackagesPolicy" feature is enabled rush.json, but the reviewCategories` +
                    ` list is not configured.`);
            }
        }
        // Load browser-approved-packages.json
        const browserApprovedPackagesPath = path.join(rushConfiguration.commonRushConfigFolder, RushConstants_1.RushConstants.browserApprovedPackagesFilename);
        this._browserApprovedPackages = new ApprovedPackagesConfiguration_1.ApprovedPackagesConfiguration(browserApprovedPackagesPath);
        this._browserApprovedPackages.tryLoadFromFile(this._enabled);
        // Load nonbrowser-approved-packages.json
        const nonbrowserApprovedPackagesPath = path.join(rushConfiguration.commonRushConfigFolder, RushConstants_1.RushConstants.nonbrowserApprovedPackagesFilename);
        this._nonbrowserApprovedPackages = new ApprovedPackagesConfiguration_1.ApprovedPackagesConfiguration(nonbrowserApprovedPackagesPath);
        this._nonbrowserApprovedPackages.tryLoadFromFile(this._enabled);
    }
    /**
     * Whether the feature is enabled.  The feature is enabled if the "approvedPackagesPolicy"
     * field is assigned in rush.json.
     */
    get enabled() {
        return this._enabled;
    }
    /**
     * A list of NPM package scopes that will be excluded from review (e.g. `@types`)
     */
    get ignoredNpmScopes() {
        return this._ignoredNpmScopes;
    }
    /**
     * A list of category names that are valid for usage as the RushConfigurationProject.reviewCategory field.
     * This array will never be undefined.
     */
    get reviewCategories() {
        return this._reviewCategories;
    }
    /**
     * Packages approved for usage in a web browser.  This is the stricter of the two types, so by default
     * all new packages are added to this file.
     *
     * @remarks
     *
     * This is part of an optional approval workflow, whose purpose is to review any new dependencies
     * that are introduced (e.g. maybe a legal review is required, or maybe we are trying to minimize bloat).
     * When Rush discovers a new dependency has been added to package.json, it will update the file.
     * The intent is that the file will be stored in Git and tracked by a branch policy that notifies
     * reviewers when a PR attempts to modify the file.
     *
     * Example filename: `C:\MyRepo\common\config\rush\browser-approved-packages.json`
     */
    get browserApprovedPackages() {
        return this._browserApprovedPackages;
    }
    /**
     * Packages approved for usage everywhere *except* in a web browser.
     *
     * @remarks
     *
     * This is part of an optional approval workflow, whose purpose is to review any new dependencies
     * that are introduced (e.g. maybe a legal review is required, or maybe we are trying to minimize bloat).
     * The intent is that the file will be stored in Git and tracked by a branch policy that notifies
     * reviewers when a PR attempts to modify the file.
     *
     * Example filename: `C:\MyRepo\common\config\rush\browser-approved-packages.json`
     */
    get nonbrowserApprovedPackages() {
        return this._nonbrowserApprovedPackages;
    }
}
exports.ApprovedPackagesPolicy = ApprovedPackagesPolicy;
//# sourceMappingURL=ApprovedPackagesPolicy.js.map