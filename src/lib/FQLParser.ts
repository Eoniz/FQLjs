import {
  FQL_OP_MINUS,
  FQLAbstractSyntaxTree,
  FQLNodeType
} from './FQLDefinitions';
import {
  FQLIdentifierNode,
  FQLLiteralNode,
  FQLNode, FQLOperatorNode
} from './FQLNode';
import { FQLToken, FQLTokenType } from './FQLToken';
import { FQLUtils } from './FQLUtils';

export class FQLParser {

  private _currentTokenIdx: number = 0;
  private _numberOfOpenParens: number = 0;

  constructor() {
    this._currentTokenIdx = 0;
    this._numberOfOpenParens = 0;
  }

  public parse(tokens: Array<FQLToken<FQLTokenType>>) {
    this._currentTokenIdx = 0;
    this._numberOfOpenParens = 0;

    const result: FQLAbstractSyntaxTree = {
      nodes: [],
      structuredNodes: [],
    };

    try {
      while (this._currentTokenIdx < tokens.length) {
        const parsedStatement = this.parseStatement(result, tokens);

        if (parsedStatement) {
          result.structuredNodes.push(parsedStatement);
        }

        this.continue(tokens);
      }
    } catch (error) {
      throw error;
    }

    return result;
  }

  private continue(tokens: Array<FQLToken<FQLTokenType>>) {
    const token = tokens[this._currentTokenIdx];
    if (!token) {
      return;
    }

    if (this._currentTokenIdx === tokens.length - 1 && this._numberOfOpenParens > 0) {
      throw new Error("Missing closing parenthesis");
    }

    this._currentTokenIdx++;
  }

  private parseStatement(ast: FQLAbstractSyntaxTree, tokens: Array<FQLToken<FQLTokenType>>): FQLNode<FQLNodeType> | null {
    const token = tokens[this._currentTokenIdx];
    if (!token) {
      return null;
    }

    const left = this.parseNonOperator(ast, tokens);
    let operatorNode = this.getOperatorNode(ast, tokens);
    const right = this.parseNonOperator(ast, tokens);

    operatorNode.getOperator().left = left;
    operatorNode.getOperator().right = right;

    while (this._currentTokenIdx < tokens.length) {
      const newOp = this.getOperatorNode(ast, tokens);

      if (!newOp) {
        break;
      }

      const right = this.parseNonOperator(ast, tokens);

      if (this.getNodeWeight(newOp) >= this.getNodeWeight(operatorNode)) {
        newOp.getOperator().left = this.addNode(ast, operatorNode);
        newOp.getOperator().right = right;
        operatorNode = newOp;
      } else {
        let rightMost = operatorNode;
        let rightMostRight = <FQLNode<"OPERATOR">> ast.nodes.find((node) => node === rightMost.getOperator().right);
        while (
          rightMostRight.isOperator()
          && this.getNodeWeight(newOp) < this.getNodeWeight(rightMostRight)
          && rightMost.getOperator().inParens
        ) {
          rightMost = <FQLNode<"OPERATOR">> ast.nodes.find((node) => node === rightMost.getOperator().right);
          rightMostRight = <FQLNode<"OPERATOR">> ast.nodes.find((node) => node === rightMost.getOperator().right);
        }

        newOp.getOperator().left = rightMost.getOperator().right;
        newOp.getOperator().right = right;
        rightMost.getOperator().right = this.addNode(ast, newOp);
      }
    }

    return this.addNode(ast, operatorNode);
  }

  private getNodeWeight(node: FQLNode<"OPERATOR"> | null) {
    if (!node) {
      return 0;
    }

    return node.getOperator().weight;
  }

  private getOperatorNode(ast: FQLAbstractSyntaxTree, tokens: Array<FQLToken<FQLTokenType>>): FQLNode<"OPERATOR"> {
    const token = tokens[this._currentTokenIdx];

    if (token.type === "KEYWORD") {
      const keywordNode = this.parseKeyword(ast, tokens);

      if (keywordNode) {
        this.continue(tokens);
        return keywordNode;
      }
    }

    if (token.type !== "OPERATOR") {
      throw new Error("node is not an OPERATOR");
    }

    const node = new FQLNode("OPERATOR", token.position);
    const opNodeType = FQLUtils.tokenOperatorToNodeOperator(token.value);

    if (!opNodeType) {
      throw new Error(`invalid token ${token.value}`);
    }

    node.operator = new FQLOperatorNode(opNodeType);

    this.continue(tokens);

    return node;
  }

  private parseNonOperator(ast: FQLAbstractSyntaxTree, tokens: Array<FQLToken<FQLTokenType>>) {
    const token = tokens[this._currentTokenIdx];

    if (token.isOperator()) {
      throw new Error("Trying to parse a non operator node, found operator node");
    }

    let node: FQLNode<FQLNodeType> | null;
    if (token.isLiteral()) {
      node = this.parseLiteral(ast, tokens);
    } else if (token.isKeyword()) {
      node = this.parseKeyword(ast, tokens);
    } else {
      node = this.parseIdentifier(ast, tokens);
    }

    this.continue(tokens);

    return node;
  }

  private parseLiteral(ast: FQLAbstractSyntaxTree, tokens: Array<FQLToken<FQLTokenType>>): FQLNode<"LITERAL"> | null {
    const token = tokens[this._currentTokenIdx];

    if (!token) {
      this.continue(tokens);
      return null;
    }

    if (!token.isLiteral()) {
      throw new Error(`Trying to parse literal token but found ${token.type}`);
    }

    const isNumeric = (value: unknown) => {
      if (typeof value !== "string") {
        return false;
      }

      return !isNaN(parseFloat(value));
    }

    let negative = false;

    if (token.value === FQL_OP_MINUS) {
      negative = true;
      this._currentTokenIdx++;
    }

    if (token.value && (isNumeric(token.value) || token.value === ".")) {
      let isFloat = false;

      for (let i = 0; i < token.value.length; i++) {
        if (token.value[i] === '.') {
          if (isFloat) {
            throw new Error(`Invalid token ${token.value}`);
          }

          isFloat = true;
        } else if (!isNumeric(token.value[i])) {
          throw new Error(`Invalid token ${token.value}`);
        }
      }

      const numNode = new FQLNode("LITERAL", token.position);

      let value = (
        isFloat
          ? Number.parseFloat(token.value)
          : Number.parseInt(token.value)
      );

      if (negative) {
        value *= -1;
      }

      numNode.literal = new FQLLiteralNode("NUMBER", value);

      return this.addNode(ast, numNode);
    }

    const strNode = new FQLNode("LITERAL", token.position);
    strNode.literal = new FQLLiteralNode("STRING", token.value);

    return this.addNode(ast, strNode);
  }

  private parseKeyword(ast: FQLAbstractSyntaxTree, tokens: Array<FQLToken<FQLTokenType>>): FQLNode<"OPERATOR"> | null {
    const token = tokens[this._currentTokenIdx];

    if (!token) {
      this.continue(tokens);
      return null;
    }

    if (!token.isKeyword()) {
      throw new Error(`Trying to parse keyword token but found ${token.type} => ${token.value}`);
    }

    const keywordNode = new FQLNode<"OPERATOR">("OPERATOR", (<FQLToken<"KEYWORD">> token).position);
    const operatorNodeType = FQLUtils.tokenOperatorToNodeOperator((<FQLToken<"KEYWORD">> token).value);

    if (!operatorNodeType) {
      throw new Error(`Unable to parse "${(<FQLToken<"KEYWORD">> token).value}" to correct operator`);
    }

    keywordNode.operator = new FQLOperatorNode(operatorNodeType)
    return this.addNode(ast, keywordNode);
  }

  private parseIdentifier(ast: FQLAbstractSyntaxTree, tokens: Array<FQLToken<FQLTokenType>>): FQLNode<"IDENTIFIER"> | null {
    const token = tokens[this._currentTokenIdx];

    if (!token) {
      this.continue(tokens);
      return null;
    }

    if (!token.isIdentifier()) {
      throw new Error(`Trying to parse identifier token but found ${token.type}`);
    }

    const identifierNode = new FQLNode<"IDENTIFIER">("IDENTIFIER", token.position);

    identifierNode.identifier = new FQLIdentifierNode("VAR", token.value);
    return this.addNode(ast, identifierNode);
  }

  private addNode<T extends FQLNodeType>(ast: FQLAbstractSyntaxTree, node: FQLNode<T>): FQLNode<T> {
    ast.nodes.push(node);
    return node;
  }
}
