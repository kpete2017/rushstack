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
const nodeJsPath = __importStar(require("path"));
const Import_1 = require("../Import");
const PackageJsonLookup_1 = require("../PackageJsonLookup");
const Path_1 = require("../Path");
describe('Import', () => {
    const packageRoot = PackageJsonLookup_1.PackageJsonLookup.instance.tryGetPackageFolderFor(__dirname);
    describe('resolveModule', () => {
        it('returns an absolute path as-is', () => {
            const absolutePaths = ['/var/test/path'];
            for (const absolutePath of absolutePaths) {
                expect(Import_1.Import.resolveModule({ modulePath: absolutePath, baseFolderPath: __dirname })).toEqual(absolutePath);
            }
        });
        it('resolves a relative path', () => {
            expect(Import_1.Import.resolveModule({ modulePath: './baz', baseFolderPath: __dirname })).toEqual(nodeJsPath.join(__dirname, 'baz'));
            expect(Import_1.Import.resolveModule({ modulePath: '../baz', baseFolderPath: __dirname })).toEqual(nodeJsPath.resolve(__dirname, '..', 'baz'));
            expect(Import_1.Import.resolveModule({ modulePath: './baz/ban', baseFolderPath: __dirname })).toEqual(nodeJsPath.join(__dirname, 'baz', 'ban'));
            expect(Import_1.Import.resolveModule({ modulePath: '../baz/ban', baseFolderPath: __dirname })).toEqual(nodeJsPath.resolve(__dirname, '..', 'baz', 'ban'));
        });
        it('resolves a dependency', () => {
            expect(Path_1.Path.convertToSlashes(Import_1.Import.resolveModule({ modulePath: '@rushstack/heft', baseFolderPath: __dirname }))).toMatch(/node_modules\/@rushstack\/heft\/lib\/index.js$/);
        });
        it('resolves a path inside a dependency', () => {
            expect(Path_1.Path.convertToSlashes(Import_1.Import.resolveModule({
                modulePath: '@rushstack/heft/lib/start.js',
                baseFolderPath: __dirname
            }))).toMatch(/node_modules\/@rushstack\/heft\/lib\/start\.js$/);
        });
        it('resolves a dependency of a dependency', () => {
            expect(Path_1.Path.convertToSlashes(Import_1.Import.resolveModule({
                modulePath: '@rushstack/ts-command-line',
                baseFolderPath: nodeJsPath.join(packageRoot, 'node_modules', '@rushstack', 'heft')
            }))).toMatch(/node_modules\/@rushstack\/ts-command-line\/lib\/index\.js$/);
        });
        it('resolves a path inside a dependency of a dependency', () => {
            expect(Path_1.Path.convertToSlashes(Import_1.Import.resolveModule({
                modulePath: '@rushstack/ts-command-line/lib/Constants.js',
                baseFolderPath: nodeJsPath.join(packageRoot, 'node_modules', '@rushstack', 'heft')
            }))).toMatch(/node_modules\/@rushstack\/ts-command-line\/lib\/Constants\.js$/);
        });
        describe('allowSelfReference', () => {
            it('resolves a path inside this package with allowSelfReference turned on', () => {
                expect(Import_1.Import.resolveModule({
                    modulePath: '@rushstack/node-core-library',
                    baseFolderPath: __dirname,
                    allowSelfReference: true
                })).toEqual(packageRoot);
                expect(Import_1.Import.resolveModule({
                    modulePath: '@rushstack/node-core-library/lib/Constants.js',
                    baseFolderPath: __dirname,
                    allowSelfReference: true
                })).toEqual(nodeJsPath.join(packageRoot, 'lib', 'Constants.js'));
            });
            it('throws on an attempt to reference this package without allowSelfReference turned on', () => {
                expect(() => Import_1.Import.resolveModule({
                    modulePath: '@rushstack/node-core-library',
                    baseFolderPath: __dirname
                })).toThrowError(/^Cannot find module "@rushstack\/node-core-library" from ".+"\.$/);
                expect(() => Import_1.Import.resolveModule({
                    modulePath: '@rushstack/node-core-library/lib/Constants.js',
                    baseFolderPath: __dirname
                })).toThrowError(/^Cannot find module "@rushstack\/node-core-library\/lib\/Constants.js" from ".+"\.$/);
            });
        });
        describe('includeSystemModules', () => {
            it('resolves a system module with includeSystemModules turned on', () => {
                expect(Import_1.Import.resolveModule({ modulePath: 'http', baseFolderPath: __dirname, includeSystemModules: true })).toEqual('http');
            });
            it('throws on an attempt to resolve a system module without includeSystemModules turned on', () => {
                expect(() => Import_1.Import.resolveModule({ modulePath: 'http', baseFolderPath: __dirname })).toThrowError(/^Cannot find module "http" from ".+"\.$/);
            });
            it('throws on an attempt to resolve a path inside a system module with includeSystemModules turned on', () => {
                expect(() => Import_1.Import.resolveModule({
                    modulePath: 'http/foo/bar',
                    baseFolderPath: __dirname,
                    includeSystemModules: true
                })).toThrowError(/^Cannot find module "http\/foo\/bar" from ".+"\.$/);
            });
        });
    });
    describe('resolvePackage', () => {
        it('resolves a dependency', () => {
            expect(Import_1.Import.resolvePackage({ packageName: '@rushstack/heft', baseFolderPath: __dirname }).replace(/\\/g, '/')).toMatch(/node_modules\/@rushstack\/heft$/);
        });
        it('fails to resolve a path inside a dependency', () => {
            expect(() => Path_1.Path.convertToSlashes(Import_1.Import.resolvePackage({
                packageName: '@rushstack/heft/lib/start.js',
                baseFolderPath: __dirname
            }))).toThrowError(/^Cannot find package "@rushstack\/heft\/lib\/start.js" from ".+"\.$/);
        });
        it('resolves a dependency of a dependency', () => {
            expect(Path_1.Path.convertToSlashes(Import_1.Import.resolvePackage({
                packageName: '@rushstack/ts-command-line',
                baseFolderPath: nodeJsPath.join(packageRoot, 'node_modules', '@rushstack', 'heft')
            }))).toMatch(/node_modules\/@rushstack\/ts-command-line$/);
        });
        it('fails to resolve a path inside a dependency of a dependency', () => {
            expect(() => Path_1.Path.convertToSlashes(Import_1.Import.resolvePackage({
                packageName: '@rushstack/ts-command-line/lib/Constants.js',
                baseFolderPath: nodeJsPath.join(packageRoot, 'node_modules', '@rushstack', 'heft')
            }))).toThrowError(/^Cannot find package "@rushstack\/ts-command-line\/lib\/Constants.js" from ".+"\.$/);
        });
        describe('allowSelfReference', () => {
            it('resolves this package with allowSelfReference turned on', () => {
                expect(Import_1.Import.resolvePackage({
                    packageName: '@rushstack/node-core-library',
                    baseFolderPath: __dirname,
                    allowSelfReference: true
                })).toEqual(packageRoot);
            });
            it('fails to resolve a path inside this package with allowSelfReference turned on', () => {
                expect(() => Import_1.Import.resolvePackage({
                    packageName: '@rushstack/node-core-library/lib/Constants.js',
                    baseFolderPath: __dirname,
                    allowSelfReference: true
                })).toThrowError(/^Cannot find package "@rushstack\/node-core-library\/lib\/Constants.js" from ".+"\.$/);
            });
            it('throws on an attempt to reference this package without allowSelfReference turned on', () => {
                expect(() => Import_1.Import.resolvePackage({
                    packageName: '@rushstack/node-core-library',
                    baseFolderPath: __dirname
                })).toThrowError(/^Cannot find package "@rushstack\/node-core-library" from ".+"\.$/);
            });
        });
        describe('includeSystemModules', () => {
            it('resolves a system module with includeSystemModules turned on', () => {
                expect(Import_1.Import.resolvePackage({
                    packageName: 'http',
                    baseFolderPath: __dirname,
                    includeSystemModules: true
                })).toEqual('http');
            });
            it('throws on an attempt to resolve a system module without includeSystemModules turned on', () => {
                expect(() => Import_1.Import.resolvePackage({ packageName: 'http', baseFolderPath: __dirname })).toThrowError(/^Cannot find package "http" from ".+"\.$/);
            });
            it('throws on an attempt to resolve a path inside a system module with includeSystemModules turned on', () => {
                expect(() => Import_1.Import.resolvePackage({
                    packageName: 'http/foo/bar',
                    baseFolderPath: __dirname,
                    includeSystemModules: true
                })).toThrowError(/^Cannot find package "http\/foo\/bar" from ".+"\.$/);
            });
        });
    });
});
//# sourceMappingURL=Import.test.js.map