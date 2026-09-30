import { describe, expect, it } from 'vitest'
import { moveItem, splitLines } from './lists'

describe('splitLines', () => {
  it('splits lines and drops blanks', () => {
    expect(splitLines('500 g beef\n\n  2 onions  \r\nsalt')).toEqual(['500 g beef', '2 onions', 'salt'])
  })

  it('strips bullets and step numbers but keeps amounts', () => {
    expect(splitLines('- 1 onion\n• salt\n1. Fry the onion\n2) Add salt\nStep 3: Serve\n1.5 dl milk')).toEqual([
      '1 onion',
      'salt',
      'Fry the onion',
      'Add salt',
      'Serve',
      '1.5 dl milk',
    ])
  })
})

describe('moveItem', () => {
  it('moves an item up or down and clamps at the ends', () => {
    expect(moveItem(['a', 'b', 'c'], 2, -1)).toEqual(['a', 'c', 'b'])
    expect(moveItem(['a', 'b', 'c'], 0, 1)).toEqual(['b', 'a', 'c'])
    const list = ['a', 'b']
    expect(moveItem(list, 0, -1)).toBe(list)
  })
})
