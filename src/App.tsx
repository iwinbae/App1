import { useState } from 'react'
import Recipes from './components/Recipes'
import ShoppingList from './components/ShoppingList'
import Todos from './components/Todos'
import { exampleRecipes, recipesReducer } from './recipes'
import { shoppingReducer } from './shopping'
import { usePersistentReducer } from './storage'

type Tab = 'shopping' | 'recipes' | 'todos'

const TABS: { id: Tab; label: string }[] = [
  { id: 'shopping', label: 'Shopping' },
  { id: 'recipes', label: 'Recipes' },
  { id: 'todos', label: 'Todos' },
]

const TAB_KEY = 'app1.tab'

function loadTab(): Tab {
  try {
    const saved = localStorage.getItem(TAB_KEY)
    return TABS.some((t) => t.id === saved) ? (saved as Tab) : 'shopping'
  } catch {
    return 'shopping'
  }
}

export default function App() {
  const [tab, setTab] = useState<Tab>(loadTab)
  const [shopping, dispatchShopping] = usePersistentReducer(shoppingReducer, 'app1.shopping')
  const [recipes, dispatchRecipes] = usePersistentReducer(recipesReducer, 'app1.recipes', exampleRecipes)

  function selectTab(next: Tab) {
    setTab(next)
    try {
      localStorage.setItem(TAB_KEY, next)
    } catch {
      // Not remembering the tab is fine.
    }
  }

  const toBuy = shopping.filter((i) => !i.done).length

  return (
    <main className="app">
      <nav className="tabs" aria-label="Sections">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={tab === t.id ? 'active' : ''}
            aria-current={tab === t.id ? 'page' : undefined}
            onClick={() => selectTab(t.id)}
          >
            {t.label}
            {t.id === 'shopping' && toBuy > 0 && <span className="badge">{toBuy}</span>}
          </button>
        ))}
      </nav>

      {tab === 'shopping' && <ShoppingList items={shopping} dispatch={dispatchShopping} />}
      {tab === 'recipes' && (
        <Recipes
          recipes={recipes}
          dispatch={dispatchRecipes}
          onAddToList={(items) => dispatchShopping({ type: 'add', items })}
          onShowList={() => selectTab('shopping')}
        />
      )}
      {tab === 'todos' && <Todos />}
    </main>
  )
}
