"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
const Git_1 = require("../Git");
describe('Git', () => {
    describe('normalizeGitUrlToHttps', () => {
        it('correctly normalizes URLs', () => {
            expect(Git_1.Git.normalizeGitUrlForComparison('invalid.git')).toEqual('invalid');
            expect(Git_1.Git.normalizeGitUrlForComparison('git@github.com:ExampleOrg/ExampleProject.git')).toEqual('https://github.com/ExampleOrg/ExampleProject');
            expect(Git_1.Git.normalizeGitUrlForComparison('ssh://user@host.xz:1234/path/to/repo.git/')).toEqual('https://host.xz:1234/path/to/repo');
            expect(Git_1.Git.normalizeGitUrlForComparison('git://host.xz/path/to/repo')).toEqual('https://host.xz/path/to/repo');
            expect(Git_1.Git.normalizeGitUrlForComparison('http://host.xz:80/path/to/repo')).toEqual('https://host.xz:80/path/to/repo');
            expect(Git_1.Git.normalizeGitUrlForComparison('host.xz:path/to/repo.git/')).toEqual('https://host.xz/path/to/repo');
            // "This syntax is only recognized if there are no slashes before the first colon.
            // This helps differentiate a local path that contains a colon."
            expect(Git_1.Git.normalizeGitUrlForComparison('host/xz:path/to/repo.git/')).toEqual('host/xz:path/to/repo');
            expect(Git_1.Git.normalizeGitUrlForComparison('file:///path/to/repo.git/')).toEqual('file:///path/to/repo');
            expect(Git_1.Git.normalizeGitUrlForComparison('C:\\Windows\\Path.txt')).toEqual('C:\\Windows\\Path.txt');
            expect(Git_1.Git.normalizeGitUrlForComparison('c:/windows/path.git')).toEqual('c:/windows/path');
        });
    });
});
//# sourceMappingURL=Git.test.js.map