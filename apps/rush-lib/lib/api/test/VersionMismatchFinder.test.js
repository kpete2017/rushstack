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
const VersionMismatchFinder_1 = require("../../logic/versionMismatch/VersionMismatchFinder");
const PackageJsonEditor_1 = require("../PackageJsonEditor");
const CommonVersionsConfiguration_1 = require("../CommonVersionsConfiguration");
const VersionMismatchFinderProject_1 = require("../../logic/versionMismatch/VersionMismatchFinderProject");
const VersionMismatchFinderCommonVersions_1 = require("../../logic/versionMismatch/VersionMismatchFinderCommonVersions");
/* eslint-disable @typescript-eslint/no-explicit-any */
describe('VersionMismatchFinder', () => {
    it('finds no mismatches if there are none', (done) => {
        const projectA = new VersionMismatchFinderProject_1.VersionMismatchFinderProject({
            packageName: 'A',
            packageJsonEditor: PackageJsonEditor_1.PackageJsonEditor.fromObject({
                dependencies: {
                    '@types/foo': '1.2.3',
                    karma: '0.0.1'
                }
            }, 'foo.json'),
            cyclicDependencyProjects: new Set()
        });
        const projectB = new VersionMismatchFinderProject_1.VersionMismatchFinderProject({
            packageName: 'B',
            packageJsonEditor: PackageJsonEditor_1.PackageJsonEditor.fromObject({
                dependencies: {
                    '@types/foo': '1.2.3',
                    karma: '0.0.1'
                }
            }, 'foo.json'),
            cyclicDependencyProjects: new Set()
        });
        const mismatchFinder = new VersionMismatchFinder_1.VersionMismatchFinder([projectA, projectB]);
        expect(mismatchFinder.numberOfMismatches).toEqual(0);
        expect(mismatchFinder.getMismatches()).toHaveLength(0);
        done();
    });
    it('finds a mismatch in two packages', (done) => {
        const projectA = new VersionMismatchFinderProject_1.VersionMismatchFinderProject({
            packageName: 'A',
            packageJsonEditor: PackageJsonEditor_1.PackageJsonEditor.fromObject({
                dependencies: {
                    '@types/foo': '1.2.3',
                    karma: '0.0.1'
                }
            }, 'foo.json'),
            cyclicDependencyProjects: new Set()
        });
        const projectB = new VersionMismatchFinderProject_1.VersionMismatchFinderProject({
            packageName: 'B',
            packageJsonEditor: PackageJsonEditor_1.PackageJsonEditor.fromObject({
                dependencies: {
                    '@types/foo': '2.0.0',
                    karma: '0.0.1'
                }
            }, 'foo.json'),
            cyclicDependencyProjects: new Set()
        });
        const mismatchFinder = new VersionMismatchFinder_1.VersionMismatchFinder([projectA, projectB]);
        expect(mismatchFinder.numberOfMismatches).toEqual(1);
        expect(mismatchFinder.getMismatches()).toHaveLength(1);
        expect(mismatchFinder.getMismatches()[0]).toEqual('@types/foo');
        expect(mismatchFinder.getVersionsOfMismatch('@types/foo').sort()).toEqual(['1.2.3', '2.0.0']);
        expect(mismatchFinder.getConsumersOfMismatch('@types/foo', '2.0.0')).toEqual([projectB]);
        expect(mismatchFinder.getConsumersOfMismatch('@types/foo', '1.2.3')).toEqual([projectA]);
        done();
    });
    it('ignores cyclic dependencies', (done) => {
        const projectA = new VersionMismatchFinderProject_1.VersionMismatchFinderProject({
            packageName: 'A',
            packageJsonEditor: PackageJsonEditor_1.PackageJsonEditor.fromObject({
                dependencies: {
                    '@types/foo': '1.2.3',
                    karma: '0.0.1'
                }
            }, 'foo.json'),
            cyclicDependencyProjects: new Set(['@types/foo'])
        });
        const projectB = new VersionMismatchFinderProject_1.VersionMismatchFinderProject({
            packageName: 'B',
            packageJsonEditor: PackageJsonEditor_1.PackageJsonEditor.fromObject({
                dependencies: {
                    '@types/foo': '2.0.0',
                    karma: '0.0.1'
                }
            }, 'foo.json'),
            cyclicDependencyProjects: new Set()
        });
        const mismatchFinder = new VersionMismatchFinder_1.VersionMismatchFinder([projectA, projectB]);
        expect(mismatchFinder.numberOfMismatches).toEqual(0);
        expect(mismatchFinder.getMismatches()).toHaveLength(0);
        done();
    });
    it("won't let you access mismatches that don\t exist", (done) => {
        const projectA = new VersionMismatchFinderProject_1.VersionMismatchFinderProject({
            packageName: 'A',
            packageJsonEditor: PackageJsonEditor_1.PackageJsonEditor.fromObject({
                dependencies: {
                    '@types/foo': '1.2.3',
                    karma: '0.0.1'
                }
            }, 'foo.json'),
            cyclicDependencyProjects: new Set()
        });
        const projectB = new VersionMismatchFinderProject_1.VersionMismatchFinderProject({
            packageName: 'B',
            packageJsonEditor: PackageJsonEditor_1.PackageJsonEditor.fromObject({
                dependencies: {
                    '@types/foo': '2.0.0',
                    karma: '0.0.1'
                }
            }, 'foo.json'),
            cyclicDependencyProjects: new Set()
        });
        const mismatchFinder = new VersionMismatchFinder_1.VersionMismatchFinder([projectA, projectB]);
        expect(mismatchFinder.getVersionsOfMismatch('@types/foobar')).toEqual(undefined);
        expect(mismatchFinder.getConsumersOfMismatch('@types/fobar', '2.0.0')).toEqual(undefined);
        expect(mismatchFinder.getConsumersOfMismatch('@types/foo', '9.9.9')).toEqual(undefined);
        done();
    });
    it('finds two mismatches in two different pairs of projects', (done) => {
        const projectA = new VersionMismatchFinderProject_1.VersionMismatchFinderProject({
            packageName: 'A',
            packageJsonEditor: PackageJsonEditor_1.PackageJsonEditor.fromObject({
                dependencies: {
                    '@types/foo': '1.2.3',
                    karma: '0.0.1'
                }
            }, 'foo.json'),
            cyclicDependencyProjects: new Set()
        });
        const projectB = new VersionMismatchFinderProject_1.VersionMismatchFinderProject({
            packageName: 'B',
            packageJsonEditor: PackageJsonEditor_1.PackageJsonEditor.fromObject({
                dependencies: {
                    '@types/foo': '2.0.0',
                    karma: '0.0.1'
                }
            }, 'foo.json'),
            cyclicDependencyProjects: new Set()
        });
        const projectC = new VersionMismatchFinderProject_1.VersionMismatchFinderProject({
            packageName: 'C',
            packageJsonEditor: PackageJsonEditor_1.PackageJsonEditor.fromObject({
                dependencies: {
                    mocha: '1.2.3',
                    karma: '0.0.1'
                }
            }, 'foo.json'),
            cyclicDependencyProjects: new Set()
        });
        const projectD = new VersionMismatchFinderProject_1.VersionMismatchFinderProject({
            packageName: 'D',
            packageJsonEditor: PackageJsonEditor_1.PackageJsonEditor.fromObject({
                dependencies: {
                    mocha: '2.0.0',
                    karma: '0.0.1'
                }
            }, 'foo.json'),
            cyclicDependencyProjects: new Set()
        });
        const mismatchFinder = new VersionMismatchFinder_1.VersionMismatchFinder([
            projectA,
            projectB,
            projectC,
            projectD
        ]);
        expect(mismatchFinder.numberOfMismatches).toEqual(2);
        expect(mismatchFinder.getMismatches()).toHaveLength(2);
        expect(mismatchFinder.getMismatches()).toMatchObject(['@types/foo', 'mocha']);
        expect(mismatchFinder.getVersionsOfMismatch('@types/foo').sort()).toEqual(['1.2.3', '2.0.0']);
        expect(mismatchFinder.getVersionsOfMismatch('mocha').sort()).toEqual(['1.2.3', '2.0.0']);
        expect(mismatchFinder.getConsumersOfMismatch('@types/foo', '1.2.3')).toEqual([projectA]);
        expect(mismatchFinder.getConsumersOfMismatch('@types/foo', '2.0.0')).toEqual([projectB]);
        expect(mismatchFinder.getConsumersOfMismatch('mocha', '1.2.3')).toEqual([projectC]);
        expect(mismatchFinder.getConsumersOfMismatch('mocha', '2.0.0')).toEqual([projectD]);
        done();
    });
    it('finds three mismatches in three projects', (done) => {
        const projectA = new VersionMismatchFinderProject_1.VersionMismatchFinderProject({
            packageName: 'A',
            packageJsonEditor: PackageJsonEditor_1.PackageJsonEditor.fromObject({
                dependencies: {
                    '@types/foo': '1.2.3',
                    karma: '0.0.1'
                }
            }, 'foo.json'),
            cyclicDependencyProjects: new Set()
        });
        const projectB = new VersionMismatchFinderProject_1.VersionMismatchFinderProject({
            packageName: 'B',
            packageJsonEditor: PackageJsonEditor_1.PackageJsonEditor.fromObject({
                dependencies: {
                    '@types/foo': '2.0.0',
                    karma: '0.0.1'
                }
            }, 'foo.json'),
            cyclicDependencyProjects: new Set()
        });
        const projectC = new VersionMismatchFinderProject_1.VersionMismatchFinderProject({
            packageName: 'C',
            packageJsonEditor: PackageJsonEditor_1.PackageJsonEditor.fromObject({
                dependencies: {
                    '@types/foo': '9.9.9',
                    karma: '0.0.1'
                }
            }, 'foo.json'),
            cyclicDependencyProjects: new Set()
        });
        const mismatchFinder = new VersionMismatchFinder_1.VersionMismatchFinder([projectA, projectB, projectC]);
        expect(mismatchFinder.numberOfMismatches).toEqual(1);
        expect(mismatchFinder.getMismatches()).toHaveLength(1);
        expect(mismatchFinder.getMismatches()).toMatchObject(['@types/foo']);
        expect(mismatchFinder.getVersionsOfMismatch('@types/foo').sort()).toEqual(['1.2.3', '2.0.0', '9.9.9']);
        expect(mismatchFinder.getConsumersOfMismatch('@types/foo', '1.2.3')).toEqual([projectA]);
        expect(mismatchFinder.getConsumersOfMismatch('@types/foo', '2.0.0')).toEqual([projectB]);
        expect(mismatchFinder.getConsumersOfMismatch('@types/foo', '9.9.9')).toEqual([projectC]);
        done();
    });
    it('checks dev dependencies', (done) => {
        const projectA = new VersionMismatchFinderProject_1.VersionMismatchFinderProject({
            packageName: 'A',
            packageJsonEditor: PackageJsonEditor_1.PackageJsonEditor.fromObject({
                dependencies: {
                    '@types/foo': '1.2.3',
                    karma: '0.0.1'
                }
            }, 'foo.json'),
            cyclicDependencyProjects: new Set()
        });
        const projectB = new VersionMismatchFinderProject_1.VersionMismatchFinderProject({
            packageName: 'B',
            packageJsonEditor: PackageJsonEditor_1.PackageJsonEditor.fromObject({
                devDependencies: {
                    '@types/foo': '2.0.0',
                    karma: '0.0.1'
                }
            }, 'foo.json'),
            cyclicDependencyProjects: new Set()
        });
        const mismatchFinder = new VersionMismatchFinder_1.VersionMismatchFinder([projectA, projectB]);
        expect(mismatchFinder.numberOfMismatches).toEqual(1);
        expect(mismatchFinder.getMismatches()).toHaveLength(1);
        expect(mismatchFinder.getMismatches()[0]).toEqual('@types/foo');
        expect(mismatchFinder.getVersionsOfMismatch('@types/foo').sort()).toEqual(['1.2.3', '2.0.0']);
        expect(mismatchFinder.getConsumersOfMismatch('@types/foo', '2.0.0')).toEqual([projectB]);
        expect(mismatchFinder.getConsumersOfMismatch('@types/foo', '1.2.3')).toEqual([projectA]);
        done();
    });
    it('does not check peer dependencies', (done) => {
        const projectA = new VersionMismatchFinderProject_1.VersionMismatchFinderProject({
            packageName: 'A',
            packageJsonEditor: PackageJsonEditor_1.PackageJsonEditor.fromObject({
                dependencies: {
                    '@types/foo': '1.2.3',
                    karma: '0.0.1'
                }
            }, 'foo.json'),
            cyclicDependencyProjects: new Set()
        });
        const projectB = new VersionMismatchFinderProject_1.VersionMismatchFinderProject({
            packageName: 'B',
            packageJsonEditor: PackageJsonEditor_1.PackageJsonEditor.fromObject({
                peerDependencies: {
                    '@types/foo': '2.0.0',
                    karma: '0.0.1'
                }
            }, 'foo.json'),
            cyclicDependencyProjects: new Set()
        });
        const mismatchFinder = new VersionMismatchFinder_1.VersionMismatchFinder([projectA, projectB]);
        expect(mismatchFinder.numberOfMismatches).toEqual(0);
        done();
    });
    it('checks optional dependencies', (done) => {
        const projectA = new VersionMismatchFinderProject_1.VersionMismatchFinderProject({
            packageName: 'A',
            packageJsonEditor: PackageJsonEditor_1.PackageJsonEditor.fromObject({
                dependencies: {
                    '@types/foo': '1.2.3',
                    karma: '0.0.1'
                }
            }, 'foo.json'),
            cyclicDependencyProjects: new Set()
        });
        const projectB = new VersionMismatchFinderProject_1.VersionMismatchFinderProject({
            packageName: 'B',
            packageJsonEditor: PackageJsonEditor_1.PackageJsonEditor.fromObject({
                optionalDependencies: {
                    '@types/foo': '2.0.0',
                    karma: '0.0.1'
                }
            }, 'foo.json'),
            cyclicDependencyProjects: new Set()
        });
        const mismatchFinder = new VersionMismatchFinder_1.VersionMismatchFinder([projectA, projectB]);
        expect(mismatchFinder.numberOfMismatches).toEqual(1);
        expect(mismatchFinder.getMismatches()).toHaveLength(1);
        expect(mismatchFinder.getMismatches()[0]).toEqual('@types/foo');
        expect(mismatchFinder.getVersionsOfMismatch('@types/foo').sort()).toEqual(['1.2.3', '2.0.0']);
        expect(mismatchFinder.getConsumersOfMismatch('@types/foo', '2.0.0')).toEqual([projectB]);
        expect(mismatchFinder.getConsumersOfMismatch('@types/foo', '1.2.3')).toEqual([projectA]);
        done();
    });
    it('allows alternative versions', (done) => {
        const projectA = new VersionMismatchFinderProject_1.VersionMismatchFinderProject({
            packageName: 'A',
            packageJsonEditor: PackageJsonEditor_1.PackageJsonEditor.fromObject({
                dependencies: {
                    '@types/foo': '1.2.3',
                    karma: '0.0.1'
                }
            }, 'foo.json'),
            cyclicDependencyProjects: new Set()
        });
        const projectB = new VersionMismatchFinderProject_1.VersionMismatchFinderProject({
            packageName: 'B',
            packageJsonEditor: PackageJsonEditor_1.PackageJsonEditor.fromObject({
                dependencies: {
                    '@types/foo': '2.0.0',
                    karma: '0.0.1'
                }
            }, 'foo.json'),
            cyclicDependencyProjects: new Set()
        });
        const alternatives = new Map();
        alternatives.set('@types/foo', ['2.0.0']);
        const mismatchFinder = new VersionMismatchFinder_1.VersionMismatchFinder([projectA, projectB], alternatives);
        expect(mismatchFinder.numberOfMismatches).toEqual(0);
        expect(mismatchFinder.getMismatches()).toHaveLength(0);
        done();
    });
    it('handles the common-versions.json file correctly', (done) => {
        const projectA = new VersionMismatchFinderProject_1.VersionMismatchFinderProject({
            packageName: 'A',
            packageJsonEditor: PackageJsonEditor_1.PackageJsonEditor.fromObject({
                dependencies: {
                    '@scope/library-1': '1.2.3',
                    karma: '0.0.1'
                }
            }, 'foo.json'),
            cyclicDependencyProjects: new Set()
        });
        const projectB = new VersionMismatchFinderCommonVersions_1.VersionMismatchFinderCommonVersions(CommonVersionsConfiguration_1.CommonVersionsConfiguration.loadFromFile(path.resolve(__dirname, 'jsonFiles', 'common-versions.json')));
        const mismatchFinder = new VersionMismatchFinder_1.VersionMismatchFinder([projectA, projectB]);
        expect(mismatchFinder.numberOfMismatches).toEqual(1);
        expect(mismatchFinder.getMismatches()).toHaveLength(1);
        expect(mismatchFinder.getMismatches()[0]).toEqual('@scope/library-1');
        expect(mismatchFinder.getVersionsOfMismatch('@scope/library-1').sort()).toEqual(['1.2.3', '~3.2.1']);
        expect(mismatchFinder.getConsumersOfMismatch('@scope/library-1', '~3.2.1')).toEqual([projectB]);
        expect(mismatchFinder.getConsumersOfMismatch('@scope/library-1', '1.2.3')).toEqual([projectA]);
        done();
    });
});
//# sourceMappingURL=VersionMismatchFinder.test.js.map