import test from 'ava';

import { FQLLexer } from './FQLLexer';

test('FQLLexer should returns an empty array', (t) => {
  const fqlLexer = new FQLLexer();
  const tokens = fqlLexer.parse("");
  t.is(tokens.length, 0);
});

test('FQLLexer should returns correct token with "foo = 2"', (t) => {
  const fqlLexer = new FQLLexer();
  const tokens = fqlLexer.parse("foo = 2");
  t.is(tokens.length, 3);

  t.is(tokens[0].isIdentifier(), true);
  t.is(tokens[0].value, "foo");
  t.is(tokens[0].position, 0);

  t.is(tokens[1].isOperator(), true);
  t.is(tokens[1].value, "=");
  t.is(tokens[1].position, 4);

  t.is(tokens[2].isLiteral(), true);
  t.is(tokens[2].value, "2");
  t.is(tokens[2].position, 6);
});


test('FQLLexer should returns correct token with literals', (t) => {
  const fqlLexer = new FQLLexer();
  const tokens = fqlLexer.parse("\"hello world\" 0");
  t.is(tokens.length, 2);

  t.is(tokens[0].isLiteral(), true);
  t.is(tokens[0].value, "hello world");
  t.is(tokens[0].position, 0);

  t.is(tokens[1].isLiteral(), true);
  t.is(tokens[1].value, "0");
  t.is(tokens[1].position, 13);
});

