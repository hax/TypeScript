/// <reference path='fourslash.ts'/>

// This test demonstrates quick info (hover) for a hypothetical 'int' type.
// Note: This is a design exploration - the 'int' type does not currently exist.

//// let count: /*1*/int = 42;
//// 
//// function add(a: int, b: int): /*2*/int {
////     return a + b;
//// }
//// 
//// interface Point {
////     x: /*3*/int;
////     y: int;
//// }
//// 
//// let result = /*4*/add(5, 3);
////
//// let value: int = /*5*/42;

// Test 1: Quick info for int type annotation
goTo.marker("1");
verify.quickInfoIs("type int");

// Test 2: Quick info for int return type
goTo.marker("2");
verify.quickInfoIs("type int");

// Test 3: Quick info for int property type
goTo.marker("3");
verify.quickInfoIs("type int");

// Test 4: Quick info shows inferred int return type (if function returns int)
goTo.marker("4");
// The result should show that add returns int
verify.quickInfoIs("const result: int");

// Test 5: Quick info for integer literal
// Quick info should show the literal type "42", since const integer literals infer as literal types, not as int.
goTo.marker("5");
verify.quickInfoExists();
