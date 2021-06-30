"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const path = __importStar(require("path"));
const RushConfiguration_1 = require("../../api/RushConfiguration");
const Rush_1 = require("../../api/Rush");
const Telemetry_1 = require("../Telemetry");
describe('Telemetry', () => {
    it('adds data to store if telemetry is enabled', () => {
        const filename = path.resolve(path.join(__dirname, './telemetry/telemetryEnabled.json'));
        const rushConfig = RushConfiguration_1.RushConfiguration.loadFromConfigurationFile(filename);
        const telemetry = new Telemetry_1.Telemetry(rushConfig);
        const logData1 = {
            name: 'testData1',
            duration: 100,
            result: 'Succeeded',
            timestamp: new Date().getTime(),
            platform: process.platform,
            rushVersion: Rush_1.Rush.version
        };
        const logData2 = {
            name: 'testData2',
            duration: 100,
            result: 'Failed',
            timestamp: new Date().getTime(),
            platform: process.platform,
            rushVersion: Rush_1.Rush.version
        };
        telemetry.log(logData1);
        telemetry.log(logData2);
        expect(telemetry.store).toEqual([logData1, logData2]);
    });
    it('does not add data to store if telemetry is not enabled', () => {
        const filename = path.resolve(path.join(__dirname, './telemetry/telemetryNotEnabled.json'));
        const rushConfig = RushConfiguration_1.RushConfiguration.loadFromConfigurationFile(filename);
        const telemetry = new Telemetry_1.Telemetry(rushConfig);
        const logData = {
            name: 'testData',
            duration: 100,
            result: 'Succeeded',
            timestamp: new Date().getTime(),
            platform: process.platform,
            rushVersion: Rush_1.Rush.version
        };
        telemetry.log(logData);
        expect(telemetry.store).toEqual([]);
    });
    it('deletes data after flush', () => {
        const filename = path.resolve(path.join(__dirname, './telemetry/telemetryEnabled.json'));
        const rushConfig = RushConfiguration_1.RushConfiguration.loadFromConfigurationFile(filename);
        const telemetry = new Telemetry_1.Telemetry(rushConfig);
        const logData = {
            name: 'testData1',
            duration: 100,
            result: 'Succeeded',
            timestamp: new Date().getTime(),
            platform: process.platform,
            rushVersion: Rush_1.Rush.version
        };
        telemetry.log(logData);
        let logFile;
        let dataToWrite;
        telemetry.flush((file, data) => {
            logFile = file;
            dataToWrite = data;
        });
        expect(logFile.match(/telemetry_.*\.json/)).toBeDefined();
        expect(dataToWrite).toEqual(JSON.stringify([logData]));
        expect(telemetry.store).toEqual([]);
    });
    it('populates default fields', () => {
        const filename = path.resolve(path.join(__dirname, './telemetry/telemetryEnabled.json'));
        const rushConfig = RushConfiguration_1.RushConfiguration.loadFromConfigurationFile(filename);
        const telemetry = new Telemetry_1.Telemetry(rushConfig);
        const logData = {
            name: 'testData1',
            duration: 100,
            result: 'Succeeded'
        };
        telemetry.log(logData);
        const result = telemetry.store[0];
        expect(result.platform).toEqual(process.platform);
        expect(result.rushVersion).toEqual(Rush_1.Rush.version);
        expect(result.timestamp).toBeDefined();
    });
});
//# sourceMappingURL=Telemetry.test.js.map