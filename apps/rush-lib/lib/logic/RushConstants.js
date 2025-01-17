"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.RushConstants = void 0;
/**
 * Constants used by the Rush tool.
 *
 * @remarks
 *
 * These are NOT part of the public API surface for rush-lib.
 * The rationale is that we don't want people implementing custom parsers for
 * the Rush config files; instead, they should rely on the official APIs from rush-lib.
 */
class RushConstants {
}
exports.RushConstants = RushConstants;
/**
 * The filename ("browser-approved-packages.json") for an optional policy configuration file
 * that stores a list of NPM packages that have been approved for usage by Rush projects.
 * This is part of a pair of config files, one for projects that run in a web browser
 * (e.g. whose approval criteria mostly focuses on licensing and code size), and one for everywhere else
 * (e.g. tooling projects whose approval criteria mostly focuses on avoiding node_modules sprawl).
 */
RushConstants.browserApprovedPackagesFilename = 'browser-approved-packages.json';
/**
 * The folder name ("changes") where change files will be stored.
 */
RushConstants.changeFilesFolderName = 'changes';
/**
 * The filename ("nonbrowser-approved-packages.json") for an optional policy configuration file
 * that stores a list of NPM packages that have been approved for usage by Rush projects.
 * This is part of a pair of config files, one for projects that run in a web browser
 * (e.g. whose approval criteria mostly focuses on licensing and code size), and one for everywhere else
 * (e.g. tooling projects whose approval criteria mostly focuses on avoiding node_modules sprawl).
 */
RushConstants.nonbrowserApprovedPackagesFilename = 'nonbrowser-approved-packages.json';
/**
 * The folder name ("common") where Rush's common data will be stored.
 */
RushConstants.commonFolderName = 'common';
/**
 * The NPM scope ("@rush-temp") that is used for Rush's temporary projects.
 */
RushConstants.rushTempNpmScope = '@rush-temp';
/**
 * The folder name ("temp") under the common folder, or under the .rush folder in each project's directory where
 * temporary files will be stored.
 * Example: `C:\MyRepo\common\temp`
 */
RushConstants.rushTempFolderName = 'temp';
/**
 * The folder name ("projects") where temporary projects will be stored.
 * Example: `C:\MyRepo\common\temp\projects`
 */
RushConstants.rushTempProjectsFolderName = 'projects';
/**
 * The folder name ("variants") under which named variant configurations for
 * alternate dependency sets may be found.
 * Example: "C:\MyRepo\common\config\rush\variants"
 */
RushConstants.rushVariantsFolderName = 'variants';
/**
 * The filename ("npm-shrinkwrap.json") used to store an installation plan for the NPM package manger.
 */
RushConstants.npmShrinkwrapFilename = 'npm-shrinkwrap.json';
/**
 * Number of installation attempts
 */
RushConstants.defaultMaxInstallAttempts = 3;
/**
 * The filename ("pnpm-lock.yaml") used to store an installation plan for the PNPM package manger
 * (PNPM version 3.x and later).
 */
RushConstants.pnpmV3ShrinkwrapFilename = 'pnpm-lock.yaml';
/**
 * The filename ("pnpmfile.js") used to add custom configuration to PNPM (PNPM version 1.x and later).
 */
RushConstants.pnpmfileV1Filename = 'pnpmfile.js';
/**
 * The filename (".pnpmfile.cjs") used to add custom configuration to PNPM (PNPM version 6.x and later).
 */
RushConstants.pnpmfileV6Filename = '.pnpmfile.cjs';
/**
 * The filename ("shrinkwrap.yaml") used to store state for pnpm
 */
RushConstants.yarnShrinkwrapFilename = 'yarn.lock';
/**
 * The folder name ("node_modules") where NPM installs its packages.
 */
RushConstants.nodeModulesFolderName = 'node_modules';
/**
 * The filename ("pinned-versions.json") for an old configuration file that
 * that is no longer supported.
 *
 * @deprecated This feature has been superseded by the "preferredVersions" setting
 * in common-versions.json
 */
// NOTE: Although this is marked as "deprecated", we will probably never retire it,
// since we always want to report the warning when someone upgrades an old repo.
RushConstants.pinnedVersionsFilename = 'pinned-versions.json';
/**
 * The filename ("common-versions.json") for an optional configuration file
 * that stores dependency version information that affects all projects in the repo.
 * This configuration file should go in the "common/config/rush" folder.
 */
RushConstants.commonVersionsFilename = 'common-versions.json';
/**
 * The filename ("repo-state.json") for a file used by Rush to
 * store the state of various features as they stand in the repo.
 */
RushConstants.repoStateFilename = 'repo-state.json';
/**
 * The name of the per-project folder where project-specific Rush files are stored. For example,
 * the package-deps files, which are used by commands to determine if a particular project needs to be rebuilt.
 */
RushConstants.projectRushFolderName = '.rush';
/**
 * Custom command line configuration file, which is used by rush for implementing
 * custom command and options.
 */
RushConstants.commandLineFilename = 'command-line.json';
RushConstants.versionPoliciesFilename = 'version-policies.json';
/**
 * Experiments configuration file.
 */
RushConstants.experimentsFilename = 'experiments.json';
/**
 * The artifactory.json configuration file name.
 */
RushConstants.artifactoryFilename = 'artifactory.json';
/**
 * Build cache configuration file.
 */
RushConstants.buildCacheFilename = 'build-cache.json';
/**
 * Per-project configuration filename.
 */
RushConstants.rushProjectConfigFilename = 'rush-project.json';
/**
 * The URL ("http://rushjs.io") for the Rush web site.
 */
RushConstants.rushWebSiteUrl = 'https://rushjs.io';
/**
 * The name of the NPM package for the Rush tool ("@microsoft/rush").
 */
RushConstants.rushPackageName = '@microsoft/rush';
/**
 * The folder name ("rush-recycler") where Rush moves large folder trees
 * before asynchronously deleting them.
 */
RushConstants.rushRecyclerFolderName = 'rush-recycler';
/**
 * The name of the file to drop in project-folder/.rush/temp/ containing a listing of the project's direct
 * and indirect dependencies. This is used to detect if a project's dependencies have changed since the last build.
 */
RushConstants.projectShrinkwrapFilename = 'shrinkwrap-deps.json';
/**
 * The value of the "commandKind" property for a bulk command in command-line.json
 */
RushConstants.bulkCommandKind = 'bulk';
/**
 * The value of the "commandKind" property for a global command in command-line.json
 */
RushConstants.globalCommandKind = 'global';
/**
 * The name of the incremental build command.
 */
RushConstants.buildCommandName = 'build';
/**
 * The name of the non-incremental build command.
 */
RushConstants.rebuildCommandName = 'rebuild';
RushConstants.updateCloudCredentialsCommandName = 'update-cloud-credentials';
/**
 * When a hash generated that contains multiple input segments, this character may be used
 * to separate them to avoid issues like
 * crypto.createHash('sha1').update('a').update('bc').digest('hex') === crypto.createHash('sha1').update('ab').update('c').digest('hex')
 */
RushConstants.hashDelimiter = '|';
/**
 * The name of the per-user Rush configuration data folder.
 */
RushConstants.rushUserConfigurationFolderName = '.rush-user';
//# sourceMappingURL=RushConstants.js.map