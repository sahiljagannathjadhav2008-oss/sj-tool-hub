# Tool Hub

A personal, permanent, ever-growing index of small browser-based tools — built to run entirely on GitHub Pages with plain HTML, CSS, and JavaScript. No frameworks, no build step, no backend.

**About Developer**
Sahil Jadhav
Built Different

---

## Table of contents

- [Project overview](#project-overview)
- [Folder structure](#folder-structure)
- [How to add a tool](#how-to-add-a-tool)
- [How to remove a tool](#how-to-remove-a-tool)
- [How tools.json works](#how-toolsjson-works)
- [GitHub Pages deployment](#github-pages-deployment)
- [Customization guide](#customization-guide)
- [Future expansion guide](#future-expansion-guide)

---

## Project overview

The homepage never needs manual edits when a tool is added or removed. `index.html` contains only empty containers; `script.js` reads `tools.json` at load time and generates every card, category chip, and count on the page. The single source of truth for what appears on the homepage is `tools.json`.

Core behaviors:

- **Live search** — filters cards instantly as you type, no reload.
- **Category filter** — chips are generated from whatever categories exist in `tools.json`; there's nothing to configure.
- **Dark / light theme** — chosen in the settings panel (top right) and remembered via `localStorage`, restored automatically on the next visit.
- **Empty state** — if `tools.json` is `[]`, the homepage shows a clean "no tools yet" message instead of placeholder cards.

---

## Folder structure

```
/
├── index.html          → homepage shell (empty containers only)
├── style.css            → all styling, theme tokens, animations
├── script.js             → loads tools.json, renders cards/search/theme
├── tools.json            → the list of tools — the only file you edit routinely
├── README.md
└── tools/
    ├── tool-one/
    │   └── index.html
    ├── tool-two/
    │   └── index.html
    └── ...
```

Every tool lives in its own folder under `/tools/`. What's inside that folder is entirely up to the tool — a single `index.html`, or `index.html` + its own CSS/JS files. Tools are self-contained and don't share code with the homepage.

---

## How to add a tool

1. Create a new folder inside `/tools/`, e.g. `/tools/word-counter/`.
2. Put the tool's files inside it. It must have an `index.html` as the entry point (that's what the card's **Open** button links to).
3. Add one new entry to `tools.json` (see the schema below).
4. Commit and push to GitHub.

That's it — nothing in `index.html`, `style.css`, or `script.js` needs to change. The homepage will pick up the new card automatically the next time the page loads.

---

## How to remove a tool

1. Delete its folder from `/tools/`.
2. Remove its entry from `tools.json`.
3. Commit and push.

The card disappears from the homepage on the next load.

---

## How tools.json works

`tools.json` is a JSON array. Each object in the array becomes one card. Fields:

| Field         | Type   | Required | Description                                             |
|---------------|--------|----------|-----------------------------------------------------------|
| `name`        | string | yes      | Tool name shown on the card.                              |
| `description` | string | yes      | One or two short sentences.                               |
| `category`    | string | yes      | Powers the category filter chips. Free text — chips generate automatically from whatever values exist. |
| `folder`      | string | yes      | Path to the tool's folder relative to the repo root, e.g. `tools/word-counter`. Used to build the **Open** link (`<folder>/index.html`). |
| `version`     | string | no       | Shown in the card footer, e.g. `1.0.0`.                    |

Example entry (not currently in `tools.json` — it ships empty):

```json
{
  "name": "Word Counter",
  "description": "Counts words, characters, and reading time as you type.",
  "category": "Utilities",
  "folder": "tools/word-counter",
  "version": "1.0.0"
}
```

`tools.json` currently contains an empty array (`[]`) on purpose — no sample or placeholder tools ship with this project.

---

## GitHub Pages deployment

1. Push this repository to GitHub.
2. In the repo, go to **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to `Deploy from a branch`.
4. Choose the branch (typically `main`) and the root folder (`/`).
5. Save. GitHub will publish the site at `https://<your-username>.github.io/<repo-name>/`.

No build step is required — the site is static HTML/CSS/JS and Pages serves it as-is. Every push to the branch you selected redeploys automatically.

**Local preview:** opening `index.html` directly as a `file://` URL will not load `tools.json` in most browsers, because `fetch()` of local JSON files is blocked by CORS under the `file://` protocol. Serve the folder locally instead, e.g. `python3 -m http.server` from the project root, then visit `http://localhost:8000`.

---

## Customization guide

All visual tokens (colors, fonts, spacing, radii) live at the top of `style.css` as CSS custom properties, split by theme:

```css
html[data-theme="dark"]  { --bg: ...; --accent: ...; ... }
html[data-theme="light"] { --bg: ...; --accent: ...; ... }
```

To restyle the site, change values there rather than hunting through individual component rules — every component references these variables.

Fonts are loaded from Google Fonts in `index.html`'s `<head>`:
- **Space Grotesk** — headings and the brand mark
- **Inter** — body text and UI
- **JetBrains Mono** — tags, counters, category chips, code-styled elements

Swap the `<link>` tag and the `--font-*` variables together if you want a different type pairing.

---

## Future expansion guide

The architecture leaves room to add the following without redesigning anything:

- **Favorites / Pinned tools** — add a `pinned: true` field to a tool's entry in `tools.json`, then sort pinned tools first in `getFilteredTools()` inside `script.js`.
- **Sorting / Recently added** — add a `dateAdded` field to entries and sort by it before rendering.
- **Search filters** (by category + query combined) — the filtering logic already lives in one place (`getFilteredTools()`), so additional filters are additional conditions in that function.
- **Tool counter** — already implemented (`#tool-count` in the hero).
- **PWA / offline support** — add a `manifest.json` and a service worker registration in `script.js`; no restructuring needed since everything is already static assets.
- **Import/export settings** — the settings panel already isolates all persisted state under a single `localStorage` key (`toolhub-theme`); additional settings can follow the same pattern.

Because every tool is a self-contained folder and the homepage never hardcodes tool data, this project is designed to scale to hundreds of entries without the core files growing in complexity.
