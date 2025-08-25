
import { useEffect, useState } from "react";

/**
 * usePersistentState
 * Persists state in localStorage (keyed by localStorageKey).
 * Usage: 
 *   const [draft, setDraft] = usePersistentState(defaultState, "draft-key");
 */
export function usePersistentState<T>(initialValue: T, localStorageKey: string): [T, (val: T) => void] {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = window.localStorage.getItem(localStorageKey);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // ignore and fall through
    }
    return initialValue;
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(localStorageKey, JSON.stringify(value));
    } catch {
      // ignore quota errors, etc
    }
  }, [localStorageKey, value]);

  return [value, setValue];
}
