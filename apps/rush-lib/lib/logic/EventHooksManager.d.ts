import { Event } from '../api/EventHooks';
import { RushConfiguration } from '../api/RushConfiguration';
export declare class EventHooksManager {
    private _rushConfiguration;
    private _eventHooks;
    private _commonTempFolder;
    constructor(rushConfiguration: RushConfiguration);
    handle(event: Event, isDebug: boolean, ignoreHooks: boolean): void;
}
//# sourceMappingURL=EventHooksManager.d.ts.map