import { IEventHooksJson } from './RushConfiguration';
/**
 * Events happen during Rush runs.
 * @beta
 */
export declare enum Event {
    /**
     * Pre Rush install event
     */
    preRushInstall = 1,
    /**
     * Post Rush install event
     */
    postRushInstall = 2,
    /**
     * Pre Rush build event
     */
    preRushBuild = 3,
    /**
     * Post Rush build event
     */
    postRushBuild = 4
}
/**
 * This class represents Rush event hooks configured for this repo.
 * Hooks are customized script actions that Rush executes when specific events occur.
 * The actions are expressed as a command-line that is executed using the operating system shell.
 * @beta
 */
export declare class EventHooks {
    private _hooks;
    /**
     * @internal
     */
    constructor(eventHooksJson: IEventHooksJson);
    /**
     * Return all the scripts associated with the specified event.
     * @param event - Rush event
     */
    get(event: Event): string[];
}
//# sourceMappingURL=EventHooks.d.ts.map