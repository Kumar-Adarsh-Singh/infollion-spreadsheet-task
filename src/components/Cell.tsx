import { memo, useRef, useEffect } from 'react';

interface CellProps {
  cellId: string;
  displayValue: string;
  hasError: boolean;
  isSelected: boolean;
  isEditing: boolean;
  editValue: string;
  onSelect: (cellId: string) => void;
  onStartEditing: (cellId: string) => void;
  onEditChange: (value: string) => void;
  onCommit: (direction?: 'down' | 'right') => void;
  onCancel: () => void;
}

export const Cell = memo(function Cell({
  cellId,
  displayValue,
  hasError,
  isSelected,
  isEditing,
  editValue,
  onSelect,
  onStartEditing,
  onEditChange,
  onCommit,
  onCancel,
}: CellProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  if (isEditing) {
    return (
      <div className="w-[100px] h-[28px] box-border">
        <input
          ref={inputRef}
          className="w-full h-full px-1 text-sm outline-none bg-white border-2 border-blue-500 box-border"
          value={editValue}
          onChange={(e) => onEditChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              onCommit('down');
            } else if (e.key === 'Tab') {
              e.preventDefault();
              onCommit('right');
            } else if (e.key === 'Escape') {
              onCancel();
            }
          }}
          onBlur={() => onCommit()}
        />
      </div>
    );
  }

  let cellClass =
    'w-[100px] h-[28px] px-1 text-sm text-center leading-[28px] border-r border-b border-gray-300 truncate cursor-cell box-border';

  if (hasError) {
    cellClass += displayValue.includes('CIRCULAR')
      ? ' bg-amber-50 text-amber-700 font-semibold'
      : ' bg-red-50 text-red-600 font-semibold';
  }

  return (
    <div
      className={cellClass}
      style={
        isSelected
          ? { outline: '2px solid #3b82f6', outlineOffset: '-2px' }
          : undefined
      }
      onClick={() => onSelect(cellId)}
      onDoubleClick={() => onStartEditing(cellId)}
    >
      {displayValue}
    </div>
  );
});
