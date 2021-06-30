import { CollatedTerminal } from '@rushstack/stream-collator';
import { TaskStatus } from '../TaskStatus';
import { BaseBuilder, IBuilderContext } from '../BaseBuilder';
export declare class MockBuilder extends BaseBuilder {
    private readonly _action;
    readonly name: string;
    readonly hadEmptyScript: boolean;
    readonly isIncrementalBuildAllowed: boolean;
    constructor(name: string, action?: (terminal: CollatedTerminal) => Promise<TaskStatus>);
    executeAsync(context: IBuilderContext): Promise<TaskStatus>;
}
//# sourceMappingURL=MockBuilder.d.ts.map