import { colIndexToLabel } from '../utils/cellUtils';

interface ColumnHeaderProps {
  colCount: number;
}

export function ColumnHeader({ colCount }: ColumnHeaderProps) {
  return (
    <div className="flex sticky top-0 z-10">
      <div className="w-[60px] h-[28px] bg-gray-200 border-r border-b border-gray-300 flex-shrink-0" />
      {Array.from({ length: colCount }, (_, colIndex) => (
        <div
          key={colIndex}
          className="w-[100px] h-[28px] bg-gray-100 border-r border-b border-gray-300 text-xs text-gray-600 font-medium flex items-center justify-center flex-shrink-0"
        >
          {colIndexToLabel(colIndex)}
        </div>
      ))}
    </div>
  );
}
