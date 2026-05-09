import type { ASTNode } from '../types';
import { ERROR_VALUE } from '../utils/constants';

export type CellValueResolver = (cellId: string) => string | number | null;

export function evaluateAST(node: ASTNode, resolve: CellValueResolver): number | string {
  switch (node.type) {
    case 'number':
      return node.value;

    case 'string':
      return node.value;

    case 'cellRef': {
      const value = resolve(node.cellId);
      if (value === null || value === undefined) return 0;
      if (typeof value === 'string') {
        if (value === ERROR_VALUE || value.startsWith('#')) return ERROR_VALUE;
        const parsed = parseFloat(value);
        return isNaN(parsed) ? ERROR_VALUE : parsed;
      }
      return value;
    }

    case 'unaryOp': {
      const operand = evaluateAST(node.operand, resolve);
      if (typeof operand === 'string') return ERROR_VALUE;
      return -operand;
    }

    case 'binaryOp': {
      const left = evaluateAST(node.left, resolve);
      const right = evaluateAST(node.right, resolve);

      if (typeof left === 'string' || typeof right === 'string') return ERROR_VALUE;

      switch (node.op) {
        case '+': return left + right;
        case '-': return left - right;
        case '*': return left * right;
        case '/':
          if (right === 0) return ERROR_VALUE;
          return left / right;
      }
    }
  }
}
