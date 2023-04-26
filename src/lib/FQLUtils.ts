import {
  FQL_KEYWORD_AND, FQL_KEYWORD_OR,
  FQL_LEXER_KEYWORDS,
  FQL_LEXER_OPERATORS, FQL_OP_DIV,
  FQL_OP_EQUAL,
  FQL_OP_GRATER_THAN,
  FQL_OP_GREATER_OR_EQUAL_THAN,
  FQL_OP_LESS_OR_EQUAL_THAN,
  FQL_OP_LESS_THAN, FQL_OP_MINUS, FQL_OP_MOD, FQL_OP_MULT,
  FQL_OP_NOT_EQUAL, FQL_OP_PLUS,
  FQLLexerIdentifier,
  FQLLexerKeyword,
  FQLLexerLiteral,
  FQLLexerOperator, FQLOperatorNodeType
} from './FQLDefinitions';


export class FQLUtils {

  public static isLexerKeyword(str?: string | null): str is FQLLexerKeyword {
    if (!str) {
      return false;
    }

    return FQL_LEXER_KEYWORDS.some((_keyword) => _keyword === str);
  }

  public static isLexerOperatorChar(char?: string | null, idx: number = 0): char is FQLLexerOperator {
    if (!char) {
      return false;
    }

    if (!char.trim().length) {
      return false;
    }

    for (const operator of FQL_LEXER_OPERATORS) {
      if (operator.charAt(idx) === char) {
        return true;
      }
    }

    return false;
  }

  public static isLexerOperatorStr(str?: string | null): str is FQLLexerOperator {
    if (!str) {
      return false;
    }

    for (const operator of FQL_LEXER_OPERATORS) {
      if (operator === str) {
        return true;
      }
    }

    return false;
  }

  public static isLexerIdentifier(str?: string | null): str is FQLLexerIdentifier {
    if (!str) {
      return false;
    }

    if (!str.length) {
      return false;
    }

    if (str.match(/^\w+([.]*\w*)+$/g)) {
      return true;
    }

    return false;
  }

  public static isLexerLiteral(str?: string | null): str is FQLLexerLiteral {
    if (!str) {
      return false;
    }

    if (!str.length) {
      return false;
    }

    if (str.match(/^"(.*)"$/g)) {
      return true;
    }

    if (str.match(/^\d*[.\d]*$/g)) {
      return true;
    }

    return false;
  }

  public static tokenOperatorToNodeOperator (op?: FQLLexerOperator | FQLLexerKeyword | null) {
    if (!op) {
      return null;
    }

    switch (op) {
      case FQL_OP_EQUAL:
        return FQLOperatorNodeType.EQUAL;
      case FQL_OP_NOT_EQUAL:
        return FQLOperatorNodeType.NOT_EQUAL;
      case FQL_OP_LESS_THAN:
        return FQLOperatorNodeType.LESS_THAN;
      case FQL_OP_GRATER_THAN:
        return FQLOperatorNodeType.GREATER_THAN;
      case FQL_OP_LESS_OR_EQUAL_THAN:
        return FQLOperatorNodeType.LESS_OR_EQUAL_THAN;
      case FQL_OP_GREATER_OR_EQUAL_THAN:
        return FQLOperatorNodeType.GREATER_OR_EQUAL_THAN;
      case FQL_OP_PLUS:
        return FQLOperatorNodeType.PLUS;
      case FQL_OP_MINUS:
        return FQLOperatorNodeType.MINUS;
      case FQL_OP_DIV:
        return FQLOperatorNodeType.DIV;
      case FQL_OP_MULT:
        return FQLOperatorNodeType.MULT;
      case FQL_OP_MOD:
        return FQLOperatorNodeType.MOD;
      case FQL_KEYWORD_OR:
        return FQLOperatorNodeType.OR;
      case FQL_KEYWORD_AND:
        return FQLOperatorNodeType.AND;
      default:
        return null;
    }
  }

}
