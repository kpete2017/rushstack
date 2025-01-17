import { BaseShrinkwrapFile } from '../base/BaseShrinkwrapFile';
import { DependencySpecifier } from '../DependencySpecifier';
import { PackageManagerOptionsConfigurationBase, PnpmOptionsConfiguration, RushConfiguration } from '../../api/RushConfiguration';
import { IShrinkwrapFilePolicyValidatorOptions } from '../policy/ShrinkwrapFilePolicy';
import { IExperimentsJson } from '../../api/ExperimentsConfiguration';
import { RushConfigurationProject } from '../../api/RushConfigurationProject';
import { PnpmProjectShrinkwrapFile } from './PnpmProjectShrinkwrapFile';
export interface IPeerDependenciesMetaYaml {
    optional?: boolean;
}
export interface IPnpmShrinkwrapDependencyYaml {
    /** Information about the resolved package */
    resolution?: {
        /** The hash of the tarball, to ensure archive integrity */
        integrity: string;
        /** The name of the tarball, if this was from a TGX file */
        tarball?: string;
    };
    /** The list of dependencies and the resolved version */
    dependencies?: {
        [dependency: string]: string;
    };
    /** The list of optional dependencies and the resolved version */
    optionalDependencies?: {
        [dependency: string]: string;
    };
    /** The list of peer dependencies and the resolved version */
    peerDependencies?: {
        [dependency: string]: string;
    };
    /**
     * Used to indicate optional peer dependencies, as described in this RFC:
     * https://github.com/yarnpkg/rfcs/blob/master/accepted/0000-optional-peer-dependencies.md
     */
    peerDependenciesMeta?: {
        [dependency: string]: IPeerDependenciesMetaYaml;
    };
}
export interface IPnpmShrinkwrapImporterYaml {
    /** The list of resolved version numbers for direct dependencies */
    dependencies?: {
        [dependency: string]: string;
    };
    /** The list of resolved version numbers for dev dependencies */
    devDependencies?: {
        [dependency: string]: string;
    };
    /** The list of resolved version numbers for optional dependencies */
    optionalDependencies?: {
        [dependency: string]: string;
    };
    /** The list of specifiers used to resolve dependency versions */
    specifiers: {
        [dependency: string]: string;
    };
}
/**
 * This interface represents the raw pnpm-lock.YAML file
 * Example:
 *  {
 *    "dependencies": {
 *      "@rush-temp/project1": "file:./projects/project1.tgz"
 *    },
 *    "packages": {
 *      "file:projects/library1.tgz": {
 *        "dependencies: {
 *          "markdown": "0.5.0"
 *        },
 *        "name": "@rush-temp/library1",
 *        "resolution": {
 *          "tarball": "file:projects/library1.tgz"
 *        },
 *        "version": "0.0.0"
 *      },
 *      "markdown/0.5.0": {
 *        "resolution": {
 *          "integrity": "sha1-KCBbVlqK51kt4gdGPWY33BgnIrI="
 *        }
 *      }
 *    },
 *    "registry": "http://localhost:4873/",
 *    "shrinkwrapVersion": 3,
 *    "specifiers": {
 *      "@rush-temp/project1": "file:./projects/project1.tgz"
 *    }
 *  }
 */
export interface IPnpmShrinkwrapYaml {
    /** The list of resolved version numbers for direct dependencies */
    dependencies: {
        [dependency: string]: string;
    };
    /** The list of importers for local workspace projects */
    importers: {
        [relativePath: string]: IPnpmShrinkwrapImporterYaml;
    };
    /** The description of the solved graph */
    packages: {
        [dependencyVersion: string]: IPnpmShrinkwrapDependencyYaml;
    };
    /** URL of the registry which was used */
    registry: string;
    /** The list of specifiers used to resolve direct dependency versions */
    specifiers: {
        [dependency: string]: string;
    };
}
/**
 * Given an encoded "dependency key" from the PNPM shrinkwrap file, this parses it into an equivalent
 * DependencySpecifier.
 *
 * @returns a SemVer string, or undefined if the version specifier cannot be parsed
 */
export declare function parsePnpmDependencyKey(dependencyName: string, dependencyKey: string): DependencySpecifier | undefined;
export declare class PnpmShrinkwrapFile extends BaseShrinkwrapFile {
    readonly shrinkwrapFilename: string;
    readonly isWorkspaceCompatible: boolean;
    readonly registry: string;
    readonly dependencies: ReadonlyMap<string, string>;
    readonly importers: ReadonlyMap<string, IPnpmShrinkwrapImporterYaml>;
    readonly specifiers: ReadonlyMap<string, string>;
    readonly packages: ReadonlyMap<string, IPnpmShrinkwrapDependencyYaml>;
    private readonly _shrinkwrapJson;
    private _pnpmfileConfiguration;
    private constructor();
    static loadFromFile(shrinkwrapYamlFilename: string, pnpmOptions: PnpmOptionsConfiguration): PnpmShrinkwrapFile | undefined;
    getShrinkwrapHash(experimentsConfig?: IExperimentsJson): string;
    /** @override */
    validate(packageManagerOptionsConfig: PackageManagerOptionsConfigurationBase, policyOptions: IShrinkwrapFilePolicyValidatorOptions, experimentsConfig?: IExperimentsJson): void;
    /** @override */
    getTempProjectNames(): ReadonlyArray<string>;
    /**
     * Gets the path to the tarball file if the package is a tarball.
     * Returns undefined if the package entry doesn't exist or the package isn't a tarball.
     * Example of return value: file:projects/build-tools.tgz
     */
    getTarballPath(packageName: string): string | undefined;
    getTopLevelDependencyKey(dependencyName: string): string | undefined;
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
    getTopLevelDependencyVersion(dependencyName: string): DependencySpecifier | undefined;
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
    getTempProjectDependencyKey(tempProjectName: string): string | undefined;
    getShrinkwrapEntryFromTempProjectDependencyKey(tempProjectDependencyKey: string): IPnpmShrinkwrapDependencyYaml | undefined;
    getShrinkwrapEntry(name: string, version: string): IPnpmShrinkwrapDependencyYaml | undefined;
    /**
     * Serializes the PNPM Shrinkwrap file
     *
     * @override
     */
    protected serialize(): string;
    /**
     * Gets the resolved version number of a dependency for a specific temp project.
     * For PNPM, we can reuse the version that another project is using.
     * Note that this function modifies the shrinkwrap data if tryReusingPackageVersionsFromShrinkwrap is set to true.
     *
     * @override
     */
    protected tryEnsureDependencyVersion(dependencySpecifier: DependencySpecifier, tempProjectName: string): DependencySpecifier | undefined;
    /** @override */
    findOrphanedProjects(rushConfiguration: RushConfiguration): ReadonlyArray<string>;
    /** @override */
    getProjectShrinkwrap(project: RushConfigurationProject): PnpmProjectShrinkwrapFile | undefined;
    getImporterKeys(): ReadonlyArray<string>;
    getImporterKeyByPath(workspaceRoot: string, projectFolder: string): string;
    getImporter(importerKey: string): IPnpmShrinkwrapImporterYaml | undefined;
    /** @override */
    isWorkspaceProjectModified(project: RushConfigurationProject, variant?: string): boolean;
    /**
     * Gets the package description for a tempProject from the shrinkwrap file.
     */
    private _getPackageDescription;
    private _parsePnpmDependencyKey;
    private _serializeInternal;
}
//# sourceMappingURL=PnpmShrinkwrapFile.d.ts.map