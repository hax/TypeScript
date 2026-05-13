//// [tests/cases/compiler/indexFromEnd.ts] ////

//// [indexFromEnd.ts]
// Basic index-from-end syntax test

const arr = [1, 2, 3, 4, 5];

// Valid usage - simple identifier
const index = 1;
const last = arr[^index];  // Should be arr[arr.length - index]

// Valid usage - literal
const secondLast = arr[^2];  // Should be arr[arr.length - 2]

// Valid usage - expression with parentheses
const n = 1;
const m = 2;
const fromEnd = arr[^(n + m)];  // Should be arr[arr.length - (n + m)]

// Valid usage - method call
function getIndex(): number {
    return 1;
}
const withMethod = arr[^getIndex()];

// Valid usage - property access
const obj = { idx: 1 };
const withProperty = arr[^obj.idx];

// Type checking - should error for non-number
const str = "1";
const invalid = arr[^str];  // Error: Index from end operator requires an operand of type 'number'

// Type checking - should error for non-array-like targets
interface NumericIndexWithoutLength {
    [n: number]: number;
}
declare const numericIndexWithoutLength: NumericIndexWithoutLength;
const invalidTarget = numericIndexWithoutLength[^1];  // Error: requires numeric length + numeric indexing

// Should work with string arrays
const strArr = ["a", "b", "c"];
const lastStr = strArr[^1];

// Should work with tuples
const tuple: [number, string, boolean] = [1, "test", true];
const lastInTuple = tuple[^1];

// Should work with readonly arrays
const readonlyArr: readonly number[] = [1, 2, 3];
const lastReadonly = readonlyArr[^1];

// Emit - base expression should only be evaluated once
let calls = 0;
function getArr() {
    calls++;
    return arr;
}
const withSideEffects = getArr()[^1];

// Emit - optional chaining should preserve short-circuiting and still evaluate base once
let optionalCalls = 0;
function getOptionalArr(): number[] | undefined {
    optionalCalls++;
    return optionalCalls % 2 ? arr : undefined;
}
const optionalWithSideEffects = getOptionalArr()?.[^1];


//// [indexFromEnd.js]
"use strict";
// Basic index-from-end syntax test
var _a;
var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
var arr = [1, 2, 3, 4, 5];
// Valid usage - simple identifier
var index = 1;
var last = (_b = arr)[_b.length - index]; // Should be arr[arr.length - index]
// Valid usage - literal
var secondLast = (_c = arr)[_c.length - 2]; // Should be arr[arr.length - 2]
// Valid usage - expression with parentheses
var n = 1;
var m = 2;
var fromEnd = (_d = arr)[_d.length - (n + m)]; // Should be arr[arr.length - (n + m)]
// Valid usage - method call
function getIndex() {
    return 1;
}
var withMethod = (_e = arr)[_e.length - getIndex()];
// Valid usage - property access
var obj = { idx: 1 };
var withProperty = (_f = arr)[_f.length - obj.idx];
// Type checking - should error for non-number
var str = "1";
var invalid = (_g = arr)[_g.length - str]; // Error: Index from end operator requires an operand of type 'number'
var invalidTarget = (_h = numericIndexWithoutLength)[_h.length - 1]; // Error: requires numeric length + numeric indexing
// Should work with string arrays
var strArr = ["a", "b", "c"];
var lastStr = (_j = strArr)[_j.length - 1];
// Should work with tuples
var tuple = [1, "test", true];
var lastInTuple = (_k = tuple)[_k.length - 1];
// Should work with readonly arrays
var readonlyArr = [1, 2, 3];
var lastReadonly = (_l = readonlyArr)[_l.length - 1];
// Emit - base expression should only be evaluated once
var calls = 0;
function getArr() {
    calls++;
    return arr;
}
var withSideEffects = (_m = getArr())[_m.length - 1];
// Emit - optional chaining should preserve short-circuiting and still evaluate base once
var optionalCalls = 0;
function getOptionalArr() {
    optionalCalls++;
    return optionalCalls % 2 ? arr : undefined;
}
var optionalWithSideEffects = (_a = (_o = getOptionalArr())) === null || _a === void 0 ? void 0 : _a[_o.length - 1];
