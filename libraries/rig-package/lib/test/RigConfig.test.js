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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const ajv_1 = __importDefault(require("ajv"));
const strip_json_comments_1 = __importDefault(require("strip-json-comments"));
const RigConfig_1 = require("../RigConfig");
const testProjectFolder = path.join(__dirname, 'test-project');
function expectEqualPaths(path1, path2) {
    if (path.relative(path1, path2) !== '') {
        fail('Expected paths to be equal:\npath1: ' + path1 + '\npath2: ' + path2);
    }
}
describe('RigConfig tests', () => {
    describe('loads a rig.json file', () => {
        function validate(rigConfig) {
            expectEqualPaths(rigConfig.projectFolderPath, testProjectFolder);
            expect(rigConfig.rigFound).toBe(true);
            expectEqualPaths(rigConfig.filePath, path.join(testProjectFolder, 'config/rig.json'));
            expect(rigConfig.rigProfile).toBe('web-app');
            expect(rigConfig.rigPackageName).toBe('example-rig');
            expect(rigConfig.relativeProfileFolderPath).toBe('profiles/web-app');
        }
        it('synchronously', () => {
            const rigConfig = RigConfig_1.RigConfig.loadForProjectFolder({ projectFolderPath: testProjectFolder });
            validate(rigConfig);
        });
        it('asynchronously', async () => {
            const rigConfig = await RigConfig_1.RigConfig.loadForProjectFolderAsync({
                projectFolderPath: testProjectFolder
            });
            validate(rigConfig);
        });
    });
    describe('handles a missing rig.json file', () => {
        function validate(rigConfig) {
            expectEqualPaths(rigConfig.projectFolderPath, __dirname);
            expect(rigConfig.rigFound).toBe(false);
            expect(rigConfig.filePath).toBe('');
            expect(rigConfig.rigProfile).toBe('');
            expect(rigConfig.rigPackageName).toBe('');
            expect(rigConfig.relativeProfileFolderPath).toBe('');
        }
        it('synchronously', () => {
            const rigConfig = RigConfig_1.RigConfig.loadForProjectFolder({ projectFolderPath: __dirname });
            validate(rigConfig);
        });
        it('asynchronously', async () => {
            const rigConfig = await RigConfig_1.RigConfig.loadForProjectFolderAsync({
                projectFolderPath: __dirname
            });
            validate(rigConfig);
        });
    });
    describe(`resolves the profile path`, () => {
        it('synchronously', () => {
            const rigConfig = RigConfig_1.RigConfig.loadForProjectFolder({
                projectFolderPath: testProjectFolder
            });
            expect(rigConfig.rigFound).toBe(true);
            expectEqualPaths(rigConfig.getResolvedProfileFolder(), path.join(testProjectFolder, 'node_modules/example-rig/profiles/web-app'));
        });
        it('asynchronously', async () => {
            const rigConfig = await RigConfig_1.RigConfig.loadForProjectFolderAsync({
                projectFolderPath: testProjectFolder
            });
            expect(rigConfig.rigFound).toBe(true);
            expectEqualPaths(await rigConfig.getResolvedProfileFolderAsync(), path.join(testProjectFolder, 'node_modules/example-rig/profiles/web-app'));
        });
    });
    describe(`reports an undefined profile`, () => {
        it('synchronously', () => {
            const rigConfig = RigConfig_1.RigConfig.loadForProjectFolder({
                projectFolderPath: testProjectFolder,
                overrideRigJsonObject: {
                    rigPackageName: 'example-rig',
                    rigProfile: 'missing-profile'
                }
            });
            expect(rigConfig.rigFound).toBe(true);
            expect(() => rigConfig.getResolvedProfileFolder()).toThrowError('The rig profile "missing-profile" is not defined by the rig package "example-rig"');
        });
        it('asynchronously', async () => {
            const rigConfig = await RigConfig_1.RigConfig.loadForProjectFolderAsync({
                projectFolderPath: testProjectFolder,
                overrideRigJsonObject: {
                    rigPackageName: 'example-rig',
                    rigProfile: 'missing-profile'
                }
            });
            await expect(rigConfig.getResolvedProfileFolderAsync()).rejects.toThrowError('The rig profile "missing-profile" is not defined by the rig package "example-rig"');
        });
    });
    describe(`resolves a config file path`, () => {
        it('synchronously', () => {
            const rigConfig = RigConfig_1.RigConfig.loadForProjectFolder({
                projectFolderPath: testProjectFolder
            });
            expect(rigConfig.rigFound).toBe(true);
            const resolvedPath = rigConfig.tryResolveConfigFilePath('example-config.json');
            expect(resolvedPath).toBeDefined();
            expectEqualPaths(resolvedPath, path.join(testProjectFolder, 'node_modules/example-rig/profiles/web-app/example-config.json'));
        });
        it('asynchronously', async () => {
            const rigConfig = await RigConfig_1.RigConfig.loadForProjectFolderAsync({
                projectFolderPath: testProjectFolder
            });
            expect(rigConfig.rigFound).toBe(true);
            const resolvedPath = await rigConfig.tryResolveConfigFilePathAsync('example-config.json');
            expect(resolvedPath).toBeDefined();
            expectEqualPaths(resolvedPath, path.join(testProjectFolder, 'node_modules/example-rig/profiles/web-app/example-config.json'));
        });
    });
    it('validates a rig.json file using the schema', () => {
        const rigConfigFilePath = path.join(testProjectFolder, 'config', 'rig.json');
        const ajv = new ajv_1.default({
            verbose: true,
            strictKeywords: true
        });
        // Delete our older "draft-04/schema" and use AJV's built-in schema
        // eslint-disable-next-line
        delete RigConfig_1.RigConfig.jsonSchemaObject['$schema'];
        // Compile our schema
        const validateRigFile = ajv.compile(RigConfig_1.RigConfig.jsonSchemaObject);
        // Load the rig.json file
        const rigConfigFileContent = fs.readFileSync(rigConfigFilePath).toString();
        const rigConfigJsonObject = JSON.parse(strip_json_comments_1.default(rigConfigFileContent));
        // Validate it against our schema
        const valid = validateRigFile(rigConfigJsonObject);
        expect(validateRigFile.errors).toMatchInlineSnapshot(`null`);
        expect(valid).toBe(true);
    });
});
//# sourceMappingURL=RigConfig.test.js.map