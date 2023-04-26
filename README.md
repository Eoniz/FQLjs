# fqljs

Simple query language for filtering data

## Examples

````typescript
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

const lexer = new FQLLexer();
const parser = new FQLParser();
const interpreter = new FQLInterpreter();


// FIRST EXAMPLE

const firstQuery = `id % 2 = 0`;
const tokens = lexer.parse(firstQuery);
const nodes = parser.parser(tokens);
const results = interpreter.execute(nodes, array);
//     ^
// [{ id: 2, foo: 'foo' }, { id: 4, foo: 'barfoo' }]


// SECOND EXAMPLE

const secondQuery = `foo = "bar"`;
const tokens = lexer.parse(secondQuery);
const nodes = parser.parser(tokens);
const results = interpreter.execute(nodes, array);
//     ^
// [{ id: 5, foo: 'bar' }]


// THIRD EXAMPLE

const thirdQuery = `id <= 2`;
const tokens = lexer.parse(thirdQuery);
const nodes = parser.parser(tokens);
const results = interpreter.execute(nodes, array);
//     ^
// [{ id: 1, foo: 'bar' }, { id: 2, foo: 'foo' }]

````
