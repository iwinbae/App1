export type CategoryId =
  | 'produce' | 'bakery' | 'dairy' | 'meat' | 'pantry' | 'frozen' | 'drinks' | 'household' | 'other'

/** Listed in the order you typically walk through a store. */
export const CATEGORIES: { id: CategoryId; label: string; keywords: string[] }[] = [
  {
    id: 'produce',
    label: 'Fruit & vegetables',
    keywords: [
      'apple', 'banana', 'orange', 'lemon', 'lime', 'grape', 'berr', 'avocado', 'tomato', 'potato',
      'onion', 'garlic', 'carrot', 'cucumber', 'lettuce', 'salad', 'spinach', 'pepper', 'broccoli',
      'cauliflower', 'mushroom', 'celery', 'leek', 'zucchini', 'ginger', 'herb', 'basil', 'parsley',
      'coriander', 'cilantro', 'eple', 'banan', 'appelsin', 'sitron', 'tomat', 'potet', 'løk',
      'hvitløk', 'gulrot', 'agurk', 'paprika', 'sopp', 'brokkoli', 'purre',
    ],
  },
  { id: 'bakery', label: 'Bread & bakery', keywords: ['bread', 'bun', 'roll', 'bagel', 'tortilla', 'wrap', 'croissant', 'brød', 'rundstykke', 'lompe'] },
  {
    id: 'dairy',
    label: 'Dairy & eggs',
    keywords: ['milk', 'cheese', 'butter', 'yogurt', 'yoghurt', 'cream', 'egg', 'parmesan', 'mozzarella', 'melk', 'ost', 'smør', 'fløte', 'rømme', 'egg'],
  },
  {
    id: 'meat',
    label: 'Meat & fish',
    keywords: [
      'chicken', 'beef', 'pork', 'mince', 'bacon', 'ham', 'sausage', 'salmon', 'fish', 'cod', 'shrimp',
      'prawn', 'tuna', 'turkey', 'lamb', 'kylling', 'kjøtt', 'svin', 'laks', 'torsk', 'fisk', 'reker', 'pølse', 'skinke',
    ],
  },
  {
    id: 'pantry',
    label: 'Pantry',
    keywords: [
      'pasta', 'spaghetti', 'noodle', 'rice', 'flour', 'sugar', 'salt', 'oil', 'vinegar', 'sauce',
      'stock', 'broth', 'paste', 'chopped tomato', 'oregano', 'thyme', 'dried', 'black pepper', 'bean', 'lentil', 'oat', 'cereal', 'honey', 'jam', 'spice', 'cumin', 'paprika powder',
      'cinnamon', 'canned', 'tinned', 'passata', 'ketchup', 'mustard', 'mayo', 'nut', 'chocolate',
      'ris', 'mel', 'sukker', 'olje', 'buljong', 'bønner', 'havre', 'krydder',
    ],
  },
  { id: 'frozen', label: 'Frozen', keywords: ['frozen', 'ice cream', 'pizza', 'frossen'] },
  { id: 'drinks', label: 'Drinks', keywords: ['juice', 'coffee', 'tea', 'water', 'soda', 'cola', 'beer', 'wine', 'kaffe', 'vann', 'brus', 'øl', 'vin'] },
  {
    id: 'household',
    label: 'Household',
    keywords: ['paper', 'soap', 'detergent', 'dish', 'toilet', 'tissue', 'foil', 'bag', 'sponge', 'battery', 'shampoo', 'toothpaste', 'papir', 'såpe', 'oppvask'],
  },
  { id: 'other', label: 'Other', keywords: [] },
]

/**
 * Guesses the store aisle from an item name. A keyword matches at the start of any word
 * ("milk" in "oat milk"), so short keywords don't match inside unrelated words.
 * Multi-word matches beat single words, and later words (the noun) beat earlier ones.
 */
export function categorize(name: string): CategoryId {
  const text = name.toLowerCase()
  const words = text.split(/[^a-zæøå]+/).filter(Boolean)
  let best: { id: CategoryId; score: number } = { id: 'other', score: 0 }
  for (const cat of CATEGORIES) {
    for (const kw of cat.keywords) {
      let score = 0
      if (kw.includes(' ')) {
        if (text.includes(kw)) score = 1000
      } else {
        const idx = words.findLastIndex((w) => w.startsWith(kw))
        if (idx >= 0) score = idx + 1 + kw.length / 100
      }
      if (score > best.score) best = { id: cat.id, score }
    }
  }
  return best.id
}
