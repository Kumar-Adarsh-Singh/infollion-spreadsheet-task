import { useState, useCallback } from 'react';
import { useSpreadsheet } from '../hooks/useSpreadsheet';
import { FormulaBar } from './FormulaBar';
import { Toolbar } from './Toolbar';
import { Grid } from './Grid';
import { parseCellId, makeCellId } from '../utils/cellUtils';
import { MAX_ROWS, MAX_COLS } from '../utils/constants';

export function Spreadsheet() {
  const { store, version } = useSpreadsheet();
  const [activeCellId, setActiveCellId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const commitValue = useCallback(
    (cellId: string, value: string) => {
      store.setCellValue(cellId, value);
    },
    [store]
  );

  const handleSelect = useCallback(
    (cellId: string) => {
      if (activeCellId && activeCellId !== cellId) {
        commitValue(activeCellId, editValue);
      }
      setActiveCellId(cellId);
      setEditValue(store.getCellRawValue(cellId));
    },
    [activeCellId, editValue, commitValue, store]
  );

  const handleEditChange = useCallback((value: string) => {
    setEditValue(value);
  }, []);

  const handleCommit = useCallback(
    (direction?: 'down' | 'right') => {
      if (!activeCellId) return;

      commitValue(activeCellId, editValue);

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
          return;
        }
      }

      setActiveCellId(null);
      setEditValue('');
    },
    [activeCellId, editValue, commitValue, store]
  );

  const handleCancel = useCallback(() => {
    if (activeCellId) {
      setEditValue(store.getCellRawValue(activeCellId));
    }
    setActiveCellId(null);
    setEditValue('');
  }, [activeCellId, store]);

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
        onEditChange={handleEditChange}
        onCommit={() => handleCommit()}
        onCancel={handleCancel}
      />
      <Grid
        rowCount={MAX_ROWS}
        colCount={MAX_COLS}
        activeCellId={activeCellId}
        editValue={editValue}
        store={store}
        version={version}
        onSelect={handleSelect}
        onEditChange={handleEditChange}
        onCommit={handleCommit}
        onCancel={handleCancel}
      />
    </div>
  );
}

