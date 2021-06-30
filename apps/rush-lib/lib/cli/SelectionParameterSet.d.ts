import { CommandLineParameterProvider } from '@rushstack/ts-command-line';
import { RushConfiguration } from '../api/RushConfiguration';
import { RushConfigurationProject } from '../api/RushConfigurationProject';
/**
 * This class is provides the set of command line parameters used to select projects
 * based on dependencies.
 *
 * It is a separate component such that unrelated actions can share the same parameters.
 */
export declare class SelectionParameterSet {
    private readonly _rushConfiguration;
    private readonly _fromProject;
    private readonly _impactedByProject;
    private readonly _impactedByExceptProject;
    private readonly _onlyProject;
    private readonly _toProject;
    private readonly _toExceptProject;
    private readonly _fromVersionPolicy;
    private readonly _toVersionPolicy;
    constructor(rushConfiguration: RushConfiguration, action: CommandLineParameterProvider);
    /**
     * Computes the set of selected projects based on all parameter values.
     *
     * If no parameters are specified, returns all projects in the Rush config file.
     */
    getSelectedProjects(): Set<RushConfigurationProject>;
    /**
     * Represents the selection as `--filter` parameters to pnpm.
     *
     * @remarks
     * This is a separate from the selection to allow the filters to be represented more concisely.
     *
     * @see https://pnpm.js.org/en/filtering
     */
    getPnpmFilterArguments(): string[];
    /**
     * Usage telemetry for selection parameters. Only saved locally, and if requested in the config.
     */
    getTelemetry(): {
        [key: string]: string;
    };
    /**
     * Computes the referents of parameters that accept a project identifier.
     * Handles '.', unscoped names, and scoped names.
     */
    private _evaluateProjectParameter;
    /**
     * Computes the set of available project names, for use by tab completion.
     */
    private _getProjectNames;
    /**
     * Computes the set of projects that have the specified version policy
     */
    private _evaluateVersionPolicyProjects;
}
//# sourceMappingURL=SelectionParameterSet.d.ts.map