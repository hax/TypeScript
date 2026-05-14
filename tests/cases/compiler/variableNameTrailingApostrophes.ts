// @target: es2022
// @lib: es2022,esnext.disposable
// @strict: true

let x = 1;
let x' = x + 2;
const x'' = x' + 1;
var x''' = x'' + 1;

using y' = {
    [Symbol.dispose]() {},
};

const o1 = { x' }; // property shorthand strips trailing apostrophes
o1.x.toFixed();

const o2 = { x'': x''' }; // should error (apostrophes are not allowed in non-binding property names)
o2.x.toFixed();

{
    let { x' } = o1; // destructuring shorthand strips trailing apostrophes
    x'.toFixed();
}

let { x: x'''' } = o1;
x''''.toFixed();

class C {
    method() {}
    method'() {} // should error
}

const obj = {
    method'() {}, // should error
};
