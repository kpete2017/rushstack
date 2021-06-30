"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
const node_core_library_1 = require("@rushstack/node-core-library");
const PackageChangeAnalyzer_1 = require("../PackageChangeAnalyzer");
const EnvironmentConfiguration_1 = require("../../api/EnvironmentConfiguration");
const RushProjectConfiguration_1 = require("../../api/RushProjectConfiguration");
describe('PackageChangeAnalyzer', () => {
    beforeEach(() => {
        jest.spyOn(EnvironmentConfiguration_1.EnvironmentConfiguration, 'gitBinaryPath', 'get').mockReturnValue(undefined);
        jest.spyOn(RushProjectConfiguration_1.RushProjectConfiguration, 'tryLoadForProjectAsync').mockResolvedValue(undefined);
    });
    afterEach(() => {
        jest.resetAllMocks();
    });
    function createTestSubject(projects, files) {
        const rushConfiguration = {
            commonRushConfigFolder: '',
            projects,
            rushJsonFolder: '',
            getCommittedShrinkwrapFilename() {
                return 'common/config/rush/pnpm-lock.yaml';
            },
            findProjectForPosixRelativePath(path) {
                return projects.find((project) => path.startsWith(project.projectRelativeFolder));
            }
        };
        const subject = new PackageChangeAnalyzer_1.PackageChangeAnalyzer(rushConfiguration);
        subject['_getRepoDeps'] = jest.fn(() => {
            return files;
        });
        return subject;
    }
    describe('getPackageDeps', () => {
        it('returns the files for the specified project', async () => {
            const projects = [
                {
                    packageName: 'apple',
                    projectFolder: 'apps/apple',
                    projectRelativeFolder: 'apps/apple'
                },
                {
                    packageName: 'banana',
                    projectFolder: 'apps/apple',
                    projectRelativeFolder: 'apps/banana'
                }
            ];
            const files = new Map([
                ['apps/apple/core.js', 'a101'],
                ['apps/banana/peel.js', 'b201']
            ]);
            const subject = createTestSubject(projects, files);
            const terminal = new node_core_library_1.Terminal(new node_core_library_1.StringBufferTerminalProvider());
            expect(await subject.getPackageDeps('apple', terminal)).toEqual(new Map([['apps/apple/core.js', 'a101']]));
            expect(await subject.getPackageDeps('banana', terminal)).toEqual(new Map([['apps/banana/peel.js', 'b201']]));
        });
        it('ignores files specified by project configuration files, relative to project folder', async () => {
            // rush-project.json configuration for 'apple'
            jest.spyOn(RushProjectConfiguration_1.RushProjectConfiguration, 'tryLoadForProjectAsync').mockResolvedValueOnce({
                incrementalBuildIgnoredGlobs: ['assets/*.png', '*.js.map']
            });
            // rush-project.json configuration for 'banana' does not exist
            jest.spyOn(RushProjectConfiguration_1.RushProjectConfiguration, 'tryLoadForProjectAsync').mockResolvedValueOnce(undefined);
            const projects = [
                {
                    packageName: 'apple',
                    projectFolder: 'apps/apple',
                    projectRelativeFolder: 'apps/apple'
                },
                {
                    packageName: 'banana',
                    projectFolder: 'apps/apple',
                    projectRelativeFolder: 'apps/banana'
                }
            ];
            const files = new Map([
                ['apps/apple/core.js', 'a101'],
                ['apps/apple/core.js.map', 'a102'],
                ['apps/apple/assets/one.jpg', 'a103'],
                ['apps/apple/assets/two.png', 'a104'],
                ['apps/banana/peel.js', 'b201'],
                ['apps/banana/peel.js.map', 'b202']
            ]);
            const subject = createTestSubject(projects, files);
            const terminal = new node_core_library_1.Terminal(new node_core_library_1.StringBufferTerminalProvider());
            expect(await subject.getPackageDeps('apple', terminal)).toEqual(new Map([
                ['apps/apple/core.js', 'a101'],
                ['apps/apple/assets/one.jpg', 'a103']
            ]));
            expect(await subject.getPackageDeps('banana', terminal)).toEqual(new Map([
                ['apps/banana/peel.js', 'b201'],
                ['apps/banana/peel.js.map', 'b202']
            ]));
        });
        it('interprets ignored globs as a dot-ignore file (not as individually handled globs)', async () => {
            // rush-project.json configuration for 'apple'
            jest.spyOn(RushProjectConfiguration_1.RushProjectConfiguration, 'tryLoadForProjectAsync').mockResolvedValue({
                incrementalBuildIgnoredGlobs: ['*.png', 'assets/*.psd', '!assets/important/**']
            });
            const projects = [
                {
                    packageName: 'apple',
                    projectFolder: 'apps/apple',
                    projectRelativeFolder: 'apps/apple'
                }
            ];
            const files = new Map([
                ['apps/apple/one.png', 'a101'],
                ['apps/apple/assets/two.psd', 'a102'],
                ['apps/apple/assets/three.png', 'a103'],
                ['apps/apple/assets/important/four.png', 'a104'],
                ['apps/apple/assets/important/five.psd', 'a105'],
                ['apps/apple/src/index.ts', 'a106']
            ]);
            const subject = createTestSubject(projects, files);
            const terminal = new node_core_library_1.Terminal(new node_core_library_1.StringBufferTerminalProvider());
            // In a dot-ignore file, the later rule '!assets/important/**' should override the previous
            // rule of '*.png'. This unit test verifies that this behavior doesn't change later if
            // we modify the implementation.
            expect(await subject.getPackageDeps('apple', terminal)).toEqual(new Map([
                ['apps/apple/assets/important/four.png', 'a104'],
                ['apps/apple/assets/important/five.psd', 'a105'],
                ['apps/apple/src/index.ts', 'a106']
            ]));
        });
        it('includes the committed shrinkwrap file as a dep for all projects', async () => {
            const projects = [
                {
                    packageName: 'apple',
                    projectFolder: 'apps/apple',
                    projectRelativeFolder: 'apps/apple'
                },
                {
                    packageName: 'banana',
                    projectFolder: 'apps/apple',
                    projectRelativeFolder: 'apps/banana'
                }
            ];
            const files = new Map([
                ['apps/apple/core.js', 'a101'],
                ['apps/banana/peel.js', 'b201'],
                ['common/config/rush/pnpm-lock.yaml', 'ffff'],
                ['tools/random-file.js', 'e00e']
            ]);
            const subject = createTestSubject(projects, files);
            const terminal = new node_core_library_1.Terminal(new node_core_library_1.StringBufferTerminalProvider());
            expect(await subject.getPackageDeps('apple', terminal)).toEqual(new Map([
                ['apps/apple/core.js', 'a101'],
                ['common/config/rush/pnpm-lock.yaml', 'ffff']
            ]));
            expect(await subject.getPackageDeps('banana', terminal)).toEqual(new Map([
                ['apps/banana/peel.js', 'b201'],
                ['common/config/rush/pnpm-lock.yaml', 'ffff']
            ]));
        });
        it('returns undefined if the specified project does not exist', async () => {
            const projects = [
                {
                    packageName: 'apple',
                    projectFolder: 'apps/apple',
                    projectRelativeFolder: 'apps/apple'
                }
            ];
            const files = new Map([['apps/apple/core.js', 'a101']]);
            const subject = createTestSubject(projects, files);
            const terminal = new node_core_library_1.Terminal(new node_core_library_1.StringBufferTerminalProvider());
            expect(await subject.getPackageDeps('carrot', terminal)).toBeUndefined();
        });
        it('lazy-loads project data and caches it for future calls', async () => {
            const projects = [
                {
                    packageName: 'apple',
                    projectFolder: 'apps/apple',
                    projectRelativeFolder: 'apps/apple'
                }
            ];
            const files = new Map([['apps/apple/core.js', 'a101']]);
            const subject = createTestSubject(projects, files);
            const terminal = new node_core_library_1.Terminal(new node_core_library_1.StringBufferTerminalProvider());
            // Because other unit tests rely on the fact that a freshly instantiated
            // PackageChangeAnalyzer is inert until someone actually requests project data,
            // this test makes that expectation explicit.
            expect(subject['_data']).toBeNull();
            expect(await subject.getPackageDeps('apple', terminal)).toEqual(new Map([['apps/apple/core.js', 'a101']]));
            expect(subject['_data']).toBeDefined();
            expect(await subject.getPackageDeps('apple', terminal)).toEqual(new Map([['apps/apple/core.js', 'a101']]));
            expect(subject['_getRepoDeps']).toHaveBeenCalledTimes(1);
        });
    });
    describe('getProjectStateHash', () => {
        it('returns a fixed hash snapshot for a set of project deps', async () => {
            const projects = [
                {
                    packageName: 'apple',
                    projectFolder: 'apps/apple',
                    projectRelativeFolder: 'apps/apple'
                }
            ];
            const files = new Map([
                ['apps/apple/core.js', 'a101'],
                ['apps/apple/juice.js', 'e333'],
                ['apps/apple/slices.js', 'a102']
            ]);
            const subject = createTestSubject(projects, files);
            const terminal = new node_core_library_1.Terminal(new node_core_library_1.StringBufferTerminalProvider());
            expect(await subject.getProjectStateHash('apple', terminal)).toMatchInlineSnapshot(`"265536e325cdfac3fa806a51873d927a712fc6c9"`);
        });
        it('returns the same hash regardless of dep order', async () => {
            const projectsA = [
                {
                    packageName: 'apple',
                    projectFolder: 'apps/apple',
                    projectRelativeFolder: 'apps/apple'
                }
            ];
            const filesA = new Map([
                ['apps/apple/core.js', 'a101'],
                ['apps/apple/juice.js', 'e333'],
                ['apps/apple/slices.js', 'a102']
            ]);
            const subjectA = createTestSubject(projectsA, filesA);
            const projectsB = [
                {
                    packageName: 'apple',
                    projectFolder: 'apps/apple',
                    projectRelativeFolder: 'apps/apple'
                }
            ];
            const filesB = new Map([
                ['apps/apple/slices.js', 'a102'],
                ['apps/apple/core.js', 'a101'],
                ['apps/apple/juice.js', 'e333']
            ]);
            const subjectB = createTestSubject(projectsB, filesB);
            const terminal = new node_core_library_1.Terminal(new node_core_library_1.StringBufferTerminalProvider());
            expect(await subjectA.getProjectStateHash('apple', terminal)).toEqual(await subjectB.getProjectStateHash('apple', terminal));
        });
    });
});
//# sourceMappingURL=PackageChangeAnalyzer.test.js.map