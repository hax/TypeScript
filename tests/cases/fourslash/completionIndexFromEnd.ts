/// <reference path='fourslash.ts'/>

// @Filename: /indexFromEnd.ts
////const arr = [1, 2, 3, 4, 5];
////const index = 1;
////const last = arr[^index/*marker*/];

goTo.marker("marker");
verify.currentLineContentIs("const last = arr[^index];");
