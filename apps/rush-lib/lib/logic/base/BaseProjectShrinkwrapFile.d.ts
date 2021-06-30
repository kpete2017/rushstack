import { RushConfigurationProject } from '../../api/RushConfigurationProject';
import { BaseShrinkwrapFile } from './BaseShrinkwrapFile';
/**
 * This class handles creating the project/.rush/temp/shrinkwrap-deps.json file
 * which tracks the direct and indirect dependencies that a project consumes. This is used
 * to better determine which projects should be rebuilt when dependencies are updated.
 */
export declare abstract class BaseProjectShrinkwrapFile {
    readonly projectShrinkwrapFilePath: string;
    protected readonly project: RushConfigurationProject;
    private readonly _shrinkwrapFile;
    constructor(shrinkwrapFile: BaseShrinkwrapFile, project: RushConfigurationProject);
    /**
     * Get the fully-qualified path to the <project>/.rush/temp/shrinkwrap-deps.json
     * for the specified project.
     */
    static getFilePathForProject(project: RushConfigurationProject): string;
    /**
     * If the <project>/.rush/temp/shrinkwrap-deps.json file exists, delete it. Otherwise, do nothing.
     */
    deleteIfExistsAsync(): Promise<void>;
    /**
     * Generate and write the project shrinkwrap file to <project>/.rush/temp/shrinkwrap-deps.json.
     *
     * @virtual
     */
    abstract updateProjectShrinkwrapAsync(): Promise<void>;
    /**
     * The shrinkwrap file that the project shrinkwrap file is based off of.
     */
    protected get shrinkwrapFile(): BaseShrinkwrapFile;
}
//# sourceMappingURL=BaseProjectShrinkwrapFile.d.ts.map