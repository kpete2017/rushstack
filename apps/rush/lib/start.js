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
// We're using a path-based import here to minimize the amount of code that is evaluated before
// we check to see if the Node.js version is too old. If, for whatever reason, Rush crashes with
// an old Node.js version when evaluating one of the more complex imports, we'll at least
// shown a meaningful error message.
const NodeJsCompatibility_1 = require("@microsoft/rush-lib/lib/logic/NodeJsCompatibility");
if (NodeJsCompatibility_1.NodeJsCompatibility.reportAncientIncompatibleVersion()) {
    // The Node.js version is known to have serious incompatibilities.  In that situation, the user
    // should downgrade Rush to an older release that supported their Node.js version.
    process.exit(1);
}
const alreadyReportedNodeTooNewError = NodeJsCompatibility_1.NodeJsCompatibility.warnAboutVersionTooNew({
    isRushLib: false,
    alreadyReportedNodeTooNewError: false
});
const safe_1 = __importDefault(require("colors/safe"));
const os = __importStar(require("os"));
const semver = __importStar(require("semver"));
const node_core_library_1 = require("@rushstack/node-core-library");
const rushLib = __importStar(require("@microsoft/rush-lib"));
const RushCommandSelector_1 = require("./RushCommandSelector");
const RushVersionSelector_1 = require("./RushVersionSelector");
const MinimalRushConfiguration_1 = require("./MinimalRushConfiguration");
// Load the configuration
const configuration = MinimalRushConfiguration_1.MinimalRushConfiguration.loadFromDefaultLocation();
const currentPackageVersion = node_core_library_1.PackageJsonLookup.loadOwnPackageJson(__dirname).version;
let rushVersionToLoad = undefined;
const previewVersion = process.env["RUSH_PREVIEW_VERSION" /* RUSH_PREVIEW_VERSION */];
if (previewVersion) {
    if (!semver.valid(previewVersion, false)) {
        console.error(safe_1.default.red(`Invalid value for RUSH_PREVIEW_VERSION environment variable: "${previewVersion}"`));
        process.exit(1);
    }
    rushVersionToLoad = previewVersion;
    const lines = [];
    lines.push(`*********************************************************************`, `* WARNING! THE "RUSH_PREVIEW_VERSION" ENVIRONMENT VARIABLE IS SET.  *`, `*                                                                   *`, `* You are previewing Rush version:        ${node_core_library_1.Text.padEnd(previewVersion, 25)} *`);
    if (configuration) {
        lines.push(`* The rush.json configuration asks for:   ${node_core_library_1.Text.padEnd(configuration.rushVersion, 25)} *`);
    }
    lines.push(`*                                                                   *`, `* To restore the normal behavior, unset the RUSH_PREVIEW_VERSION    *`, `* environment variable.                                             *`, `*********************************************************************`);
    console.error(lines.map((line) => safe_1.default.black(safe_1.default.bgYellow(line))).join(os.EOL));
}
else if (configuration) {
    rushVersionToLoad = configuration.rushVersion;
}
// If we are previewing an older Rush that doesn't understand the RUSH_PREVIEW_VERSION variable,
// then unset it.
if (rushVersionToLoad && semver.lt(rushVersionToLoad, '5.0.0-dev.18')) {
    delete process.env["RUSH_PREVIEW_VERSION" /* RUSH_PREVIEW_VERSION */];
}
// Rush is "managed" if its version and configuration are dictated by a repo's rush.json
const isManaged = !!configuration;
const launchOptions = { isManaged, alreadyReportedNodeTooNewError };
// If we're inside a repo folder, and it's requesting a different version, then use the RushVersionManager to
// install it
if (rushVersionToLoad && rushVersionToLoad !== currentPackageVersion) {
    const versionSelector = new RushVersionSelector_1.RushVersionSelector(currentPackageVersion);
    versionSelector
        .ensureRushVersionInstalledAsync(rushVersionToLoad, configuration, launchOptions)
        .catch((error) => {
        console.log(safe_1.default.red('Error: ' + error.message));
    });
}
else {
    // Otherwise invoke the rush-lib that came with this rush package
    RushCommandSelector_1.RushCommandSelector.execute(currentPackageVersion, rushLib, launchOptions);
}
//# sourceMappingURL=start.js.map