import { categorize, type CategoryId } from './categories'
import { itemKey, type Ingredient } from './ingredients'

export type ShoppingItem = Ingredient & {
  id: string
  category: CategoryId
  done: boolean
  createdAt: number
}

export type ShoppingAction =
  | { type: 'add'; items: Ingredient[] }
  | { type: 'toggle'; id: string }
  | { type: 'remove'; id: string }
  | { type: 'clearBought' }

/** Adds an ingredient, summing it into a matching item still on the list when the units agree. */
function addOne(list: ShoppingItem[], ing: Ingredient): ShoppingItem[] {
  const name = ing.name.trim()
  if (!name) return list
  const match = list.find(
    (it) =>
      !it.done &&
      itemKey(it.name) === itemKey(name) &&
      it.unit === ing.unit &&
      (it.amount === null) === (ing.amount === null),
  )
  if (match) {
    if (match.amount === null || ing.amount === null) return list
    return list.map((it) => (it === match ? { ...it, amount: it.amount! + ing.amount! } : it))
  }
  return [
    ...list,
    {
      ...ing,
      name,
      id: crypto.randomUUID(),
      category: categorize(name),
      done: false,
      createdAt: Date.now(),
    },
  ]
}

export function shoppingReducer(list: ShoppingItem[], action: ShoppingAction): ShoppingItem[] {
  switch (action.type) {
    case 'add':
      return action.items.reduce(addOne, list)
    case 'toggle':
      return list.map((it) => (it.id === action.id ? { ...it, done: !it.done } : it))
    case 'remove':
      return list.filter((it) => it.id !== action.id)
    case 'clearBought':
      return list.filter((it) => !it.done)
  }
}
