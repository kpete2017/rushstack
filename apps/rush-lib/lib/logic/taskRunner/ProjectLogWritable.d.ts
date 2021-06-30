import { TerminalWritable, ITerminalChunk } from '@rushstack/terminal';
import { CollatedTerminal } from '@rushstack/stream-collator';
import { RushConfigurationProject } from '../../api/RushConfigurationProject';
export declare class ProjectLogWritable extends TerminalWritable {
    private readonly _project;
    private readonly _terminal;
    private _buildLogPath;
    private _errorLogPath;
    private _buildLogWriter;
    private _errorLogWriter;
    constructor(project: RushConfigurationProject, terminal: CollatedTerminal);
    protected onWriteChunk(chunk: ITerminalChunk): void;
    protected onClose(): void;
}
//# sourceMappingURL=ProjectLogWritable.d.ts.map