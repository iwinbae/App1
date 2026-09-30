export type Ingredient = {
  amount: number | null
  unit: string
  name: string
}

const UNITS = new Set([
  'g', 'kg', 'mg', 'ml', 'cl', 'dl', 'l',
  'tsp', 'tbsp', 'cup', 'oz', 'lb',
  'pc', 'pack', 'can', 'clove', 'pinch', 'bunch',
  // Norwegian: spiseskje, teskje, stykk, pakke, boks, fedd, klype
  'ss', 'ts', 'stk', 'pk', 'pakke', 'boks', 'fedd', 'klype',
])

const NUMBER = /^\d+(?:[.,]\d+)?$/
const FRACTION = /^(\d+)\/(\d+)$/
const NUMBER_WITH_UNIT = /^(\d+(?:[.,]\d+)?)([a-zæøå]+)\.?$/i

function parseNumber(token: string): number | null {
  if (NUMBER.test(token)) return Number(token.replace(',', '.'))
  const f = FRACTION.exec(token)
  if (f && Number(f[2]) !== 0) return Number(f[1]) / Number(f[2])
  return null
}

/** English units that take a plural "s" ("2 cans"). Units are stored in singular form. */
const PLURAL_UNITS = new Set(['cup', 'pc', 'pack', 'can', 'clove', 'bunch', 'pinch'])

function asUnit(token: string | undefined): string | null {
  if (!token) return null
  const unit = token.toLowerCase().replace(/\.$/, '')
  if (UNITS.has(unit)) return unit
  // "cans" → "can", "bunches" → "bunch".
  for (const singular of [unit.replace(/s$/, ''), unit.replace(/es$/, '')]) {
    if (PLURAL_UNITS.has(singular)) return singular
  }
  return null
}

function unitLabel(unit: string, amount: number | null): string {
  if (amount === null || amount <= 1 || !PLURAL_UNITS.has(unit)) return unit
  return unit.endsWith('h') ? unit + 'es' : unit + 's'
}

/** Parses lines like "500 g minced meat", "1 1/2 tsp salt", "2 onions" or "salt". */
export function parseIngredient(line: string): Ingredient {
  const tokens = line.trim().split(/\s+/).filter(Boolean)
  let amount: number | null = null
  let unit = ''
  let i = 0

  const attached = tokens[0] ? NUMBER_WITH_UNIT.exec(tokens[0]) : null
  if (attached && asUnit(attached[2])) {
    amount = Number(attached[1].replace(',', '.'))
    unit = asUnit(attached[2])!
    i = 1
  } else {
    amount = tokens[0] ? parseNumber(tokens[0]) : null
    if (amount !== null) {
      i = 1
      // "1 1/2": a whole number followed by a fraction.
      const frac = tokens[1] && FRACTION.test(tokens[1]) ? parseNumber(tokens[1]) : null
      if (frac !== null && Number.isInteger(amount)) {
        amount += frac
        i = 2
      }
      const u = asUnit(tokens[i])
      if (u && tokens.length > i + 1) {
        unit = u
        i++
      }
    }
  }

  const name = tokens.slice(i).join(' ')
  // Nothing sensible left for a name (e.g. "2", "500 g" or "2 cans"): keep the whole line.
  if (!name || asUnit(name)) return { amount: null, unit: '', name: line.trim() }
  return { amount, unit, name }
}

const NICE_FRACTIONS: [number, string][] = [
  [0.25, '¼'], [1 / 3, '⅓'], [0.5, '½'], [2 / 3, '⅔'], [0.75, '¾'],
]

/** Formats an amount for display: 1.5 → "1½", 0.3333 → "⅓", 2.4 → "2.4". */
export function formatAmount(amount: number): string {
  const whole = Math.floor(amount)
  const rest = amount - whole
  for (const [value, glyph] of NICE_FRACTIONS) {
    if (Math.abs(rest - value) < 0.01) return (whole || '') + glyph
  }
  return String(Math.round(amount * 100) / 100)
}

/** Formats an ingredient as display text. */
export function formatIngredient(ing: Ingredient): string {
  return [formatQuantity(ing), ing.name].filter(Boolean).join(' ')
}

/** The amount and unit only, e.g. "2 cans" or "500 g". */
export function formatQuantity(ing: Pick<Ingredient, 'amount' | 'unit'>): string {
  return [ing.amount === null ? '' : formatAmount(ing.amount), unitLabel(ing.unit, ing.amount)]
    .filter(Boolean)
    .join(' ')
}

/** Formats an ingredient so that parseIngredient reads it back unchanged (used for editing). */
export function ingredientToLine(ing: Ingredient): string {
  const amount = ing.amount === null ? '' : String(Math.round(ing.amount * 1000) / 1000)
  return [amount, unitLabel(ing.unit, ing.amount), ing.name].filter(Boolean).join(' ')
}

export function scaleIngredient(ing: Ingredient, factor: number): Ingredient {
  return ing.amount === null ? ing : { ...ing, amount: ing.amount * factor }
}

/** A key for spotting the same item written differently: "Onions" and "onion" match. */
export function itemKey(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map((w) => (w.length > 3 ? w.replace(/(?<=o)es$|(?<!s)s$/, '') : w))
    .join(' ')
}
