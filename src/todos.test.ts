import { describe, expect, it } from 'vitest'
import { filterTodos, todosReducer, type Todo } from './todos'

const make = (text: string, done = false): Todo => ({
  id: text,
  text,
  done,
  createdAt: 0,
})

describe('todosReducer', () => {
  it('adds a trimmed todo and ignores blank input', () => {
    const added = todosReducer([], { type: 'add', text: '  buy milk  ' })
    expect(added).toHaveLength(1)
    expect(added[0]).toMatchObject({ text: 'buy milk', done: false })
    expect(todosReducer([], { type: 'add', text: '   ' })).toEqual([])
  })

  it('toggles, edits and removes by id', () => {
    const start = [make('a'), make('b')]
    expect(todosReducer(start, { type: 'toggle', id: 'a' })[0].done).toBe(true)
    expect(todosReducer(start, { type: 'edit', id: 'b', text: 'B' })[1].text).toBe('B')
    expect(todosReducer(start, { type: 'remove', id: 'a' })).toEqual([make('b')])
  })

  it('removes a todo edited to empty text', () => {
    expect(todosReducer([make('a')], { type: 'edit', id: 'a', text: ' ' })).toEqual([])
  })

  it('clears done todos', () => {
    expect(todosReducer([make('a', true), make('b')], { type: 'clearDone' })).toEqual([make('b')])
  })
})

describe('filterTodos', () => {
  const todos = [make('a', true), make('b')]
  it('filters by status', () => {
    expect(filterTodos(todos, 'all')).toHaveLength(2)
    expect(filterTodos(todos, 'active')).toEqual([make('b')])
    expect(filterTodos(todos, 'done')).toEqual([make('a', true)])
  })
})
