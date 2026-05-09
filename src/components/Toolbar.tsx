import { useEffect } from 'react';

interface ToolbarProps {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
}

export function Toolbar({ canUndo, canRedo, onUndo, onRedo }: ToolbarProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        onUndo();
      }
      if ((e.ctrlKey || e.metaKey) && ((e.key === 'z' && e.shiftKey) || e.key === 'y')) {
        e.preventDefault();
        onRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onUndo, onRedo]);

  return (
    <div className="flex items-center gap-1 mb-2">
      <button
        className={`px-3 py-1 text-sm rounded border transition-colors ${
          canUndo
            ? 'border-gray-300 bg-white hover:bg-gray-100 text-gray-700 cursor-pointer'
            : 'border-gray-200 bg-gray-50 text-gray-300 cursor-not-allowed'
        }`}
        onClick={onUndo}
        disabled={!canUndo}
        title="Undo (Ctrl+Z)"
      >
        ↶ Undo
      </button>
      <button
        className={`px-3 py-1 text-sm rounded border transition-colors ${
          canRedo
            ? 'border-gray-300 bg-white hover:bg-gray-100 text-gray-700 cursor-pointer'
            : 'border-gray-200 bg-gray-50 text-gray-300 cursor-not-allowed'
        }`}
        onClick={onRedo}
        disabled={!canRedo}
        title="Redo (Ctrl+Y)"
      >
        ↷ Redo
      </button>
    </div>
  );
}
