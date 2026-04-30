/// <reference path='fourslash.ts'/>

// @Filename: /indexFromEnd.ts
////const arr = [1, 2, 3, 4, 5];
////const index = 1;
////const last = arr[^/*completion*/];

verify.completions({
    marker: "completion",
    includes: { name: "index", sortText: "0" }
});
