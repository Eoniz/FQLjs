import {
  FQLLexerIdentifier,
  FQLLexerKeyword, FQLLexerLiteral,
  FQLLexerOperator
} from './FQLDefinitions';

export type FQLTokenType =
  | "OPERATOR"
  | "KEYWORD"
  | "IDENTIFIER"
  | "LITERAL"
  ;

export class FQLToken<T extends FQLTokenType> {

  private constructor(
    private readonly _type: T,
    private readonly _value: (
      T extends "OPERATOR"
        ? FQLLexerOperator
        : T extends "KEYWORD"
          ? FQLLexerKeyword
          : T extends "LITERAL"
            ? FQLLexerLiteral
            : T extends "IDENTIFIER"
              ? FQLLexerIdentifier
              : unknown
    ),
    private readonly _position: number
  ) {
  }

  /**
   * Create an operator token
   *
   * @params operator - The operator value
   * @params position - Position of the operator token in the string
   * @returns Newly created operator FQLToken
   */
  public static operator(operator: FQLLexerOperator, position: number) {
    return new FQLToken("OPERATOR", operator, position);
  }

  /**
   * Create a keyword token
   *
   * @params keyword - The keyword value
   * @params position - Position of the keyword token in the string
   * @returns Newly created keyword FQLToken
   */
  public static keyword(keyword: FQLLexerKeyword, position: number) {
    return new FQLToken("KEYWORD", keyword, position);
  }

  /**
   * Create an identifier token
   *
   * @params identifier - The identifier value
   * @params position - Position of the identifier token in the string
   * @returns Newly created identifier FQLToken
   */
  public static identifier(identifier: FQLLexerIdentifier, position: number) {
    return new FQLToken("IDENTIFIER", identifier, position);
  }

  /**
   * Create a literal token
   *
   * @params literal - The literal value
   * @params position - Position of the literal token in the string
   * @returns Newly created literal FQLToken
   */
  public static literal(literal: FQLLexerLiteral, position: number) {
    return new FQLToken("LITERAL", literal, position);
  }

  /**
   * Check whether the given token is an operator token or not
   *
   * @params token - FQLToken to check
   * @returns The given token is an opeartor token or not
   */
  public static isOperator(token: FQLToken<FQLTokenType>): token is FQLToken<"OPERATOR"> {
    return token._type === "OPERATOR";
  }

  /**
   * Check whether the given token is a keyword token or not
   *
   * @params token - FQLToken to check
   * @returns The given token is a keyword token or not
   */
  public static isKeyword(token: FQLToken<FQLTokenType>): token is FQLToken<"KEYWORD"> {
    return token._type === "KEYWORD";
  }

  /**
   * Check whether the given token is an identifier token or not
   *
   * @params token - FQLToken to check
   * @returns The given token is an identifier token or not
   */
  public static isIdentifier(token: FQLToken<FQLTokenType>): token is FQLToken<"IDENTIFIER"> {
    return token._type === "IDENTIFIER";
  }

  /**
   * Check whether the given token is a literal token or not
   *
   * @params token - FQLToken to check
   * @returns The given token is a literal token or not
   */
  public static isLiteral(token: FQLToken<FQLTokenType>): token is FQLToken<"LITERAL"> {
    return token._type === "LITERAL";
  }

  /**
   * Check whether this token is an operator token or not
   *
   * @returns This token is an operator token or not
   */
  public isOperator(): this is FQLToken<"OPERATOR"> {
    return FQLToken.isOperator(this);
  }

  /**
   * Check whether this token is a keyword token or not
   *
   * @returns This token is a keyword token or not
   */
  public isKeyword(): this is FQLToken<"KEYWORD"> {
    return FQLToken.isKeyword(this);
  }

  /**
   * Check whether this token is an identifier token or not
   *
   * @returns This token is an identifier token or not
   */
  public isIdentifier(): this is FQLToken<"IDENTIFIER"> {
    return FQLToken.isIdentifier(this);
  }

  /**
   * Check whether this token is a literal token or not
   *
   * @returns This token is a literal token or not
   */
  public isLiteral(): this is FQLToken<"LITERAL"> {
    return FQLToken.isLiteral(this);
  }

  /**
   * @returns Type of the token between ['OPERATOR', 'KEYWORD', 'IDENTIFIER', 'LITERAL']
   */
  public get type() {
    return this._type;
  }

  /**
   * @returns Value of the token
   */
  public get value() {
    return this._value;
  }

  /**
   * @returns Position of the token in the string
   */
  public get position() {
    return this._position;
  }

}
