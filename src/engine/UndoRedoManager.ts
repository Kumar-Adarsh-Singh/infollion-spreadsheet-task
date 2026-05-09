import type { CellCommand } from '../types';

export class UndoRedoManager {
  private undoStack: CellCommand[][] = [];
  private redoStack: CellCommand[][] = [];

  push(commands: CellCommand[]): void {
    if (commands.length === 0) return;
    this.undoStack.push(commands);
    this.redoStack = [];
  }

  undo(): CellCommand[] | null {
    const batch = this.undoStack.pop();
    if (!batch) return null;
    this.redoStack.push(batch);
    return batch;
  }

  redo(): CellCommand[] | null {
    const batch = this.redoStack.pop();
    if (!batch) return null;
    this.undoStack.push(batch);
    return batch;
  }

  canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  canRedo(): boolean {
    return this.redoStack.length > 0;
  }
}
