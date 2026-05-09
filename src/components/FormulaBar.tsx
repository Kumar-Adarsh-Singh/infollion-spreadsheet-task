interface FormulaBarProps {
  activeCellId: string | null;
  editValue: string;
  isEditing: boolean;
  onEditChange: (value: string) => void;
  onCommit: () => void;
  onCancel: () => void;
  onStartEditing: () => void;
}

export function FormulaBar({
  activeCellId,
  editValue,
  isEditing,
  onEditChange,
  onCommit,
  onCancel,
  onStartEditing,
}: FormulaBarProps) {
  return (
    <div className="flex items-center border border-gray-300 bg-white mb-1 h-[32px]">
      <div className="w-[80px] h-full bg-gray-100 border-r border-gray-300 flex items-center justify-center text-sm font-medium text-gray-700">
        {activeCellId ?? ''}
      </div>
      <div className="px-2 text-gray-400 text-sm font-medium select-none">
        fx
      </div>
      <input
        className="flex-1 h-full px-2 text-sm outline-none"
        value={activeCellId ? editValue : ''}
        onChange={(e) => {
          if (!isEditing) onStartEditing();
          onEditChange(e.target.value);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            onCommit();
          } else if (e.key === 'Escape') {
            onCancel();
          }
        }}
        onFocus={() => {
          if (activeCellId && !isEditing) {
            onStartEditing();
          }
        }}
        disabled={!activeCellId}
        placeholder={activeCellId ? 'Enter value or formula' : 'Select a cell'}
      />
    </div>
  );
}
