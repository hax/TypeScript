// @strict: true
// @noEmit: true

// This test explores arithmetic operations with a hypothetical 'int' type.
// Note: This is a design exploration - the 'int' type does not currently exist.

// Basic arithmetic operations
let a: int = 10;
let b: int = 3;

// Addition - should return int
let sum = a + b;          // What type is inferred?
let sumInt: int = a + b;  // Should this be allowed?

// Subtraction - should return int
let diff = a - b;
let diffInt: int = a - b;

// Multiplication - should return int
let product = a * b;
let productInt: int = a * b;

// Division - returns number (per RFC design decision: division always produces `number` type)
let quotient = a / b;        // Inferred as number
let quotientNum: number = a / b;   // Should work
let quotientInt: int = a / b;      // Design question: should this be allowed, or require explicit conversion from number to int?

// Modulo - should return int
let remainder = a % b;
let remainderInt: int = a % b;

// Exponentiation - may produce non-integer
let power = a ** b;           // What type? 10^3 = 1000 (int), but 10^0.5 would be float
let powerInt: int = a ** b;   // Should this work?

// Unary operations
let negation = -a;          // Should return int
let negInt: int = -a;

let plus = +a;              // Should return int
let plusInt: int = +a;

// Increment/Decrement
let c: int = 5;
c++;                         // Should remain int
let d: int = c++;           // Should work
let e: int = ++c;           // Should work

c--;
let f: int = c--;
let g: int = --c;

// Compound assignment operators
let h: int = 10;
h += 5;                     // Should remain int
h -= 3;                     // Should remain int  
h *= 2;                     // Should remain int
h /= 2;                     // What should happen here?
h %= 3;                     // Should remain int

// Mixed operations: int with int
function intWithInt() {
    let x: int = 10;
    let y: int = 5;
    
    let add: int = x + y;
    let sub: int = x - y;
    let mul: int = x * y;
    let div = x / y;        // Type?
    let mod: int = x % y;
}

// Mixed operations: int with number
function intWithNumber() {
    let i: int = 10;
    let n: number = 3.5;
    
    // Mixed int/number operations always return `number` (per RFC lines 108-119).
    let add = i + n;        // number (13.5)
    let sub = i - n;        // number (6.5)
    let mul = i * n;        // number (35.0)
    let div = i / n;        // number
    
    // Assigning the `number` result of mixed operations to `int` should be an error (per RFC lines 55-62).
    let addInt: int = i + n;   // Error: result is number, not int
    let subInt: int = i - n;   // Error: result is number, not int
}

// Operations with literal types
function withLiterals() {
    let i: int = 10;
    
    // Integer literals
    let add1 = i + 5;       // int + 5 -> int?
    let add2: int = i + 5;
    
    // Float literals
    let add3 = i + 3.14;    // int + 3.14 -> number
    let add4: number = i + 3.14;
}

// Bitwise operations - should definitely work with int and return int
let x: int = 5;  // 0101
let y: int = 3;  // 0011

let bitwiseAnd: int = x & y;       // 0001 = 1
let bitwiseOr: int = x | y;        // 0111 = 7
let bitwiseXor: int = x ^ y;       // 0110 = 6
let bitwiseNot: int = ~x;          // ...1010 = -6
let leftShift: int = x << 1;       // 1010 = 10
let rightShift: int = x >> 1;      // 0010 = 2
let unsignedRight: int = x >>> 1;  // 0010 = 2

// Comparison operations - should work between int and return boolean
let eq: boolean = a == b;
let neq: boolean = a != b;
let strictEq: boolean = a === b;
let strictNeq: boolean = a !== b;
let lt: boolean = a < b;
let lte: boolean = a <= b;
let gt: boolean = a > b;
let gte: boolean = a >= b;

// Logical operations - coercion rules
let and = a && b;           // Should return int (short-circuit)
let or = a || b;            // Should return int
let not = !a;               // Should return boolean

// Ternary operator
let ternary1 = true ? a : b;           // Should return int
let ternary2: int = false ? a : b;
let ternary3 = true ? a : 3.14;        // Should return number (union of int and float)

// Template literals
let template = `Count: ${a}`;           // Should work
let template2: string = `Value: ${a}`;

// String concatenation
let concat = "Count: " + a;             // Should produce string
let concat2: string = a + " items";     // Should produce string

// Overflow behavior - JavaScript safe integer range
let maxSafe: int = Number.MAX_SAFE_INTEGER;  // 2^53 - 1
let overflow = maxSafe + 1;                   // What happens?
let overflowInt: int = maxSafe + 1;          // Should this warn or error?

// Fractional results
function fractionalResults() {
    let x: int = 1;
    let y: int = 2;
    
    let result = x / y;     // 0.5 - can't be represented as int
    // Should this:
    // A) Return number type
    // B) Truncate to 0 
    // C) Error at compile time
}

// Operations with NaN and Infinity
function specialValues() {
    let i: int = 42;
    let nan = i / 0;        // NaN
    let inf = i + Infinity; // Infinity
    
    // These are `number` values and are assignable to `int` with a warning (configurable as an error) per the RFC.
    let nanInt: int = nan;  // Allowed with warning: assigning NaN (number) to int
    let infInt: int = inf;  // Allowed with warning: assigning Infinity (number) to int
}

// Generic arithmetic
function genericAdd<T extends int | number>(a: T, b: T): T {
    return (a as any) + (b as any);  // What should the return type be?
}

let genResult1 = genericAdd(5 as int, 3 as int);      // T = int
let genResult2 = genericAdd(5.5, 3.2);                 // T = number
