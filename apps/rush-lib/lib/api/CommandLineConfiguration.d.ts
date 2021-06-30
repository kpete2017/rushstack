import { CommandJson, ParameterJson } from './CommandLineJson';
/**
 * Custom Commands and Options for the Rush Command Line
 */
export declare class CommandLineConfiguration {
    private static _jsonSchema;
    readonly commands: CommandJson[];
    readonly parameters: ParameterJson[];
    static readonly defaultBuildCommandJson: CommandJson;
    static readonly defaultRebuildCommandJson: CommandJson;
    /**
     * Use CommandLineConfiguration.loadFromFile()
     */
    private constructor();
    /**
     * Loads the configuration from the specified file and applies any omitted default build
     * settings.  If the file does not exist, then an empty default instance is returned.
     * If the file contains errors, then an exception is thrown.
     */
    static loadFromFileOrDefault(jsonFilename: string): CommandLineConfiguration;
}
//# sourceMappingURL=CommandLineConfiguration.d.ts.map