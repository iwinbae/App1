export type Todo = {
  id: string
  text: string
  done: boolean
  createdAt: number
}

export type Filter = 'all' | 'active' | 'done'

export type Action =
  | { type: 'add'; text: string }
  | { type: 'toggle'; id: string }
  | { type: 'remove'; id: string }
  | { type: 'edit'; id: string; text: string }
  | { type: 'clearDone' }

export function todosReducer(todos: Todo[], action: Action): Todo[] {
  switch (action.type) {
    case 'add': {
      const text = action.text.trim()
      if (!text) return todos
      return [...todos, { id: crypto.randomUUID(), text, done: false, createdAt: Date.now() }]
    }
    case 'toggle':
      return todos.map((t) => (t.id === action.id ? { ...t, done: !t.done } : t))
    case 'remove':
      return todos.filter((t) => t.id !== action.id)
    case 'edit': {
      const text = action.text.trim()
      if (!text) return todos.filter((t) => t.id !== action.id)
      return todos.map((t) => (t.id === action.id ? { ...t, text } : t))
    }
    case 'clearDone':
      return todos.filter((t) => !t.done)
  }
}

export function filterTodos(todos: Todo[], filter: Filter): Todo[] {
  if (filter === 'active') return todos.filter((t) => !t.done)
  if (filter === 'done') return todos.filter((t) => t.done)
  return todos
}

const STORAGE_KEY = 'app1.todos'

export function loadTodos(): Todo[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed: unknown = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? (parsed as Todo[]) : []
  } catch {
    return []
  }
}

export function saveTodos(todos: Todo[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
  } catch {
    // Storage full or unavailable (e.g. private mode): keep working in memory.
  }
}
