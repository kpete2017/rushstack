import { BaseShrinkwrapFile } from '../base/BaseShrinkwrapFile';
import { DependencySpecifier } from '../DependencySpecifier';
import { RushConfigurationProject } from '../../api/RushConfigurationProject';
import { BaseProjectShrinkwrapFile } from '../base/BaseProjectShrinkwrapFile';
export declare class NpmShrinkwrapFile extends BaseShrinkwrapFile {
    readonly isWorkspaceCompatible: boolean;
    private _shrinkwrapJson;
    private constructor();
    static loadFromFile(shrinkwrapJsonFilename: string): NpmShrinkwrapFile | undefined;
    /** @override */
    getTempProjectNames(): ReadonlyArray<string>;
    /** @override */
    protected serialize(): string;
    /** @override */
    protected getTopLevelDependencyVersion(dependencyName: string): DependencySpecifier | undefined;
    /**
     * @param dependencyName the name of the dependency to get a version for
     * @param tempProjectName the name of the temp project to check for this dependency
     * @param versionRange Not used, just exists to satisfy abstract API contract
     * @override
     */
    protected tryEnsureDependencyVersion(dependencySpecifier: DependencySpecifier, tempProjectName: string): DependencySpecifier | undefined;
    /** @override */
    getProjectShrinkwrap(project: RushConfigurationProject): BaseProjectShrinkwrapFile | undefined;
    /** @override */
    isWorkspaceProjectModified(project: RushConfigurationProject, variant?: string): boolean;
}
//# sourceMappingURL=NpmShrinkwrapFile.d.ts.map