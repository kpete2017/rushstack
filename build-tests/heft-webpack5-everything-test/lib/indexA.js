/* eslint-disable */
/* tslint:disable */
import(/* webpackChunkName: 'chunk' */ './chunks/ChunkClass')
    .then(function (_a) {
    var ChunkClass = _a.ChunkClass;
    var chunk = new ChunkClass();
    chunk.doStuff();
})
    .catch(function (e) {
    console.log('Error: ' + e.message);
});
//# sourceMappingURL=indexA.js.map