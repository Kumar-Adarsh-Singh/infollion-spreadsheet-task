import type { CellId } from '../types';

export class DependencyGraph {
  private dependents: Map<CellId, Set<CellId>> = new Map();
  private dependencies: Map<CellId, Set<CellId>> = new Map();

  setDependencies(cell: CellId, deps: CellId[]): void {
    const oldDeps = this.dependencies.get(cell);
    if (oldDeps) {
      for (const dep of oldDeps) {
        this.dependents.get(dep)?.delete(cell);
      }
    }

    if (deps.length === 0) {
      this.dependencies.delete(cell);
      return;
    }

    this.dependencies.set(cell, new Set(deps));
    for (const dep of deps) {
      if (!this.dependents.has(dep)) {
        this.dependents.set(dep, new Set());
      }
      this.dependents.get(dep)!.add(cell);
    }
  }

  getDependents(cell: CellId): Set<CellId> {
    return this.dependents.get(cell) ?? new Set();
  }

  getDependencies(cell: CellId): Set<CellId> {
    return this.dependencies.get(cell) ?? new Set();
  }

  getAffectedCells(startCell: CellId): Set<CellId> {
    const affected = new Set<CellId>();
    const queue: CellId[] = [startCell];

    while (queue.length > 0) {
      const current = queue.shift()!;
      const deps = this.dependents.get(current);
      if (!deps) continue;

      for (const dep of deps) {
        if (!affected.has(dep)) {
          affected.add(dep);
          queue.push(dep);
        }
      }
    }

    return affected;
  }

  topologicalSort(cells: Set<CellId>): { order: CellId[]; cycles: Set<CellId> } {
    const WHITE = 0;
    const GRAY = 1;
    const BLACK = 2;

    const color = new Map<CellId, number>();
    const order: CellId[] = [];
    const cycles = new Set<CellId>();

    for (const cell of cells) {
      color.set(cell, WHITE);
    }

    const dfs = (node: CellId): void => {
      color.set(node, GRAY);

      const deps = this.dependencies.get(node);
      if (deps) {
        for (const dep of deps) {
          if (!cells.has(dep)) continue;

          const depColor = color.get(dep) ?? BLACK;

          if (depColor === GRAY) {
            cycles.add(node);
            cycles.add(dep);
            continue;
          }

          if (depColor === WHITE) {
            dfs(dep);
            if (cycles.has(dep)) {
              cycles.add(node);
            }
          }
        }
      }

      color.set(node, BLACK);
      order.push(node);
    };

    for (const cell of cells) {
      if (color.get(cell) === WHITE) {
        dfs(cell);
      }
    }

    return { order, cycles };
  }

  clearCell(cell: CellId): void {
    const deps = this.dependencies.get(cell);
    if (deps) {
      for (const dep of deps) {
        this.dependents.get(dep)?.delete(cell);
      }
      this.dependencies.delete(cell);
    }
  }

  removeDependentsOf(cell: CellId): void {
    this.dependents.delete(cell);
  }
}
