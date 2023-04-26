import { FQLInterpreter } from './lib/FQLInterpreter';
import { FQLLexer } from './lib/FQLLexer';
import { FQLParser } from './lib/FQLParser';

export * from './lib/number';

const lexer = new FQLLexer();
const parser = new FQLParser();
const interpreter = new FQLInterpreter();
const tokens = lexer.parse("foo + 1 = 6");
const nodes = parser.parse(tokens);

const results = interpreter.execute(nodes, [{ foo: 5 }])
// @ts-ignore-next-line
console.log(JSON.stringify(results, null, 4));
