import { useState, type Dispatch, type FormEvent } from 'react'
import { CATEGORIES } from '../categories'
import { formatQuantity, parseIngredient } from '../ingredients'
import type { ShoppingAction, ShoppingItem } from '../shopping'

type Props = {
  items: ShoppingItem[]
  dispatch: Dispatch<ShoppingAction>
}

export default function ShoppingList({ items, dispatch }: Props) {
  const [draft, setDraft] = useState('')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    // Several items can be added at once, separated by commas.
    const lines = draft.split(',').map((l) => l.trim()).filter(Boolean)
    dispatch({ type: 'add', items: lines.map(parseIngredient) })
    setDraft('')
  }

  const toBuy = items.filter((i) => !i.done)
  const inCart = items.filter((i) => i.done)
  const groups = CATEGORIES.map((c) => ({ ...c, items: toBuy.filter((i) => i.category === c.id) })).filter(
    (g) => g.items.length > 0,
  )

  return (
    <section>
      <h1>Shopping list</h1>
      <form className="new-todo" onSubmit={handleSubmit}>
        <input
          id="shopping-new"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="e.g. 2 l milk, bread, 500 g minced beef"
          aria-label="Add to shopping list"
        />
        <button type="submit" disabled={!draft.trim()}>
          Add
        </button>
      </form>

      {items.length === 0 && (
        <p className="empty">
          Your list is empty. Add items above, or add a recipe's ingredients from the Recipes tab.
        </p>
      )}

      {groups.map((g) => (
        <div key={g.id} className="group">
          <h2 className="group-title">{g.label}</h2>
          <ul className="todo-list">
            {g.items.map((item) => (
              <Item key={item.id} item={item} dispatch={dispatch} />
            ))}
          </ul>
        </div>
      ))}

      {toBuy.length === 0 && inCart.length > 0 && <p className="empty">All done. Everything is in the cart.</p>}

      {inCart.length > 0 && (
        <div className="group">
          <div className="group-head">
            <h2 className="group-title">In the cart ({inCart.length})</h2>
            <button className="link" onClick={() => dispatch({ type: 'clearBought' })}>
              Clear
            </button>
          </div>
          <ul className="todo-list">
            {inCart.map((item) => (
              <Item key={item.id} item={item} dispatch={dispatch} />
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}

function Item({ item, dispatch }: { item: ShoppingItem; dispatch: Dispatch<ShoppingAction> }) {
  const qty = formatQuantity(item)
  return (
    <li className={item.done ? 'done' : ''}>
      <input
        type="checkbox"
        checked={item.done}
        onChange={() => dispatch({ type: 'toggle', id: item.id })}
        aria-label={`${item.done ? 'Put back' : 'Mark as bought'}: ${item.name}`}
      />
      <span className="text">{item.name}</span>
      {qty && <span className="qty">{qty}</span>}
      <button className="remove" onClick={() => dispatch({ type: 'remove', id: item.id })} aria-label={`Delete "${item.name}"`}>
        ×
      </button>
    </li>
  )
}
