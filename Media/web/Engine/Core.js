
window.InvokeNative = window.InvokeNative || function (InFuncName, ...theArgs) {
    console.log("No Native Invoke: " + JSON.stringify({ func: InFuncName, args: theArgs }));
}

if (!String.prototype.format) {
    String.prototype.format = function () {
        var args = arguments;
        return this.replace(/{(\d+)}/g, function (match, number) {
            return typeof args[number] != 'undefined'
                ? args[number]
                : match
                ;
        });
    };
}

String.prototype.formatUnicorn = String.prototype.formatUnicorn ||
    function () {
        "use strict";
        var str = this.toString();
        if (arguments.length) {
            var t = typeof arguments[0];
            var key;
            var args = ("string" === t || "number" === t) ?
                Array.prototype.slice.call(arguments)
                : arguments[0];

            for (key in args) {
                str = str.replace(new RegExp("\\{" + key + "\\}", "gi"), args[key]);
            }
        }

        return str;
    };


function isInteger(x) { return typeof x === "number" && Number.isInteger(x) }
function isFloat(x) { return typeof x === "number" && !Number.isInteger(x) && Number.isFinite(x) }
function isVector3(x) { return typeof x === "Vector3" }