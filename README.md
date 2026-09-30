# App1
Første appen - lekeprosjekt med claude

A shopping list, recipe box and todo app built with Vite, React and TypeScript. Everything is saved in the browser (localStorage).

## Features
**Shopping list**
- Add items with amounts, e.g. `2 l milk`, or several at once separated by commas
- Items are sorted into store aisles automatically (fruit & veg, dairy, meat, pantry…), with English and Norwegian names
- Ticked items move to "In the cart"; clear them when you're done

**Recipes**
- Save recipes with ingredients, method and an optional link to the original
- Build the ingredient and step lists one entry at a time: type, press Enter, and it's added. Paste a whole list to add every line at once. Click an entry to edit it; reorder or remove steps with the buttons
- Change the number of servings and all amounts scale (½, ¼ and ⅓ shown as fractions)
- Add a recipe's ingredients to the shopping list in one tap; duplicates are merged (2 onions + ½ onion = 2½ onions)

**Todos**
- Add, check off, edit (double-click) and delete todos, with All / Active / Done filters

## Getting started
```sh
npm install
npm run dev      # start the dev server
npm test         # run the unit tests
npm run build    # type-check and build for production
npm run lint     # lint with oxlint
```
