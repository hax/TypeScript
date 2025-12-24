// @strict: true
// @noEmit: true

// This test demonstrates basic usage of a hypothetical 'int' type in TypeScript.
// Note: This is a design exploration - the 'int' type does not currently exist.

// Basic int declarations
let count: int = 42;
let index: int = 0;
let negative: int = -10;

// Function with int parameters and return type
function add(a: int, b: int): int {
    return a + b;
}

function subtract(x: int, y: int): int {
    return x - y;
}

function multiply(x: int, y: int): int {
    return x * y;
}

// Arrays of integers
let numbers: int[] = [1, 2, 3, 4, 5];
let emptyInts: int[] = [];

// Tuples with int
let pair: [int, int] = [10, 20];
let triple: [int, string, int] = [1, "test", 2];

// Object properties with int type
interface Point {
    x: int;
    y: int;
}

let point: Point = { x: 100, y: 200 };

interface User {
    id: int;
    name: string;
    age: int;
}

let user: User = {
    id: 1,
    name: "Alice",
    age: 30
};

// Generic types with int
let map: Map<string, int> = new Map();
map.set("count", 42);

let set: Set<int> = new Set([1, 2, 3]);

// Optional and nullable int
function process(value?: int): void {
    if (value !== undefined) {
        console.log(value);
    }
}

let nullable: int | null = null;
nullable = 42;

// Union types with int
let mixed: int | string = 42;
mixed = "hello";

// Type aliases
type UserId = int;
type Count = int;

let userId: UserId = 123;
let itemCount: Count = 5;

// Const assertions with int
const MAX_SIZE: int = 100;
const MIN_SIZE: int = 0;

// Integer literals
let literal = 42; // Currently infers as literal type 42
let explicitInt: int = 42; // Explicitly typed as int

// Rest parameters
function sum(...values: int[]): int {
    return values.reduce((a, b) => a + b, 0);
}

// Destructuring
let [first, second]: [int, int] = [10, 20];
let { x, y }: Point = { x: 5, y: 10 };

// Type assertions
let value: any = 42;
let intValue = value as int;

// Classes with int properties
class Counter {
    private count: int = 0;

    increment(): void {
        this.count++;
    }

    getCount(): int {
        return this.count;
    }
}

// Inheritance
interface Identifiable {
    id: int;
}

class Entity implements Identifiable {
    constructor(public id: int) {}
}

// Return type inference - should infer int
function createId() {
    const id: int = 123;
    return id;
}

// Discriminated unions
type Result = 
    | { status: "success"; code: int }
    | { status: "error"; code: int; message: string };

function handleResult(result: Result) {
    if (result.status === "success") {
        console.log(`Success with code ${result.code}`);
    } else {
        console.log(`Error ${result.code}: ${result.message}`);
    }
}
