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
exports.PnpmShrinkwrapFile = exports.parsePnpmDependencyKey = void 0;
const os = __importStar(require("os"));
const path = __importStar(require("path"));
const semver = __importStar(require("semver"));
const crypto_1 = __importDefault(require("crypto"));
const safe_1 = __importDefault(require("colors/safe"));
const node_core_library_1 = require("@rushstack/node-core-library");
const BaseShrinkwrapFile_1 = require("../base/BaseShrinkwrapFile");
const DependencySpecifier_1 = require("../DependencySpecifier");
const RushConfiguration_1 = require("../../api/RushConfiguration");
const PnpmYamlCommon_1 = require("./PnpmYamlCommon");
const RushConstants_1 = require("../RushConstants");
const PackageJsonEditor_1 = require("../../api/PackageJsonEditor");
const PnpmfileConfiguration_1 = require("./PnpmfileConfiguration");
const PnpmProjectShrinkwrapFile_1 = require("./PnpmProjectShrinkwrapFile");
const yamlModule = node_core_library_1.Import.lazy('js-yaml', require);
/**
 * Given an encoded "dependency key" from the PNPM shrinkwrap file, this parses it into an equivalent
 * DependencySpecifier.
 *
 * @returns a SemVer string, or undefined if the version specifier cannot be parsed
 */
function parsePnpmDependencyKey(dependencyName, dependencyKey) {
    if (!dependencyKey) {
        return undefined;
    }
    if (/^\w+:/.test(dependencyKey)) {
        // If it starts with an NPM scheme such as "file:projects/my-app.tgz", we don't support that
        return undefined;
    }
    // The package name parsed from the dependency key, or dependencyName if it was omitted.
    // Example: "@scope/depame"
    let parsedPackageName;
    // The trailing portion of the dependency key that includes the version and optional peer dependency path.
    // Example: "2.8.0/chai@3.5.0+sinon@1.17.7"
    let parsedInstallPath;
    // Example: "path.pkgs.visualstudio.com/@scope/depame/1.4.0"  --> 0="@scope/depame" 1="1.4.0"
    // Example: "/isarray/2.0.1"                                  --> 0="isarray"       1="2.0.1"
    // Example: "/sinon-chai/2.8.0/chai@3.5.0+sinon@1.17.7"       --> 0="sinon-chai"    1="2.8.0/chai@3.5.0+sinon@1.17.7"
    const packageNameMatch = /^[^\/]*\/((?:@[^\/]+\/)?[^\/]+)\/(.*)$/.exec(dependencyKey);
    if (packageNameMatch) {
        parsedPackageName = packageNameMatch[1];
        parsedInstallPath = packageNameMatch[2];
    }
    else {
        parsedPackageName = dependencyName;
        // Example: "23.6.0_babel-core@6.26.3"
        // Example: "23.6.0"
        parsedInstallPath = dependencyKey;
    }
    // The SemVer value
    // Example: "2.8.0"
    let parsedVersionPart;
    // Example: "23.6.0_babel-core@6.26.3" --> "23.6.0"
    // Example: "2.8.0/chai@3.5.0+sinon@1.17.7" --> "2.8.0"
    const versionMatch = /^([^\/_]+)[\/_]/.exec(parsedInstallPath);
    if (versionMatch) {
        parsedVersionPart = versionMatch[1];
    }
    else {
        // Example: "2.8.0"
        parsedVersionPart = parsedInstallPath;
    }
    // By this point, we expect parsedVersionPart to be a valid SemVer range
    if (!parsedVersionPart) {
        return undefined;
    }
    if (!semver.valid(parsedVersionPart)) {
        const urlRegex = /^(@?)([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}\/([^\/\\]+\/?)*([^\/\\]+)$/i;
        // Test for urls:
        // Examples:
        //     @github.com/abc/def/188ed64efd5218beda276e02f2277bf3a6b745b2
        //     github.com/abc/def/188ed64efd5218beda276e02f2277bf3a6b745b2
        //     github.com.au/abc/def/188ed64efd5218beda276e02f2277bf3a6b745b2
        //     bitbucket.com/abc/def/188ed64efd5218beda276e02f2277bf3a6b745b2
        //     bitbucket.co.in/abc/def/188ed64efd5218beda276e02f2277bf3a6b745b2
        if (urlRegex.test(dependencyKey)) {
            const dependencySpecifier = new DependencySpecifier_1.DependencySpecifier(dependencyName, dependencyKey);
            return dependencySpecifier;
        }
        else {
            return undefined;
        }
    }
    // Is it an alias for a different package?
    if (parsedPackageName === dependencyName) {
        // No, it's a regular dependency
        return new DependencySpecifier_1.DependencySpecifier(parsedPackageName, parsedVersionPart);
    }
    else {
        // If the parsed package name is different from the dependencyName, then this is an NPM package alias
        return new DependencySpecifier_1.DependencySpecifier(dependencyName, `npm:${parsedPackageName}@${parsedVersionPart}`);
    }
}
exports.parsePnpmDependencyKey = parsePnpmDependencyKey;
class PnpmShrinkwrapFile extends BaseShrinkwrapFile_1.BaseShrinkwrapFile {
    constructor(shrinkwrapJson, shrinkwrapFilename) {
        super();
        this.shrinkwrapFilename = shrinkwrapFilename;
        this._shrinkwrapJson = shrinkwrapJson;
        // Normalize the data
        this.registry = shrinkwrapJson.registry || '';
        this.dependencies = new Map(Object.entries(shrinkwrapJson.dependencies || {}));
        this.importers = new Map(Object.entries(shrinkwrapJson.importers || {}));
        this.specifiers = new Map(Object.entries(shrinkwrapJson.specifiers || {}));
        this.packages = new Map(Object.entries(shrinkwrapJson.packages || {}));
        // Importers only exist in workspaces
        this.isWorkspaceCompatible = this.importers.size > 0;
    }
    static loadFromFile(shrinkwrapYamlFilename, pnpmOptions) {
        try {
            if (!node_core_library_1.FileSystem.exists(shrinkwrapYamlFilename)) {
                return undefined; // file does not exist
            }
            const shrinkwrapContent = node_core_library_1.FileSystem.readFile(shrinkwrapYamlFilename);
            const parsedData = yamlModule.safeLoad(shrinkwrapContent);
            return new PnpmShrinkwrapFile(parsedData, shrinkwrapYamlFilename);
        }
        catch (error) {
            throw new Error(`Error reading "${shrinkwrapYamlFilename}":${os.EOL}  ${error.message}`);
        }
    }
    getShrinkwrapHash(experimentsConfig) {
        // The 'omitImportersFromPreventManualShrinkwrapChanges' experiment skips the 'importers' section
        // when computing the hash, since the main concern is changes to the overall external dependency footprint
        const { omitImportersFromPreventManualShrinkwrapChanges } = experimentsConfig || {};
        const shrinkwrapContent = this._serializeInternal(omitImportersFromPreventManualShrinkwrapChanges);
        return crypto_1.default.createHash('sha1').update(shrinkwrapContent).digest('hex');
    }
    /** @override */
    validate(packageManagerOptionsConfig, policyOptions, experimentsConfig) {
        super.validate(packageManagerOptionsConfig, policyOptions);
        if (!(packageManagerOptionsConfig instanceof RushConfiguration_1.PnpmOptionsConfiguration)) {
            throw new Error('The provided package manager options are not valid for PNPM shrinkwrap files.');
        }
        if (!policyOptions.allowShrinkwrapUpdates) {
            if (!policyOptions.repoState.isValid) {
                console.log(safe_1.default.red(`The ${RushConstants_1.RushConstants.repoStateFilename} file is invalid. There may be a merge conflict marker ` +
                    'in the file. You may need to run "rush update" to refresh its contents.') + os.EOL);
                throw new node_core_library_1.AlreadyReportedError();
            }
            // Only check the hash if allowShrinkwrapUpdates is false. If true, the shrinkwrap file
            // may have changed and the hash could be invalid.
            if (packageManagerOptionsConfig.preventManualShrinkwrapChanges) {
                if (!policyOptions.repoState.pnpmShrinkwrapHash) {
                    console.log(safe_1.default.red('The existing shrinkwrap file hash could not be found. You may need to run "rush update" to ' +
                        'populate the hash. See the "preventManualShrinkwrapChanges" setting documentation for details.') + os.EOL);
                    throw new node_core_library_1.AlreadyReportedError();
                }
                if (this.getShrinkwrapHash(experimentsConfig) !== policyOptions.repoState.pnpmShrinkwrapHash) {
                    console.log(safe_1.default.red('The shrinkwrap file hash does not match the expected hash. Please run "rush update" to ensure the ' +
                        'shrinkwrap file is up to date. See the "preventManualShrinkwrapChanges" setting documentation for ' +
                        'details.') + os.EOL);
                    throw new node_core_library_1.AlreadyReportedError();
                }
            }
        }
    }
    /** @override */
    getTempProjectNames() {
        return this._getTempProjectNames(this._shrinkwrapJson.dependencies || {});
    }
    /**
     * Gets the path to the tarball file if the package is a tarball.
     * Returns undefined if the package entry doesn't exist or the package isn't a tarball.
     * Example of return value: file:projects/build-tools.tgz
     */
    getTarballPath(packageName) {
        var _a;
        const dependency = this.packages.get(packageName);
        return (_a = dependency === null || dependency === void 0 ? void 0 : dependency.resolution) === null || _a === void 0 ? void 0 : _a.tarball;
    }
    getTopLevelDependencyKey(dependencyName) {
        return this.dependencies.get(dependencyName);
    }
    /**
     * Gets the version number from the list of top-level dependencies in the "dependencies" section
     * of the shrinkwrap file. Sample return values:
     *   '2.1.113'
     *   '1.9.0-dev.27'
     *   'file:projects/empty-webpart-project.tgz'
     *   undefined
     *
     * @override
     */
    getTopLevelDependencyVersion(dependencyName) {
        var _a;
        let value = this.dependencies.get(dependencyName);
        if (value) {
            // Getting the top level dependency version from a PNPM lockfile version 5.1
            // --------------------------------------------------------------------------
            //
            // 1) Top-level tarball dependency entries in pnpm-lock.yaml look like:
            //    '@rush-temp/sp-filepicker': 'file:projects/sp-filepicker.tgz_0ec79d3b08edd81ebf49cd19ca50b3f5'
            //    Then, it would be defined below:
            //    'file:projects/sp-filepicker.tgz_0ec79d3b08edd81ebf49cd19ca50b3f5':
            //      dependencies:
            //       '@microsoft/load-themed-styles': 1.10.7
            //       ...
            //      resolution:
            //       integrity: sha512-guuoFIc**==
            //       tarball: 'file:projects/sp-filepicker.tgz'
            //    Here, we are interested in the part 'file:projects/sp-filepicker.tgz'. Splitting by underscores is not the
            //    best way to get this because file names could have underscores in them. Instead, we could use the tarball
            //    field in the resolution section.
            // 2) Top-level non-tarball dependency entries in pnpm-lock.yaml would look like:
            //    '@rushstack/set-webpack-public-path-plugin': 2.1.133
            //    @microsoft/sp-build-node': 1.9.0-dev.27_typescript@2.9.2
            //    Here, we could just split by underscores and take the first part.
            // The below code is also compatible with lockfile versions < 5.1
            const dependency = this.packages.get(value);
            if (((_a = dependency === null || dependency === void 0 ? void 0 : dependency.resolution) === null || _a === void 0 ? void 0 : _a.tarball) && value.startsWith(dependency.resolution.tarball)) {
                return new DependencySpecifier_1.DependencySpecifier(dependencyName, dependency.resolution.tarball);
            }
            else {
                const underscoreIndex = value.indexOf('_');
                if (underscoreIndex >= 0) {
                    value = value.substr(0, underscoreIndex);
                }
            }
            return new DependencySpecifier_1.DependencySpecifier(dependencyName, value);
        }
        return undefined;
    }
    /**
     * The PNPM shrinkwrap file has top-level dependencies on the temp projects like this:
     *
     * ```
     * dependencies:
     *   '@rush-temp/my-app': 'file:projects/my-app.tgz_25c559a5921686293a001a397be4dce0'
     * packages:
     *   /@types/node/10.14.15:
     *     dev: false
     *   'file:projects/my-app.tgz_25c559a5921686293a001a397be4dce0':
     *     dev: false
     *     name: '@rush-temp/my-app'
     *     version: 0.0.0
     * ```
     *
     * We refer to 'file:projects/my-app.tgz_25c559a5921686293a001a397be4dce0' as the temp project dependency key
     * of the temp project '@rush-temp/my-app'.
     */
    getTempProjectDependencyKey(tempProjectName) {
        const tempProjectDependencyKey = this.dependencies.get(tempProjectName);
        return tempProjectDependencyKey ? tempProjectDependencyKey : undefined;
    }
    getShrinkwrapEntryFromTempProjectDependencyKey(tempProjectDependencyKey) {
        return this.packages.get(tempProjectDependencyKey);
    }
    getShrinkwrapEntry(name, version) {
        // Version can sometimes be in the form of a path that's already in the /name/version format.
        const packageId = version.indexOf('/') !== -1 ? version : `/${name}/${version}`;
        return this.packages.get(packageId);
    }
    /**
     * Serializes the PNPM Shrinkwrap file
     *
     * @override
     */
    serialize() {
        return this._serializeInternal(false);
    }
    /**
     * Gets the resolved version number of a dependency for a specific temp project.
     * For PNPM, we can reuse the version that another project is using.
     * Note that this function modifies the shrinkwrap data if tryReusingPackageVersionsFromShrinkwrap is set to true.
     *
     * @override
     */
    tryEnsureDependencyVersion(dependencySpecifier, tempProjectName) {
        // PNPM doesn't have the same advantage of NPM, where we can skip generate as long as the
        // shrinkwrap file puts our dependency in either the top of the node_modules folder
        // or underneath the package we are looking at.
        // This is because the PNPM shrinkwrap file describes the exact links that need to be created
        // to recreate the graph..
        // Because of this, we actually need to check for a version that this package is directly
        // linked to.
        const packageName = dependencySpecifier.packageName;
        const tempProjectDependencyKey = this.getTempProjectDependencyKey(tempProjectName);
        if (!tempProjectDependencyKey) {
            return undefined;
        }
        const packageDescription = this._getPackageDescription(tempProjectDependencyKey);
        if (!packageDescription ||
            !packageDescription.dependencies ||
            !packageDescription.dependencies.hasOwnProperty(packageName)) {
            return undefined;
        }
        const dependencyKey = packageDescription.dependencies[packageName];
        return this._parsePnpmDependencyKey(packageName, dependencyKey);
    }
    /** @override */
    findOrphanedProjects(rushConfiguration) {
        // The base shrinkwrap handles orphaned projects the same across all package managers,
        // but this is only valid for non-workspace installs
        if (!this.isWorkspaceCompatible) {
            return super.findOrphanedProjects(rushConfiguration);
        }
        const orphanedProjectPaths = [];
        for (const importerKey of this.getImporterKeys()) {
            // PNPM importer keys are relative paths from the workspace root, which is the common temp folder
            const rushProjectPath = path.resolve(rushConfiguration.commonTempFolder, importerKey);
            if (!rushConfiguration.tryGetProjectForPath(rushProjectPath)) {
                orphanedProjectPaths.push(rushProjectPath);
            }
        }
        return orphanedProjectPaths;
    }
    /** @override */
    getProjectShrinkwrap(project) {
        return new PnpmProjectShrinkwrapFile_1.PnpmProjectShrinkwrapFile(this, project);
    }
    getImporterKeys() {
        // Filter out the root importer used for the generated package.json in the root
        // of the install, since we do not use this.
        return [...this.importers.keys()].filter((k) => k !== '.');
    }
    getImporterKeyByPath(workspaceRoot, projectFolder) {
        return node_core_library_1.Path.convertToSlashes(path.relative(workspaceRoot, projectFolder));
    }
    getImporter(importerKey) {
        return this.importers.get(importerKey);
    }
    /** @override */
    isWorkspaceProjectModified(project, variant) {
        const importerKey = this.getImporterKeyByPath(project.rushConfiguration.commonTempFolder, project.projectFolder);
        const importer = this.getImporter(importerKey);
        if (!importer) {
            return true;
        }
        // First, let's transform the package.json using the pnpmfile
        const packageJson = project.packageJsonEditor.saveToObject();
        // Initialize the pnpmfile if it doesn't exist
        if (!this._pnpmfileConfiguration) {
            this._pnpmfileConfiguration = new PnpmfileConfiguration_1.PnpmfileConfiguration(project.rushConfiguration, { variant });
        }
        // Use a new PackageJsonEditor since it will classify each dependency type, making tracking the
        // found versions much simpler.
        const { dependencyList, devDependencyList } = PackageJsonEditor_1.PackageJsonEditor.fromObject(this._pnpmfileConfiguration.transform(packageJson), project.packageJsonEditor.filePath);
        // Then get the unique package names and map them to package versions.
        const dependencyVersions = new Map();
        for (const packageDependency of [...dependencyList, ...devDependencyList]) {
            // We will also filter out peer dependencies since these are not installed at development time.
            if (packageDependency.dependencyType === "peerDependencies" /* Peer */) {
                continue;
            }
            const foundDependency = dependencyVersions.get(packageDependency.name);
            if (!foundDependency) {
                dependencyVersions.set(packageDependency.name, packageDependency);
            }
            else {
                // Shrinkwrap will prioritize optional dependencies, followed by regular dependencies, with dev being
                // the least prioritized. We will only keep the most prioritized option.
                // See: https://github.com/pnpm/pnpm/blob/main/packages/lockfile-utils/src/satisfiesPackageManifest.ts
                switch (foundDependency.dependencyType) {
                    case "optionalDependencies" /* Optional */:
                        break;
                    case "dependencies" /* Regular */:
                        if (packageDependency.dependencyType === "optionalDependencies" /* Optional */) {
                            dependencyVersions.set(packageDependency.name, packageDependency);
                        }
                        break;
                    case "devDependencies" /* Dev */:
                        dependencyVersions.set(packageDependency.name, packageDependency);
                        break;
                }
            }
        }
        // Then validate that the dependency fields are as expected in the shrinkwrap to avoid false-negatives
        // when moving a package from one field to the other.
        for (const dependencyVersion of dependencyVersions.values()) {
            switch (dependencyVersion.dependencyType) {
                case "optionalDependencies" /* Optional */:
                    if (!importer.optionalDependencies || !importer.optionalDependencies[dependencyVersion.name])
                        return true;
                    break;
                case "dependencies" /* Regular */:
                    if (!importer.dependencies || !importer.dependencies[dependencyVersion.name])
                        return true;
                    break;
                case "devDependencies" /* Dev */:
                    if (!importer.devDependencies || !importer.devDependencies[dependencyVersion.name])
                        return true;
                    break;
            }
        }
        // Then validate the length matches between the importer and the dependency list, since duplicates are
        // a valid use-case. Importers will only take one of these values, so no need to do more work here.
        if (dependencyVersions.size !== Object.keys(importer.specifiers).length) {
            return true;
        }
        // Finally, validate that all values in the importer are also present in the dependency list.
        for (const [importerPackageName, importerVersionSpecifier] of Object.entries(importer.specifiers)) {
            const foundDependency = dependencyVersions.get(importerPackageName);
            if (!foundDependency || foundDependency.version !== importerVersionSpecifier) {
                return true;
            }
        }
        return false;
    }
    /**
     * Gets the package description for a tempProject from the shrinkwrap file.
     */
    _getPackageDescription(tempProjectDependencyKey) {
        const packageDescription = this.packages.get(tempProjectDependencyKey);
        return packageDescription && packageDescription.dependencies ? packageDescription : undefined;
    }
    _parsePnpmDependencyKey(dependencyName, pnpmDependencyKey) {
        if (pnpmDependencyKey) {
            const result = parsePnpmDependencyKey(dependencyName, pnpmDependencyKey);
            if (!result) {
                throw new Error(`Cannot parse PNPM shrinkwrap version specifier: "${pnpmDependencyKey}"` +
                    ` for "${dependencyName}"`);
            }
            return result;
        }
        else {
            return undefined;
        }
    }
    _serializeInternal(omitImporters = false) {
        // Ensure that if any of the top-level properties are provided but empty are removed. We populate the object
        // properties when we read the shrinkwrap but PNPM does not set these top-level properties unless they are present.
        const shrinkwrapToSerialize = {};
        for (const [key, value] of Object.entries(this._shrinkwrapJson)) {
            if (omitImporters && key === 'importers') {
                continue;
            }
            if (!value || typeof value !== 'object' || Object.keys(value).length > 0) {
                shrinkwrapToSerialize[key] = value;
            }
        }
        return yamlModule.safeDump(shrinkwrapToSerialize, PnpmYamlCommon_1.PNPM_SHRINKWRAP_YAML_FORMAT);
    }
}
exports.PnpmShrinkwrapFile = PnpmShrinkwrapFile;
//# sourceMappingURL=PnpmShrinkwrapFile.js.map