export type CellId = string;

export interface CellData {
  rawValue: string;
  computedValue: string | number;
  formula: string | null;
  error: string | null;
}

export type ASTNode =
  | { type: 'number'; value: number }
  | { type: 'string'; value: string }
  | { type: 'cellRef'; cellId: CellId }
  | { type: 'binaryOp'; op: '+' | '-' | '*' | '/'; left: ASTNode; right: ASTNode }
  | { type: 'unaryOp'; op: '-'; operand: ASTNode };

export interface CellCommand {
  cellId: CellId;
  oldRawValue: string;
  newRawValue: string;
}

export interface CellPosition {
  col: number;
  row: number;
}

export interface VirtualWindow {
  startRow: number;
  endRow: number;
  startCol: number;
  endCol: number;
  offsetTop: number;
  offsetLeft: number;
}
