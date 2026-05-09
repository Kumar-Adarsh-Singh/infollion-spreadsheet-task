import { memo, useRef, useEffect } from 'react';

interface CellProps {
  cellId: string;
  displayValue: string;
  hasError: boolean;
  isActive: boolean;
  editValue: string;
  onSelect: (cellId: string) => void;
  onEditChange: (value: string) => void;
  onCommit: (direction?: 'down' | 'right') => void;
  onCancel: () => void;
}

export const Cell = memo(function Cell({
  cellId,
  displayValue,
  hasError,
  isActive,
  editValue,
  onSelect,
  onEditChange,
  onCommit,
  onCancel,
}: CellProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isActive && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isActive]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onCommit('down');
    } else if (e.key === 'Tab') {
      e.preventDefault();
      onCommit('right');
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  if (isActive) {
    return (
      <div className="w-[100px] h-[28px] border-r border-b border-gray-300 box-border">
        <input
          ref={inputRef}
          className="w-full h-full px-1 text-sm outline-none bg-white border-2 border-blue-500 box-border"
          value={editValue}
          onChange={(e) => onEditChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => onCommit()}
        />
      </div>
    );
  }

  return (
    <div
      className={`w-[100px] h-[28px] px-1 text-sm leading-[28px] border-r border-b border-gray-300 truncate cursor-cell box-border ${
        hasError ? 'text-red-600 font-medium' : ''
      }`}
      onClick={() => onSelect(cellId)}
    >
      {displayValue}
    </div>
  );
});
