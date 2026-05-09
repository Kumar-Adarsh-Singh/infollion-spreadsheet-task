import type { CellId, CellData } from '../types';
import { DependencyGraph } from './DependencyGraph';
import { parseFormula } from './FormulaParser';
import { evaluateAST } from './FormulaEvaluator';
import { ERROR_VALUE, CIRCULAR_ERROR_VALUE } from '../utils/constants';

export class Recalculator {
  private graph: DependencyGraph;

  constructor(graph: DependencyGraph) {
    this.graph = graph;
  }

  processCell(cellId: CellId, rawValue: string, cells: Map<CellId, CellData>): CellId[] {
    const cellData = this.createCellData(cellId, rawValue);
    cells.set(cellId, cellData);

    if (rawValue === '') {
      this.graph.clearCell(cellId);
      cells.delete(cellId);
    }

    const affected = this.graph.getAffectedCells(cellId);
    affected.add(cellId);

    const { order, cycles } = this.graph.topologicalSort(affected);

    for (const id of order) {
      if (cycles.has(id)) {
        const cell = cells.get(id);
        if (cell) {
          cell.computedValue = CIRCULAR_ERROR_VALUE;
          cell.error = CIRCULAR_ERROR_VALUE;
        }
        continue;
      }

      const cell = cells.get(id);
      if (!cell || !cell.formula) continue;

      this.evaluateCell(id, cell, cells);
    }

    return order;
  }

  private createCellData(cellId: CellId, rawValue: string): CellData {
    if (rawValue.startsWith('=')) {
      try {
        const { references } = parseFormula(rawValue);
        this.graph.setDependencies(cellId, references);

        return {
          rawValue,
          computedValue: '',
          formula: rawValue,
          error: null,
        };
      } catch {
        this.graph.setDependencies(cellId, []);
        return {
          rawValue,
          computedValue: ERROR_VALUE,
          formula: rawValue,
          error: ERROR_VALUE,
        };
      }
    }

    this.graph.setDependencies(cellId, []);

    const numValue = parseFloat(rawValue);
    if (!isNaN(numValue) && rawValue.trim() !== '') {
      return {
        rawValue,
        computedValue: numValue,
        formula: null,
        error: null,
      };
    }

    return {
      rawValue,
      computedValue: rawValue,
      formula: null,
      error: null,
    };
  }

  private evaluateCell(_cellId: CellId, cell: CellData, cells: Map<CellId, CellData>): void {
    try {
      const { ast } = parseFormula(cell.rawValue);

      const resolver = (refId: string): string | number | null => {
        const refCell = cells.get(refId);
        if (!refCell) return 0;
        if (refCell.error) return refCell.error;
        return refCell.computedValue;
      };

      const result = evaluateAST(ast, resolver);
      cell.computedValue = result;
      cell.error = typeof result === 'string' && result.startsWith('#') ? result : null;
    } catch {
      cell.computedValue = ERROR_VALUE;
      cell.error = ERROR_VALUE;
    }
  }
}
