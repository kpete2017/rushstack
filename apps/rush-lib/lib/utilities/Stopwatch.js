"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.Stopwatch = exports.StopwatchState = void 0;
const Utilities_1 = require("./Utilities");
/**
 * Used with the Stopwatch class.
 */
var StopwatchState;
(function (StopwatchState) {
    StopwatchState[StopwatchState["Stopped"] = 1] = "Stopped";
    StopwatchState[StopwatchState["Started"] = 2] = "Started";
})(StopwatchState = exports.StopwatchState || (exports.StopwatchState = {}));
/**
 * Represents a typical timer/stopwatch which keeps track
 * of elapsed time in between two events.
 */
class Stopwatch {
    constructor(getTime = Utilities_1.Utilities.getTimeInMs) {
        this._startTime = undefined;
        this._endTime = undefined;
        this._getTime = getTime;
        this._state = StopwatchState.Stopped;
    }
    /**
     * Static helper function which creates a stopwatch which is immediately started
     */
    static start() {
        return new Stopwatch().start();
    }
    get state() {
        return this._state;
    }
    /**
     * Starts the stopwatch. Note that if end() has been called,
     * reset() should be called before calling start() again.
     */
    start() {
        if (this._startTime !== undefined) {
            throw new Error('Call reset() before starting the Stopwatch');
        }
        this._startTime = this._getTime();
        this._endTime = undefined;
        this._state = StopwatchState.Started;
        return this;
    }
    /**
     * Stops executing the stopwatch and saves the current timestamp
     */
    stop() {
        this._endTime = this._startTime !== undefined ? this._getTime() : undefined;
        this._state = StopwatchState.Stopped;
        return this;
    }
    /**
     * Resets all values of the stopwatch back to the original
     */
    reset() {
        this._endTime = this._startTime = undefined;
        this._state = StopwatchState.Stopped;
        return this;
    }
    /**
     * Displays how long the stopwatch has been executing in a human readable format.
     */
    toString() {
        if (this._state === StopwatchState.Stopped && this._startTime === undefined) {
            return '0.00 seconds (stopped)';
        }
        const totalSeconds = this.duration;
        if (totalSeconds > 60) {
            const minutes = Math.floor(totalSeconds / 60);
            const seconds = totalSeconds % 60.0;
            return `${minutes.toFixed(0)} minute${minutes === 1 ? '' : 's'} ${seconds.toFixed(1)} seconds`;
        }
        else {
            return `${totalSeconds.toFixed(2)} seconds`;
        }
    }
    /**
     * Get the duration in seconds.
     */
    get duration() {
        if (this._startTime === undefined) {
            return 0;
        }
        const curTime = this._endTime !== undefined ? this._endTime : this._getTime();
        return (curTime - this._startTime) / 1000.0;
    }
}
exports.Stopwatch = Stopwatch;
//# sourceMappingURL=Stopwatch.js.map