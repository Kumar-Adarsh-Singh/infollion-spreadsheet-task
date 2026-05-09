import { memo } from 'react';
import { Cell } from './Cell';
import { colIndexToLabel, makeCellId } from '../utils/cellUtils';

interface RowProps {
  rowIndex: number;
  colCount: number;
  activeCellId: string | null;
  editValue: string;
  version: number;
  getCellDisplay: (cellId: string) => string;
  getCellError: (cellId: string) => boolean;
  onSelect: (cellId: string) => void;
  onEditChange: (value: string) => void;
  onCommit: (direction?: 'down' | 'right') => void;
  onCancel: () => void;
}

export const Row = memo(function Row({
  rowIndex,
  colCount,
  activeCellId,
  editValue,
  getCellDisplay,
  getCellError,
  onSelect,
  onEditChange,
  onCommit,
  onCancel,
}: RowProps) {
  return (
    <div className="flex">
      <div className="w-[60px] h-[28px] bg-gray-100 border-r border-b border-gray-300 text-xs text-gray-600 font-medium flex items-center justify-center flex-shrink-0">
        {rowIndex + 1}
      </div>
      {Array.from({ length: colCount }, (_, colIndex) => {
        const cellId = makeCellId(colIndex, rowIndex);
        return (
          <Cell
            key={colIndexToLabel(colIndex)}
            cellId={cellId}
            displayValue={getCellDisplay(cellId)}
            hasError={getCellError(cellId)}
            isActive={activeCellId === cellId}
            editValue={activeCellId === cellId ? editValue : ''}
            onSelect={onSelect}
            onEditChange={onEditChange}
            onCommit={onCommit}
            onCancel={onCancel}
          />
        );
      })}
    </div>
  );
});
