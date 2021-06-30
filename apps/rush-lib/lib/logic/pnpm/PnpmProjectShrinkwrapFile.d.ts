import { BaseProjectShrinkwrapFile } from '../base/BaseProjectShrinkwrapFile';
import { PnpmShrinkwrapFile } from './PnpmShrinkwrapFile';
/**
 *
 */
export declare class PnpmProjectShrinkwrapFile extends BaseProjectShrinkwrapFile {
    /**
     * Generate and write the project shrinkwrap file to <project>/.rush/temp/shrinkwrap-deps.json.
     * @returns True if the project shrinkwrap was created or updated, false otherwise.
     */
    updateProjectShrinkwrapAsync(): Promise<void>;
    protected generateWorkspaceProjectShrinkwrapMap(): Map<string, string> | undefined;
    protected generateLegacyProjectShrinkwrapMap(): Map<string, string>;
    private _addDependencyRecursive;
    private _resolveAndAddPeerDependencies;
    /**
     * Save the current state of the object to project/.rush/temp/shrinkwrap-deps.json
     */
    protected saveAsync(projectShrinkwrapMap: Map<string, string>): Promise<void>;
    /**
     * @override
     */
    protected get shrinkwrapFile(): PnpmShrinkwrapFile;
}
//# sourceMappingURL=PnpmProjectShrinkwrapFile.d.ts.map