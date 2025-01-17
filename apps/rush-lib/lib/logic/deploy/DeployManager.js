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
exports.DeployManager = void 0;
const safe_1 = __importDefault(require("colors/safe"));
const path = __importStar(require("path"));
const resolve = __importStar(require("resolve"));
const npmPacklist = __importStar(require("npm-packlist"));
const link_bins_1 = __importDefault(require("@pnpm/link-bins"));
// (Used only by the legacy code fragment in the resolve.sync() hook below)
const fsForResolve = __importStar(require("fs"));
const ignore_1 = __importDefault(require("ignore"));
const node_core_library_1 = require("@rushstack/node-core-library");
const DeployArchiver_1 = require("./DeployArchiver");
const SymlinkAnalyzer_1 = require("./SymlinkAnalyzer");
const DeployScenarioConfiguration_1 = require("./DeployScenarioConfiguration");
const PnpmfileConfiguration_1 = require("../pnpm/PnpmfileConfiguration");
const Utils_1 = require("./Utils");
/**
 * Manages the business logic for the "rush deploy" command.
 */
class DeployManager {
    constructor(rushConfiguration) {
        this._rushConfiguration = rushConfiguration;
        this._packageJsonLookup = new node_core_library_1.PackageJsonLookup();
    }
    /**
     * Recursively crawl the node_modules dependencies and collect the result in IDeployState.foldersToCopy.
     */
    _collectFoldersRecursive(packageJsonFolderPath, deployState) {
        const packageJsonRealFolderPath = node_core_library_1.FileSystem.getRealPath(packageJsonFolderPath);
        if (deployState.foldersToCopy.has(packageJsonRealFolderPath)) {
            // we've already seen this folder
            return;
        }
        deployState.foldersToCopy.add(packageJsonRealFolderPath);
        const originalPackageJson = node_core_library_1.JsonFile.load(path.join(packageJsonRealFolderPath, 'package.json'));
        const sourceFolderInfo = deployState.folderInfosByPath.get(node_core_library_1.FileSystem.getRealPath(packageJsonFolderPath));
        // Transform packageJson using pnpmfile.js if available
        const packageJson = deployState.pnpmfileConfiguration
            ? deployState.pnpmfileConfiguration.transform(originalPackageJson)
            : originalPackageJson;
        // Union of keys from regular dependencies, peerDependencies, optionalDependencies
        // (and possibly devDependencies if includeDevDependencies=true)
        const dependencyNamesToProcess = new Set();
        // Just the keys from optionalDependencies and peerDependencies
        const optionalDependencyNames = new Set();
        for (const name of Object.keys(packageJson.dependencies || {})) {
            dependencyNamesToProcess.add(name);
        }
        if (deployState.scenarioConfiguration.json.includeDevDependencies && (sourceFolderInfo === null || sourceFolderInfo === void 0 ? void 0 : sourceFolderInfo.isRushProject)) {
            for (const name of Object.keys(packageJson.devDependencies || {})) {
                dependencyNamesToProcess.add(name);
            }
        }
        for (const name of Object.keys(packageJson.peerDependencies || {})) {
            dependencyNamesToProcess.add(name);
            optionalDependencyNames.add(name); // consider peers optional, since they are so frequently broken
        }
        for (const name of Object.keys(packageJson.optionalDependencies || {})) {
            dependencyNamesToProcess.add(name);
            optionalDependencyNames.add(name);
        }
        if (sourceFolderInfo && sourceFolderInfo.isRushProject) {
            const projectSettings = sourceFolderInfo.projectSettings;
            if (projectSettings) {
                this._applyDependencyFilters(dependencyNamesToProcess, projectSettings.additionalDependenciesToInclude, projectSettings.dependenciesToExclude);
            }
        }
        for (const dependencyPackageName of dependencyNamesToProcess) {
            try {
                this._traceResolveDependency(dependencyPackageName, packageJsonRealFolderPath, deployState);
            }
            catch (resolveErr) {
                if (resolveErr.code === 'MODULE_NOT_FOUND' && optionalDependencyNames.has(dependencyPackageName)) {
                    // Ignore missing optional dependency
                    continue;
                }
                throw resolveErr;
            }
        }
        if (this._rushConfiguration.packageManager === 'pnpm' &&
            !deployState.scenarioConfiguration.json.omitPnpmWorkaroundLinks) {
            // Replicate the PNPM workaround links.
            // Only apply this logic for packages that were actually installed under the common/temp folder.
            if (node_core_library_1.Path.isUnder(packageJsonFolderPath, this._rushConfiguration.commonTempFolder)) {
                try {
                    // The PNPM workaround links are created in this folder.  We will resolve the current package
                    // from that location and collect any additional links encountered along the way.
                    const pnpmDotFolderPath = path.join(this._rushConfiguration.commonTempFolder, 'node_modules', '.pnpm');
                    // TODO: Investigate how package aliases are handled by PNPM in this case.  For example:
                    //
                    // "dependencies": {
                    //   "alias-name": "npm:real-name@^1.2.3"
                    // }
                    this._traceResolveDependency(packageJson.name, pnpmDotFolderPath, deployState);
                }
                catch (resolveErr) {
                    if (resolveErr.code === 'MODULE_NOT_FOUND') {
                        // The workaround link isn't guaranteed to exist, so ignore if it's missing
                        // NOTE: If you encounter this warning a lot, please report it to the Rush maintainers.
                        console.log('Ignoring missing PNPM workaround link for ' + packageJsonFolderPath);
                    }
                }
            }
        }
    }
    _applyDependencyFilters(allDependencyNames, additionalDependenciesToInclude = [], dependenciesToExclude = []) {
        // Track packages that got added/removed for reporting purposes
        const extraIncludedPackageNames = [];
        const extraExcludedPackageNames = [];
        for (const patternWithStar of dependenciesToExclude) {
            for (const dependency of allDependencyNames) {
                if (Utils_1.matchesWithStar(patternWithStar, dependency)) {
                    if (allDependencyNames.delete(dependency)) {
                        extraExcludedPackageNames.push(dependency);
                    }
                }
            }
        }
        for (const dependencyToInclude of additionalDependenciesToInclude) {
            if (!allDependencyNames.has(dependencyToInclude)) {
                allDependencyNames.add(dependencyToInclude);
                extraIncludedPackageNames.push(dependencyToInclude);
            }
        }
        if (extraIncludedPackageNames.length > 0) {
            extraIncludedPackageNames.sort();
            console.log('Extra dependencies included by settings: ' + extraIncludedPackageNames.join(', '));
        }
        if (extraExcludedPackageNames.length > 0) {
            extraExcludedPackageNames.sort();
            console.log('Extra dependencies excluded by settings: ' + extraExcludedPackageNames.join(', '));
        }
        return allDependencyNames;
    }
    _traceResolveDependency(packageName, startingFolder, deployState) {
        // The "resolve" library models the Node.js require() API, which gives precedence to "core" system modules
        // over an NPM package with the same name.  But we are traversing package.json dependencies, which never
        // refer to system modules.  Appending a "/" forces require() to look for the NPM package.
        const resolveSuffix = packageName + resolve.isCore(packageName) ? '/' : '';
        const resolvedDependency = resolve.sync(packageName + resolveSuffix, {
            basedir: startingFolder,
            preserveSymlinks: false,
            packageFilter: (pkg, dir) => {
                // point "main" at a file that is guaranteed to exist
                // This helps resolve packages such as @types/node that have no entry point
                pkg.main = './package.json';
                return pkg;
            },
            realpathSync: (filePath) => {
                // This code fragment is a modification of the documented default implementation from the "fs-extra" docs
                try {
                    const resolvedPath = fsForResolve.realpathSync(filePath);
                    deployState.symlinkAnalyzer.analyzePath(filePath);
                    return resolvedPath;
                }
                catch (realpathErr) {
                    if (realpathErr.code !== 'ENOENT') {
                        throw realpathErr;
                    }
                }
                return filePath;
            }
        });
        if (!resolvedDependency) {
            // This should not happen, since the resolve.sync() docs say it will throw an exception instead
            throw new node_core_library_1.InternalError(`Error resolving ${packageName} from ${startingFolder}`);
        }
        const dependencyPackageFolderPath = this._packageJsonLookup.tryGetPackageFolderFor(resolvedDependency);
        if (!dependencyPackageFolderPath) {
            throw new Error(`Error finding package.json folder for ${resolvedDependency}`);
        }
        this._collectFoldersRecursive(dependencyPackageFolderPath, deployState);
    }
    /**
     * Maps a file path from IDeployState.sourceRootFolder --> IDeployState.targetRootFolder
     *
     * Example input: "C:\MyRepo\libraries\my-lib"
     * Example output: "C:\MyRepo\common\deploy\libraries\my-lib"
     */
    _remapPathForDeployFolder(absolutePathInSourceFolder, deployState) {
        if (!node_core_library_1.Path.isUnderOrEqual(absolutePathInSourceFolder, deployState.sourceRootFolder)) {
            throw new Error(`Source path is not under ${deployState.sourceRootFolder}\n${absolutePathInSourceFolder}`);
        }
        const relativePath = path.relative(deployState.sourceRootFolder, absolutePathInSourceFolder);
        const absolutePathInTargetFolder = path.join(deployState.targetRootFolder, relativePath);
        return absolutePathInTargetFolder;
    }
    /**
     * Maps a file path from IDeployState.sourceRootFolder --> relative path
     *
     * Example input: "C:\MyRepo\libraries\my-lib"
     * Example output: "libraries/my-lib"
     */
    _remapPathForDeployMetadata(absolutePathInSourceFolder, deployState) {
        if (!node_core_library_1.Path.isUnderOrEqual(absolutePathInSourceFolder, deployState.sourceRootFolder)) {
            throw new Error(`Source path is not under ${deployState.sourceRootFolder}\n${absolutePathInSourceFolder}`);
        }
        const relativePath = path.relative(deployState.sourceRootFolder, absolutePathInSourceFolder);
        return node_core_library_1.Text.replaceAll(relativePath, '\\', '/');
    }
    /**
     * Copy one package folder to the deployment target folder.
     */
    _deployFolder(sourceFolderPath, deployState) {
        let useNpmIgnoreFilter = false;
        if (!deployState.scenarioConfiguration.json.includeNpmIgnoreFiles) {
            const sourceFolderInfo = deployState.folderInfosByPath.get(node_core_library_1.FileSystem.getRealPath(sourceFolderPath));
            if (sourceFolderInfo) {
                if (sourceFolderInfo.isRushProject) {
                    useNpmIgnoreFilter = true;
                }
            }
        }
        const targetFolderPath = this._remapPathForDeployFolder(sourceFolderPath, deployState);
        if (useNpmIgnoreFilter) {
            // Use npm-packlist to filter the files.  Using the WalkerSync class (instead of the sync() API) ensures
            // that "bundledDependencies" are not included.
            const walker = new npmPacklist.WalkerSync({
                path: sourceFolderPath
            });
            walker.start();
            const npmPackFiles = walker.result;
            const alreadyCopiedSourcePaths = new Set();
            for (const npmPackFile of npmPackFiles) {
                // In issue https://github.com/microsoft/rushstack/issues/2121 we found that npm-packlist sometimes returns
                // duplicate file paths, for example:
                //
                //   'dist//index.js'
                //   'dist/index.js'
                //
                // We can detect the duplicates by comparing the path.resolve() result.
                const copySourcePath = path.resolve(sourceFolderPath, npmPackFile);
                if (alreadyCopiedSourcePaths.has(copySourcePath)) {
                    continue;
                }
                alreadyCopiedSourcePaths.add(copySourcePath);
                const copyDestinationPath = path.join(targetFolderPath, npmPackFile);
                if (deployState.symlinkAnalyzer.analyzePath(copySourcePath).kind !== 'link') {
                    node_core_library_1.FileSystem.ensureFolder(path.dirname(copyDestinationPath));
                    node_core_library_1.FileSystem.copyFile({
                        sourcePath: copySourcePath,
                        destinationPath: copyDestinationPath,
                        alreadyExistsBehavior: "error" /* Error */
                    });
                }
            }
        }
        else {
            // use a simplistic "ignore" ruleset to filter the files
            const ignoreFilter = ignore_1.default();
            ignoreFilter.add([
                // The top-level node_modules folder is always excluded
                '/node_modules',
                // Also exclude well-known folders that can contribute a lot of unnecessary files
                '**/.git',
                '**/.svn',
                '**/.hg',
                '**/.DS_Store'
            ]);
            node_core_library_1.FileSystem.copyFiles({
                sourcePath: sourceFolderPath,
                destinationPath: targetFolderPath,
                alreadyExistsBehavior: "error" /* Error */,
                filter: (src, dest) => {
                    const relativeSrc = path.relative(sourceFolderPath, src);
                    if (!relativeSrc) {
                        return true; // don't filter sourceFolderPath itself
                    }
                    if (ignoreFilter.ignores(relativeSrc)) {
                        return false;
                    }
                    const stats = node_core_library_1.FileSystem.getLinkStatistics(src);
                    if (stats.isSymbolicLink()) {
                        deployState.symlinkAnalyzer.analyzePath(src);
                        return false;
                    }
                    else {
                        return true;
                    }
                }
            });
        }
    }
    /**
     * Create a symlink as described by the ILinkInfo object.
     */
    _deploySymlink(originalLinkInfo, deployState) {
        const linkInfo = {
            kind: originalLinkInfo.kind,
            linkPath: this._remapPathForDeployFolder(originalLinkInfo.linkPath, deployState),
            targetPath: this._remapPathForDeployFolder(originalLinkInfo.targetPath, deployState)
        };
        // Has the link target been created yet?  If not, we should try again later
        if (!node_core_library_1.FileSystem.exists(linkInfo.targetPath)) {
            return false;
        }
        const newLinkFolder = path.dirname(linkInfo.linkPath);
        node_core_library_1.FileSystem.ensureFolder(newLinkFolder);
        // Link to the relative path for symlinks
        const relativeTargetPath = path.relative(newLinkFolder, linkInfo.targetPath);
        // NOTE: This logic is based on NpmLinkManager._createSymlink()
        if (process.platform === 'win32') {
            if (linkInfo.kind === 'folderLink') {
                // For directories, we use a Windows "junction".  On Unix, this produces a regular symlink.
                node_core_library_1.FileSystem.createSymbolicLinkJunction({
                    linkTargetPath: relativeTargetPath,
                    newLinkPath: linkInfo.linkPath
                });
            }
            else {
                // For files, we use a Windows "hard link", because creating a symbolic link requires
                // administrator permission.
                // NOTE: We cannot use the relative path for hard links
                node_core_library_1.FileSystem.createHardLink({
                    linkTargetPath: relativeTargetPath,
                    newLinkPath: linkInfo.linkPath
                });
            }
        }
        else {
            // However hard links seem to cause build failures on Mac, so for all other operating systems
            // we use symbolic links for this case.
            if (linkInfo.kind === 'folderLink') {
                node_core_library_1.FileSystem.createSymbolicLinkFolder({
                    linkTargetPath: relativeTargetPath,
                    newLinkPath: linkInfo.linkPath
                });
            }
            else {
                node_core_library_1.FileSystem.createSymbolicLinkFile({
                    linkTargetPath: relativeTargetPath,
                    newLinkPath: linkInfo.linkPath
                });
            }
        }
        return true;
    }
    /**
     * Recursively apply the "additionalProjectToInclude" setting.
     */
    _collectAdditionalProjectsToInclude(includedProjectNamesSet, projectName, deployState) {
        if (includedProjectNamesSet.has(projectName)) {
            return;
        }
        includedProjectNamesSet.add(projectName);
        const projectSettings = deployState.scenarioConfiguration.projectJsonsByName.get(projectName);
        if (projectSettings && projectSettings.additionalProjectsToInclude) {
            for (const additionalProjectToInclude of projectSettings.additionalProjectsToInclude) {
                this._collectAdditionalProjectsToInclude(includedProjectNamesSet, additionalProjectToInclude, deployState);
            }
        }
    }
    /**
     * Write the common/deploy/deploy-metadata.json file.
     */
    _writeDeployMetadata(deployState) {
        const deployMetadataFilePath = path.join(deployState.targetRootFolder, 'deploy-metadata.json');
        const deployMetadataJson = {
            scenarioName: path.basename(deployState.scenarioFilePath),
            mainProjectName: deployState.mainProjectName,
            projects: [],
            links: []
        };
        deployState.folderInfosByPath.forEach((folderInfo) => {
            if (!folderInfo.isRushProject) {
                // It's not a Rush project
                return;
            }
            if (!deployState.foldersToCopy.has(folderInfo.folderPath)) {
                // It's not something we crawled
                return;
            }
            deployMetadataJson.projects.push({
                path: this._remapPathForDeployMetadata(folderInfo.folderPath, deployState)
            });
        });
        // Remap the links to be relative to target folder
        for (const absoluteLinkInfo of deployState.symlinkAnalyzer.reportSymlinks()) {
            const relativeInfo = {
                kind: absoluteLinkInfo.kind,
                linkPath: this._remapPathForDeployMetadata(absoluteLinkInfo.linkPath, deployState),
                targetPath: this._remapPathForDeployMetadata(absoluteLinkInfo.targetPath, deployState)
            };
            deployMetadataJson.links.push(relativeInfo);
        }
        node_core_library_1.JsonFile.save(deployMetadataJson, deployMetadataFilePath, {
            newlineConversion: "os" /* OsDefault */
        });
    }
    async _makeBinLinksAsync(deployState) {
        for (const [, folderInfo] of deployState.folderInfosByPath) {
            if (!folderInfo.isRushProject) {
                return;
            }
            const deployedPath = this._remapPathForDeployMetadata(folderInfo.folderPath, deployState);
            const projectFolder = path.join(deployState.targetRootFolder, deployedPath, 'node_modules');
            const projectBinFolder = path.join(deployState.targetRootFolder, deployedPath, 'node_modules', '.bin');
            await link_bins_1.default(projectFolder, projectBinFolder, {
                warn: (msg) => console.warn(safe_1.default.yellow(msg))
            });
        }
    }
    async _prepareDeploymentAsync(deployState) {
        // Calculate the set with additionalProjectsToInclude
        const includedProjectNamesSet = new Set();
        this._collectAdditionalProjectsToInclude(includedProjectNamesSet, deployState.mainProjectName, deployState);
        for (const rushProject of this._rushConfiguration.projects) {
            const projectFolder = node_core_library_1.FileSystem.getRealPath(rushProject.projectFolder);
            const projectSettings = deployState.scenarioConfiguration.projectJsonsByName.get(rushProject.packageName);
            deployState.folderInfosByPath.set(projectFolder, {
                folderPath: projectFolder,
                isRushProject: true,
                projectSettings
            });
        }
        for (const projectName of includedProjectNamesSet) {
            console.log(safe_1.default.cyan('Analyzing project: ') + projectName);
            const project = this._rushConfiguration.getProjectByName(projectName);
            if (!project) {
                throw new Error(`The project ${projectName} is not defined in rush.json`);
            }
            this._collectFoldersRecursive(project.projectFolder, deployState);
            console.log();
        }
        node_core_library_1.Sort.sortSet(deployState.foldersToCopy);
        console.log('Copying folders...');
        for (const folderToCopy of deployState.foldersToCopy) {
            this._deployFolder(folderToCopy, deployState);
        }
        console.log('Writing deploy-metadata.json');
        this._writeDeployMetadata(deployState);
        if (deployState.scenarioConfiguration.json.linkCreation === 'script') {
            console.log('Copying create-links.js');
            node_core_library_1.FileSystem.copyFile({
                sourcePath: path.join(__dirname, '../../scripts/create-links.js'),
                destinationPath: path.join(deployState.targetRootFolder, 'create-links.js'),
                alreadyExistsBehavior: "error" /* Error */
            });
        }
        if (deployState.scenarioConfiguration.json.linkCreation === 'default') {
            console.log('Creating symlinks...');
            const linksToCopy = deployState.symlinkAnalyzer.reportSymlinks();
            for (const linkToCopy of linksToCopy) {
                if (!this._deploySymlink(linkToCopy, deployState)) {
                    // TODO: If a symbolic link points to another symbolic link, then we should order the operations
                    // so that the intermediary target is created first.  This case was procrastinated because it does
                    // not seem to occur in practice.  If you encounter this, please report it.
                    throw new node_core_library_1.InternalError('Target does not exist: ' + JSON.stringify(linkToCopy, undefined, 2));
                }
            }
            await this._makeBinLinksAsync(deployState);
        }
        if (deployState.scenarioConfiguration.json.folderToCopy !== undefined) {
            const sourceFolderPath = path.resolve(this._rushConfiguration.rushJsonFolder, deployState.scenarioConfiguration.json.folderToCopy);
            node_core_library_1.FileSystem.copyFiles({
                sourcePath: sourceFolderPath,
                destinationPath: deployState.targetRootFolder,
                alreadyExistsBehavior: "error" /* Error */
            });
        }
        await DeployArchiver_1.DeployArchiver.createArchiveAsync(deployState);
    }
    /**
     * The main entry point for performing a deployment.
     */
    async deployAsync(mainProjectName, scenarioName, overwriteExisting, targetFolderParameter, createArchiveFilePath) {
        const scenarioFilePath = DeployScenarioConfiguration_1.DeployScenarioConfiguration.getConfigFilePath(scenarioName, this._rushConfiguration);
        const scenarioConfiguration = DeployScenarioConfiguration_1.DeployScenarioConfiguration.loadFromFile(scenarioFilePath, this._rushConfiguration);
        if (!mainProjectName) {
            if (scenarioConfiguration.json.deploymentProjectNames.length === 1) {
                // If there is only one project, then "--project" is optional
                mainProjectName = scenarioConfiguration.json.deploymentProjectNames[0];
            }
            else {
                throw new Error(`The ${path.basename(scenarioFilePath)} configuration specifies multiple items for` +
                    ` "deploymentProjectNames". Use the "--project" parameter to indicate the project to be deployed.`);
            }
        }
        else {
            if (scenarioConfiguration.json.deploymentProjectNames.indexOf(mainProjectName) < 0) {
                throw new Error(`The project "${mainProjectName}" does not appear in the list of "deploymentProjectNames"` +
                    ` from ${path.basename(scenarioFilePath)}.`);
            }
        }
        let targetRootFolder;
        if (targetFolderParameter) {
            targetRootFolder = path.resolve(targetFolderParameter);
            if (!node_core_library_1.FileSystem.exists(targetRootFolder)) {
                throw new Error('The specified target folder does not exist: ' + JSON.stringify(targetFolderParameter));
            }
        }
        else {
            targetRootFolder = path.join(this._rushConfiguration.commonFolder, 'deploy');
        }
        const sourceRootFolder = this._rushConfiguration.rushJsonFolder;
        console.log(safe_1.default.cyan('Deploying to target folder:  ') + targetRootFolder);
        console.log(safe_1.default.cyan('Main project for deployment: ') + mainProjectName + '\n');
        node_core_library_1.FileSystem.ensureFolder(targetRootFolder);
        // Is the target folder empty?
        if (node_core_library_1.FileSystem.readFolder(targetRootFolder).length > 0) {
            if (overwriteExisting) {
                console.log('Deleting target folder contents because "--overwrite" was specified...');
                node_core_library_1.FileSystem.ensureEmptyFolder(targetRootFolder);
                console.log();
            }
            else {
                throw new Error('The deploy target folder is not empty. You can specify "--overwrite"' +
                    ' to recursively delete all folder contents.');
            }
        }
        // If create archive is set, ensure it has a legal extension
        if (createArchiveFilePath && path.extname(createArchiveFilePath) !== '.zip') {
            throw new Error('The "--create-archive" parameter currently only supports archives with the .zip file extension.');
        }
        const deployState = {
            scenarioFilePath,
            scenarioConfiguration,
            mainProjectName,
            sourceRootFolder,
            targetRootFolder,
            foldersToCopy: new Set(),
            folderInfosByPath: new Map(),
            symlinkAnalyzer: new SymlinkAnalyzer_1.SymlinkAnalyzer(),
            pnpmfileConfiguration: this._rushConfiguration.packageManager === 'pnpm'
                ? new PnpmfileConfiguration_1.PnpmfileConfiguration(this._rushConfiguration)
                : undefined,
            createArchiveFilePath
        };
        await this._prepareDeploymentAsync(deployState);
        console.log('\n' + safe_1.default.green('The operation completed successfully.'));
    }
}
exports.DeployManager = DeployManager;
//# sourceMappingURL=DeployManager.js.map