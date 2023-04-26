import {
  FQLAbstractSyntaxTree,
  FQLData,
  FQLDataType,
  FQLNodeType, FQLOperatorNodeType
} from './FQLDefinitions';
import { FQLNode } from './FQLNode';

export class FQLInterpreter {

  constructor() {
  }

  public execute(ast: FQLAbstractSyntaxTree, arrayOfObj: Array<Record<string, unknown>>) {
    try {
      const results: Array<Record<string, unknown>> = [];
      for (const obj of arrayOfObj) {
        const result = this.executeStatements(ast, ast.structuredNodes, obj);

        if (result) {
          results.push(obj);
        }
      }

      return results;
    } catch (e) {
      throw e;
    }
  }

  private executeStatements(ast: FQLAbstractSyntaxTree, nodes: Array<FQLNode<FQLNodeType>>, obj: Record<string, unknown>) {
    const results: Array<FQLData<any>> = [];

    for (let i = 0; i < nodes.length; i++) {
      const node = ast.nodes.find((_node) => _node === nodes[i]);

      if (!node) {
        continue;
      }

      const evaluation = this.evaluateStatement(ast, node, obj);
      results.push(evaluation);
    }

    return results.every((_value) => !!_value.value);
  }

  private evaluateStatement(ast: FQLAbstractSyntaxTree, node: FQLNode<FQLNodeType> | null, obj: Record<string, unknown>): FQLData<any> {
    if (!node) {
      return {
        type: FQLDataType.VOID,
        value: null
      };
    }

    switch (node.type) {
      case "OPERATOR": {
        const operatorNode = <FQLNode<"OPERATOR">> node;
        const left = this.evaluateStatement(ast, operatorNode.getOperator().left, obj);
        const right = this.evaluateStatement(ast, operatorNode.getOperator().right, obj);

        switch (operatorNode.getOperator().type) {
          case FQLOperatorNodeType.AND:
            return this.and(left, right);
          case FQLOperatorNodeType.EQUAL:
            return this.equal(left, right, node);
          case FQLOperatorNodeType.NOT_EQUAL:
            return this.notEqual(left, right);
          case FQLOperatorNodeType.OR:
            return this.or(left, right);
          case FQLOperatorNodeType.GREATER_THAN:
            return this.gt(left, right);
          case FQLOperatorNodeType.LESS_THAN:
            return this.lt(left, right);
          case FQLOperatorNodeType.GREATER_OR_EQUAL_THAN:
            return this.gte(left, right);
          case FQLOperatorNodeType.LESS_OR_EQUAL_THAN:
            return this.lte(left, right);
          case FQLOperatorNodeType.MULT:
            return this.mult(left, right);
          case FQLOperatorNodeType.DIV:
            return this.div(left, right);
          case FQLOperatorNodeType.PLUS:
            return this.plus(left, right);
          case FQLOperatorNodeType.MINUS:
            return this.minus(left, right);
          case FQLOperatorNodeType.MOD:
            return this.mod(left, right);
        }

        break;
      }
      case "IDENTIFIER": {
        const identifierNode = <FQLNode<"IDENTIFIER">> node;
        if (typeof obj !== "object") {
          throw new Error("given obj is not an object");
        }

        const getValues = (obj: Record<string, unknown>, path: string): any[] => {
          const keys = path.split('.');
          let result: any[] = [obj];

          for (const key of keys) {
            const newResult: any[] = [];

            for (const r of result) {
              if (Array.isArray(r)) {
                for (const item of r) {
                  newResult.push(item[key]);
                }
              } else {
                newResult.push(r[key]);
              }
            }

            result = newResult;
          }

          return result.filter((r: any) => r !== undefined).flat();
        }

        // @ts-ignore-next-line
        console.log(JSON.stringify(identifierNode.getIdentifier(), null, 4));
        const results = getValues(obj ?? {}, identifierNode.getIdentifier().name);

        if (results.length === 1) {
          if (typeof results[0] === "number") {
            return {
              type: FQLDataType.NUMBER,
              value: <number> results[0]
            }
          }

          return {
            type: FQLDataType.STRING,
            value: `${results[0]}`
          }
        }

        return {
          type: FQLDataType.ARRAY,
          value: results
        }
      }
      case "LITERAL": {
        const literalNode = <FQLNode<"LITERAL">> node;
        switch (literalNode.getLiteral().type) {
          case "NUMBER":
            return {
              type: FQLDataType.NUMBER,
              value: literalNode.getLiteral().value
            }
          case "STRING":
            return {
              type: FQLDataType.STRING,
              value: literalNode.getLiteral().value
            }
        }
      }
    }

    return {
      type: FQLDataType.VOID,
      value: null
    };
  }

  private and(left: FQLData, right: FQLData): FQLData<FQLDataType.NUMBER> {
    const data: FQLData<FQLDataType.NUMBER> = {
      type: FQLDataType.NUMBER,
      value: (this.getScalar(left) === 1 && this.getScalar(right) === 1) ? 1 : 0
    };

    return data;
  }

  private or(left: FQLData, right: FQLData): FQLData<FQLDataType.NUMBER> {
    const data: FQLData<FQLDataType.NUMBER> = {
      type: FQLDataType.NUMBER,
      value: (this.getScalar(left) === 1 || this.getScalar(right) === 1) ? 1 : 0
    };

    return data;
  }

  private mapFQLDataArray(data: FQLData<FQLDataType.ARRAY>) {
    return data.value.map((_value) => {
      if (typeof _value === "number") {
        return {
          type: FQLDataType.NUMBER,
          value: _value
        }
      }

      return {
        type: FQLDataType.STRING,
        value: `${_value}`
      }
    })
  }

  private equal(left: FQLData, right: FQLData, node: FQLNode<FQLNodeType>): FQLData<FQLDataType.NUMBER> {
    if (left.type === FQLDataType.ARRAY && right.type !== FQLDataType.ARRAY) {
      const leftFQLDataArray = this.mapFQLDataArray(<FQLData<FQLDataType.ARRAY>> <unknown> left);
      const results = leftFQLDataArray.map((_leftData: any) => this.equal(_leftData, right, node));

      return {
        type: FQLDataType.NUMBER,
        value: results.some((_dataValue) => _dataValue.value === 1) ? 1 : 0
      }
    }

    if (right.type === FQLDataType.ARRAY && left.type !== FQLDataType.ARRAY) {
      const rightFQLDataArray = this.mapFQLDataArray(<FQLData<FQLDataType.ARRAY>> <unknown> right);
      const results = rightFQLDataArray.map((_rightData: any) => this.equal(left, _rightData, node));

      return {
        type: FQLDataType.NUMBER,
        value: results.some((_dataValue) => _dataValue.value === 1) ? 1 : 0
      }
    }

    if (right.type === FQLDataType.ARRAY && left.type === FQLDataType.ARRAY) {
      throw new Error("Equality between arrays is not implemented yet");
    }

    if (right.type === FQLDataType.STRING) {
      const rightValue = <string> <unknown> right.value;
      const leftValue = <string> <unknown> left.value;

      return this.strContains(leftValue.trim(), rightValue.trim());
    }

    return {
      type: FQLDataType.NUMBER,
      value: left.value === right.value ? 1 : 0
    }
  }

  private strContains(value: string, strToSearch: string): FQLData<FQLDataType.NUMBER> {
    if (value.includes('*') && !strToSearch.includes('*')) {
      return this.strContains(strToSearch, value);
    }

    if (value.includes('*') && strToSearch.includes('*')) {
      return {
        type: FQLDataType.NUMBER,
        value: value === strToSearch ? 1 : 0
      }
    }

    const matchStrings = (s1: string, s2: string): boolean => {
      const s2Arr = s2.split('*');

      let startIndex = 0;
      for (let i = 0; i < s2Arr.length; i++) {
        const word = s2Arr[i];
        const index = s1.indexOf(word, startIndex);

        if (index === -1) {
          return false;
        }

        startIndex = index + word.length;
        if (i === 0 && word !== '' && !s1.startsWith(word)) {
          return false;
        }
      }

      return true;
    }

    return {
      type: FQLDataType.NUMBER,
      value: matchStrings(value.trim(), strToSearch.trim()) ? 1 : 0
    }
  }

  private notEqual(left: FQLData, right: FQLData): FQLData<FQLDataType.NUMBER> {
    if (left.type === FQLDataType.ARRAY && right.type !== FQLDataType.ARRAY) {
      const leftFQLDataArray = this.mapFQLDataArray(<FQLData<FQLDataType.ARRAY>> <unknown> left);

      return {
        type: FQLDataType.NUMBER,
        value: leftFQLDataArray.some((_left: any) => this.getScalar(_left) !== this.getScalar(right)) ? 1 : 0
      }
    }

    if (right.type === FQLDataType.ARRAY && left.type !== FQLDataType.ARRAY) {
      const rightFQLDataArray = this.mapFQLDataArray(<FQLData<FQLDataType.ARRAY>> <unknown> right);

      return {
        type: FQLDataType.NUMBER,
        value: rightFQLDataArray.some((_right: any) => this.getScalar(left) !== this.getScalar(_right)) ? 1 : 0
      }
    }

    if (left.type === FQLDataType.ARRAY && right.type === FQLDataType.ARRAY) {
      throw new Error("Unable to execute a lte to two arrays");
    }

    return {
      type: FQLDataType.NUMBER,
      value: left.value !== right.value ? 1 : 0
    }
  }

  private gt(left: FQLData, right: FQLData): FQLData<FQLDataType.NUMBER> {
    if (left.type === FQLDataType.ARRAY && right.type !== FQLDataType.ARRAY) {
      const leftFQLDataArray = this.mapFQLDataArray(<FQLData<FQLDataType.ARRAY>> <unknown> left);

      return {
        type: FQLDataType.NUMBER,
        value: leftFQLDataArray.some((_left: any) => this.getScalar(_left) > this.getScalar(right)) ? 1 : 0
      }
    }

    if (right.type === FQLDataType.ARRAY && left.type !== FQLDataType.ARRAY) {
      const rightFQLDataArray = this.mapFQLDataArray(<FQLData<FQLDataType.ARRAY>> <unknown> right);

      return {
        type: FQLDataType.NUMBER,
        value: rightFQLDataArray.some((_right: any) => this.getScalar(left) > this.getScalar(_right)) ? 1 : 0
      }
    }

    if (left.type === FQLDataType.ARRAY && right.type === FQLDataType.ARRAY) {
      throw new Error("Unable to execute a lte to two arrays");
    }

    return {
      type: FQLDataType.NUMBER,
      value: (this.getScalar(left) > this.getScalar(right)) ? 1 : 0
    }
  }

  private lt(left: FQLData, right: FQLData): FQLData<FQLDataType.NUMBER> {
    if (left.type === FQLDataType.ARRAY && right.type !== FQLDataType.ARRAY) {
      const leftFQLDataArray = this.mapFQLDataArray(<FQLData<FQLDataType.ARRAY>> <unknown> left);

      return {
        type: FQLDataType.NUMBER,
        value: leftFQLDataArray.some((_left: any) => this.getScalar(_left) < this.getScalar(right)) ? 1 : 0
      }
    }

    if (right.type === FQLDataType.ARRAY && left.type !== FQLDataType.ARRAY) {
      const rightFQLDataArray = this.mapFQLDataArray(<FQLData<FQLDataType.ARRAY>> <unknown> right);

      return {
        type: FQLDataType.NUMBER,
        value: rightFQLDataArray.some((_right: any) => this.getScalar(left) < this.getScalar(_right)) ? 1 : 0
      }
    }

    if (left.type === FQLDataType.ARRAY && right.type === FQLDataType.ARRAY) {
      throw new Error("Unable to execute a lte to two arrays");
    }

    return {
      type: FQLDataType.NUMBER,
      value: (this.getScalar(left) < this.getScalar(right)) ? 1 : 0
    }
  }

  private gte(left: FQLData, right: FQLData): FQLData<FQLDataType.NUMBER> {
    if (left.type === FQLDataType.ARRAY && right.type !== FQLDataType.ARRAY) {
      const leftFQLDataArray = this.mapFQLDataArray(<FQLData<FQLDataType.ARRAY>> <unknown> left);

      return {
        type: FQLDataType.NUMBER,
        value: leftFQLDataArray.some((_left: any) => this.getScalar(_left) >= this.getScalar(right)) ? 1 : 0
      }
    }

    if (right.type === FQLDataType.ARRAY && left.type !== FQLDataType.ARRAY) {
      const rightFQLDataArray = this.mapFQLDataArray(<FQLData<FQLDataType.ARRAY>> <unknown> right);

      return {
        type: FQLDataType.NUMBER,
        value: rightFQLDataArray.some((_right: any) => this.getScalar(left) >= this.getScalar(_right)) ? 1 : 0
      }
    }

    if (left.type === FQLDataType.ARRAY && right.type === FQLDataType.ARRAY) {
      throw new Error("Unable to execute a lte to two arrays");
    }

    return {
      type: FQLDataType.NUMBER,
      value: (this.getScalar(left) >= this.getScalar(right)) ? 1 : 0
    }
  }

  private lte(left: FQLData, right: FQLData): FQLData<FQLDataType.NUMBER> {
    if (left.type === FQLDataType.ARRAY && right.type !== FQLDataType.ARRAY) {
      const leftFQLDataArray = this.mapFQLDataArray(<FQLData<FQLDataType.ARRAY>> <unknown> left);

      return {
        type: FQLDataType.NUMBER,
        value: leftFQLDataArray.some((_left: any) => this.getScalar(_left) <= this.getScalar(right)) ? 1 : 0
      }
    }

    if (right.type === FQLDataType.ARRAY && left.type !== FQLDataType.ARRAY) {
      const rightFQLDataArray = this.mapFQLDataArray(<FQLData<FQLDataType.ARRAY>> <unknown> right);

      return {
        type: FQLDataType.NUMBER,
        value: rightFQLDataArray.some((_right: any) => this.getScalar(left) <= this.getScalar(_right)) ? 1 : 0
      }
    }

    if (left.type === FQLDataType.ARRAY && right.type === FQLDataType.ARRAY) {
      throw new Error("Unable to execute a lte to two arrays");
    }

    return {
      type: FQLDataType.NUMBER,
      value: (this.getScalar(left) <= this.getScalar(right)) ? 1 : 0
    }
  }

  private mult(left: FQLData, right: FQLData): FQLData<FQLDataType.ARRAY> | FQLData<FQLDataType.NUMBER> {
    if (left.type === FQLDataType.ARRAY && right.type !== FQLDataType.ARRAY) {
      const leftFQLDataArray = this.mapFQLDataArray(<FQLData<FQLDataType.ARRAY>> <unknown> left);

      return {
        type: FQLDataType.ARRAY,
        value: leftFQLDataArray.map((_left: any) => this.getScalar(_left) * this.getScalar(right))
      }
    }

    if (right.type === FQLDataType.ARRAY && left.type !== FQLDataType.ARRAY) {
      const rightFQLDataArray = this.mapFQLDataArray(<FQLData<FQLDataType.ARRAY>> <unknown> right);

      return {
        type: FQLDataType.ARRAY,
        value: rightFQLDataArray.map((_right: any) => this.getScalar(left) * this.getScalar(_right))
      }
    }

    if (left.type === FQLDataType.ARRAY && right.type === FQLDataType.ARRAY) {
      throw new Error("Unable to execute a mult to two arrays");
    }

    return {
      type: FQLDataType.NUMBER,
      value: (this.getScalar(left) * this.getScalar(right))
    }
  }

  private div(left: FQLData, right: FQLData): FQLData<FQLDataType.ARRAY> | FQLData<FQLDataType.NUMBER> {
    if (left.type === FQLDataType.ARRAY && right.type !== FQLDataType.ARRAY) {
      const leftFQLDataArray = this.mapFQLDataArray(<FQLData<FQLDataType.ARRAY>> <unknown> left);

      return {
        type: FQLDataType.ARRAY,
        value: leftFQLDataArray.map((_left: any) => this.getScalar(_left) / this.getScalar(right))
      }
    }

    if (right.type === FQLDataType.ARRAY && left.type !== FQLDataType.ARRAY) {
      const rightFQLDataArray = this.mapFQLDataArray(<FQLData<FQLDataType.ARRAY>> <unknown> right);

      return {
        type: FQLDataType.ARRAY,
        value: rightFQLDataArray.map((_right: any) => this.getScalar(left) / this.getScalar(_right))
      }
    }

    if (left.type === FQLDataType.ARRAY && right.type === FQLDataType.ARRAY) {
      throw new Error("Unable to execute a div to two arrays");
    }

    return {
      type: FQLDataType.NUMBER,
      value: (this.getScalar(left) / this.getScalar(right))
    }
  }

  private plus(left: FQLData, right: FQLData): FQLData<FQLDataType.ARRAY> | FQLData<FQLDataType.NUMBER> {
    if (left.type === FQLDataType.ARRAY && right.type !== FQLDataType.ARRAY) {
      const leftFQLDataArray = this.mapFQLDataArray(<FQLData<FQLDataType.ARRAY>> <unknown> left);

      return {
        type: FQLDataType.ARRAY,
        value: leftFQLDataArray.map((_left: any) => this.getScalar(_left) + this.getScalar(right))
      }
    }

    if (right.type === FQLDataType.ARRAY && left.type !== FQLDataType.ARRAY) {
      const rightFQLDataArray = this.mapFQLDataArray(<FQLData<FQLDataType.ARRAY>> <unknown> right);

      return {
        type: FQLDataType.ARRAY,
        value: rightFQLDataArray.map((_right: any) => this.getScalar(left) + this.getScalar(_right))
      }
    }

    if (left.type === FQLDataType.ARRAY && right.type === FQLDataType.ARRAY) {
      throw new Error("Unable to execute a plus to two arrays");
    }

    return {
      type: FQLDataType.NUMBER,
      value: (this.getScalar(left) + this.getScalar(right))
    }
  }

  private minus(left: FQLData, right: FQLData): FQLData<FQLDataType.ARRAY> | FQLData<FQLDataType.NUMBER> {
    if (left.type === FQLDataType.ARRAY && right.type !== FQLDataType.ARRAY) {
      const leftFQLDataArray = this.mapFQLDataArray(<FQLData<FQLDataType.ARRAY>> <unknown> left);

      return {
        type: FQLDataType.ARRAY,
        value: leftFQLDataArray.map((_left: any) => this.getScalar(_left) - this.getScalar(right))
      }
    }

    if (right.type === FQLDataType.ARRAY && left.type !== FQLDataType.ARRAY) {
      const rightFQLDataArray = this.mapFQLDataArray(<FQLData<FQLDataType.ARRAY>> <unknown> right);

      return {
        type: FQLDataType.ARRAY,
        value: rightFQLDataArray.map((_right: any) => this.getScalar(left) - this.getScalar(_right))
      }
    }

    if (left.type === FQLDataType.ARRAY && right.type === FQLDataType.ARRAY) {
      throw new Error("Unable to execute a minus to two arrays");
    }

    return {
      type: FQLDataType.NUMBER,
      value: (this.getScalar(left) - this.getScalar(right))
    }
  }

  private mod(left: FQLData, right: FQLData): FQLData<FQLDataType.ARRAY> | FQLData<FQLDataType.NUMBER> {
    if (left.type === FQLDataType.ARRAY && right.type !== FQLDataType.ARRAY) {
      const leftFQLDataArray = this.mapFQLDataArray(<FQLData<FQLDataType.ARRAY>> <unknown> left);

      return {
        type: FQLDataType.ARRAY,
        value: leftFQLDataArray.map((_left: any) => this.getScalar(_left) % this.getScalar(right))
      }
    }

    if (right.type === FQLDataType.ARRAY && left.type !== FQLDataType.ARRAY) {
      const rightFQLDataArray = this.mapFQLDataArray(<FQLData<FQLDataType.ARRAY>> <unknown> right);

      return {
        type: FQLDataType.ARRAY,
        value: rightFQLDataArray.map((_right: any) => this.getScalar(left) % this.getScalar(_right))
      }
    }

    if (left.type === FQLDataType.ARRAY && right.type === FQLDataType.ARRAY) {
      throw new Error("Unable to execute a mod to two arrays");
    }

    return {
      type: FQLDataType.NUMBER,
      value: (this.getScalar(left) % this.getScalar(right))
    };
  }

  private getScalar(data: FQLData) {
    if (data.type === FQLDataType.NUMBER) {
      return (<number> (<unknown> data.value));
    }

    return 0.0;
  }
}
