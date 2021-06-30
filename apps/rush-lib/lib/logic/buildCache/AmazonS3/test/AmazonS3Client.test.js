"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
const node_fetch_1 = require("node-fetch");
const AmazonS3Client_1 = require("../AmazonS3Client");
const WebClient_1 = require("../../../../utilities/WebClient");
const DUMMY_OPTIONS_WITHOUT_BUCKET = {
    s3Region: 'us-east-1',
    isCacheWriteAllowed: true
};
const DUMMY_OPTIONS = Object.assign(Object.assign({}, DUMMY_OPTIONS_WITHOUT_BUCKET), { s3Bucket: 'test-s3-bucket' });
class MockedDate extends Date {
    constructor() {
        super(2020, 3, 18, 12, 32, 42, 493);
    }
    toISOString() {
        return '2020-04-18T12:32:42.493Z';
    }
}
describe('AmazonS3Client', () => {
    it('Rejects invalid S3 bucket names', () => {
        expect(() => new AmazonS3Client_1.AmazonS3Client(undefined, Object.assign({ s3Bucket: undefined }, DUMMY_OPTIONS_WITHOUT_BUCKET))).toThrowErrorMatchingSnapshot();
        expect(() => new AmazonS3Client_1.AmazonS3Client(undefined, Object.assign({ s3Bucket: '-abc' }, DUMMY_OPTIONS_WITHOUT_BUCKET))).toThrowErrorMatchingSnapshot();
        expect(() => new AmazonS3Client_1.AmazonS3Client(undefined, Object.assign({ s3Bucket: 'a!bc' }, DUMMY_OPTIONS_WITHOUT_BUCKET))).toThrowErrorMatchingSnapshot();
        expect(() => new AmazonS3Client_1.AmazonS3Client(undefined, Object.assign({ s3Bucket: 'a' }, DUMMY_OPTIONS_WITHOUT_BUCKET))).toThrowErrorMatchingSnapshot();
        expect(() => new AmazonS3Client_1.AmazonS3Client(undefined, Object.assign({ s3Bucket: '10.10.10.10' }, DUMMY_OPTIONS_WITHOUT_BUCKET))).toThrowErrorMatchingSnapshot();
        expect(() => new AmazonS3Client_1.AmazonS3Client(undefined, Object.assign({ s3Bucket: 'abc..d' }, DUMMY_OPTIONS_WITHOUT_BUCKET))).toThrowErrorMatchingSnapshot();
        expect(() => new AmazonS3Client_1.AmazonS3Client(undefined, Object.assign({ s3Bucket: 'abc.-d' }, DUMMY_OPTIONS_WITHOUT_BUCKET))).toThrowErrorMatchingSnapshot();
        expect(() => new AmazonS3Client_1.AmazonS3Client(undefined, Object.assign({ s3Bucket: 'abc-.d' }, DUMMY_OPTIONS_WITHOUT_BUCKET))).toThrowErrorMatchingSnapshot();
        expect(() => new AmazonS3Client_1.AmazonS3Client(undefined, Object.assign({ s3Bucket: 'abc-' }, DUMMY_OPTIONS_WITHOUT_BUCKET))).toThrowErrorMatchingSnapshot();
    });
    it('Accepts valid S3 bucket names', () => {
        expect(() => new AmazonS3Client_1.AmazonS3Client(undefined, Object.assign({ s3Bucket: 'abc123' }, DUMMY_OPTIONS_WITHOUT_BUCKET))).not.toThrow();
        expect(() => new AmazonS3Client_1.AmazonS3Client(undefined, Object.assign({ s3Bucket: 'abc' }, DUMMY_OPTIONS_WITHOUT_BUCKET))).not.toThrow();
        expect(() => new AmazonS3Client_1.AmazonS3Client(undefined, Object.assign({ s3Bucket: 'foo-bar-baz' }, DUMMY_OPTIONS_WITHOUT_BUCKET))).not.toThrow();
        expect(() => new AmazonS3Client_1.AmazonS3Client(undefined, Object.assign({ s3Bucket: 'foo.bar.baz' }, DUMMY_OPTIONS_WITHOUT_BUCKET))).not.toThrow();
    });
    it('Does not allow upload without credentials', async () => {
        const client = new AmazonS3Client_1.AmazonS3Client(undefined, Object.assign({ s3Bucket: 'foo.bar.baz' }, DUMMY_OPTIONS_WITHOUT_BUCKET));
        try {
            await client.uploadObjectAsync('temp', undefined);
            fail('Expected an exception to be thrown');
        }
        catch (e) {
            expect(e).toMatchSnapshot();
        }
    });
    describe('Making requests', () => {
        let realDate;
        beforeEach(() => {
            realDate = global.Date;
            global.Date = MockedDate;
        });
        afterEach(() => {
            jest.restoreAllMocks();
            global.Date = realDate;
        });
        async function makeS3ClientRequestAsync(credentials, options, request, response) {
            const spy = jest
                .spyOn(WebClient_1.WebClient.prototype, 'fetchAsync')
                .mockReturnValue(Promise.resolve(new node_fetch_1.Response(response.body, response.responseInit)));
            const s3Client = new AmazonS3Client_1.AmazonS3Client(credentials, options);
            let result;
            let error;
            try {
                result = await request(s3Client);
            }
            catch (e) {
                error = e;
            }
            expect(spy).toHaveBeenCalledTimes(1);
            expect(spy.mock.calls[0]).toMatchSnapshot();
            if (error) {
                throw error;
            }
            else {
                return result;
            }
        }
        async function runAndExpectErrorAsync(fnAsync) {
            try {
                await fnAsync();
                fail('Expected an error to be thrown');
            }
            catch (e) {
                expect(e).toMatchSnapshot();
            }
        }
        describe('Getting an object', () => {
            async function makeGetRequestAsync(credentials, options, objectName, response) {
                return await makeS3ClientRequestAsync(credentials, options, async (s3Client) => {
                    return await s3Client.getObjectAsync(objectName);
                }, response);
            }
            function registerGetTests(credentials) {
                it('Can get an object', async () => {
                    const expectedContents = 'abc123-contents';
                    const result = await makeGetRequestAsync(credentials, DUMMY_OPTIONS, 'abc123', {
                        body: expectedContents,
                        responseInit: {
                            status: 200
                        }
                    });
                    expect(result).toBeDefined();
                    expect(result === null || result === void 0 ? void 0 : result.toString()).toBe(expectedContents);
                });
                it('Can get an object from a different region', async () => {
                    const expectedContents = 'abc123-contents';
                    const result = await makeGetRequestAsync(credentials, Object.assign(Object.assign({}, DUMMY_OPTIONS), { s3Region: 'us-west-1' }), 'abc123', {
                        body: expectedContents,
                        responseInit: {
                            status: 200
                        }
                    });
                    expect(result).toBeDefined();
                    expect(result === null || result === void 0 ? void 0 : result.toString()).toBe(expectedContents);
                });
                it('Handles a missing object', async () => {
                    const result = await makeGetRequestAsync(credentials, DUMMY_OPTIONS, 'abc123', {
                        responseInit: {
                            status: 404,
                            statusText: 'Not Found'
                        }
                    });
                    expect(result).toBeUndefined();
                });
                it('Handles an unexpected error', async () => {
                    await runAndExpectErrorAsync(async () => await makeGetRequestAsync(credentials, DUMMY_OPTIONS, 'abc123', {
                        responseInit: {
                            status: 500,
                            statusText: 'Server Error'
                        }
                    }));
                });
            }
            describe('Without credentials', () => {
                registerGetTests(undefined);
                it('Handles missing credentials object', async () => {
                    const result = await makeGetRequestAsync(undefined, DUMMY_OPTIONS, 'abc123', {
                        responseInit: {
                            status: 403,
                            statusText: 'Unauthorized'
                        }
                    });
                    expect(result).toBeUndefined();
                });
            });
            function registerGetWithCredentialsTests(credentials) {
                registerGetTests(credentials);
                it('Handles a 403 error', async () => {
                    await runAndExpectErrorAsync(async () => await makeGetRequestAsync(credentials, DUMMY_OPTIONS, 'abc123', {
                        responseInit: {
                            status: 403,
                            statusText: 'Unauthorized'
                        }
                    }));
                });
            }
            describe('With credentials', () => {
                registerGetWithCredentialsTests({
                    accessKeyId: 'accessKeyId',
                    secretAccessKey: 'secretAccessKey',
                    sessionToken: undefined
                });
            });
            describe('With credentials including a session token', () => {
                registerGetWithCredentialsTests({
                    accessKeyId: 'accessKeyId',
                    secretAccessKey: 'secretAccessKey',
                    sessionToken: 'sessionToken'
                });
            });
        });
        describe('Uploading an object', () => {
            async function makeUploadRequestAsync(credentials, options, objectName, objectContents, response) {
                return await makeS3ClientRequestAsync(credentials, options, async (s3Client) => {
                    return await s3Client.uploadObjectAsync(objectName, Buffer.from(objectContents));
                }, response);
            }
            it('Throws an error if credentials are not provided', async () => {
                await runAndExpectErrorAsync(async () => await makeUploadRequestAsync(undefined, DUMMY_OPTIONS, 'abc123', 'abc123-contents', undefined));
            });
            function registerUploadTests(credentials) {
                it('Uploads an object', async () => {
                    await makeUploadRequestAsync(credentials, DUMMY_OPTIONS, 'abc123', 'abc123-contents', {
                        responseInit: {
                            status: 200
                        }
                    });
                });
                it('Uploads an object to a different region', async () => {
                    await makeUploadRequestAsync(credentials, Object.assign(Object.assign({}, DUMMY_OPTIONS), { s3Region: 'us-west-1' }), 'abc123', 'abc123-contents', {
                        responseInit: {
                            status: 200
                        }
                    });
                });
                it('Handles an unexpected error code', async () => {
                    await runAndExpectErrorAsync(async () => await makeUploadRequestAsync(credentials, DUMMY_OPTIONS, 'abc123', 'abc123-contents', {
                        responseInit: {
                            status: 500,
                            statusText: 'Server Error'
                        }
                    }));
                });
            }
            describe('With credentials', () => {
                registerUploadTests({
                    accessKeyId: 'accessKeyId',
                    secretAccessKey: 'secretAccessKey',
                    sessionToken: undefined
                });
            });
            describe('With credentials including a session token', () => {
                registerUploadTests({
                    accessKeyId: 'accessKeyId',
                    secretAccessKey: 'secretAccessKey',
                    sessionToken: 'sessionToken'
                });
            });
        });
    });
});
//# sourceMappingURL=AmazonS3Client.test.js.map