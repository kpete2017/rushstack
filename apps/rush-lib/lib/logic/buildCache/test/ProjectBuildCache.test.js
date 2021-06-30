"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
const node_core_library_1 = require("@rushstack/node-core-library");
const ProjectBuildCache_1 = require("../ProjectBuildCache");
describe('ProjectBuildCache', () => {
    async function prepareSubject(options) {
        const terminal = new node_core_library_1.Terminal(new node_core_library_1.StringBufferTerminalProvider());
        const packageChangeAnalyzer = {
            getProjectStateHash: () => {
                return 'state_hash';
            }
        };
        const subject = await ProjectBuildCache_1.ProjectBuildCache.tryGetProjectBuildCache({
            buildCacheConfiguration: {
                buildCacheEnabled: options.hasOwnProperty('enabled') ? options.enabled : true,
                getCacheEntryId: (options) => `${options.projectName}/${options.projectStateHash}`,
                localCacheProvider: undefined,
                cloudCacheProvider: {
                    isCacheWriteAllowed: options.hasOwnProperty('writeAllowed') ? options.writeAllowed : false
                }
            },
            projectConfiguration: {
                projectOutputFolderNames: ['dist'],
                project: {
                    packageName: 'acme-wizard',
                    projectRelativeFolder: 'apps/acme-wizard',
                    dependencyProjects: []
                }
            },
            command: 'build',
            trackedProjectFiles: options.hasOwnProperty('trackedProjectFiles') ? options.trackedProjectFiles : [],
            packageChangeAnalyzer,
            terminal
        });
        return subject;
    }
    describe('tryGetProjectBuildCache', () => {
        it('returns a ProjectBuildCache with a calculated cacheId value', async () => {
            const subject = (await prepareSubject({}));
            expect(subject['_cacheId']).toMatchInlineSnapshot(`"acme-wizard/e229f8765b7d450a8a84f711a81c21e37935d661"`);
        });
        it('returns undefined if the tracked file list is undefined', async () => {
            expect(await prepareSubject({
                trackedProjectFiles: undefined
            })).toBe(undefined);
        });
    });
});
//# sourceMappingURL=ProjectBuildCache.test.js.map