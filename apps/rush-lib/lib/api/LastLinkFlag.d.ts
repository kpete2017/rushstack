import { LastInstallFlag } from './LastInstallFlag';
import { RushConfiguration } from './RushConfiguration';
export declare const LAST_LINK_FLAG_FILE_NAME: string;
/**
 * A helper class for managing the last-link flag, which is persistent and
 * indicates that linking was completed successfully.
 * @internal
 */
export declare class LastLinkFlag extends LastInstallFlag {
    /**
     * @override
     */
    isValid(): boolean;
    /**
     * @override
     */
    checkValidAndReportStoreIssues(): boolean;
    protected get flagName(): string;
}
/**
 * A helper class for LastLinkFlag
 *
 * @internal
 */
export declare class LastLinkFlagFactory {
    /**
     * Gets the LastLink flag and sets the current state. This state is used to compare
     * against the last-known-good state tracked by the LastLink flag.
     * @param rushConfiguration - the configuration of the Rush repo to get the install
     * state from
     *
     * @internal
     */
    static getCommonTempFlag(rushConfiguration: RushConfiguration): LastLinkFlag;
}
//# sourceMappingURL=LastLinkFlag.d.ts.map