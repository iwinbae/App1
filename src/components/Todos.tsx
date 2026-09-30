import { useState, type FormEvent } from 'react'
import { usePersistentReducer } from '../storage'
import { filterTodos, todosReducer, type Action, type Filter, type Todo } from '../todos'

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'done', label: 'Done' },
]

export default function Todos() {
  const [todos, dispatch] = usePersistentReducer(todosReducer, 'app1.todos')
  const [draft, setDraft] = useState('')
  const [filter, setFilter] = useState<Filter>('all')

  const visible = filterTodos(todos, filter)
  const remaining = todos.filter((t) => !t.done).length
  const doneCount = todos.length - remaining

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    dispatch({ type: 'add', text: draft })
    setDraft('')
  }

  return (
    <section>
      <h1>Todos</h1>

      <form className="new-todo sticky-add" onSubmit={handleSubmit}>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="What needs doing?"
          aria-label="New todo"
        />
        <button type="submit" disabled={!draft.trim()}>
          Add
        </button>
      </form>

      {todos.length > 0 && (
        <nav className="filters" aria-label="Filter todos">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              className={filter === f.value ? 'active' : ''}
              aria-pressed={filter === f.value}
              onClick={() => setFilter(f.value)}
            >
              {f.label}
            </button>
          ))}
        </nav>
      )}

      <ul className="todo-list">
        {visible.map((todo) => (
          <TodoItem key={todo.id} todo={todo} dispatch={dispatch} />
        ))}
      </ul>

      {todos.length === 0 ? (
        <p className="empty">Nothing here yet. Add your first todo above.</p>
      ) : (
        <footer className="summary">
          <span>
            {remaining} {remaining === 1 ? 'item' : 'items'} left
          </span>
          {doneCount > 0 && (
            <button className="link" onClick={() => dispatch({ type: 'clearDone' })}>
              Clear done ({doneCount})
            </button>
          )}
        </footer>
      )}
    </section>
  )
}

function TodoItem({ todo, dispatch }: { todo: Todo; dispatch: React.Dispatch<Action> }) {
  const [editing, setEditing] = useState(false)
  const [text, setText] = useState(todo.text)

  function commit() {
    dispatch({ type: 'edit', id: todo.id, text })
    setEditing(false)
  }

  return (
    <li className={todo.done ? 'done' : ''}>
      <input
        type="checkbox"
        checked={todo.done}
        onChange={() => dispatch({ type: 'toggle', id: todo.id })}
        aria-label={`Mark "${todo.text}" as ${todo.done ? 'not done' : 'done'}`}
      />
      {editing ? (
        <input
          className="edit"
          value={text}
          autoFocus
          onChange={(e) => setText(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commit()
            if (e.key === 'Escape') {
              setText(todo.text)
              setEditing(false)
            }
          }}
        />
      ) : (
        <span className="text" onDoubleClick={() => setEditing(true)} title="Double-click to edit">
          {todo.text}
        </span>
      )}
      <button
        className="remove"
        onClick={() => dispatch({ type: 'remove', id: todo.id })}
        aria-label={`Delete "${todo.text}"`}
      >
        ×
      </button>
    </li>
  )
}
