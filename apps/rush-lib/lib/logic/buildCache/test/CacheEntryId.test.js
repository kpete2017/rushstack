"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
const CacheEntryId_1 = require("../CacheEntryId");
describe(CacheEntryId_1.CacheEntryId.name, () => {
    describe('Valid pattern names', () => {
        function validatePatternMatchesSnapshot(projectName, pattern) {
            const getCacheEntryId = CacheEntryId_1.CacheEntryId.parsePattern(pattern);
            expect(getCacheEntryId({
                projectName,
                projectStateHash: '09d1ecee6d5f888fa6c35ca804b5dac7c3735ce3'
            })).toMatchSnapshot();
        }
        it('Handles a cache entry name for a project name without a scope', () => {
            const projectName = 'project+name';
            validatePatternMatchesSnapshot(projectName);
            validatePatternMatchesSnapshot(projectName, '[hash]');
            validatePatternMatchesSnapshot(projectName, '[projectName]_[hash]');
            validatePatternMatchesSnapshot(projectName, '[projectName:normalize]_[hash]');
            validatePatternMatchesSnapshot(projectName, 'prefix/[projectName:normalize]_[hash]');
        });
        it('Handles a cache entry name for a project name with a scope', () => {
            const projectName = '@scope/project+name';
            validatePatternMatchesSnapshot(projectName);
            validatePatternMatchesSnapshot(projectName, '[hash]');
            validatePatternMatchesSnapshot(projectName, '[projectName]_[hash]');
            validatePatternMatchesSnapshot(projectName, '[projectName:normalize]_[hash]');
            validatePatternMatchesSnapshot(projectName, 'prefix/[projectName:normalize]_[hash]');
        });
    });
    describe('Invalid pattern names', () => {
        async function validateInvalidPatternErrorMatchesSnapshotAsync(pattern) {
            await expect(() => CacheEntryId_1.CacheEntryId.parsePattern(pattern)).toThrowErrorMatchingSnapshot();
        }
        it('Throws an exception for an invalid pattern', async () => {
            await validateInvalidPatternErrorMatchesSnapshotAsync('x');
            await validateInvalidPatternErrorMatchesSnapshotAsync('[invalidTag]');
            await validateInvalidPatternErrorMatchesSnapshotAsync('unstartedTag]');
            await validateInvalidPatternErrorMatchesSnapshotAsync('[incompleteTag');
            await validateInvalidPatternErrorMatchesSnapshotAsync('[hash:badAttribute]');
            await validateInvalidPatternErrorMatchesSnapshotAsync('[hash:badAttribute:attr2]');
            await validateInvalidPatternErrorMatchesSnapshotAsync('[projectName:badAttribute]');
            await validateInvalidPatternErrorMatchesSnapshotAsync('[projectName:]');
            await validateInvalidPatternErrorMatchesSnapshotAsync('[:attr1]');
            await validateInvalidPatternErrorMatchesSnapshotAsync('[projectName:attr1:attr2]');
            await validateInvalidPatternErrorMatchesSnapshotAsync('/[hash]');
            await validateInvalidPatternErrorMatchesSnapshotAsync('~');
        });
    });
});
//# sourceMappingURL=CacheEntryId.test.js.map