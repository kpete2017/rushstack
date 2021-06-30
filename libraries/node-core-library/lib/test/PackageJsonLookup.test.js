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
const PackageJsonLookup_1 = require("../PackageJsonLookup");
describe('PackageJsonLookup', () => {
    describe('basic tests', () => {
        test('', () => {
            expect(PackageJsonLookup_1.PackageJsonLookup.loadOwnPackageJson(__dirname).name).toEqual('@rushstack/node-core-library');
        });
        test('tryLoadPackageJsonFor() test', () => {
            const packageJsonLookup = new PackageJsonLookup_1.PackageJsonLookup();
            const sourceFilePath = path.join(__dirname, './test-data/example-package');
            const packageJson = packageJsonLookup.tryLoadPackageJsonFor(sourceFilePath);
            expect(packageJson).toBeDefined();
            if (packageJson) {
                expect(packageJson.name).toEqual('example-package');
                expect(packageJson.version).toEqual('1.0.0');
                // The "nonstandardField" should have been trimmed because loadExtraFields=false
                expect(packageJson).not.toHaveProperty('nonstandardField');
            }
        });
        test('tryLoadNodePackageJsonFor() test package with no version', () => {
            const packageJsonLookup = new PackageJsonLookup_1.PackageJsonLookup();
            const sourceFilePath = path.join(__dirname, './test-data/example-package-no-version');
            const packageJson = packageJsonLookup.tryLoadNodePackageJsonFor(sourceFilePath);
            expect(packageJson).toBeDefined();
            if (packageJson) {
                expect(packageJson.name).toEqual('example-package');
                expect(packageJson.version).not.toBeDefined();
                // The "nonstandardField" should have been trimmed because loadExtraFields=false
                expect(packageJson).not.toHaveProperty('nonstandardField');
            }
        });
        test('tryGetPackageFolderFor() test', () => {
            const packageJsonLookup = new PackageJsonLookup_1.PackageJsonLookup();
            const sourceFilePath = path.join(__dirname, './test-data/example-package/src/ExampleFile.txt');
            // Example: C:\rushstack\libraries\node-core-library\src\test\example-package
            const foundFolder = packageJsonLookup.tryGetPackageFolderFor(sourceFilePath);
            expect(foundFolder).toBeDefined();
            expect(foundFolder.search(/[\\/]example-package$/i)).toBeGreaterThan(0);
            const foundFile = packageJsonLookup.tryGetPackageJsonFilePathFor(sourceFilePath);
            expect(foundFile).toEqual(path.join(foundFolder || '', "package.json" /* PackageJson */));
        });
    });
});
//# sourceMappingURL=PackageJsonLookup.test.js.map