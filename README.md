# Spreadsheet Engine

A React + TypeScript spreadsheet engine that supports formula evaluation, cell references, dependency management, circular reference detection, and undo/redo — all running entirely client-side with a virtualized grid capable of handling 1000 columns × 100,000 rows.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- npm (bundled with Node.js)

### Installation

```bash
git clone https://github.com/Kumar-Adarsh-Singh/infollion-spreadsheet-task.git
cd infollion-spreadsheet-task/spreadsheet-engine
npm install
```

### Development

```bash
npm run dev
```

Opens the app at [http://localhost:5173](http://localhost:5173).

### Production Build

```bash
npm run build
npm run preview
```

## Features

### Core

- **Editable grid** with columns A–J and rows 1–10 (expandable to 1000 × 100K via virtualization)
- **Numeric, text, and formula** entry in any cell
- **Formula evaluation** with support for:
  - Cell references: `=A1+B2`
  - Arithmetic operators: `+`, `-`, `*`, `/`
  - Parentheses: `=(C1+D1)/3`
  - Unary negation: `=-A1`
  - Chained references: `=A1*2+B2/3`

### Dependency Management

- Automatic propagation: changing `A1` recalculates all cells that depend on it
- Topological sort ensures cells are recalculated in the correct order
- Only affected cells are recalculated — not the entire grid

### Error Handling

- **`#ERROR`** — displayed for invalid formulas, malformed expressions, or division by zero
- **`#CIRCULAR`** — displayed when circular references are detected (e.g., `A1=B1` and `B1=A1`)
- Errors are visually distinct: red background for `#ERROR`, amber background for `#CIRCULAR`
- Errors are isolated — one broken formula does not affect unrelated cells

### Bonus Features

- **Undo/Redo** — `Ctrl+Z` / `Ctrl+Y` (or toolbar buttons), with command-pattern batching
- **DOM Virtualization** — only visible cells are rendered, supporting a 1000 × 100K grid at 60fps
- **Optimized Recalculation** — dependency graph ensures only affected cells are recomputed
- **Keyboard Navigation** — arrow keys, Enter, Tab, F2, Delete, Escape for full keyboard-driven editing

## Usage

### Entering Values

- **Click** a cell to select it (blue outline)
- **Double-click** or press **Enter** / **F2** to start editing
- Type a number, text, or formula starting with `=`
- Press **Enter** to confirm and move down, **Tab** to confirm and move right
- Press **Escape** to cancel editing

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| Arrow keys | Move selection between cells |
| Enter | Start editing / Confirm and move down |
| Tab | Confirm and move right |
| F2 | Start editing selected cell |
| Escape | Cancel editing / Deselect cell |
| Delete / Backspace | Clear selected cell |
| Ctrl+Z | Undo |
| Ctrl+Y / Ctrl+Shift+Z | Redo |
| Any character | Start editing with that character |

### Formula Examples

| Cell | Formula | Result |
|------|---------|--------|
| A1 | `5` | 5 |
| B1 | `=A1+3` | 8 |
| C1 | `=B1*2` | 16 |
| D1 | `=(A1+B1)/2` | 6.5 |

Changing A1 to `10` automatically updates B1→13, C1→26, D1→11.5.

## Architecture

```
src/
├── engine/                  # Pure logic — zero React imports
│   ├── SpreadsheetStore.ts  # Central store: sparse Map, get/set/subscribe
│   ├── FormulaParser.ts     # Tokenizer + recursive-descent parser → AST
│   ├── FormulaEvaluator.ts  # Walk AST, resolve cell refs, compute result
│   ├── DependencyGraph.ts   # Directed graph: edges, topo-sort, cycle detection
│   ├── Recalculator.ts      # On cell change → topo-sort → re-eval affected
│   └── UndoRedoManager.ts   # Command-pattern undo/redo stack
│
├── hooks/
│   ├── useSpreadsheet.ts    # React hook wrapping SpreadsheetStore
│   └── useVirtualGrid.ts    # Visible row/col window from scroll position
│
├── components/
│   ├── Spreadsheet.tsx      # Top-level layout + keyboard navigation
│   ├── Grid.tsx             # Virtualized grid renderer
│   ├── Cell.tsx             # Display/edit/error cell states
│   ├── FormulaBar.tsx       # Formula bar with cell reference display
│   └── Toolbar.tsx          # Undo/redo buttons
│
├── types/index.ts           # Shared TypeScript interfaces
└── utils/
    ├── cellUtils.ts         # Column ↔ index conversion helpers
    └── constants.ts         # Grid dimensions, sizing constants
```

### Key Design Decisions

**Sparse storage** — A `Map<CellId, CellData>` stores only populated cells. For a 100M-cell grid with 5K populated cells, memory usage is proportional to 5K, not 100M.

**Custom parser** — A hand-written recursive-descent parser (not `eval()`) provides security, precise error messages, and extracts cell references during parsing for the dependency graph.

**Dependency graph with topological sort** — When a cell changes, BFS finds all transitively dependent cells. A DFS-based topological sort with 3-color cycle detection determines recalculation order and identifies circular references.

**DOM virtualization** — Only ~50 rows × ~15 columns are rendered at any time. Scroll position drives which cells are in the viewport, with an overscan buffer for smooth scrolling.

**Command pattern for undo/redo** — Each edit is recorded as a `{cellId, oldValue, newValue}` command. Batched commands enable atomic undo of multi-cell operations.

## Tech Stack

- **React 19** + **TypeScript**
- **Vite** — build tooling
- **Tailwind CSS v4** — utility styling
- No external spreadsheet or formula libraries
