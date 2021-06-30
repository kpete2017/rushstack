var ChunkClass = /** @class */ (function () {
    function ChunkClass() {
    }
    ChunkClass.prototype.doStuff = function () {
        console.log('CHUNK');
    };
    ChunkClass.prototype.getImageUrl = function () {
        return require('./image.png');
    };
    return ChunkClass;
}());
export { ChunkClass };
//# sourceMappingURL=ChunkClass.js.map