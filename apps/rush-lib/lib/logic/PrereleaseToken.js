"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrereleaseToken = void 0;
class PrereleaseToken {
    constructor(prereleaseName, suffixName, partialPrerelease = false) {
        if (prereleaseName && suffixName) {
            throw new Error('Pre-release name and suffix cannot be provided at the same time.');
        }
        this._name = prereleaseName || suffixName;
        this._prereleaseName = prereleaseName;
        this._suffixName = suffixName;
        this._partialPrerelease = partialPrerelease;
    }
    get hasValue() {
        return !!this._prereleaseName || !!this._suffixName;
    }
    get isPrerelease() {
        return !!this._prereleaseName;
    }
    get isSuffix() {
        return !!this._suffixName;
    }
    get isPartialPrerelease() {
        return this.isPrerelease && this._partialPrerelease;
    }
    get name() {
        return this._name;
    }
}
exports.PrereleaseToken = PrereleaseToken;
//# sourceMappingURL=PrereleaseToken.js.map