# Considerations for Adding an `int` Type to TypeScript

## Executive Summary

This document analyzes the design considerations, implementation challenges, and implications of adding a new primitive `int` (integer) type to TypeScript. The `int` type would represent integer numbers, distinct from the existing `number` type which represents all IEEE 754 floating-point numbers.

## Background

Currently, TypeScript has:
- `number`: All numeric values (integers and floating-point)
- `bigint`: Arbitrary precision integers
- Numeric literal types: e.g., `42`, `3.14`

An `int` type would provide:
- Static type checking for integer-only operations
- Better documentation of intent
- Potential for runtime optimizations
- Alignment with other typed languages

## Major Design Areas

### 1. Syntax and Language Specification

#### 1.1 Type Annotation Syntax
```typescript
// Basic usage
let count: int = 42;
let index: int = 0;

// Function signatures
function add(a: int, b: int): int {
    return a + b;
}

// Arrays and generics
let numbers: int[] = [1, 2, 3];
let map: Map<string, int> = new Map();
```

#### 1.2 Keyword Addition
- Add `IntKeyword` to `SyntaxKind` enum in `types.ts`
- Update keyword token mapping in `scanner.ts`
- Add to `KeywordTypeSyntaxKind` union type
- Ensure no conflicts with existing JavaScript/TypeScript identifiers

#### 1.3 Type Compatibility Rules
**Design decisions:**

1. **`int` is assignable to `number`** (safe and expected)
   ```typescript
   let i: int = 42;
   let n: number = i; // Allowed - int is subset of number
   ```

2. **`number` is assignable to `int` with warning**
   ```typescript
   let n: number = 3.14;
   let i: int = n; // Warning by default, can be configured as error
   ```
   - Allows gradual migration of existing code by not immediately breaking assignments where `number` is passed to variables/parameters annotated as `int`, while still surfacing these sites as warnings so developers can incrementally fix type mismatches
   - CompilerOption to control behavior (warning/error)
   - Avoids forcing developers to add noisy or semantically unnecessary casts (for example, when a value is known to be an integer but is typed as `number`, requiring an explicit `number` → `int` conversion would add clutter without improving safety)

3. **Numeric literals infer as int for integer values**
   ```typescript
   let x = 42;      // Infers int
   const y = 42;    // Infers literal type 42
   let z: int = 42; // Explicit int annotation
   ```

### 2. Type System Integration

#### 2.1 TypeFlags Enumeration
Add new flag to `TypeFlags` enum in `types.ts`:
```typescript
export const enum TypeFlags {
    // ... existing flags
    Int = 1 << 31,  // New flag for int type
    // ... existing flags
    IntLiteral = 1 << 32,  // For integer literal types
}
```

**Considerations:**
- Currently using 30 bits of flag space
- Need to ensure bitwise operations still work efficiently
- Update all `TypeFlags` combinations (IntLike, Primitive, etc.)

#### 2.2 Type Relationships
Update type compatibility checking in `checker.ts`:

```typescript
// Type hierarchy decisions
NumberLike = Number | NumberLiteral | Enum | Int | IntLiteral
IntLike = Int | IntLiteral
Primitive = StringLike | NumberLike | BigIntLike | BooleanLike | ...
```

#### 2.3 Type Inference Rules

1. **Literal inference**:
   ```typescript
   const x = 42; // Infers literal type 42
   let y = 42;   // Infers int
   ```

2. **Operation inference:**
   ```typescript
   function add(a: int, b: int) {
       return a + b; // Returns int
   }
   
   function divide(a: int, b: int) {
       return a / b; // Returns number (may be fractional)
   }
   
   function mixed(a: int, b: number) {
       return a + b; // Returns number (mixed types always produce number)
   }
   ```

3. **Generic constraints:**
   ```typescript
   function sum<T extends int | number>(a: T, b: T): T {
       return a + b;
   }
   ```

### 3. Compiler Implementation

#### 3.1 Parser Changes (`parser.ts`)
- Update `parseTypeReference()` to handle `int` keyword
- Add validation for `int` type nodes
- Ensure proper AST structure

#### 3.2 Checker Changes (`checker.ts`)
**Major areas:**

1. **Type creation:**
   ```typescript
   var intType = createIntrinsicType(TypeFlags.Int, "int");
   ```

2. **Type checking:**
   - Integer literal compatibility with `int`
   - Arithmetic operation result types
   - Comparison operations
   - Bitwise operations (should remain int)

3. **Type narrowing:**
   ```typescript
   function check(x: number) {
       if (Number.isInteger(x) && x >= -2147483648 && x <= 2147483647) {
           // x narrowed to int (int32 range check)
       }
   }
   ```

4. **Built-in operations:**
   - Array indexing: Changed to accept only `int` (passing `number` triggers warning/error)
   - String indexing: Changed to accept only `int`
   - Tuple indexing: Changed to accept only `int`
   - Bitwise operations: **Required to use `int`** types

#### 3.3 Emitter Changes (`emitter.ts`)
**Optional runtime enforcement** via compiler option:
- Default: Emit as regular JavaScript numbers (type erased)
- Optional: Emit as `value | 0` to enforce int32 conversion at runtime
- CompilerOption to control emit behavior

#### 3.4 Transformer Changes
- Ensure type annotations are properly stripped
- Optional transformer for runtime int32 conversion

### 4. Standard Library Integration

#### 4.1 Built-in APIs
**Many APIs would need overloads:**

```typescript
// Array methods
interface Array<T> {
    [n: int]: T;  // Index signatures
    length: int;   // Should length be int?
    indexOf(searchElement: T, fromIndex?: int): int;
    lastIndexOf(searchElement: T, fromIndex?: int): int;
    // ... many more
}

// Math methods - keep existing signatures (values outside int32 range)
interface Math {
    floor(x: number): number;  // Not changed - result may exceed int32
    ceil(x: number): number;
    round(x: number): number;
    trunc(x: number): number;
    abs(x: number): number;
    min(...values: number[]): number;
    max(...values: number[]): number;
    // ... etc
}

// Number methods - not changed (no need for int overloads)
interface Number {
    toFixed(fractionDigits?: number): string;
    toExponential(fractionDigits?: number): string;
    toPrecision(precision?: number): string;
}

// String methods
interface String {
    [index: int]: string | undefined;
    length: int;
    charAt(pos: int): string;
    charCodeAt(index: int): int;
    substring(start: int, end?: int): string;
    // ... many more
}
```

#### 4.2 Global Functions
```typescript
declare function parseInt(string: string, radix?: int): number;  // radix is int, but returns number
declare function parseFloat(string: string): number;
// ... etc
```

### 5. Backwards Compatibility

#### 5.1 Breaking Changes
**Potential issues:**

1. **`int` as identifier:**
   ```typescript
   // Existing code that uses 'int' as a variable name
   let int = 42; // Still allowed - int is contextual keyword
   function int() {} // Still allowed
   ```
   - **Solution**: `int` is a contextual keyword (only keyword in type positions)

2. **Type inference changes:**
   - Integer literals in non-`const` variable declarations now infer as `int` (e.g., `let x = 42;` infers `int` rather than the literal type `42`).
   - This is a breaking change, but is limited to value inference for integer literals; literal types remain available (e.g., via `as const` and in type positions).

3. **Library compatibility:**
   - Existing type definitions continue to work
   - `int` is assignable to `number` (safe conversion)

#### 5.2 Migration Strategy
All changes introduced at once - no phased approach needed.

### 6. Semantic Challenges

#### 6.1 Operations That Produce Non-Integers
```typescript
let a: int = 10;
let b: int = 3;
let c = a / b; // Returns number (may be fractional)
```

**Design decision:** Division always produces `number` type.

#### 6.2 Range Limitations
`int` type represents int32 range:
- Range: -2147483648 to 2147483647 (32-bit signed integer)
- Operations that overflow are undefined behavior (UB)
- No compile-time overflow checking

```typescript
let max: int = 2147483647;
let overflow: int = max + 1; // Undefined behavior (UB)
```

#### 6.3 Bitwise Operations
Bitwise operations **require `int`** and return `int`:
```typescript
let a: int = 5;
let b: int = 3;
let c = a & b;  // Returns int
let d = a << 2; // Returns int
```

#### 6.4 Interaction with BigInt
```typescript
let i: int = 42;
let b: bigint = 42n;

// Design decisions:
let x = i + b;  // Not allowed - type error
let y: bigint = i;  // Not allowed - type error
let z: int = Number(b); // Allowed with explicit conversion
```

### 7. Testing Requirements

#### 7.1 Compiler Tests
Create tests in `tests/cases/compiler/`:

1. **Basic usage:**
   - `intTypeBasic.ts` - Basic int declarations and assignments
   - `intTypeInference.ts` - Type inference with int
   - `intTypeCompatibility.ts` - Assignability rules

2. **Type checking:**
   - `intTypeArithmetic.ts` - Arithmetic operations
   - `intTypeBitwise.ts` - Bitwise operations
   - `intTypeComparison.ts` - Comparison operations

3. **Edge cases:**
   - `intTypeLiterals.ts` - Literal type behavior
   - `intTypeOverflow.ts` - Overflow handling
   - `intTypeGeneric.ts` - Generics with int constraints

4. **Integration:**
   - `intTypeWithStdLib.ts` - Standard library integration
   - `intTypeWithBigInt.ts` - Interaction with bigint
   - `intTypeNarrowing.ts` - Type narrowing behavior

#### 7.2 Fourslash Tests
Create tests in `tests/cases/fourslash/`:

1. **Completions:**
   - `intTypeCompletion.ts` - Verify 'int' appears in completions
   
2. **Quick Info:**
   - `intTypeQuickInfo.ts` - Hover information shows correct type

3. **Code Fixes:**
   - `intTypeConversion.ts` - Suggest int/number conversions

#### 7.3 Baselines
- Update all baselines that would change
- Ensure error messages are clear and helpful

### 8. Error Messages and Diagnostics

Need to add to `diagnosticMessages.json`:

```json
{
  "Type '{0}' is not assignable to type 'int'. Only integer values can be assigned to 'int'.": {
    "category": "Error",
    "code": XXXXX
  },
  "Operation '{0}' may produce a non-integer result. Consider using 'number' type instead.": {
    "category": "Error", 
    "code": XXXXX
  },
  "Integer overflow: Value exceeds safe integer range.": {
    "category": "Warning",
    "code": XXXXX
  }
}
```

### 10. Resolved Design Questions

1. **`int` with decimal notation?**
   ```typescript
   let x: int = 42.0; // Not allowed

2. **parseInt return type:**
   ```typescript
   let x = parseInt("42"); // Returns number (not int) for backward compatibility

3. **JSON serialization:**
   ```typescript
   JSON.parse('{"count": 42}') // Current type inference unchanged
   ```

4. **Type guards:**
   ```typescript
   function isInt(x: any): x is int {
       return Number.isInteger(x) && x >= -2147483648 && x <= 2147483647;
   }
   ```

5. **Widening behavior:**
   ```typescript
   let x = 42; // Infers int
   let y: int = x; // int is assignable to int
   ```

### 11. Implementation Checklist

#### Core Implementation
- [ ] Add `IntKeyword` to SyntaxKind
- [ ] Update scanner to recognize `int`
- [ ] Add `Int` to TypeFlags (int32 range)
- [ ] Implement basic type checking
- [ ] Update parser for int type nodes
- [ ] Basic test coverage

#### Type System Integration
- [ ] Define type compatibility rules (int → number safe, number → int warning)
- [ ] Implement type inference (operations, mixed types)
- [ ] Handle arithmetic operations (int + int = int, int / int = number)
- [ ] Update bitwise operations to require int
- [ ] Update array/string indexing to accept int
- [ ] Comprehensive test coverage

#### Standard Library
- [ ] Update Array index signatures to use int
- [ ] Update String index signatures to use int
- [ ] Update parseInt radix parameter to int
- [ ] Test standard library integration

#### Compiler Options
- [ ] Add option to control number → int behavior (warning/error)
- [ ] Add option to emit runtime int32 conversion (`value | 0`)

#### Tooling and Polish
- [ ] Language service integration
- [ ] Error messages and diagnostics
- [ ] Performance optimization
- [ ] Documentation

## Summary

This document outlines the design and implementation considerations for adding a primitive `int` type to TypeScript:

### Key Design Decisions:
1. `int` represents int32 range (-2147483648 to 2147483647)
2. `int` is assignable to `number` (safe conversion)
3. `number` is assignable to `int` with warning (configurable)
4. Integer literals (`42`) infer as `int` for let, literal type for const
5. Arithmetic operations between ints return int (except division → number)
6. Mixed int/number operations return number
7. Bitwise operations require and return int
8. Array/string indexing changed to require int
9. `int` to `bigint` conversion not allowed (must use explicit conversion)
10. Optional runtime enforcement via compiler option

### Implementation Scope:
- Parser, scanner, and type system changes
- Standard library updates (Array, String index signatures)
- New compiler options for behavior control
- Language service integration
- Comprehensive testing

### Backwards Compatibility:
- `int` is contextual keyword (only in type positions)
- Integer literals now infer as `int` (breaking change for generic code expecting literal types)
- Migration supported via warning mode for `number` → `int` assignments
