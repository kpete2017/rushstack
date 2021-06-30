import * as semver1 from 'semver';
import * as semver2 from 'semver';
import * as semver3 from 'semver';
/**
 * This definition references the "semver" module imported from \@types/semver.
 * @public
 */
export declare function importedModuleAsReturnType(): semver1.SemVer | undefined;
/**
 * An interface with a generic parameter.
 * @public
 */
export interface GenericInterface<T> {
    member: T;
}
/**
 * A generic parameter that references the "semver" module imported from \@types/semver.
 * @public
 */
export declare function importedModuleAsGenericParameter(): GenericInterface<semver2.SemVer> | undefined;
/**
 * A class that inherits from a type defined in the "semver" module imported from \@types/semver.
 * @public
 */
export declare class ImportedModuleAsBaseClass extends semver3.SemVer {
}
//# sourceMappingURL=TypeFromImportedModule.d.ts.map