import { useEffect, useReducer } from 'react'

export function loadArray<T>(key: string): T[] | undefined {
  try {
    const raw = localStorage.getItem(key)
    if (raw === null) return undefined
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as T[]) : undefined
  } catch {
    return undefined
  }
}

export function saveValue(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Storage full or unavailable (e.g. private mode): keep working in memory.
  }
}

/** A reducer whose state is loaded from and saved to localStorage under `key`. */
export function usePersistentReducer<T, A>(
  reducer: (state: T[], action: A) => T[],
  key: string,
  fallback: () => T[] = () => [],
) {
  const [state, dispatch] = useReducer(reducer, undefined, () => loadArray<T>(key) ?? fallback())
  useEffect(() => saveValue(key, state), [key, state])
  return [state, dispatch] as const
}
