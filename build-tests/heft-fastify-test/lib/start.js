"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = require("fastify");
console.error('CHILD STARTING');
process.on('beforeExit', () => {
    console.error('CHILD BEFOREEXIT');
});
process.on('exit', () => {
    console.error('CHILD EXITED');
});
process.on('SIGINT', function () {
    console.error('CHILD SIGINT');
});
process.on('SIGTERM', function () {
    console.error('CHILD SIGTERM');
});
class MyApp {
    constructor() {
        this.server = fastify_1.fastify({
            logger: true
        });
    }
    async _startAsync() {
        this.server.get('/', async (request, reply) => {
            return { hello: 'world' };
        });
        console.log('Listening on http://localhost:3000');
        await this.server.listen(3000);
    }
    start() {
        this._startAsync().catch((error) => {
            process.exitCode = 1;
            this.server.log.error(error);
            if (error.stack) {
                console.error(error.stack);
                console.error();
            }
            console.error('ERROR: ' + error.toString());
        });
    }
}
const myApp = new MyApp();
myApp.start();
//# sourceMappingURL=start.js.map