//// [tests/cases/compiler/variableNameTrailingApostrophes.ts] ////

//// [variableNameTrailingApostrophes.ts]
let x = 1;
let x' = x + 2;
const x'' = x' + 1;
var x''' = x'' + 1;

using y' = {
    [Symbol.dispose]() {},
};

const o1 = { x' }; // property shorthand strips trailing apostrophes
o1.x.toFixed();

const o2 = { x'': x''' };
o2.x.toFixed();

{
    let { x' } = o1; // destructuring shorthand strips trailing apostrophes
    x'.toFixed();
}

let { x: x'''' } = o1;
x''''.toFixed();

class C {
    method() {}
    method'() {} // should error
}

const obj = {
    method'() {}, // should error
};


//// [variableNameTrailingApostrophes.js]
"use strict";
var __addDisposableResource = (this && this.__addDisposableResource) || function (env, value, async) {
    if (value !== null && value !== void 0) {
        if (typeof value !== "object" && typeof value !== "function") throw new TypeError("Object expected.");
        var dispose, inner;
        if (async) {
            if (!Symbol.asyncDispose) throw new TypeError("Symbol.asyncDispose is not defined.");
            dispose = value[Symbol.asyncDispose];
        }
        if (dispose === void 0) {
            if (!Symbol.dispose) throw new TypeError("Symbol.dispose is not defined.");
            dispose = value[Symbol.dispose];
            if (async) inner = dispose;
        }
        if (typeof dispose !== "function") throw new TypeError("Object not disposable.");
        if (inner) dispose = function() { try { inner.call(this); } catch (e) { return Promise.reject(e); } };
        env.stack.push({ value: value, dispose: dispose, async: async });
    }
    else if (async) {
        env.stack.push({ async: true });
    }
    return value;
};
var __disposeResources = (this && this.__disposeResources) || (function (SuppressedError) {
    return function (env) {
        function fail(e) {
            env.error = env.hasError ? new SuppressedError(e, env.error, "An error was suppressed during disposal.") : e;
            env.hasError = true;
        }
        var r, s = 0;
        function next() {
            while (r = env.stack.pop()) {
                try {
                    if (!r.async && s === 1) return s = 0, env.stack.push(r), Promise.resolve().then(next);
                    if (r.dispose) {
                        var result = r.dispose.call(r.value);
                        if (r.async) return s |= 2, Promise.resolve(result).then(next, function(e) { fail(e); return next(); });
                    }
                    else s |= 1;
                }
                catch (e) {
                    fail(e);
                }
            }
            if (s === 1) return env.hasError ? Promise.reject(env.error) : Promise.resolve();
            if (env.hasError) throw env.error;
        }
        return next();
    };
})(typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
});
let x = 1;
let x' = x + 2;
const x'' = x' + 1;
var x''' = x'' + 1;
var y', o1, o2, x'''', C, obj;
const env_1 = { stack: [], error: void 0, hasError: false };
try {
    y' = __addDisposableResource(env_1, {
        [Symbol.dispose]() { },
    }, false);
    o1 = { x: x' }; // property shorthand strips trailing apostrophes
    o1.x.toFixed();
    o2 = { x, '': x''' };
    o2.x.toFixed();
    {
        let { x: x' } = o1; // destructuring shorthand strips trailing apostrophes
        x'.toFixed();
    }
    ({ x: x'''' } = o1);
    x''''.toFixed();
    C = class C {
        method() { }
        method;
        '() {} // should error;
    };
    obj = {
        method, '() {}, // should error: 
    };
}
catch (e_1) {
    env_1.error = e_1;
    env_1.hasError = true;
}
finally {
    __disposeResources(env_1);
}
