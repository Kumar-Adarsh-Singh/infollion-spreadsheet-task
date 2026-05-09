
import { ColumnHeader } from './ColumnHeader';
import { Row } from './Row';

import type { SpreadsheetStore } from '../engine/SpreadsheetStore';

interface GridProps {
  rowCount: number;
  colCount: number;
  activeCellId: string | null;
  editValue: string;
  store: SpreadsheetStore;
  version: number;
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
  version,
  onSelect,
  onEditChange,
  onCommit,
  onCancel,
}: GridProps) {
  const getCellDisplay = (cellId: string) => store.getCellDisplay(cellId);

  const getCellError = (cellId: string) => {
    const data = store.getCellData(cellId);
    return data?.error != null;
  };

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
            version={version}
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
