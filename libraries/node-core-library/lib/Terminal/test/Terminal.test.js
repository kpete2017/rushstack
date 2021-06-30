"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
const Terminal_1 = require("../Terminal");
const StringBufferTerminalProvider_1 = require("../StringBufferTerminalProvider");
const Colors_1 = require("../Colors");
let terminal;
let provider;
function verifyProvider() {
    expect({
        log: provider.getOutput(),
        warning: provider.getWarningOutput(),
        error: provider.getErrorOutput(),
        verbose: provider.getVerbose()
    }).toMatchSnapshot();
}
describe('01 color enabled', () => {
    beforeEach(() => {
        provider = new StringBufferTerminalProvider_1.StringBufferTerminalProvider(true);
        terminal = new Terminal_1.Terminal(provider);
    });
    describe('01 basic terminal functions', () => {
        describe('01 write', () => {
            test('01 writes a single message', () => {
                terminal.write('test message');
                verifyProvider();
            });
            test('02 writes multiple messages', () => {
                terminal.write('message 1', 'message 2');
                verifyProvider();
            });
            test('03 writes a message with colors', () => {
                terminal.write(Colors_1.Colors.green('message 1'));
                verifyProvider();
            });
            test('04 writes a multiple messages with colors', () => {
                terminal.write(Colors_1.Colors.green('message 1'), Colors_1.Colors.red('message 2'));
                verifyProvider();
            });
            test('05 writes a messages with colors interspersed with non-colored messages', () => {
                terminal.write('message 1', Colors_1.Colors.green('message 2'), 'message 3', Colors_1.Colors.red('message 4'));
                verifyProvider();
            });
        });
        describe('02 writeLine', () => {
            test('01 writes a single message', () => {
                terminal.writeLine('test message');
                verifyProvider();
            });
            test('02 writes multiple messages', () => {
                terminal.writeLine('message 1', 'message 2');
                verifyProvider();
            });
            test('03 writes a message with colors', () => {
                terminal.writeLine(Colors_1.Colors.green('message 1'));
                verifyProvider();
            });
            test('04 writes a multiple messages with colors', () => {
                terminal.writeLine(Colors_1.Colors.green('message 1'), Colors_1.Colors.red('message 2'));
                verifyProvider();
            });
            test('05 writes a messages with colors interspersed with non-colored messages', () => {
                terminal.writeLine('message 1', Colors_1.Colors.green('message 2'), 'message 3', Colors_1.Colors.red('message 4'));
                verifyProvider();
            });
        });
        describe('03 writeWarning', () => {
            test('01 writes a single message', () => {
                terminal.writeWarning('test message');
                verifyProvider();
            });
            test('02 writes multiple messages', () => {
                terminal.writeWarning('message 1', 'message 2');
                verifyProvider();
            });
            test('03 writes a message with colors', () => {
                terminal.writeWarning(Colors_1.Colors.green('message 1'));
                verifyProvider();
            });
            test('04 writes a multiple messages with colors', () => {
                terminal.writeWarning(Colors_1.Colors.green('message 1'), Colors_1.Colors.red('message 2'));
                verifyProvider();
            });
            test('05 writes a messages with colors interspersed with non-colored messages', () => {
                terminal.writeWarning('message 1', Colors_1.Colors.green('message 2'), 'message 3', Colors_1.Colors.red('message 4'));
                verifyProvider();
            });
        });
        describe('04 writeWarningLine', () => {
            test('01 writes a single message', () => {
                terminal.writeWarningLine('test message');
                verifyProvider();
            });
            test('02 writes multiple messages', () => {
                terminal.writeWarningLine('message 1', 'message 2');
                verifyProvider();
            });
            test('03 writes a message with colors', () => {
                terminal.writeWarningLine(Colors_1.Colors.green('message 1'));
                verifyProvider();
            });
            test('04 writes a multiple messages with colors', () => {
                terminal.writeWarningLine(Colors_1.Colors.green('message 1'), Colors_1.Colors.red('message 2'));
                verifyProvider();
            });
            test('05 writes a messages with colors interspersed with non-colored messages', () => {
                terminal.writeWarningLine('message 1', Colors_1.Colors.green('message 2'), 'message 3', Colors_1.Colors.red('message 4'));
                verifyProvider();
            });
        });
        describe('05 writeError', () => {
            test('01 writes a single message', () => {
                terminal.writeError('test message');
                verifyProvider();
            });
            test('02 writes multiple messages', () => {
                terminal.writeError('message 1', 'message 2');
                verifyProvider();
            });
            test('03 writes a message with colors', () => {
                terminal.writeError(Colors_1.Colors.green('message 1'));
                verifyProvider();
            });
            test('04 writes a multiple messages with colors', () => {
                terminal.writeError(Colors_1.Colors.green('message 1'), Colors_1.Colors.red('message 2'));
                verifyProvider();
            });
            test('05 writes a messages with colors interspersed with non-colored messages', () => {
                terminal.writeError('message 1', Colors_1.Colors.green('message 2'), 'message 3', Colors_1.Colors.red('message 4'));
                verifyProvider();
            });
        });
        describe('06 writeErrorLine', () => {
            test('01 writes a single message', () => {
                terminal.writeErrorLine('test message');
                verifyProvider();
            });
            test('02 writes multiple messages', () => {
                terminal.writeErrorLine('message 1', 'message 2');
                verifyProvider();
            });
            test('03 writes a message with colors', () => {
                terminal.writeErrorLine(Colors_1.Colors.green('message 1'));
                verifyProvider();
            });
            test('04 writes a multiple messages with colors', () => {
                terminal.writeErrorLine(Colors_1.Colors.green('message 1'), Colors_1.Colors.red('message 2'));
                verifyProvider();
            });
            test('05 writes a messages with colors interspersed with non-colored messages', () => {
                terminal.writeErrorLine('message 1', Colors_1.Colors.green('message 2'), 'message 3', Colors_1.Colors.red('message 4'));
                verifyProvider();
            });
        });
        describe('07 writeVerbose', () => {
            test('01 writes a single message', () => {
                terminal.writeVerbose('test message');
                verifyProvider();
            });
            test('02 writes multiple messages', () => {
                terminal.writeVerbose('message 1', 'message 2');
                verifyProvider();
            });
            test('03 writes a message with colors', () => {
                terminal.writeVerbose(Colors_1.Colors.green('message 1'));
                verifyProvider();
            });
            test('04 writes a multiple messages with colors', () => {
                terminal.writeVerbose(Colors_1.Colors.green('message 1'), Colors_1.Colors.red('message 2'));
                verifyProvider();
            });
            test('05 writes a messages with colors interspersed with non-colored messages', () => {
                terminal.writeVerbose('message 1', Colors_1.Colors.green('message 2'), 'message 3', Colors_1.Colors.red('message 4'));
                verifyProvider();
            });
        });
        describe('08 writeVerboseLine', () => {
            test('01 writes a single message', () => {
                terminal.writeVerboseLine('test message');
                verifyProvider();
            });
            test('02 writes multiple messages', () => {
                terminal.writeVerboseLine('message 1', 'message 2');
                verifyProvider();
            });
            test('03 writes a message with colors', () => {
                terminal.writeVerboseLine(Colors_1.Colors.green('message 1'));
                verifyProvider();
            });
            test('04 writes a multiple messages with colors', () => {
                terminal.writeVerboseLine(Colors_1.Colors.green('message 1'), Colors_1.Colors.red('message 2'));
                verifyProvider();
            });
            test('05 writes a messages with colors interspersed with non-colored messages', () => {
                terminal.writeVerboseLine('message 1', Colors_1.Colors.green('message 2'), 'message 3', Colors_1.Colors.red('message 4'));
                verifyProvider();
            });
        });
    });
    test('05 writes to multiple streams', () => {
        terminal.write('message 1', Colors_1.Colors.green('message 2'), 'message 3', Colors_1.Colors.red('message 4'));
        terminal.writeWarningLine('message 1', 'message 2');
        terminal.writeVerbose('test message');
        terminal.writeVerbose(Colors_1.Colors.green('message 1'));
        terminal.writeLine(Colors_1.Colors.green('message 1'));
        terminal.writeError('message 1', Colors_1.Colors.green('message 2'), 'message 3', Colors_1.Colors.red('message 4'));
        terminal.writeErrorLine('test message');
        terminal.writeVerboseLine('message 1', Colors_1.Colors.green('message 2'), 'message 3', Colors_1.Colors.red('message 4'));
        terminal.writeVerboseLine('test message');
        terminal.writeWarning(Colors_1.Colors.green('message 1'), Colors_1.Colors.red('message 2'));
        terminal.writeWarning('message 1', Colors_1.Colors.green('message 2'), 'message 3', Colors_1.Colors.red('message 4'));
        terminal.writeError('message 1', 'message 2');
        terminal.write(Colors_1.Colors.green('message 1'));
        terminal.writeVerbose('message 1', Colors_1.Colors.green('message 2'), 'message 3', Colors_1.Colors.red('message 4'));
        terminal.writeErrorLine('message 1', 'message 2');
        terminal.write(Colors_1.Colors.green('message 1'), Colors_1.Colors.red('message 2'));
        terminal.writeVerbose('message 1', 'message 2');
        terminal.writeVerboseLine(Colors_1.Colors.green('message 1'));
        terminal.writeLine(Colors_1.Colors.green('message 1'), Colors_1.Colors.red('message 2'));
        terminal.writeError(Colors_1.Colors.green('message 1'));
        terminal.writeWarningLine('message 1', Colors_1.Colors.green('message 2'), 'message 3', Colors_1.Colors.red('message 4'));
        terminal.write('test message');
        terminal.writeWarningLine('test message');
        terminal.writeVerboseLine(Colors_1.Colors.green('message 1'), Colors_1.Colors.red('message 2'));
        terminal.writeVerboseLine('message 1', 'message 2');
        terminal.writeErrorLine('message 1', Colors_1.Colors.green('message 2'), 'message 3', Colors_1.Colors.red('message 4'));
        terminal.writeLine('message 1', Colors_1.Colors.green('message 2'), 'message 3', Colors_1.Colors.red('message 4'));
        terminal.writeWarning('message 1', 'message 2');
        terminal.writeErrorLine(Colors_1.Colors.green('message 1'));
        terminal.write('message 1', 'message 2');
        terminal.writeVerbose(Colors_1.Colors.green('message 1'), Colors_1.Colors.red('message 2'));
        terminal.writeWarning(Colors_1.Colors.green('message 1'));
        terminal.writeLine('test message');
        terminal.writeError('test message');
        terminal.writeLine('message 1', 'message 2');
        terminal.writeErrorLine(Colors_1.Colors.green('message 1'), Colors_1.Colors.red('message 2'));
        terminal.writeError(Colors_1.Colors.green('message 1'), Colors_1.Colors.red('message 2'));
        terminal.writeWarningLine(Colors_1.Colors.green('message 1'), Colors_1.Colors.red('message 2'));
        terminal.writeWarningLine(Colors_1.Colors.green('message 1'));
        verifyProvider();
    });
});
describe('02 color disabled', () => {
    beforeEach(() => {
        provider = new StringBufferTerminalProvider_1.StringBufferTerminalProvider(false);
        terminal = new Terminal_1.Terminal(provider);
    });
    describe('01 basic terminal functions', () => {
        describe('01 write', () => {
            test('01 writes a single message', () => {
                terminal.write('test message');
                verifyProvider();
            });
            test('02 writes multiple messages', () => {
                terminal.write('message 1', 'message 2');
                verifyProvider();
            });
            test('03 writes a message with colors', () => {
                terminal.write(Colors_1.Colors.green('message 1'));
                verifyProvider();
            });
            test('04 writes a multiple messages with colors', () => {
                terminal.write(Colors_1.Colors.green('message 1'), Colors_1.Colors.red('message 2'));
                verifyProvider();
            });
            test('05 writes a messages with colors interspersed with non-colored messages', () => {
                terminal.write('message 1', Colors_1.Colors.green('message 2'), 'message 3', Colors_1.Colors.red('message 4'));
                verifyProvider();
            });
        });
        describe('02 writeLine', () => {
            test('01 writes a single message', () => {
                terminal.writeLine('test message');
                verifyProvider();
            });
            test('02 writes multiple messages', () => {
                terminal.writeLine('message 1', 'message 2');
                verifyProvider();
            });
            test('03 writes a message with colors', () => {
                terminal.writeLine(Colors_1.Colors.green('message 1'));
                verifyProvider();
            });
            test('04 writes a multiple messages with colors', () => {
                terminal.writeLine(Colors_1.Colors.green('message 1'), Colors_1.Colors.red('message 2'));
                verifyProvider();
            });
            test('05 writes a messages with colors interspersed with non-colored messages', () => {
                terminal.writeLine('message 1', Colors_1.Colors.green('message 2'), 'message 3', Colors_1.Colors.red('message 4'));
                verifyProvider();
            });
        });
        describe('03 writeWarning', () => {
            test('01 writes a single message', () => {
                terminal.writeWarning('test message');
                verifyProvider();
            });
            test('02 writes multiple messages', () => {
                terminal.writeWarning('message 1', 'message 2');
                verifyProvider();
            });
            test('03 writes a message with colors', () => {
                terminal.writeWarning(Colors_1.Colors.green('message 1'));
                verifyProvider();
            });
            test('04 writes a multiple messages with colors', () => {
                terminal.writeWarning(Colors_1.Colors.green('message 1'), Colors_1.Colors.red('message 2'));
                verifyProvider();
            });
            test('05 writes a messages with colors interspersed with non-colored messages', () => {
                terminal.writeWarning('message 1', Colors_1.Colors.green('message 2'), 'message 3', Colors_1.Colors.red('message 4'));
                verifyProvider();
            });
        });
        describe('04 writeWarningLine', () => {
            test('01 writes a single message', () => {
                terminal.writeWarningLine('test message');
                verifyProvider();
            });
            test('02 writes multiple messages', () => {
                terminal.writeWarningLine('message 1', 'message 2');
                verifyProvider();
            });
            test('03 writes a message with colors', () => {
                terminal.writeWarningLine(Colors_1.Colors.green('message 1'));
                verifyProvider();
            });
            test('04 writes a multiple messages with colors', () => {
                terminal.writeWarningLine(Colors_1.Colors.green('message 1'), Colors_1.Colors.red('message 2'));
                verifyProvider();
            });
            test('05 writes a messages with colors interspersed with non-colored messages', () => {
                terminal.writeWarningLine('message 1', Colors_1.Colors.green('message 2'), 'message 3', Colors_1.Colors.red('message 4'));
                verifyProvider();
            });
        });
        describe('05 writeError', () => {
            test('01 writes a single message', () => {
                terminal.writeError('test message');
                verifyProvider();
            });
            test('02 writes multiple messages', () => {
                terminal.writeError('message 1', 'message 2');
                verifyProvider();
            });
            test('03 writes a message with colors', () => {
                terminal.writeError(Colors_1.Colors.green('message 1'));
                verifyProvider();
            });
            test('04 writes a multiple messages with colors', () => {
                terminal.writeError(Colors_1.Colors.green('message 1'), Colors_1.Colors.red('message 2'));
                verifyProvider();
            });
            test('05 writes a messages with colors interspersed with non-colored messages', () => {
                terminal.writeError('message 1', Colors_1.Colors.green('message 2'), 'message 3', Colors_1.Colors.red('message 4'));
                verifyProvider();
            });
        });
        describe('06 writeErrorLine', () => {
            test('01 writes a single message', () => {
                terminal.writeErrorLine('test message');
                verifyProvider();
            });
            test('02 writes multiple messages', () => {
                terminal.writeErrorLine('message 1', 'message 2');
                verifyProvider();
            });
            test('03 writes a message with colors', () => {
                terminal.writeErrorLine(Colors_1.Colors.green('message 1'));
                verifyProvider();
            });
            test('04 writes a multiple messages with colors', () => {
                terminal.writeErrorLine(Colors_1.Colors.green('message 1'), Colors_1.Colors.red('message 2'));
                verifyProvider();
            });
            test('05 writes a messages with colors interspersed with non-colored messages', () => {
                terminal.writeErrorLine('message 1', Colors_1.Colors.green('message 2'), 'message 3', Colors_1.Colors.red('message 4'));
                verifyProvider();
            });
        });
        describe('07 writeVerbose', () => {
            test('01 writes a single message', () => {
                terminal.writeVerbose('test message');
                verifyProvider();
            });
            test('02 writes multiple messages', () => {
                terminal.writeVerbose('message 1', 'message 2');
                verifyProvider();
            });
            test('03 writes a message with colors', () => {
                terminal.writeVerbose(Colors_1.Colors.green('message 1'));
                verifyProvider();
            });
            test('04 writes a multiple messages with colors', () => {
                terminal.writeVerbose(Colors_1.Colors.green('message 1'), Colors_1.Colors.red('message 2'));
                verifyProvider();
            });
            test('05 writes a messages with colors interspersed with non-colored messages', () => {
                terminal.writeVerbose('message 1', Colors_1.Colors.green('message 2'), 'message 3', Colors_1.Colors.red('message 4'));
                verifyProvider();
            });
        });
        describe('08 writeVerboseLine', () => {
            test('01 writes a single message', () => {
                terminal.writeVerboseLine('test message');
                verifyProvider();
            });
            test('02 writes multiple messages', () => {
                terminal.writeVerboseLine('message 1', 'message 2');
                verifyProvider();
            });
            test('03 writes a message with colors', () => {
                terminal.writeVerboseLine(Colors_1.Colors.green('message 1'));
                verifyProvider();
            });
            test('04 writes a multiple messages with colors', () => {
                terminal.writeVerboseLine(Colors_1.Colors.green('message 1'), Colors_1.Colors.red('message 2'));
                verifyProvider();
            });
            test('05 writes a messages with colors interspersed with non-colored messages', () => {
                terminal.writeVerboseLine('message 1', Colors_1.Colors.green('message 2'), 'message 3', Colors_1.Colors.red('message 4'));
                verifyProvider();
            });
        });
    });
    test('05 writes to multiple streams', () => {
        terminal.write('message 1', Colors_1.Colors.green('message 2'), 'message 3', Colors_1.Colors.red('message 4'));
        terminal.writeWarningLine('message 1', 'message 2');
        terminal.writeVerbose('test message');
        terminal.writeVerbose(Colors_1.Colors.green('message 1'));
        terminal.writeLine(Colors_1.Colors.green('message 1'));
        terminal.writeError('message 1', Colors_1.Colors.green('message 2'), 'message 3', Colors_1.Colors.red('message 4'));
        terminal.writeErrorLine('test message');
        terminal.writeVerboseLine('message 1', Colors_1.Colors.green('message 2'), 'message 3', Colors_1.Colors.red('message 4'));
        terminal.writeVerboseLine('test message');
        terminal.writeWarning(Colors_1.Colors.green('message 1'), Colors_1.Colors.red('message 2'));
        terminal.writeWarning('message 1', Colors_1.Colors.green('message 2'), 'message 3', Colors_1.Colors.red('message 4'));
        terminal.writeError('message 1', 'message 2');
        terminal.write(Colors_1.Colors.green('message 1'));
        terminal.writeVerbose('message 1', Colors_1.Colors.green('message 2'), 'message 3', Colors_1.Colors.red('message 4'));
        terminal.writeErrorLine('message 1', 'message 2');
        terminal.write(Colors_1.Colors.green('message 1'), Colors_1.Colors.red('message 2'));
        terminal.writeVerbose('message 1', 'message 2');
        terminal.writeVerboseLine(Colors_1.Colors.green('message 1'));
        terminal.writeLine(Colors_1.Colors.green('message 1'), Colors_1.Colors.red('message 2'));
        terminal.writeError(Colors_1.Colors.green('message 1'));
        terminal.writeWarningLine('message 1', Colors_1.Colors.green('message 2'), 'message 3', Colors_1.Colors.red('message 4'));
        terminal.write('test message');
        terminal.writeWarningLine('test message');
        terminal.writeVerboseLine(Colors_1.Colors.green('message 1'), Colors_1.Colors.red('message 2'));
        terminal.writeVerboseLine('message 1', 'message 2');
        terminal.writeErrorLine('message 1', Colors_1.Colors.green('message 2'), 'message 3', Colors_1.Colors.red('message 4'));
        terminal.writeLine('message 1', Colors_1.Colors.green('message 2'), 'message 3', Colors_1.Colors.red('message 4'));
        terminal.writeWarning('message 1', 'message 2');
        terminal.writeErrorLine(Colors_1.Colors.green('message 1'));
        terminal.write('message 1', 'message 2');
        terminal.writeVerbose(Colors_1.Colors.green('message 1'), Colors_1.Colors.red('message 2'));
        terminal.writeWarning(Colors_1.Colors.green('message 1'));
        terminal.writeLine('test message');
        terminal.writeError('test message');
        terminal.writeLine('message 1', 'message 2');
        terminal.writeErrorLine(Colors_1.Colors.green('message 1'), Colors_1.Colors.red('message 2'));
        terminal.writeError(Colors_1.Colors.green('message 1'), Colors_1.Colors.red('message 2'));
        terminal.writeWarningLine(Colors_1.Colors.green('message 1'), Colors_1.Colors.red('message 2'));
        terminal.writeWarningLine(Colors_1.Colors.green('message 1'));
        verifyProvider();
    });
});
//# sourceMappingURL=Terminal.test.js.map