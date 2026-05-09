import { useSyncExternalStore } from 'react';
import { SpreadsheetStore } from '../engine/SpreadsheetStore';

const store = new SpreadsheetStore();

export function useSpreadsheet() {
  const version = useSyncExternalStore(
    (callback: () => void) => store.subscribe(callback),
    () => store.getVersion()
  );

  return { store, version };
}
