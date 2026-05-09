import { useRef, memo } from 'react';
import { useVirtualGrid } from '../hooks/useVirtualGrid';
import { colIndexToLabel, makeCellId } from '../utils/cellUtils';
import { Cell } from './Cell';
import {
  DEFAULT_CELL_WIDTH,
  DEFAULT_CELL_HEIGHT,
  ROW_HEADER_WIDTH,
  COLUMN_HEADER_HEIGHT,
} from '../utils/constants';
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
  const containerRef = useRef<HTMLDivElement>(null);
  const vw = useVirtualGrid(containerRef, rowCount, colCount);

  const totalWidth = ROW_HEADER_WIDTH + colCount * DEFAULT_CELL_WIDTH;
  const totalHeight = COLUMN_HEADER_HEIGHT + rowCount * DEFAULT_CELL_HEIGHT;

  const visibleRows: number[] = [];
  for (let r = vw.startRow; r <= vw.endRow; r++) visibleRows.push(r);

  const visibleCols: number[] = [];
  for (let c = vw.startCol; c <= vw.endCol; c++) visibleCols.push(c);

  return (
    <div
      ref={containerRef}
      className="overflow-auto border border-gray-300 bg-white"
      style={{ height: 'calc(100vh - 160px)' }}
    >
      <div style={{ width: totalWidth, height: totalHeight, position: 'relative' }}>
        <div
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 20,
            height: COLUMN_HEADER_HEIGHT,
            width: totalWidth,
            backgroundColor: 'white',
          }}
        >
          <div
            className="bg-gray-200 border-r border-b border-gray-300"
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: ROW_HEADER_WIDTH,
              height: COLUMN_HEADER_HEIGHT,
              zIndex: 30,
            }}
          />
          {visibleCols.map((colIdx) => (
            <div
              key={colIdx}
              className="bg-gray-100 border-r border-b border-gray-300 text-xs text-gray-600 font-medium flex items-center justify-center"
              style={{
                position: 'absolute',
                left: ROW_HEADER_WIDTH + colIdx * DEFAULT_CELL_WIDTH,
                top: 0,
                width: DEFAULT_CELL_WIDTH,
                height: COLUMN_HEADER_HEIGHT,
              }}
            >
              {colIndexToLabel(colIdx)}
            </div>
          ))}
        </div>

        {visibleRows.map((rowIdx) => (
          <VirtualRow
            key={rowIdx}
            rowIdx={rowIdx}
            visibleCols={visibleCols}
            activeCellId={activeCellId}
            editValue={editValue}
            store={store}
            version={version}
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

interface VirtualRowProps {
  rowIdx: number;
  visibleCols: number[];
  activeCellId: string | null;
  editValue: string;
  store: SpreadsheetStore;
  version: number;
  onSelect: (cellId: string) => void;
  onEditChange: (value: string) => void;
  onCommit: (direction?: 'down' | 'right') => void;
  onCancel: () => void;
}

const VirtualRow = memo(function VirtualRow({
  rowIdx,
  visibleCols,
  activeCellId,
  editValue,
  store,
  version: _version,
  onSelect,
  onEditChange,
  onCommit,
  onCancel,
}: VirtualRowProps) {
  return (
    <div
      style={{
        position: 'absolute',
        top: COLUMN_HEADER_HEIGHT + rowIdx * DEFAULT_CELL_HEIGHT,
        left: 0,
        height: DEFAULT_CELL_HEIGHT,
        width: '100%',
      }}
    >
      <div
        className="bg-gray-100 border-r border-b border-gray-300 text-xs text-gray-600 font-medium flex items-center justify-center"
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: ROW_HEADER_WIDTH,
          height: DEFAULT_CELL_HEIGHT,
          zIndex: 10,
        }}
      >
        {rowIdx + 1}
      </div>

      {visibleCols.map((colIdx) => {
        const cellId = makeCellId(colIdx, rowIdx);
        const displayValue = store.getCellDisplay(cellId);
        const hasError = store.getCellData(cellId)?.error != null;
        const isActive = activeCellId === cellId;

        return (
          <div
            key={colIdx}
            style={{
              position: 'absolute',
              left: ROW_HEADER_WIDTH + colIdx * DEFAULT_CELL_WIDTH,
              top: 0,
            }}
          >
            <Cell
              cellId={cellId}
              displayValue={displayValue}
              hasError={hasError}
              isActive={isActive}
              editValue={isActive ? editValue : ''}
              onSelect={onSelect}
              onEditChange={onEditChange}
              onCommit={onCommit}
              onCancel={onCancel}
            />
          </div>
        );
      })}
    </div>
  );
});
