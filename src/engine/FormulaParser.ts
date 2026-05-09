import type { ASTNode } from '../types';

const TokenType = {
  NUMBER: 'NUMBER',
  CELL_REF: 'CELL_REF',
  PLUS: 'PLUS',
  MINUS: 'MINUS',
  MULTIPLY: 'MULTIPLY',
  DIVIDE: 'DIVIDE',
  LPAREN: 'LPAREN',
  RPAREN: 'RPAREN',
  EOF: 'EOF',
} as const;

type TokenType = (typeof TokenType)[keyof typeof TokenType];

interface Token {
  type: TokenType;
  value: string;
}

function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < input.length) {
    if (input[i] === ' ') {
      i++;
      continue;
    }

    if (input[i] === '+') { tokens.push({ type: TokenType.PLUS, value: '+' }); i++; continue; }
    if (input[i] === '-') { tokens.push({ type: TokenType.MINUS, value: '-' }); i++; continue; }
    if (input[i] === '*') { tokens.push({ type: TokenType.MULTIPLY, value: '*' }); i++; continue; }
    if (input[i] === '/') { tokens.push({ type: TokenType.DIVIDE, value: '/' }); i++; continue; }
    if (input[i] === '(') { tokens.push({ type: TokenType.LPAREN, value: '(' }); i++; continue; }
    if (input[i] === ')') { tokens.push({ type: TokenType.RPAREN, value: ')' }); i++; continue; }

    if (/[0-9.]/.test(input[i])) {
      let num = '';
      while (i < input.length && /[0-9.]/.test(input[i])) {
        num += input[i];
        i++;
      }
      tokens.push({ type: TokenType.NUMBER, value: num });
      continue;
    }

    if (/[A-Z]/i.test(input[i])) {
      let ref = '';
      while (i < input.length && /[A-Z]/i.test(input[i])) {
        ref += input[i].toUpperCase();
        i++;
      }
      while (i < input.length && /[0-9]/.test(input[i])) {
        ref += input[i];
        i++;
      }
      if (/^[A-Z]+\d+$/.test(ref)) {
        tokens.push({ type: TokenType.CELL_REF, value: ref });
      } else {
        throw new Error(`Invalid token: ${ref}`);
      }
      continue;
    }

    throw new Error(`Unexpected character: ${input[i]}`);
  }

  tokens.push({ type: TokenType.EOF, value: '' });
  return tokens;
}

export interface ParseResult {
  ast: ASTNode;
  references: string[];
}

export function parseFormula(formula: string): ParseResult {
  if (!formula.startsWith('=')) {
    throw new Error('Formula must start with =');
  }

  const expression = formula.slice(1).trim();
  if (expression.length === 0) {
    throw new Error('Empty formula');
  }

  const tokens = tokenize(expression);
  const references: string[] = [];
  let pos = 0;

  function peek(): Token {
    return tokens[pos];
  }

  function consume(): Token {
    return tokens[pos++];
  }

  function expect(type: TokenType): Token {
    const token = peek();
    if (token.type !== type) {
      throw new Error(`Expected ${type} but got ${token.type}`);
    }
    return consume();
  }

  function parseExpression(): ASTNode {
    let left = parseTerm();

    while (peek().type === TokenType.PLUS || peek().type === TokenType.MINUS) {
      const op = consume().value as '+' | '-';
      const right = parseTerm();
      left = { type: 'binaryOp', op, left, right };
    }

    return left;
  }

  function parseTerm(): ASTNode {
    let left = parseFactor();

    while (peek().type === TokenType.MULTIPLY || peek().type === TokenType.DIVIDE) {
      const op = consume().value as '*' | '/';
      const right = parseFactor();
      left = { type: 'binaryOp', op, left, right };
    }

    return left;
  }

  function parseFactor(): ASTNode {
    const token = peek();

    if (token.type === TokenType.NUMBER) {
      consume();
      const value = parseFloat(token.value);
      if (isNaN(value)) {
        throw new Error(`Invalid number: ${token.value}`);
      }
      return { type: 'number', value };
    }

    if (token.type === TokenType.CELL_REF) {
      consume();
      references.push(token.value);
      return { type: 'cellRef', cellId: token.value };
    }

    if (token.type === TokenType.LPAREN) {
      consume();
      const expr = parseExpression();
      expect(TokenType.RPAREN);
      return expr;
    }

    if (token.type === TokenType.MINUS) {
      consume();
      const operand = parseFactor();
      return { type: 'unaryOp', op: '-', operand };
    }

    throw new Error(`Unexpected token: ${token.value || 'EOF'}`);
  }

  const ast = parseExpression();

  if (peek().type !== TokenType.EOF) {
    throw new Error(`Unexpected token after expression: ${peek().value}`);
  }

  return { ast, references };
}
