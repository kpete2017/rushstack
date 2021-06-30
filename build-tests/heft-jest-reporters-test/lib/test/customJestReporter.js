module.exports = /** @class */ (function () {
    function CustomJestReporter(globalConfig, options) {
    }
    CustomJestReporter.prototype.onRunStart = function (results, options) {
        console.log();
        console.log("################# Custom Jest reporter: Starting test run #################");
    };
    CustomJestReporter.prototype.onTestStart = function (test) { };
    CustomJestReporter.prototype.onTestResult = function (test, testResult, results) {
        console.log('Custom Jest reporter: Reporting test result');
        for (var _i = 0, _a = testResult.testResults; _i < _a.length; _i++) {
            var result = _a[_i];
            console.log(result.title + ": " + result.status);
        }
    };
    CustomJestReporter.prototype.onRunComplete = function (contexts, results) {
        console.log('################# Completing test run #################');
        console.log();
    };
    CustomJestReporter.prototype.getLastError = function () { };
    return CustomJestReporter;
}());
//# sourceMappingURL=customJestReporter.js.map