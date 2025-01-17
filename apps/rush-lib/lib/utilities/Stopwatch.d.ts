/**
 * Used with the Stopwatch class.
 */
export declare enum StopwatchState {
    Stopped = 1,
    Started = 2
}
/**
 * Represents a typical timer/stopwatch which keeps track
 * of elapsed time in between two events.
 */
export declare class Stopwatch {
    private _startTime;
    private _endTime;
    private _state;
    private _getTime;
    constructor(getTime?: () => number);
    /**
     * Static helper function which creates a stopwatch which is immediately started
     */
    static start(): Stopwatch;
    get state(): StopwatchState;
    /**
     * Starts the stopwatch. Note that if end() has been called,
     * reset() should be called before calling start() again.
     */
    start(): Stopwatch;
    /**
     * Stops executing the stopwatch and saves the current timestamp
     */
    stop(): Stopwatch;
    /**
     * Resets all values of the stopwatch back to the original
     */
    reset(): Stopwatch;
    /**
     * Displays how long the stopwatch has been executing in a human readable format.
     */
    toString(): string;
    /**
     * Get the duration in seconds.
     */
    get duration(): number;
}
//# sourceMappingURL=Stopwatch.d.ts.map