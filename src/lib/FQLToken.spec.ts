import test from 'ava';

import { FQLToken } from './FQLToken';

test('FQLToken literals should be true', (t) => {
  const literalToken = FQLToken.literal("foo", 0);
  t.is(literalToken.isLiteral(), true);
  t.is(FQLToken.isLiteral(literalToken), true);
});

test('FQLToken keyword should be true', (t) => {
  const keywordToken = FQLToken.keyword("and", 0);
  t.is(keywordToken.isKeyword(), true);
  t.is(FQLToken.isKeyword(keywordToken), true);
});

test('FQLToken operators should be true', (t) => {
  const operatorToken = FQLToken.operator("=", 0);
  t.is(operatorToken.isOperator(), true);
  t.is(FQLToken.isOperator(operatorToken), true);
});

test('FQLToken identifier should be true', (t) => {
  const identifierToken = FQLToken.identifier("foo", 0);
  t.is(identifierToken.isIdentifier(), true);
  t.is(FQLToken.isIdentifier(identifierToken), true);
});
