import { useCallback } from 'react';
import { ColumnHeader } from './ColumnHeader';
import { Row } from './Row';

import type { SpreadsheetStore } from '../engine/SpreadsheetStore';

interface GridProps {
  rowCount: number;
  colCount: number;
  activeCellId: string | null;
  editValue: string;
  store: SpreadsheetStore;
  onSelect: (cellId: string) => void;
  onEditChange: (value: string) => void;
  onCommit: (direction?: 'down' | 'right') => void;
  onCancel: () => void;
}

export function Grid({
  rowCount,
  colCount,
  activeCellId,
  editValue,
  store,
  onSelect,
  onEditChange,
  onCommit,
  onCancel,
}: GridProps) {
  const getCellDisplay = useCallback(
    (cellId: string) => store.getCellDisplay(cellId),
    [store]
  );

  const getCellError = useCallback(
    (cellId: string) => {
      const data = store.getCellData(cellId);
      return data?.error != null;
    },
    [store]
  );

  return (
    <div className="overflow-auto border border-gray-300 bg-white">
      <div className="inline-block min-w-max">
        <ColumnHeader colCount={colCount} />
        {Array.from({ length: rowCount }, (_, rowIndex) => (
          <Row
            key={rowIndex}
            rowIndex={rowIndex}
            colCount={colCount}
            activeCellId={activeCellId}
            editValue={editValue}
            getCellDisplay={getCellDisplay}
            getCellError={getCellError}
            onSelect={onSelect}
            onEditChange={onEditChange}
            onCommit={onCommit}
            onCancel={onCancel}
          />
        ))}
      </div>
    </div>
  );
}
