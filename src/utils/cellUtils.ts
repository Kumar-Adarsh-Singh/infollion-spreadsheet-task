import type { CellPosition } from '../types';
import { MAX_COLS, MAX_ROWS } from './constants';

export function colIndexToLabel(index: number): string {
  let label = '';
  let n = index;
  while (n >= 0) {
    label = String.fromCharCode((n % 26) + 65) + label;
    n = Math.floor(n / 26) - 1;
  }
  return label;
}

export function labelToColIndex(label: string): number {
  let index = 0;
  for (let i = 0; i < label.length; i++) {
    index = index * 26 + (label.charCodeAt(i) - 64);
  }
  return index - 1;
}

export function parseCellId(cellId: string): CellPosition | null {
  const match = cellId.match(/^([A-Z]+)(\d+)$/);
  if (!match) return null;

  const col = labelToColIndex(match[1]);
  const row = parseInt(match[2], 10) - 1;

  if (col < 0 || col >= MAX_COLS || row < 0 || row >= MAX_ROWS) return null;

  return { col, row };
}

export function makeCellId(col: number, row: number): string {
  return `${colIndexToLabel(col)}${row + 1}`;
}

export function isValidCellId(cellId: string): boolean {
  return parseCellId(cellId) !== null;
}
