import { FQLInterpreter } from './FQLInterpreter';
import { FQLLexer } from './FQLLexer';
import { FQLParser } from './FQLParser';

export class FQL {

  constructor() {
  }

  public filter<T>(items: Array<T>, query: string): Array<T> {
    const lexer = new FQLLexer();
    const parser = new FQLParser();
    const interpreter = new FQLInterpreter();

    const tokens = lexer.parse(query);
    const nodes = parser.parse(tokens);
    const filteredResults = interpreter.execute(nodes, items);

    return filteredResults;
  }

}

export const fql = <T>(items: Array<T>, query: string): Array<T> => {
  return new FQL().filter(items, query);
}

