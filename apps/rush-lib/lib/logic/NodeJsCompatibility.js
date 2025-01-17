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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NodeJsCompatibility = void 0;
const safe_1 = __importDefault(require("colors/safe"));
const semver = __importStar(require("semver"));
/**
 * This constant is the major version of the next LTS node Node.js release. This constant should be updated when
 * a new LTS version is added to Rush's support matrix.
 *
 * LTS schedule: https://nodejs.org/en/about/releases/
 * LTS versions: https://nodejs.org/en/download/releases/
 */
const UPCOMING_NODE_LTS_VERSION = 16;
const nodeVersion = process.versions.node;
const nodeMajorVersion = semver.major(nodeVersion);
/**
 * This class provides useful functions for warning if the current Node.js runtime isn't supported.
 *
 * @internal
 */
class NodeJsCompatibility {
    /**
     * This reports if the Node.js version is known to have serious incompatibilities.  In that situation, the user
     * should downgrade Rush to an older release that supported their Node.js version.
     */
    static reportAncientIncompatibleVersion() {
        // IMPORTANT: If this test fails, the Rush CLI front-end process will terminate with an error.
        // Only increment it when our code base is known to use newer features (e.g. "async"/"await") that
        // have no hope of working with older Node.js.
        if (semver.satisfies(nodeVersion, '< 8.9.0')) {
            console.error(safe_1.default.red(`Your version of Node.js (${nodeVersion}) is very old and incompatible with Rush. ` +
                `Please upgrade to the latest Long-Term Support (LTS) version.\n`));
            return true;
        }
        else {
            return false;
        }
    }
    /**
     * Detect whether the Node.js version is "supported" by the Rush maintainers.  We generally
     * only support versions that were "Long Term Support" (LTS) at the time when Rush was published.
     *
     * This is a warning only -- the user is free to ignore it and use Rush anyway.
     */
    static warnAboutCompatibilityIssues(options) {
        // Only show the first warning
        return (NodeJsCompatibility.reportAncientIncompatibleVersion() ||
            NodeJsCompatibility.warnAboutVersionTooNew(options) ||
            NodeJsCompatibility._warnAboutOddNumberedVersion() ||
            NodeJsCompatibility._warnAboutNonLtsVersion(options.rushConfiguration));
    }
    /**
     * Warn about a Node.js version that has not been tested yet with Rush.
     */
    static warnAboutVersionTooNew(options) {
        if (nodeMajorVersion >= UPCOMING_NODE_LTS_VERSION + 1) {
            if (!options.alreadyReportedNodeTooNewError) {
                // We are on a much newer release than we have tested and support
                if (options.isRushLib) {
                    console.warn(safe_1.default.yellow(`Your version of Node.js (${nodeVersion}) has not been tested with this release ` +
                        `of the Rush engine. Please consider upgrading the "rushVersion" setting in rush.json, ` +
                        `or downgrading Node.js.\n`));
                }
                else {
                    console.warn(safe_1.default.yellow(`Your version of Node.js (${nodeVersion}) has not been tested with this release ` +
                        `of Rush. Please consider installing a newer version of the "@microsoft/rush" ` +
                        `package, or downgrading Node.js.\n`));
                }
            }
            return true;
        }
        else {
            return false;
        }
    }
    static _warnAboutNonLtsVersion(rushConfiguration) {
        if (rushConfiguration && !rushConfiguration.suppressNodeLtsWarning && !NodeJsCompatibility.isLtsVersion) {
            console.warn(safe_1.default.yellow(`Your version of Node.js (${nodeVersion}) is not a Long-Term Support (LTS) release. ` +
                'These versions frequently have bugs. Please consider installing a stable release.\n'));
            return true;
        }
        else {
            return false;
        }
    }
    static _warnAboutOddNumberedVersion() {
        if (NodeJsCompatibility.isOddNumberedVersion) {
            console.warn(safe_1.default.yellow(`Your version of Node.js (${nodeVersion}) is an odd-numbered release. ` +
                `These releases frequently have bugs. Please consider installing a Long Term Support (LTS) ` +
                `version instead.\n`));
            return true;
        }
        else {
            return false;
        }
    }
    static get isLtsVersion() {
        return !!process.release.lts;
    }
    static get isOddNumberedVersion() {
        return nodeMajorVersion % 2 !== 0;
    }
}
exports.NodeJsCompatibility = NodeJsCompatibility;
//# sourceMappingURL=NodeJsCompatibility.js.map