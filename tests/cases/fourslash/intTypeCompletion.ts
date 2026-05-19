/// <reference path='fourslash.ts'/>

// This test demonstrates IDE features for a hypothetical 'int' type.
// Note: This is a design exploration - the 'int' type does not currently exist.

//// interface User {
////     id: /*1*/
//// }
////
//// let count: /*2*/
////
//// function add(a: /*3*/, b: int): /*4*/ {
////     return a + b;
//// }
////
//// let x: in/*5*/t = 42;
////
//// let y: int = /*6*/;

// Test 1: Completion after property type annotation
goTo.marker("1");
verify.completions({
    includes: [
        { name: "int", sortText: completion.SortText.GlobalsOrKeywords },
        { name: "number", sortText: completion.SortText.GlobalsOrKeywords },
        { name: "string", sortText: completion.SortText.GlobalsOrKeywords },
        { name: "boolean", sortText: completion.SortText.GlobalsOrKeywords },
        { name: "bigint", sortText: completion.SortText.GlobalsOrKeywords }
    ]
});

// Test 2: Completion for variable type annotation
goTo.marker("2");
verify.completions({
    includes: [
        { name: "int", sortText: completion.SortText.GlobalsOrKeywords }
    ]
});

// Test 3: Completion for function parameter type
goTo.marker("3");
verify.completions({
    includes: [
        { name: "int", sortText: completion.SortText.GlobalsOrKeywords }
    ]
});

// Test 4: Completion for return type annotation
goTo.marker("4");
verify.completions({
    includes: [
        { name: "int", sortText: completion.SortText.GlobalsOrKeywords }
    ]
});

// Test 5: Completion while typing 'int'
goTo.marker("5");
verify.completions({
    includes: [
        { name: "int", sortText: completion.SortText.GlobalsOrKeywords }
    ]
});

// Test 6: Completion for integer literal (if literals are typed as int)
goTo.marker("6");
verify.completions({
    isNewIdentifierLocation: true
});
