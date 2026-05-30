# Contributing

Thanks for your interest in improving the Sorting Algorithm Visualizer. Contributions of
all sizes are welcome.

## Before you start

- For a small fix (typo, bug, style tweak), open a pull request directly.
- For anything larger (a new algorithm, a UX change), open an issue first so we can agree
  on the approach before you invest time.

## Development

There is no build step and no dependencies. The app is plain HTML, CSS, and ES modules in
`docs/`.

```bash
git clone https://github.com/mehdisayn/Sorting-Algorithm-Visualizer.git
cd Sorting-Algorithm-Visualizer/docs
python3 -m http.server 8000
# open http://localhost:8000
```

ES modules require an HTTP server; opening `index.html` via `file://` will not work.

## Checks before opening a PR

- The JavaScript parses cleanly:
  ```bash
  node --check docs/js/main.js
  node --check docs/js/algorithms.js
  ```
- If you touch an algorithm, confirm it still sorts/searches correctly across sizes and
  both orders (the algorithms are framework-free generators, easy to drive from a small
  Node script).
- Try the change in the browser: run it, pause/step, resize, and check light and dark
  themes.

## Project conventions

- **Keep it dependency-free.** No frameworks, no build tooling, no runtime libraries.
- **Keep the Content Security Policy strict.** No inline `<script>`, no inline event
  handlers, no inline `style` attributes. Use external files and classes.
- **Accessibility matters.** Maintain WCAG AA contrast, visible focus states, keyboard
  operability, and `prefers-reduced-motion` support.
- **No em dashes in UI copy or docs.** Use commas, colons, or parentheses.
- New algorithms are generators in `docs/js/algorithms.js` that `yield` a step descriptor
  (`{ highlights: { index: state } }`) and increment the shared `stats` counters. Add a
  matching entry (summary, complexity, properties, pseudocode) in
  `docs/js/descriptions.js`.

## Repository layout

- `docs/` is the published web app (GitHub Pages serves from this folder).
- `algo-vis.py` is the original pygame desktop version, kept for reference.
- `NOT-Pushed/` is local-only working material (notes, drafts) and is git-ignored.

## Pull requests

1. Fork and branch: `git checkout -b feature/your-idea`.
2. Make the change and verify it as above.
3. Commit with a clear message and open a PR describing what and why.
