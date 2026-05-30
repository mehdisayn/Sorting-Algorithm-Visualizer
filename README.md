<div align="center">

# Sorting Algorithm Visualizer

Watch sorting and searching algorithms run step by step as animated bars, with live
operation counts, pseudocode, and sound.

[**Live demo**](https://mehdisayn.github.io/Sorting-Algorithm-Visualizer/) ·
[Report a bug](https://github.com/mehdisayn/Sorting-Algorithm-Visualizer/issues) ·
[Request a feature](https://github.com/mehdisayn/Sorting-Algorithm-Visualizer/issues)

![Built with HTML, CSS and JavaScript](https://img.shields.io/badge/built%20with-HTML%20|%20CSS%20|%20JS-f7df1e)
![Zero dependencies](https://img.shields.io/badge/dependencies-0-2ea44f)
![No build step](https://img.shields.io/badge/build-none-blue)
![PRs welcome](https://img.shields.io/badge/PRs-welcome-orange)

</div>

## Contents

- [About](#about)
- [Features](#features)
- [Algorithms](#algorithms)
- [Getting started](#getting-started)
- [Usage](#usage)
- [Keyboard shortcuts](#keyboard-shortcuts)
- [Deployment](#deployment)
- [Project structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)
- [Credits](#credits)

## About

An interactive, browser-based visualizer for classic sorting and searching algorithms.
It is a learning tool: you can watch each comparison and swap, read how every algorithm
works, step through the logic one operation at a time, and even hear the array sort
itself.

Built with vanilla HTML, CSS, and JavaScript. No framework, no build step, no
dependencies. Each algorithm is a JavaScript generator that yields one step at a time,
and a `<canvas>` renderer animates the array independently of the algorithm logic, so
the two concerns stay cleanly separated.

## Features

- **12 algorithms.** 10 sorts (Bubble, Insertion, Selection, Merge, Quick, Heap, Bucket,
  Radix, Tim, Intro) and 2 searches (Linear, Binary).
- **Ascending or descending** order for every sort.
- **Shape the input.** Size slider (10-150), data distributions (random, nearly sorted,
  reversed, few-unique), your own custom values, or upload / drag-and-drop a
  `.txt`, `.csv`, or `.json` file of numbers.
- **Playback control.** Run, pause, resume, and single-step through any run.
- **Live metrics.** Comparison and write counters, elapsed time, and time complexity.
- **Learn as you go.** A details panel explains how the selected algorithm works, with
  best/average/worst complexity, properties (stable, in-place), and pseudocode.
- **Sound.** Optional sonification: each step plays a tone pitched to its value.
- **Fullscreen + pan.** Click the chart to expand it and pan across large arrays.
- **Export.** Download a human-readable run report (`.txt`) or a labeled chart image
  (`.png`).
- **Polished UX.** Light/dark theme, keyboard shortcuts, first-run onboarding, WCAG AA
  contrast, reduced-motion support, and a strict Content Security Policy.

## Algorithms

| Algorithm | Type | Time (avg) | Stable | In-place |
|-----------|------|-----------|:------:|:--------:|
| Bubble | Sort | O(n²) | Yes | Yes |
| Insertion | Sort | O(n²) | Yes | Yes |
| Selection | Sort | O(n²) | No | Yes |
| Merge | Sort | O(n log n) | Yes | No |
| Quick | Sort | O(n log n) | No | Yes |
| Heap | Sort | O(n log n) | No | Yes |
| Bucket | Sort | O(n + k) | Yes | No |
| Radix | Sort | O(n · d) | Yes | No |
| Tim | Sort | O(n log n) | Yes | No |
| Intro | Sort | O(n log n) | No | Yes |
| Linear | Search | O(n) | - | - |
| Binary | Search | O(log n) | - | - |

> Tim and Intro ship as simplified merge-based and quick-based versions, as noted in the
> in-app descriptions.

## Getting started

No build or install is required. Because the app uses ES modules, it must be served over
HTTP (opening `index.html` directly with `file://` will not work).

```bash
git clone https://github.com/mehdisayn/Sorting-Algorithm-Visualizer.git
cd Sorting-Algorithm-Visualizer/docs
python3 -m http.server 8000
# open http://localhost:8000
```

Any static server works (`npx serve`, the VS Code Live Server extension, etc.).

## Usage

| Control | Action |
|---------|--------|
| Algorithm | Pick a sort or search |
| Order | Ascending / descending (sorts only) |
| Target | Value to find (search only) |
| Data | Distribution of the generated array |
| Size | Number of elements (10-150) |
| Custom values | Enter your own numbers (Space auto-inserts commas) |
| Upload | Load numbers from a `.txt`, `.csv`, or `.json` file (or drag-and-drop) |
| Randomize | Generate a new random array |
| Run / Pause / Step | Start, pause/resume, or advance one operation |
| Reset | New array, clear the run |

## Keyboard shortcuts

| Key | Action |
|-----|--------|
| `Space` | Run / Pause |
| `S` | Step one operation |
| `R` | Reset (new array) |
| `A` / `D` | Sort ascending / descending |
| `T` | Toggle light / dark theme |
| `M` | Mute / unmute sound |
| `?` | Open help |
| `Esc` | Close dialogs / exit fullscreen |
| Click chart | Expand to fullscreen (drag or `←` / `→` to pan) |

## Deployment

The site is served from the `docs/` folder on the `main` branch via GitHub Pages:

1. Push to `main`.
2. Go to **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to **Deploy from a branch**.
4. Choose branch **`main`** and folder **`/docs`**, then **Save**.

It publishes at `https://<user>.github.io/Sorting-Algorithm-Visualizer/`.

## Project structure

```
.
├── docs/                   # the web app (GitHub Pages root)
│   ├── index.html          # markup + Content Security Policy
│   ├── styles.css          # design tokens, theme, layout
│   └── js/
│       ├── algorithms.js   # the 12 algorithms as step-yielding generators
│       ├── visualizer.js   # canvas renderer (zoom / pan)
│       ├── descriptions.js # per-algorithm reference + pseudocode
│       ├── sound.js        # Web Audio sonification
│       └── main.js         # state machine, controls, wiring
├── algo-vis.py             # original pygame desktop version (reference)
└── README.md
```

## Contributing

Contributions are welcome. For a small fix, open a pull request; for anything larger,
open an issue first to discuss the approach. There is no build step: serve `docs/` and
refresh. See [CONTRIBUTING.md](CONTRIBUTING.md) for the full guide and project
conventions (dependency-free, strict CSP, accessibility).

## License

Released under the [MIT License](LICENSE).

## Credits

- [Ridwan Hasan Khandakar](https://ridwanhasankhandakar.github.io/rrhin/): original
  algorithm visualizer (`algo-vis.py`, the pygame desktop version).
- [Syed Mehedi Hussain](https://syedmehedihussain.codes): web app (`docs/`).
