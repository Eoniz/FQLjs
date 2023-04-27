# fqljs

Simple query language for filtering data

## Examples

````typescript
import { fql } from "fqljs";

const array = [
  {
    id: 1,
    foo: 'bar'
  },
  {
    id: 2,
    foo: 'foo'
  },
  {
    id: 3,
    foo: 'foobar'
  },
  {
    id: 4,
    foo: 'barfoo'
  },
  {
    id: 5,
    foo: 'bar'
  },
];

// FIRST EXAMPLE

const firstQuery = `id % 2 = 0`;
const results = fql(array, firstQuery);
//     ^
// [{ id: 2, foo: 'foo' }, { id: 4, foo: 'barfoo' }]


// SECOND EXAMPLE

const secondQuery = `foo = "bar"`;
const results = fql(array, secondQuery);
//     ^
// [{ id: 5, foo: 'bar' }]


// THIRD EXAMPLE

const thirdQuery = `id <= 2`;
const results = fql(array, thirdQuery);
//     ^
// [{ id: 1, foo: 'bar' }, { id: 2, foo: 'foo' }]

````
