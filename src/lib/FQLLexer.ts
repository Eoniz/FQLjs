import { FQLToken, FQLTokenType } from './FQLToken';
import { FQLUtils } from './FQLUtils';

export class FQLLexer {

  constructor() {
  }

  public parse(str: string): Array<FQLToken<FQLTokenType>> {
    const results: Array<FQLToken<FQLTokenType>> = [];

    for (const token of this.lexer(str)) {
      results.push(token);
    }

    return results;
  }

  private * lexer(str: string): Generator<FQLToken<FQLTokenType>> {
    let identifierStr: string = "";
    let identifierLength = 0;

    const tryYieldsIdentifier = (cursor: number) => {
      if (identifierLength <= 0) {
        return null;
      }

      identifierStr = identifierStr.substring(0, identifierLength).trim();
      let identifier: FQLToken<FQLTokenType> | null = null;

      if (FQLUtils.isLexerKeyword(identifierStr)) {
        identifier = FQLToken.operator(identifierStr, cursor);
      } else if (FQLUtils.isLexerLiteral(identifierStr)) {
        let value = <string> identifierStr;
        if (value.startsWith("\"") && value.endsWith("\"")) {
          value = value.substring(1, value.length - 1);
        }

        identifier = FQLToken.literal(value, cursor);
      } else if (FQLUtils.isLexerIdentifier(identifierStr)) {
        identifier = FQLToken.identifier(identifierStr, cursor);
      }

      if (identifier) {
        identifierStr = "";
        identifierLength = 0;
      }

      return identifier;
    }

    for (let cursor = 0; cursor < str.length; cursor++) {
      const char = str.charAt(cursor);

      if (!char) {
        const identifier = tryYieldsIdentifier(cursor - identifierStr.length);
        if (identifier) {
          yield identifier;
        }

        continue;
      }

      if (FQLUtils.isLexerOperatorChar(char, 0)) {
        const identifier = tryYieldsIdentifier(cursor - identifierStr.length);
        if (identifier) {
          yield identifier;
        }

        let opString = char;
        let opLength = 1;
        let nextChar = str.charAt(cursor + opLength);

        while (FQLUtils.isLexerOperatorChar(nextChar, opLength)) {
          opString += nextChar;
          opLength++;
          nextChar = str.charAt(cursor + opLength);
        }

        while (!FQLUtils.isLexerOperatorStr(opString.substring(0, opLength))) {
          opLength--;
        }

        opString = opString.substring(0, opLength);

        yield FQLToken.operator(opString, cursor);

        cursor = cursor + opLength;

        continue;
      }

      if (!(<string> char).trim().length) {
        const identifier = tryYieldsIdentifier(cursor - identifierStr.length);
        if (identifier) {
          yield identifier;
        }
      }

      identifierStr += char;
      identifierLength += 1;
    }

    const identifier = tryYieldsIdentifier(str.length - identifierStr.length);
    if (identifier) {
      yield identifier;
    }
  }

}
