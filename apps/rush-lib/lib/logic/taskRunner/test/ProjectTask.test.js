"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
const ProjectBuilder_1 = require("../ProjectBuilder");
describe('convertSlashesForWindows()', () => {
    it('converted inputs', () => {
        expect(ProjectBuilder_1.convertSlashesForWindows('./node_modules/.bin/tslint -c config/tslint.json')).toEqual('.\\node_modules\\.bin\\tslint -c config/tslint.json');
        expect(ProjectBuilder_1.convertSlashesForWindows('/blah/bleep&&/bloop')).toEqual('\\blah\\bleep&&/bloop');
        expect(ProjectBuilder_1.convertSlashesForWindows('/blah/bleep')).toEqual('\\blah\\bleep');
        expect(ProjectBuilder_1.convertSlashesForWindows('/blah/bleep --path a/b')).toEqual('\\blah\\bleep --path a/b');
        expect(ProjectBuilder_1.convertSlashesForWindows('/blah/bleep>output.log')).toEqual('\\blah\\bleep>output.log');
        expect(ProjectBuilder_1.convertSlashesForWindows('/blah/bleep<input.json')).toEqual('\\blah\\bleep<input.json');
        expect(ProjectBuilder_1.convertSlashesForWindows('/blah/bleep|/blah/bloop')).toEqual('\\blah\\bleep|/blah/bloop');
    });
    it('ignored inputs', () => {
        expect(ProjectBuilder_1.convertSlashesForWindows('/blah\\bleep && /bloop')).toEqual('/blah\\bleep && /bloop');
        expect(ProjectBuilder_1.convertSlashesForWindows('cmd.exe /c blah')).toEqual('cmd.exe /c blah');
        expect(ProjectBuilder_1.convertSlashesForWindows('"/blah/bleep"')).toEqual('"/blah/bleep"');
    });
});
//# sourceMappingURL=ProjectTask.test.js.map