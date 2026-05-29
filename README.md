# Sorting Algorithm Visualizer

An interactive web visualizer for sorting and searching algorithms. Watch each
algorithm run step by step as animated bars, with live comparison/write counts.

**Live:** https://mehdisayn.github.io/Sorting-Algorithm-Visualizer/

Built with vanilla HTML, CSS, and JavaScript (no framework, no build step). Each
algorithm is a JavaScript generator that yields one step at a time; a canvas renderer
animates the array independently of the algorithm logic.

## Features

- 10 sorting algorithms: Bubble, Insertion, Selection, Merge, Quick, Heap, Bucket,
  Radix, Tim, Intro.
- 2 search algorithms: Linear and Binary (binary auto-sorts first).
- Ascending / descending order.
- Adjustable array size (10-150) and data distribution: random, nearly sorted,
  reversed, few-unique (to demo best vs worst cases).
- Custom input: type your own comma-separated values.
- Pause, resume, and single-step through any run.
- Live comparison and write counters, time, and time-complexity readout.
- Light / dark theme.

## Controls

| Control | Action |
|---------|--------|
| Algorithm | Pick a sort or search |
| Order | Ascending / descending (sorts only) |
| Target | Value to find (search only) |
| Data | Distribution of the generated array |
| Size | Number of elements |
| Custom values | Comma-separated numbers, e.g. `5, 3, 8, 1, 9` |
| Randomize | New random array |
| Run | Start a run |
| Pause / Resume | Pause or continue an active run |
| Step | Advance one operation at a time |
| Reset | New array, clear the run |

## Run locally

ES modules require an HTTP server (opening the file directly will not work):

```bash
cd docs
python3 -m http.server 8000
# then open http://localhost:8000
```

## Deploy (GitHub Pages)

The site is served from the `docs/` folder on the `main` branch:

1. Push to `main`.
2. Repo **Settings → Pages**.
3. Under **Build and deployment**, set **Source: Deploy from a branch**.
4. Choose branch **`main`** and folder **`/docs`**, then **Save**.
5. The site publishes at `https://<user>.github.io/Sorting-Algorithm-Visualizer/`.

## Credits

- [Ridwan Hasan Khandakar](https://ridwanhasankhandakar.github.io/rrhin/) — original
  algorithm visualizer (`algo-vis.py`, the pygame desktop version).
- [Syed Mehedi Hussain](https://syedmehedihussain.codes) — web app (`docs/`).

## Project layout

```
docs/
  index.html        # markup
  styles.css        # theme + layout
  js/
    algorithms.js   # the 12 algorithms as step-yielding generators
    visualizer.js   # canvas renderer
    main.js         # state machine + controls
algo-vis.py         # original pygame desktop version (reference)
```
