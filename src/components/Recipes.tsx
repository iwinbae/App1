import { useState, type Dispatch, type FormEvent } from 'react'
import {
  formatIngredient,
  formatQuantity,
  ingredientToLine,
  parseIngredient,
  scaleIngredient,
  type Ingredient,
} from '../ingredients'
import { splitLines } from '../lists'
import type { Recipe, RecipeAction, RecipeDraft } from '../recipes'
import ListInput from './ListInput'

type Props = {
  recipes: Recipe[]
  dispatch: Dispatch<RecipeAction>
  onAddToList: (items: Ingredient[]) => void
  onShowList: () => void
}

type View = { kind: 'list' } | { kind: 'show'; id: string } | { kind: 'edit'; id?: string }

export default function Recipes({ recipes, dispatch, onAddToList, onShowList }: Props) {
  const [view, setView] = useState<View>({ kind: 'list' })
  const current = 'id' in view && view.id ? recipes.find((r) => r.id === view.id) : undefined

  if (view.kind === 'edit') {
    return (
      <RecipeForm
        recipe={current}
        onCancel={() => setView(current ? { kind: 'show', id: current.id } : { kind: 'list' })}
        onSave={(draft) => {
          const id = current?.id ?? crypto.randomUUID()
          dispatch({ type: 'save', id, draft })
          setView({ kind: 'show', id })
        }}
      />
    )
  }

  if (view.kind === 'show' && current) {
    return (
      <RecipeDetail
        // Remount per recipe so servings reset when switching recipes.
        key={current.id}
        recipe={current}
        onBack={() => setView({ kind: 'list' })}
        onEdit={() => setView({ kind: 'edit', id: current.id })}
        onDelete={() => {
          dispatch({ type: 'remove', id: current.id })
          setView({ kind: 'list' })
        }}
        onAddToList={onAddToList}
        onShowList={onShowList}
      />
    )
  }

  return (
    <section>
      <div className="section-head">
        <h1>Recipes</h1>
        <button className="primary" onClick={() => setView({ kind: 'edit' })}>
          New recipe
        </button>
      </div>
      {recipes.length === 0 ? (
        <p className="empty">No recipes yet. Save your first one with “New recipe”.</p>
      ) : (
        <ul className="recipe-list">
          {recipes.map((r) => (
            <li key={r.id}>
              <button onClick={() => setView({ kind: 'show', id: r.id })}>
                <span className="recipe-title">{r.title}</span>
                <span className="recipe-meta">
                  {r.ingredients.length} ingredients · serves {r.servings}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function RecipeDetail({
  recipe,
  onBack,
  onEdit,
  onDelete,
  onAddToList,
  onShowList,
}: {
  recipe: Recipe
  onBack: () => void
  onEdit: () => void
  onDelete: () => void
  onAddToList: (items: Ingredient[]) => void
  onShowList: () => void
}) {
  const [servings, setServings] = useState(recipe.servings)
  const [added, setAdded] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const factor = servings / recipe.servings
  const scaled = recipe.ingredients.map((ing) => scaleIngredient(ing, factor))

  function changeServings(next: number) {
    setServings(Math.max(1, Math.min(99, next)))
    setAdded(false)
  }

  return (
    <section>
      <button className="link back" onClick={onBack}>
        ← All recipes
      </button>
      <h1>{recipe.title}</h1>
      {recipe.link && (
        <p className="source">
          <a href={recipe.link} target="_blank" rel="noreferrer">
            Original recipe ↗
          </a>
        </p>
      )}

      <div className="section-head">
        <h2>Ingredients</h2>
        <div className="stepper" role="group" aria-label="Servings">
          <button onClick={() => changeServings(servings - 1)} disabled={servings <= 1} aria-label="Fewer servings">
            −
          </button>
          <span>
            {servings} {servings === 1 ? 'serving' : 'servings'}
          </span>
          <button onClick={() => changeServings(servings + 1)} aria-label="More servings">
            +
          </button>
        </div>
      </div>
      <ul className="ingredients">
        {scaled.map((ing, i) => (
          <li key={i}>{formatIngredient(ing)}</li>
        ))}
      </ul>

      {scaled.length > 0 && (
        <div className="actions">
          <button
            className="primary"
            onClick={() => {
              onAddToList(scaled)
              setAdded(true)
            }}
          >
            Add {scaled.length} ingredients to shopping list
          </button>
          {added && (
            <span className="notice" role="status">
              Added.{' '}
              <button className="link" onClick={onShowList}>
                Open shopping list
              </button>
            </span>
          )}
        </div>
      )}

      {recipe.steps.trim() && (
        <>
          <h2>Method</h2>
          <ol className="steps">
            {recipe.steps
              .split('\n')
              .map((s) => s.trim())
              .filter(Boolean)
              .map((step, i) => (
                <li key={i}>{step}</li>
              ))}
          </ol>
        </>
      )}

      <div className="actions footer-actions">
        <button className="secondary" onClick={onEdit}>
          Edit
        </button>
        {confirmDelete ? (
          <>
            <span>Delete this recipe?</span>
            <button className="danger" onClick={onDelete}>
              Delete
            </button>
            <button className="link" onClick={() => setConfirmDelete(false)}>
              Keep it
            </button>
          </>
        ) : (
          <button className="link" onClick={() => setConfirmDelete(true)}>
            Delete…
          </button>
        )}
      </div>
    </section>
  )
}

function RecipeForm({
  recipe,
  onSave,
  onCancel,
}: {
  recipe?: Recipe
  onSave: (draft: RecipeDraft) => void
  onCancel: () => void
}) {
  const [title, setTitle] = useState(recipe?.title ?? '')
  const [servings, setServings] = useState(String(recipe?.servings ?? 4))
  const [ingredients, setIngredients] = useState(recipe?.ingredients.map(ingredientToLine) ?? [])
  const [ingredientDraft, setIngredientDraft] = useState('')
  const [steps, setSteps] = useState(splitLines(recipe?.steps ?? ''))
  const [stepDraft, setStepDraft] = useState('')
  const [link, setLink] = useState(recipe?.link ?? '')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const url = link.trim()
    onSave({
      title,
      servings: Math.max(1, Math.round(Number(servings)) || 1),
      // Text still in an input counts too, so nothing typed is lost by pressing Save.
      ingredients: [...ingredients, ...splitLines(ingredientDraft)].map(parseIngredient),
      steps: [...steps, ...splitLines(stepDraft)].join('\n'),
      // Only keep web links, so a stray "javascript:" can't end up in an href.
      link: /^https?:\/\//i.test(url) ? url : url ? `https://${url}` : '',
    })
  }

  return (
    <section>
      <h1>{recipe ? 'Edit recipe' : 'New recipe'}</h1>
      <form className="recipe-form" onSubmit={handleSubmit}>
        <label>
          Name
          <input id="recipe-title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </label>
        <label className="narrow">
          Servings
          <input
            id="recipe-servings"
            type="number"
            min={1}
            max={99}
            value={servings}
            onChange={(e) => setServings(e.target.value)}
          />
        </label>
        <ListInput
          id="recipe-ingredients"
          label={
            <>
              Ingredients <small>Type one and press Enter, e.g. “500 g minced beef”</small>
            </>
          }
          items={ingredients}
          onItemsChange={setIngredients}
          draft={ingredientDraft}
          onDraftChange={setIngredientDraft}
          placeholder="Add an ingredient"
          itemName="ingredient"
          renderItem={(line) => {
            const ing = parseIngredient(line)
            const qty = formatQuantity(ing)
            return (
              <>
                {qty && <strong className="entry-qty">{qty}</strong>} {ing.name}
              </>
            )
          }}
        />
        <ListInput
          id="recipe-steps"
          label={
            <>
              Method <small>Add one step at a time</small>
            </>
          }
          items={steps}
          onItemsChange={setSteps}
          draft={stepDraft}
          onDraftChange={setStepDraft}
          placeholder={steps.length ? `Step ${steps.length + 1}` : 'First step, e.g. “Fry the onion”'}
          itemName="step"
          ordered
        />
        <label>
          Link to original <small>Optional</small>
          <input id="recipe-link" inputMode="url" value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://…" />
        </label>
        <div className="actions">
          <button type="submit" className="primary" disabled={!title.trim()}>
            Save recipe
          </button>
          <button type="button" className="link" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </form>
    </section>
  )
}
