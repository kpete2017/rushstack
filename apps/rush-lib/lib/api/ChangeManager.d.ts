import { RushConfiguration } from './RushConfiguration';
/**
 * A class that helps with programmatically interacting with Rush's change files.
 * @public
 */
export declare class ChangeManager {
    /**
     * Creates a change file that has a 'none' type.
     * @param rushConfiguration - The rush configuration we are working with
     * @param projectName - The name of the project for which to create a change file
     * @param emailAddress - The email address which should be associated with this change
     * @returns the path to the file that was created, or undefined if no file was written
     */
    static createEmptyChangeFiles(rushConfiguration: RushConfiguration, projectName: string, emailAddress: string): string | undefined;
}
//# sourceMappingURL=ChangeManager.d.ts.map