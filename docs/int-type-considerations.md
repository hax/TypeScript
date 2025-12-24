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

#### 1.3 Type Compatibility Questions
**Critical decisions needed:**

1. **Should `int` be assignable to `number`?**
   ```typescript
   let i: int = 42;
   let n: number = i; // Should this be allowed?
   ```
   - **Pros**: Matches mathematical subset relationship, easier migration
   - **Cons**: Loses integer guarantee, may defeat purpose

2. **Should `number` be assignable to `int`?**
   ```typescript
   let n: number = 3.14;
   let i: int = n; // Should this be allowed?
   ```
   - **Pros**: Flexible for generic code
   - **Cons**: Unsafe, requires runtime validation

3. **How should numeric literals be typed?**
   ```typescript
   let x = 42; // Should this be int, number, or 42?
   ```
   - **Options**:
     - Keep current behavior (literal type `42`)
     - Type as `int` if it's an integer literal
     - Type as `number` for backwards compatibility

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

#### 2.3 Type Inference
**Key questions:**

1. **Literal inference:**
   ```typescript
   const x = 42; // Infer as 42, int, or number?
   let y = 42;   // Infer as int or number?
   ```

2. **Operation inference:**
   ```typescript
   function add(a: int, b: int) {
       return a + b; // Infer return type as int or number?
   }
   
   function divide(a: int, b: int) {
       return a / b; // What if result is fractional?
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
       if (Number.isInteger(x)) {
           // Can we narrow x to int here?
       }
   }
   ```

4. **Built-in operations:**
   - Array indexing (currently accepts `number`, should accept `int`)
   - String indexing
   - Tuple indexing
   - Bitwise operations (should work with `int`)

#### 3.3 Emitter Changes (`emitter.ts`)
**No runtime changes needed** - `int` types would be erased like all TypeScript types.
- Emit as regular JavaScript numbers
- No special runtime representation

#### 3.4 Transformer Changes
- Ensure type annotations are properly stripped
- No behavioral changes in emitted code

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

// Math methods
interface Math {
    floor(x: number): int;   // Floor returns integer
    ceil(x: number): int;
    round(x: number): int;
    trunc(x: number): int;
    abs(x: int): int;        // Overload for int
    abs(x: number): number;
    min(...values: int[]): int;     // Overload
    min(...values: number[]): number;
    max(...values: int[]): int;     // Overload
    max(...values: number[]): number;
    // ... etc
}

// Number methods
interface Number {
    toFixed(fractionDigits?: int): string;
    toExponential(fractionDigits?: int): string;
    toPrecision(precision?: int): string;
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
declare function parseInt(string: string, radix?: int): int;
declare function parseFloat(string: string): number;
// ... etc
```

### 5. Backwards Compatibility

#### 5.1 Breaking Changes
**Potential issues:**

1. **`int` as identifier:**
   ```typescript
   // Existing code that uses 'int' as a variable name
   let int = 42; // Would this break?
   function int() {} // Would this break?
   ```
   - **Solution**: Make `int` a contextual keyword (only keyword in type positions)

2. **Type inference changes:**
   - If literals infer as `int`, could break generic code expecting `number`
   - **Solution**: Keep literals as literal types, require explicit `int` annotation

3. **Library compatibility:**
   - Existing type definitions wouldn't use `int`
   - **Solution**: Gradual migration, `int` assignable to `number`

#### 5.2 Migration Strategy
1. **Phase 1**: Introduce as opt-in (strict mode flag?)
2. **Phase 2**: Update standard library with overloads
3. **Phase 3**: Encourage community adoption
4. **Phase 4**: Consider changing default literal inference (major version)

### 6. Semantic Challenges

#### 6.1 Operations That Produce Non-Integers
```typescript
let a: int = 10;
let b: int = 3;
let c = a / b; // Should this be int (truncated) or error or number?
```

**Options:**
- **Option A**: Division always produces `number`
- **Option B**: Error if assigning division result to `int` without explicit conversion
- **Option C**: Integer division truncates (like C/Java)

#### 6.2 Range Limitations
JavaScript numbers are IEEE 754 doubles:
- Safe integer range: -(2^53 - 1) to (2^53 - 1)
- Should `int` enforce this range?
- What about operations that overflow?

```typescript
let max: int = Number.MAX_SAFE_INTEGER;
let overflow: int = max + 1; // What happens here?
```

#### 6.3 Bitwise Operations
Currently return `number`, should they return `int`?
```typescript
let a: int = 5;
let b: int = 3;
let c = a & b;  // int or number?
let d = a << 2; // int or number?
```

#### 6.4 Interaction with BigInt
```typescript
let i: int = 42;
let b: bigint = 42n;

// Should these be allowed?
let x = i + b;  // Error? What type?
let y: bigint = i;  // Allowed?
let z: int = Number(b); // Allowed with explicit conversion?
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

#### 8.1 New Diagnostic Messages
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

#### 8.2 Error Recovery
- Parser should recover gracefully from `int` type errors
- Provide helpful suggestions for common mistakes

### 9. Documentation Requirements

#### 9.1 Language Specification
- Update TypeScript language specification
- Document type rules and semantics
- Clarify relationship with `number` and `bigint`

#### 9.2 Handbook Updates
- Add section on integer types
- Update "Everyday Types" page
- Update "More on Functions" (return types)
- Update "Narrowing" section

#### 9.3 API Documentation
- Document new type in API reference
- Update standard library documentation

#### 9.4 Migration Guide
- Create guide for adopting `int` type
- Best practices for when to use `int` vs `number`
- Common patterns and anti-patterns

### 10. Performance Considerations

#### 10.1 Compiler Performance
- Type checking with additional type may slow down compilation
- Need to benchmark on large codebases
- Optimize type comparison paths

#### 10.2 Runtime Performance
- **No runtime impact** (types are erased)
- Could enable future optimizations:
  - JIT could use int-specific operations
  - Potential for future runtime mode with int enforcement

### 11. Tooling Impact

#### 11.1 Language Service
- Update completions to suggest `int`
- Update quick info to show `int` types
- Update refactoring tools
- Update rename functionality

#### 11.2 Declaration Files (.d.ts)
- Ensure `int` emits correctly in .d.ts files
- Update .d.ts file parser

#### 11.3 Editor Support
- Update syntax highlighting
- Update IntelliSense
- Update error squiggles

### 12. Community and Ecosystem Impact

#### 12.1 DefinitelyTyped
- Need to coordinate with DefinitelyTyped maintainers
- Strategy for updating thousands of type definitions

#### 12.2 Third-Party Tools
- Linters (ESLint plugins)
- Formatters (Prettier)
- Bundlers and build tools
- Testing frameworks

#### 12.3 Learning Resources
- Need to update tutorials
- Video courses need updates
- Stack Overflow answers become outdated

### 13. Alternative Approaches

#### 13.1 Branded Types (Current User-Land Solution)
```typescript
type int = number & { __int__: void };

function toInt(n: number): int {
    if (!Number.isInteger(n)) throw new Error("Not an integer");
    return n as int;
}
```
**Pros:** No language changes needed  
**Cons:** No type inference, verbose, no IDE support

#### 13.2 Template Literal Types
Could potentially use template literal types for certain constraints, but not suitable for int.

#### 13.3 Wait for TC39 Proposal
Let JavaScript add integer types at runtime first, then TypeScript follows.

### 14. Open Questions

1. **Should `int` support decimal notation?**
   ```typescript
   let x: int = 42.0; // Should this be allowed?
   ```

2. **How to handle parseInt/parseFloat?**
   ```typescript
   let x = parseInt("42"); // Already returns number, change to int?
   ```

3. **JSON serialization:**
   ```typescript
   JSON.parse('{"count": 42}') // What type for count?
   ```

4. **Type guards:**
   ```typescript
   function isInt(x: any): x is int { ... } // How to implement?
   ```

5. **Widening behavior:**
   ```typescript
   let x = 42; // Literal type 42
   let y: int = x; // Should 42 widen to int?
   ```

### 15. Implementation Phases

#### Phase 1: Core Implementation (Estimated: 3-6 months)
- [ ] Add `IntKeyword` to SyntaxKind
- [ ] Update scanner to recognize `int`
- [ ] Add `Int` to TypeFlags
- [ ] Implement basic type checking
- [ ] Update parser for int type nodes
- [ ] Basic test coverage

#### Phase 2: Type System Integration (Estimated: 2-4 months)
- [ ] Define type compatibility rules
- [ ] Implement type inference
- [ ] Handle arithmetic operations
- [ ] Update built-in type operations
- [ ] Comprehensive test coverage

#### Phase 3: Standard Library (Estimated: 2-3 months)
- [ ] Update lib.d.ts
- [ ] Add overloads for Array methods
- [ ] Add overloads for Math methods
- [ ] Add overloads for String methods
- [ ] Test standard library integration

#### Phase 4: Tooling and Polish (Estimated: 2-3 months)
- [ ] Language service integration
- [ ] Error messages and diagnostics
- [ ] Performance optimization
- [ ] Documentation
- [ ] Migration guide

#### Phase 5: Community Preview (Estimated: 3-6 months)
- [ ] Beta release
- [ ] Gather feedback
- [ ] Update DefinitelyTyped
- [ ] Coordinate with ecosystem
- [ ] Iterate based on feedback

**Total Estimated Time: 12-22 months**

## Recommendation

Adding an `int` type to TypeScript is a **major undertaking** with far-reaching implications. Key considerations:

### Arguments For:
1. Better semantic clarity for integer-only values
2. Potential for future runtime optimizations
3. Alignment with other statically-typed languages
4. Better documentation of API intentions

### Arguments Against:
1. Massive implementation complexity (12-22 month effort)
2. Backwards compatibility challenges
3. Ecosystem fragmentation during transition
4. JavaScript has no integer type (type system diverges from runtime)
5. Current workarounds (branded types) exist
6. Limited actual safety benefits (no runtime enforcement)

### Alternative Recommendation:
**Consider a more limited approach:**
- Add `int` as a **type alias** to `number` with **lint rules** instead
- Provides documentation benefits without language changes
- Could be implemented in 1-2 months
- Path to full implementation if successful

## Conclusion

While technically feasible, adding a native `int` type to TypeScript would be one of the most complex changes in the language's history, comparable to adding generics or union types. It requires careful design, extensive implementation work, and multi-year commitment to ecosystem migration.

The decision should consider:
- Whether the benefits justify the 12-22 month implementation cost
- Impact on the TypeScript community and learning curve  
- Backwards compatibility and migration strategy
- Alignment with JavaScript's evolution (TC39)

Before proceeding, recommend:
1. Community RFC to gather feedback
2. Prototype implementation to validate approach
3. Analysis of real-world codebases to measure impact
4. Coordination with TC39 on potential JavaScript integer types
