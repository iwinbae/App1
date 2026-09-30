import { useRef, useState, type ClipboardEvent, type KeyboardEvent, type ReactNode } from 'react'
import { moveItem, splitLines } from '../lists'

type Props = {
  id: string
  label: ReactNode
  items: string[]
  onItemsChange: (items: string[]) => void
  /** The text typed but not yet added; kept by the parent so it can be saved with the form. */
  draft: string
  onDraftChange: (draft: string) => void
  placeholder: string
  /** Numbered list with buttons to reorder, for steps where the order matters. */
  ordered?: boolean
  renderItem?: (text: string) => ReactNode
  itemName: string
}

/**
 * Type one entry and press Enter (or Add) to append it to the list. Pasting several lines
 * adds them all at once. Each entry can then be edited, moved or removed on its own.
 */
export default function ListInput({
  id,
  label,
  items,
  onItemsChange,
  draft,
  onDraftChange,
  placeholder,
  ordered = false,
  renderItem = (text) => text,
  itemName,
}: Props) {
  const [editing, setEditing] = useState<number | null>(null)
  const [editText, setEditText] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  function add(text: string) {
    const lines = splitLines(text)
    if (lines.length) onItemsChange([...items, ...lines])
    onDraftChange('')
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    // Enter adds the entry instead of submitting the whole recipe form.
    if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
      e.preventDefault()
      add(draft)
    }
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    const pasted = e.clipboardData.getData('text')
    if (!pasted.includes('\n')) return
    // A pasted list (e.g. copied from a recipe website) becomes one entry per line.
    e.preventDefault()
    const input = e.currentTarget
    const before = draft.slice(0, input.selectionStart ?? draft.length)
    const after = draft.slice(input.selectionEnd ?? draft.length)
    add(before + pasted + after)
  }

  function startEdit(index: number) {
    setEditing(index)
    setEditText(items[index])
  }

  function commitEdit() {
    if (editing === null) return
    const text = editText.trim()
    onItemsChange(text ? items.map((it, i) => (i === editing ? text : it)) : items.filter((_, i) => i !== editing))
    setEditing(null)
  }

  const List = ordered ? 'ol' : 'ul'

  return (
    <div className="list-input">
      <label htmlFor={id}>{label}</label>

      {items.length > 0 && (
        <List className={ordered ? 'entries ordered' : 'entries'}>
          {items.map((item, i) => (
            <li key={`${i}-${item}`}>
              {editing === i ? (
                <input
                  className="entry-edit"
                  value={editText}
                  autoFocus
                  aria-label={`Edit ${itemName} ${i + 1}`}
                  onChange={(e) => setEditText(e.target.value)}
                  onBlur={commitEdit}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                      e.preventDefault()
                      commitEdit()
                    }
                    if (e.key === 'Escape') setEditing(null)
                  }}
                />
              ) : (
                <button type="button" className="entry-text" onClick={() => startEdit(i)} title="Click to edit">
                  {renderItem(item)}
                </button>
              )}
              {ordered && (
                <>
                  <button
                    type="button"
                    className="icon"
                    onClick={() => onItemsChange(moveItem(items, i, -1))}
                    disabled={i === 0}
                    aria-label={`Move ${itemName} ${i + 1} up`}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    className="icon"
                    onClick={() => onItemsChange(moveItem(items, i, 1))}
                    disabled={i === items.length - 1}
                    aria-label={`Move ${itemName} ${i + 1} down`}
                  >
                    ↓
                  </button>
                </>
              )}
              <button
                type="button"
                className="icon remove-entry"
                onClick={() => onItemsChange(items.filter((_, j) => j !== i))}
                aria-label={`Remove ${itemName} ${i + 1}`}
              >
                ×
              </button>
            </li>
          ))}
        </List>
      )}

      <div className="entry-add">
        <input
          ref={inputRef}
          id={id}
          value={draft}
          onChange={(e) => onDraftChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder={placeholder}
          enterKeyHint="enter"
          autoComplete="off"
        />
        <button
          type="button"
          className="secondary"
          onClick={() => {
            add(draft)
            // Keep typing the next entry without tapping the field again.
            inputRef.current?.focus()
          }}
          disabled={!draft.trim()}
        >
          Add
        </button>
      </div>
    </div>
  )
}
