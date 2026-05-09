import { useState, useCallback, useRef } from 'react';
import { useSpreadsheet } from '../hooks/useSpreadsheet';
import { FormulaBar } from './FormulaBar';
import { Toolbar } from './Toolbar';
import { Grid } from './Grid';
import { parseCellId, makeCellId } from '../utils/cellUtils';
import { MAX_ROWS, MAX_COLS } from '../utils/constants';

export function Spreadsheet() {
  const { store, version } = useSpreadsheet();
  const [activeCellId, setActiveCellId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const gridRef = useRef<HTMLDivElement>(null);
  const editingRef = useRef(false);

  const focusGrid = useCallback(() => {
    requestAnimationFrame(() => gridRef.current?.focus());
  }, []);

  const commitValue = useCallback(
    (cellId: string, value: string) => {
      store.setCellValue(cellId, value);
    },
    [store]
  );

  const handleSelect = useCallback(
    (cellId: string) => {
      if (activeCellId && editingRef.current && activeCellId !== cellId) {
        commitValue(activeCellId, editValue);
      }
      setActiveCellId(cellId);
      setIsEditing(false);
      editingRef.current = false;
      setEditValue(store.getCellRawValue(cellId));
      focusGrid();
    },
    [activeCellId, editValue, commitValue, store, focusGrid]
  );

  const handleStartEditing = useCallback(
    (cellId?: string) => {
      const target = cellId || activeCellId;
      if (!target) return;
      if (cellId && cellId !== activeCellId) {
        setActiveCellId(cellId);
        setEditValue(store.getCellRawValue(cellId));
      }
      setIsEditing(true);
      editingRef.current = true;
    },
    [activeCellId, store]
  );

  const handleEditChange = useCallback((value: string) => {
    setEditValue(value);
  }, []);

  const handleCommit = useCallback(
    (direction?: 'down' | 'right') => {
      if (!activeCellId) return;
      commitValue(activeCellId, editValue);
      setIsEditing(false);
      editingRef.current = false;

      if (direction) {
        const pos = parseCellId(activeCellId);
        if (pos) {
          let nextRow = pos.row;
          let nextCol = pos.col;
          if (direction === 'down') nextRow = Math.min(nextRow + 1, MAX_ROWS - 1);
          if (direction === 'right') nextCol = Math.min(nextCol + 1, MAX_COLS - 1);
          const nextId = makeCellId(nextCol, nextRow);
          setActiveCellId(nextId);
          setEditValue(store.getCellRawValue(nextId));
        }
      }
      focusGrid();
    },
    [activeCellId, editValue, commitValue, store, focusGrid]
  );

  const handleCancel = useCallback(() => {
    if (activeCellId) {
      setEditValue(store.getCellRawValue(activeCellId));
    }
    setIsEditing(false);
    editingRef.current = false;
    focusGrid();
  }, [activeCellId, store, focusGrid]);

  const moveSelection = useCallback(
    (dRow: number, dCol: number) => {
      if (!activeCellId) return;
      const pos = parseCellId(activeCellId);
      if (!pos) return;
      const newRow = Math.max(0, Math.min(pos.row + dRow, MAX_ROWS - 1));
      const newCol = Math.max(0, Math.min(pos.col + dCol, MAX_COLS - 1));
      const newId = makeCellId(newCol, newRow);
      setActiveCellId(newId);
      setEditValue(store.getCellRawValue(newId));
    },
    [activeCellId, store]
  );

  const handleGridKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (isEditing) return;

      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) return;
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) return;

      if (!activeCellId) return;

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          moveSelection(-1, 0);
          break;
        case 'ArrowDown':
          e.preventDefault();
          moveSelection(1, 0);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          moveSelection(0, -1);
          break;
        case 'ArrowRight':
          e.preventDefault();
          moveSelection(0, 1);
          break;
        case 'Enter':
        case 'F2':
          e.preventDefault();
          handleStartEditing();
          break;
        case 'Delete':
        case 'Backspace':
          e.preventDefault();
          commitValue(activeCellId, '');
          setEditValue('');
          break;
        case 'Escape':
          e.preventDefault();
          setActiveCellId(null);
          setEditValue('');
          break;
        case 'Tab':
          e.preventDefault();
          moveSelection(0, e.shiftKey ? -1 : 1);
          break;
        default:
          if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
            e.preventDefault();
            setEditValue(e.key);
            setIsEditing(true);
            editingRef.current = true;
          }
          break;
      }
    },
    [isEditing, activeCellId, moveSelection, handleStartEditing, commitValue]
  );

  const handleUndo = useCallback(() => {
    store.undo();
    if (activeCellId) {
      setEditValue(store.getCellRawValue(activeCellId));
    }
  }, [store, activeCellId]);

  const handleRedo = useCallback(() => {
    store.redo();
    if (activeCellId) {
      setEditValue(store.getCellRawValue(activeCellId));
    }
  }, [store, activeCellId]);

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold text-gray-800 mb-3">Spreadsheet Engine</h1>
      <Toolbar
        canUndo={store.canUndo()}
        canRedo={store.canRedo()}
        onUndo={handleUndo}
        onRedo={handleRedo}
      />
      <FormulaBar
        activeCellId={activeCellId}
        editValue={editValue}
        isEditing={isEditing}
        onEditChange={handleEditChange}
        onCommit={() => handleCommit()}
        onCancel={handleCancel}
        onStartEditing={() => handleStartEditing()}
      />
      <Grid
        ref={gridRef}
        rowCount={MAX_ROWS}
        colCount={MAX_COLS}
        activeCellId={activeCellId}
        isEditing={isEditing}
        editValue={editValue}
        store={store}
        version={version}
        onSelect={handleSelect}
        onStartEditing={handleStartEditing}
        onEditChange={handleEditChange}
        onCommit={handleCommit}
        onCancel={handleCancel}
        onKeyDown={handleGridKeyDown}
      />
    </div>
  );
}
