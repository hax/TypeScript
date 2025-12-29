// @strict: true
// @noEmit: true

// This test demonstrates type compatibility rules for a hypothetical 'int' type.
// Note: This is a design exploration - the 'int' type does not currently exist.

// Test 1: int to number assignability
// int is assignable to number (per RFC design decision).
let i1: int = 42;
let n1: number = i1; // Per RFC, this assignment is allowed (safe and expected).

// Test 2: number to int assignability  
// Decision needed: Should number be assignable to int?
let n2: number = 3.14;
let i2: int = n2; // Should this be allowed? Probably not - it's a float!

// Test 3: Integer literals to int
let i3: int = 42;    // Should work
let i4: int = 0;     // Should work
let i5: int = -100;  // Should work

// Test 4: Float literals to int
// Should these be errors?
let i6: int = 3.14;  // Error? Non-integer literal
let i7: int = 1.0;   // Allow? Technically an integer value

// Test 5: Literal type to int
let lit: 42 = 42;
let i8: int = lit;   // Should 42 (literal) be assignable to int?

// Test 6: int to literal type
let i9: int = 42;
let lit2: 42 = i9;   // Should int be assignable to specific literal? Probably not.

// Test 7: bigint and int
let big: bigint = 42n;
let i10: int = big;      // Should error - different types
let i11: int = Number(big); // Explicit conversion - should this work?

// Test 8: Generic constraints
function process<T extends int>(value: T): T {
    return value;
}

let result1 = process(42);     // What is the inferred type?
let result2: int = process(42); // Should work

// Test 9: Union type compatibility
let union1: int | string = 42;
union1 = "hello";

let union2: number | string = 42;
let union3: int | string = union2;  // Is number | string assignable to int | string?

// Test 10: Intersection types
type IntWrapper = { value: int };
type NumberWrapper = { value: number };

let iw: IntWrapper = { value: 42 };
let nw: NumberWrapper = iw;  // Is IntWrapper assignable to NumberWrapper?

// Test 11: Array compatibility
let intArr: int[] = [1, 2, 3];
let numArr: number[] = intArr;  // Should int[] be assignable to number[]?

let numArr2: number[] = [1, 2, 3];
let intArr2: int[] = numArr2;   // Should number[] be assignable to int[]?

// Test 12: Function parameter compatibility
function takeInt(x: int): void {}
function takeNumber(x: number): void {}

takeInt(42);
takeNumber(42);

let fn1: (x: int) => void = takeInt;
let fn2: (x: number) => void = takeInt;     // Can assign int param to number param?
let fn3: (x: int) => void = takeNumber;     // Can assign number param to int param?

// Test 13: Return type compatibility
function returnInt(): int { return 42; }
function returnNumber(): number { return 42; }

let f1: () => int = returnInt;
let f2: () => number = returnInt;    // Can assign () => int to () => number?
let f3: () => int = returnNumber;    // Can assign () => number to () => int?

// Test 14: Object type compatibility
interface WithInt { prop: int; }
interface WithNumber { prop: number; }

let objInt: WithInt = { prop: 42 };
let objNumber: WithNumber = objInt;     // Is WithInt assignable to WithNumber?

let objNumber2: WithNumber = { prop: 3.14 };
let objInt2: WithInt = objNumber2;      // Is WithNumber assignable to WithInt?

// Test 15: Index signatures
interface IntIndexed {
    [key: string]: int;
}

interface NumberIndexed {
    [key: string]: number;
}

let intIndexed: IntIndexed = { a: 1, b: 2 };
let numIndexed: NumberIndexed = intIndexed;  // Compatible?

// Test 16: Conditional types
type IsInt<T> = T extends int ? "yes" : "no";
type Test1 = IsInt<int>;      // "yes"
type Test2 = IsInt<number>;   // "no"?
type Test3 = IsInt<42>;       // "yes" if 42 extends int?

// Test 17: Mapped types
type IntFields<T> = {
    [K in keyof T]: int;
};

interface Original {
    a: string;
    b: number;
}

type Inted = IntFields<Original>; // { a: int; b: int; }

// Test 18: any and unknown compatibility
let anyVal: any = 42;
let i12: int = anyVal;  // any is assignable to int

let unknownVal: unknown = 42;
let i13: int = unknownVal;  // Should error - need type guard

// Type guard example
if (typeof unknownVal === "number" && Number.isInteger(unknownVal)) {
    let i14: int = unknownVal;  // Should this narrow to int?
}
