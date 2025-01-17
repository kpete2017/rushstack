"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.VersionMismatchFinderEntity = void 0;
class VersionMismatchFinderEntity {
    constructor(options) {
        this.friendlyName = options.friendlyName;
        this.cyclicDependencyProjects = options.cyclicDependencyProjects;
        this.skipRushCheck = options.skipRushCheck;
    }
}
exports.VersionMismatchFinderEntity = VersionMismatchFinderEntity;
//# sourceMappingURL=VersionMismatchFinderEntity.js.map