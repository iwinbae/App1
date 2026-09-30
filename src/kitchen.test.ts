import { describe, expect, it } from 'vitest'
import { categorize } from './categories'
import { formatAmount, formatIngredient, ingredientToLine, itemKey, parseIngredient, scaleIngredient } from './ingredients'
import { recipesReducer, type RecipeDraft } from './recipes'
import { shoppingReducer, type ShoppingItem } from './shopping'

describe('parseIngredient', () => {
  it.each([
    ['500 g minced beef', { amount: 500, unit: 'g', name: 'minced beef' }],
    ['500g minced beef', { amount: 500, unit: 'g', name: 'minced beef' }],
    ['1 1/2 tsp salt', { amount: 1.5, unit: 'tsp', name: 'salt' }],
    ['1,5 dl fløte', { amount: 1.5, unit: 'dl', name: 'fløte' }],
    ['2 onions', { amount: 2, unit: '', name: 'onions' }],
    ['salt and pepper', { amount: null, unit: '', name: 'salt and pepper' }],
    ['2 l', { amount: null, unit: '', name: '2 l' }],
    ['3 g', { amount: null, unit: '', name: '3 g' }],
  ])('parses %j', (line, expected) => {
    expect(parseIngredient(line)).toEqual(expected)
  })

  it('does not treat a unit-like word as a unit when it is the whole name', () => {
    expect(parseIngredient('2 cans')).toEqual({ amount: null, unit: '', name: '2 cans' })
  })

  it('round-trips through ingredientToLine', () => {
    const ing = scaleIngredient(parseIngredient('1 can tomatoes'), 1 / 3)
    expect(parseIngredient(ingredientToLine(ing)).amount).toBeCloseTo(1 / 3, 3)
  })
})

describe('formatting and scaling', () => {
  it('shows common fractions as glyphs', () => {
    expect(formatAmount(1.5)).toBe('1½')
    expect(formatAmount(0.25)).toBe('¼')
    expect(formatAmount(2)).toBe('2')
    expect(formatAmount(2.4)).toBe('2.4')
  })

  it('stores units in singular and pluralizes them by amount', () => {
    const cloves = parseIngredient('2 cloves garlic')
    expect(cloves.unit).toBe('clove')
    expect(formatIngredient(scaleIngredient(cloves, 0.5))).toBe('1 clove garlic')
    expect(formatIngredient(cloves)).toBe('2 cloves garlic')
    expect(formatIngredient(parseIngredient('2 bunches dill'))).toBe('2 bunches dill')
  })

  it('matches singular and plural item names', () => {
    expect(itemKey('Onions')).toBe(itemKey('onion'))
    expect(itemKey('tomatoes')).toBe(itemKey('tomato'))
    expect(itemKey('grass')).toBe('grass')
    expect(itemKey('egg')).toBe(itemKey('eggs'))
  })

  it('scales amounts but leaves unmeasured ingredients alone', () => {
    const half = scaleIngredient(parseIngredient('400 g spaghetti'), 0.5)
    expect(formatIngredient(half)).toBe('200 g spaghetti')
    expect(scaleIngredient(parseIngredient('salt'), 2).amount).toBeNull()
  })
})

describe('categorize', () => {
  it.each([
    ['bananas', 'produce'],
    ['oat milk', 'dairy'],
    ['minced beef', 'meat'],
    ['tomato paste', 'pantry'],
    ['paprika powder', 'pantry'],
    ['chopped tomatoes', 'pantry'],
    ['melk', 'dairy'],
    ['kyllingfilet', 'meat'],
    ['toilet paper', 'household'],
    ['birthday candles', 'other'],
  ])('%s → %s', (name, category) => {
    expect(categorize(name)).toBe(category)
  })
})

describe('shoppingReducer', () => {
  const add = (list: ShoppingItem[], ...lines: string[]) =>
    shoppingReducer(list, { type: 'add', items: lines.map(parseIngredient) })

  it('adds items with a category', () => {
    const [item] = add([], '2 l milk')
    expect(item).toMatchObject({ name: 'milk', amount: 2, unit: 'l', category: 'dairy', done: false })
  })

  it('merges duplicates with the same unit and keeps different units apart', () => {
    const list = add([], '200 g cheese', '100 g Cheese', '1 pack cheese')
    expect(list).toHaveLength(2)
    expect(list[0].amount).toBe(300)
  })

  it('merges singular and plural names without a unit', () => {
    const list = add([], '2 onions', '1 onion')
    expect(list).toHaveLength(1)
    expect(list[0]).toMatchObject({ name: 'onions', amount: 3 })
  })

  it('does not merge into an item already in the cart', () => {
    let list = add([], '1 l milk')
    list = shoppingReducer(list, { type: 'toggle', id: list[0].id })
    list = add(list, '1 l milk')
    expect(list).toHaveLength(2)
  })

  it('clears bought items', () => {
    let list = add([], 'bread', 'butter')
    list = shoppingReducer(list, { type: 'toggle', id: list[0].id })
    expect(shoppingReducer(list, { type: 'clearBought' }).map((i) => i.name)).toEqual(['butter'])
  })
})

describe('recipesReducer', () => {
  const draft: RecipeDraft = { title: ' Pancakes ', servings: 2, ingredients: [], steps: '', link: '' }

  it('adds, updates and removes recipes', () => {
    let recipes = recipesReducer([], { type: 'save', draft })
    expect(recipes[0].title).toBe('Pancakes')
    const id = recipes[0].id
    recipes = recipesReducer(recipes, { type: 'save', id, draft: { ...draft, servings: 4 } })
    expect(recipes).toHaveLength(1)
    expect(recipes[0].servings).toBe(4)
    expect(recipesReducer(recipes, { type: 'remove', id })).toEqual([])
  })

  it('ignores a recipe without a title', () => {
    expect(recipesReducer([], { type: 'save', draft: { ...draft, title: ' ' } })).toEqual([])
  })
})
