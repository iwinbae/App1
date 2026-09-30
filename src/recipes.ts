import type { Ingredient } from './ingredients'
import { parseIngredient } from './ingredients'

export type Recipe = {
  id: string
  title: string
  servings: number
  ingredients: Ingredient[]
  steps: string
  link: string
  createdAt: number
}

export type RecipeDraft = Omit<Recipe, 'id' | 'createdAt'>

export type RecipeAction =
  | { type: 'save'; id?: string; draft: RecipeDraft }
  | { type: 'remove'; id: string }

export function recipesReducer(recipes: Recipe[], action: RecipeAction): Recipe[] {
  switch (action.type) {
    case 'save': {
      if (!action.draft.title.trim()) return recipes
      const draft = { ...action.draft, title: action.draft.title.trim() }
      if (action.id && recipes.some((r) => r.id === action.id)) {
        return recipes.map((r) => (r.id === action.id ? { ...r, ...draft } : r))
      }
      return [...recipes, { ...draft, id: action.id ?? crypto.randomUUID(), createdAt: Date.now() }]
    }
    case 'remove':
      return recipes.filter((r) => r.id !== action.id)
  }
}

/** Shown on first launch so the recipe box isn't empty; delete it like any other recipe. */
export function exampleRecipes(): Recipe[] {
  return [
    {
      id: 'example-bolognese',
      title: 'Spaghetti bolognese (example)',
      servings: 4,
      ingredients: [
        '400 g spaghetti',
        '500 g minced beef',
        '1 onion',
        '2 cloves garlic',
        '1 can chopped tomatoes',
        '2 tbsp tomato paste',
        '1 tsp dried oregano',
        '50 g parmesan',
      ].map(parseIngredient),
      steps:
        'Fry the chopped onion and garlic in a little oil.\nAdd the mince and brown it.\nStir in tomatoes, tomato paste and oregano; simmer 20 minutes.\nCook the spaghetti and serve with grated parmesan.',
      link: '',
      createdAt: 0,
    },
  ]
}
