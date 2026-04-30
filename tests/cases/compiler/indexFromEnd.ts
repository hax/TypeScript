// @strict: true
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

// Should work with string arrays
const strArr = ["a", "b", "c"];
const lastStr = strArr[^1];

// Should work with tuples
const tuple: [number, string, boolean] = [1, "test", true];
const lastInTuple = tuple[^1];

// Should work with readonly arrays
const readonlyArr: readonly number[] = [1, 2, 3];
const lastReadonly = readonlyArr[^1];
