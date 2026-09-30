/** A leading bullet or step number such as "- ", "• ", "1. " or "2) ". "1.5 dl" is left alone. */
const LIST_MARKER = /^(?:[-*•–]\s+|\d+[.)]\s+|(?:step|steg)\s+\d+[.:]?\s+)/i

/** Splits pasted or typed text into list items, one per line, without bullets or numbering. */
export function splitLines(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim().replace(LIST_MARKER, '').trim())
    .filter(Boolean)
}

/** Returns a copy of `list` with the item at `index` moved by `delta` places (clamped to the ends). */
export function moveItem<T>(list: T[], index: number, delta: number): T[] {
  const to = Math.max(0, Math.min(list.length - 1, index + delta))
  if (to === index) return list
  const copy = [...list]
  const [item] = copy.splice(index, 1)
  copy.splice(to, 0, item)
  return copy
}
