import type { CellId, CellData } from '../types';
import { DependencyGraph } from './DependencyGraph';
import { Recalculator } from './Recalculator';

export class SpreadsheetStore {
  private cells: Map<CellId, CellData> = new Map();
  private graph: DependencyGraph = new DependencyGraph();
  private recalculator: Recalculator = new Recalculator(this.graph);
  private listeners: Set<() => void> = new Set();
  private version = 0;

  getVersion = (): number => {
    return this.version;
  };

  getCellData(cellId: CellId): CellData | undefined {
    return this.cells.get(cellId);
  }

  getCellDisplay(cellId: CellId): string {
    const cell = this.cells.get(cellId);
    if (!cell) return '';
    if (cell.error) return cell.error;
    return String(cell.computedValue);
  }

  getCellRawValue(cellId: CellId): string {
    const cell = this.cells.get(cellId);
    return cell ? cell.rawValue : '';
  }

  setCellValue(cellId: CellId, rawValue: string): CellId[] {
    const trimmed = rawValue.trim();

    if (trimmed === '' && !this.cells.has(cellId)) {
      return [];
    }

    const affectedCells = this.recalculator.processCell(cellId, trimmed, this.cells);
    this.notifyListeners();
    return affectedCells;
  }

  getAllCells(): Map<CellId, CellData> {
    return this.cells;
  }

  getPopulatedCellIds(): CellId[] {
    return Array.from(this.cells.keys());
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(): void {
    this.version++;
    for (const listener of this.listeners) {
      listener();
    }
  }

  getSnapshot(): Map<CellId, CellData> {
    return this.cells;
  }
}
