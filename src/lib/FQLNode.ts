import {
  FQLIdentifierNodeType, FQLLiteralNodeType,
  FQLNodeType,
  FQLOperatorNodeType
} from './FQLDefinitions';

export class FQLOperatorNode {

  private _left: FQLNode<FQLNodeType> | null = null;
  private _right: FQLNode<FQLNodeType> | null = null;
  private _inParens: boolean = false;

  constructor(
    private readonly _type: FQLOperatorNodeType
  ) {
  }

  public get weight(): number {
    return this._type;
  }

  public set left(value: FQLNode<FQLNodeType> | null) {
    this._left = value;
  }

  public get left() {
    return this._left;
  }

  public set right(value: FQLNode<FQLNodeType> | null) {
    this._right = value;
  }

  public get right() {
    return this._right;
  }

  public get inParens() {
    return this._inParens;
  }

  public get type() {
    return this._type;
  }

}

export class FQLIdentifierNode {

  constructor(
    private readonly _type: FQLIdentifierNodeType,
    private readonly _name: string,
  ) {
  }

  public get type() {
    return this._type;
  }

  public get name() {
    return this._name;
  }

}

export class FQLLiteralNode<T extends FQLLiteralNodeType> {
  constructor (
    private readonly _type: T,
    private readonly _value:
      T extends "NUMBER"
        ? number
        : T extends "STRING"
          ? string
          : never
  ) {
  }

  public get type() {
    return this._type;
  }

  public get value() {
    return this._value;
  }

}


export class FQLNode<T extends FQLNodeType> {

  private _operator: FQLOperatorNode | null = null;
  private _identifier: FQLIdentifierNode | null = null;
  private _literal: FQLLiteralNode<FQLLiteralNodeType> | null = null;

  constructor(
    private readonly _type: T,
    private readonly _location: number
  ) {
  }

  public static isOperator(node: FQLNode<FQLNodeType>): node is FQLNode<"OPERATOR"> {
    return node._type === "OPERATOR";
  }

  public static isIdentifier(node: FQLNode<FQLNodeType>): node is FQLNode<"IDENTIFIER"> {
    return node._type === "IDENTIFIER";
  }

  public static isLiteral(node: FQLNode<FQLNodeType>): node is FQLNode<"LITERAL"> {
    return node._type === "LITERAL";
  }

  public isOperator(): this is FQLNode<"OPERATOR"> {
    return FQLNode.isOperator(this);
  }

  public isIdentifier(): this is FQLNode<"IDENTIFIER"> {
    return FQLNode.isIdentifier(this);
  }

  public isLiteral(): this is FQLNode<"LITERAL"> {
    return FQLNode.isLiteral(this);
  }

  public getOperator(): T extends "OPERATOR" ? FQLOperatorNode : null {
    if (!this.isOperator()) {
      throw new Error("Node should be an operator node for accessing its operator");
    }

    if (!this._operator) {
      throw new Error("Node has no operator attached");
    }

    return <any> this._operator;
  }

  public getLiteral(): T extends "LITERAL" ? FQLLiteralNode<FQLLiteralNodeType> : null {
    if (!this.isLiteral()) {
      throw new Error("Node should be a literal node for accessing its literal");
    }

    if (!this._literal) {
      throw new Error("Node has no literal attached");
    }

    return <any> this._literal;
  }

  public getIdentifier(): T extends "IDENTIFIER" ? FQLIdentifierNode : null {
    if (!this.isIdentifier()) {
      throw new Error("Node should be an identifier node for accessing its identifier");
    }

    if (!this._identifier) {
      throw new Error("Node has no identifier attached");
    }

    return <any> this._identifier;
  }

  public set operator(value: FQLOperatorNode | null) {
    this._operator = value;
  }

  public set identifier(value: FQLIdentifierNode | null) {
    this._identifier = value;
  }

  public set literal(value: FQLLiteralNode<FQLLiteralNodeType> | null) {
    this._literal = value;
  }

  public get type() {
    return this._type;
  }

  public get location() {
    return this._location;
  }

}
