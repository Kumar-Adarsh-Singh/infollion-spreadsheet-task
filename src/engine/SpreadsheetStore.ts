import type { CellId, CellData } from '../types';
import { DependencyGraph } from './DependencyGraph';
import { Recalculator } from './Recalculator';
import { UndoRedoManager } from './UndoRedoManager';

export class SpreadsheetStore {
  private cells: Map<CellId, CellData> = new Map();
  private graph: DependencyGraph = new DependencyGraph();
  private recalculator: Recalculator = new Recalculator(this.graph);
  private listeners: Set<() => void> = new Set();
  private version = 0;
  private undoRedo: UndoRedoManager = new UndoRedoManager();
  private isUndoRedoAction = false;

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

    const oldRawValue = this.getCellRawValue(cellId);

    if (oldRawValue === trimmed) {
      return [];
    }

    if (!this.isUndoRedoAction) {
      this.undoRedo.push([{ cellId, oldRawValue, newRawValue: trimmed }]);
    }

    const affectedCells = this.recalculator.processCell(cellId, trimmed, this.cells);
    this.notifyListeners();
    return affectedCells;
  }

  undo(): void {
    const batch = this.undoRedo.undo();
    if (!batch) return;

    this.isUndoRedoAction = true;
    for (const cmd of batch) {
      this.setCellValue(cmd.cellId, cmd.oldRawValue);
    }
    this.isUndoRedoAction = false;
  }

  redo(): void {
    const batch = this.undoRedo.redo();
    if (!batch) return;

    this.isUndoRedoAction = true;
    for (const cmd of batch) {
      this.setCellValue(cmd.cellId, cmd.newRawValue);
    }
    this.isUndoRedoAction = false;
  }

  canUndo(): boolean {
    return this.undoRedo.canUndo();
  }

  canRedo(): boolean {
    return this.undoRedo.canRedo();
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

