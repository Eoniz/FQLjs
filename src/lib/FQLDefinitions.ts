import { FQLNode } from './FQLNode';

export const FQL_KEYWORD_AND = "and";
export const FQL_KEYWORD_OR = "or";

export const FQL_OP_EQUAL = "=";
export const FQL_OP_NOT_EQUAL = "!=";
export const FQL_OP_LESS_THAN = "<";
export const FQL_OP_GRATER_THAN = ">";
export const FQL_OP_LESS_OR_EQUAL_THAN = "<=";
export const FQL_OP_GREATER_OR_EQUAL_THAN = ">=";
export const FQL_OP_PLUS = "+";
export const FQL_OP_MINUS = "-";
export const FQL_OP_DIV = "/";
export const FQL_OP_MULT = "*";
export const FQL_OP_MOD = "%";

export const FQL_LEXER_OPERATORS = [
  FQL_OP_EQUAL,
  FQL_OP_NOT_EQUAL,
  FQL_OP_LESS_THAN,
  FQL_OP_GRATER_THAN,
  FQL_OP_LESS_OR_EQUAL_THAN,
  FQL_OP_GREATER_OR_EQUAL_THAN,
  FQL_OP_PLUS,
  FQL_OP_MINUS,
  FQL_OP_DIV,
  FQL_OP_MULT,
  FQL_OP_MOD,
];

export const FQL_LEXER_KEYWORDS = [
  FQL_KEYWORD_AND,
  FQL_KEYWORD_OR
];

export type FQLLexerOperator = typeof FQL_LEXER_OPERATORS[number];
export type FQLLexerKeyword = typeof FQL_LEXER_KEYWORDS[number];
export type FQLLexerIdentifier = string;
export type FQLLexerLiteral = string;

export enum FQLOperatorNodeType {
  MULT = 10,
  DIV,

  PLUS = 20,
  MINUS,
  MOD,

  EQUAL = 30,
  NOT_EQUAL,

  LESS_THAN = 40,
  GREATER_THAN,
  LESS_OR_EQUAL_THAN,
  GREATER_OR_EQUAL_THAN,

  AND = 50,
  OR,
}

export type FQLNodeType =
  | "OPERATOR"
  | "IDENTIFIER"
  | "LITERAL"
  ;

export type FQLIdentifierNodeType =
  | "VAR"
  ;

export type FQLLiteralNodeType =
  | "NUMBER"
  | "STRING"
  ;

export type FQLKeywordNodeType =
  | "and"
  | "or"
  ;

export interface FQLAbstractSyntaxTree {
  nodes: Array<FQLNode<FQLNodeType>>;
  structuredNodes: Array<FQLNode<FQLNodeType>>;
}

export enum FQLDataType {
  VOID,
  NUMBER,
  STRING,
  ARRAY
}

export interface FQLData<T extends FQLDataType = FQLDataType.VOID> {
  type: FQLDataType;
  value: (
    T extends FQLDataType.NUMBER
      ? number
      : T extends FQLDataType.STRING
        ? string
        : T extends FQLDataType.ARRAY
          ? Array<unknown>
          : null
    );
}
