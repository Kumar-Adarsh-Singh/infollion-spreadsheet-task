import { useState, useCallback } from 'react';
import { useSpreadsheet } from '../hooks/useSpreadsheet';
import { FormulaBar } from './FormulaBar';
import { Grid } from './Grid';
import { parseCellId, makeCellId } from '../utils/cellUtils';

const INITIAL_ROWS = 10;
const INITIAL_COLS = 10;

export function Spreadsheet() {
  const store = useSpreadsheet();
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

          if (direction === 'down') nextRow = Math.min(nextRow + 1, INITIAL_ROWS - 1);
          if (direction === 'right') nextCol = Math.min(nextCol + 1, INITIAL_COLS - 1);

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

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold text-gray-800 mb-3">Spreadsheet Engine</h1>
      <FormulaBar
        activeCellId={activeCellId}
        editValue={editValue}
        onEditChange={handleEditChange}
        onCommit={() => handleCommit()}
        onCancel={handleCancel}
      />
      <Grid
        rowCount={INITIAL_ROWS}
        colCount={INITIAL_COLS}
        activeCellId={activeCellId}
        editValue={editValue}
        store={store}
        onSelect={handleSelect}
        onEditChange={handleEditChange}
        onCommit={handleCommit}
        onCancel={handleCancel}
      />
    </div>
  );
}
