/**
 * Constants used by the Rush tool.
 *
 * @remarks
 *
 * These are NOT part of the public API surface for rush-lib.
 * The rationale is that we don't want people implementing custom parsers for
 * the Rush config files; instead, they should rely on the official APIs from rush-lib.
 */
export declare class RushConstants {
    /**
     * The filename ("browser-approved-packages.json") for an optional policy configuration file
     * that stores a list of NPM packages that have been approved for usage by Rush projects.
     * This is part of a pair of config files, one for projects that run in a web browser
     * (e.g. whose approval criteria mostly focuses on licensing and code size), and one for everywhere else
     * (e.g. tooling projects whose approval criteria mostly focuses on avoiding node_modules sprawl).
     */
    static readonly browserApprovedPackagesFilename: string;
    /**
     * The folder name ("changes") where change files will be stored.
     */
    static readonly changeFilesFolderName: string;
    /**
     * The filename ("nonbrowser-approved-packages.json") for an optional policy configuration file
     * that stores a list of NPM packages that have been approved for usage by Rush projects.
     * This is part of a pair of config files, one for projects that run in a web browser
     * (e.g. whose approval criteria mostly focuses on licensing and code size), and one for everywhere else
     * (e.g. tooling projects whose approval criteria mostly focuses on avoiding node_modules sprawl).
     */
    static readonly nonbrowserApprovedPackagesFilename: string;
    /**
     * The folder name ("common") where Rush's common data will be stored.
     */
    static readonly commonFolderName: string;
    /**
     * The NPM scope ("@rush-temp") that is used for Rush's temporary projects.
     */
    static readonly rushTempNpmScope: string;
    /**
     * The folder name ("temp") under the common folder, or under the .rush folder in each project's directory where
     * temporary files will be stored.
     * Example: `C:\MyRepo\common\temp`
     */
    static readonly rushTempFolderName: string;
    /**
     * The folder name ("projects") where temporary projects will be stored.
     * Example: `C:\MyRepo\common\temp\projects`
     */
    static readonly rushTempProjectsFolderName: string;
    /**
     * The folder name ("variants") under which named variant configurations for
     * alternate dependency sets may be found.
     * Example: "C:\MyRepo\common\config\rush\variants"
     */
    static readonly rushVariantsFolderName: string;
    /**
     * The filename ("npm-shrinkwrap.json") used to store an installation plan for the NPM package manger.
     */
    static readonly npmShrinkwrapFilename: string;
    /**
     * Number of installation attempts
     */
    static readonly defaultMaxInstallAttempts: number;
    /**
     * The filename ("pnpm-lock.yaml") used to store an installation plan for the PNPM package manger
     * (PNPM version 3.x and later).
     */
    static readonly pnpmV3ShrinkwrapFilename: string;
    /**
     * The filename ("pnpmfile.js") used to add custom configuration to PNPM (PNPM version 1.x and later).
     */
    static readonly pnpmfileV1Filename: string;
    /**
     * The filename (".pnpmfile.cjs") used to add custom configuration to PNPM (PNPM version 6.x and later).
     */
    static readonly pnpmfileV6Filename: string;
    /**
     * The filename ("shrinkwrap.yaml") used to store state for pnpm
     */
    static readonly yarnShrinkwrapFilename: string;
    /**
     * The folder name ("node_modules") where NPM installs its packages.
     */
    static readonly nodeModulesFolderName: string;
    /**
     * The filename ("pinned-versions.json") for an old configuration file that
     * that is no longer supported.
     *
     * @deprecated This feature has been superseded by the "preferredVersions" setting
     * in common-versions.json
     */
    static readonly pinnedVersionsFilename: string;
    /**
     * The filename ("common-versions.json") for an optional configuration file
     * that stores dependency version information that affects all projects in the repo.
     * This configuration file should go in the "common/config/rush" folder.
     */
    static readonly commonVersionsFilename: string;
    /**
     * The filename ("repo-state.json") for a file used by Rush to
     * store the state of various features as they stand in the repo.
     */
    static readonly repoStateFilename: string;
    /**
     * The name of the per-project folder where project-specific Rush files are stored. For example,
     * the package-deps files, which are used by commands to determine if a particular project needs to be rebuilt.
     */
    static readonly projectRushFolderName: string;
    /**
     * Custom command line configuration file, which is used by rush for implementing
     * custom command and options.
     */
    static readonly commandLineFilename: string;
    static readonly versionPoliciesFilename: string;
    /**
     * Experiments configuration file.
     */
    static readonly experimentsFilename: string;
    /**
     * The artifactory.json configuration file name.
     */
    static readonly artifactoryFilename: string;
    /**
     * Build cache configuration file.
     */
    static readonly buildCacheFilename: string;
    /**
     * Per-project configuration filename.
     */
    static readonly rushProjectConfigFilename: string;
    /**
     * The URL ("http://rushjs.io") for the Rush web site.
     */
    static readonly rushWebSiteUrl: string;
    /**
     * The name of the NPM package for the Rush tool ("@microsoft/rush").
     */
    static readonly rushPackageName: string;
    /**
     * The folder name ("rush-recycler") where Rush moves large folder trees
     * before asynchronously deleting them.
     */
    static readonly rushRecyclerFolderName: string;
    /**
     * The name of the file to drop in project-folder/.rush/temp/ containing a listing of the project's direct
     * and indirect dependencies. This is used to detect if a project's dependencies have changed since the last build.
     */
    static readonly projectShrinkwrapFilename: string;
    /**
     * The value of the "commandKind" property for a bulk command in command-line.json
     */
    static readonly bulkCommandKind: 'bulk';
    /**
     * The value of the "commandKind" property for a global command in command-line.json
     */
    static readonly globalCommandKind: 'global';
    /**
     * The name of the incremental build command.
     */
    static readonly buildCommandName: string;
    /**
     * The name of the non-incremental build command.
     */
    static readonly rebuildCommandName: string;
    static readonly updateCloudCredentialsCommandName: string;
    /**
     * When a hash generated that contains multiple input segments, this character may be used
     * to separate them to avoid issues like
     * crypto.createHash('sha1').update('a').update('bc').digest('hex') === crypto.createHash('sha1').update('ab').update('c').digest('hex')
     */
    static readonly hashDelimiter: string;
    /**
     * The name of the per-user Rush configuration data folder.
     */
    static readonly rushUserConfigurationFolderName: string;
}
//# sourceMappingURL=RushConstants.d.ts.map