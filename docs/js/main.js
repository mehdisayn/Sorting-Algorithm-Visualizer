import { ALGORITHMS } from "./algorithms.js";
import { Visualizer } from "./visualizer.js";

// ---------- Elements ----------
const $ = (id) => document.getElementById(id);
const canvas = $("canvas");
const algoSelect = $("algo-select");
const distSelect = $("dist-select");
const orderControl = $("order-control");
const targetControl = $("target-control");
const targetInput = $("target-input");
const orderAsc = $("order-asc");
const orderDesc = $("order-desc");
const sizeSlider = $("size-slider");
const sizeValue = $("size-value");
const customInput = $("custom-input");
const randomizeBtn = $("randomize-btn");
const stepBtn = $("step-btn");
const pauseBtn = $("pause-btn");
const runBtn = $("run-btn");
const resetBtn = $("reset-btn");
const themeToggle = $("theme-toggle");
const algoName = $("algo-name");
const algoComplexity = $("algo-complexity");
const modeLabel = $("mode-label");
const statusMsg = $("status-msg");
const counts = $("counts");
const timeLabel = $("time-label");

// ---------- State ----------
const state = {
  arr: [],
  algoId: "bubble",
  ascending: true,
  gen: null,
  running: false,
  paused: false,
  finished: false,
  raf: null,
  stepsPerFrame: 1,
  stats: { comparisons: 0, writes: 0 },
  searchTarget: null,
  // timing across running segments only (excludes pauses / manual stepping)
  elapsed: 0,
  segStart: 0,
  timing: false,
};

const viz = new Visualizer(canvas);

const isActive = () => state.gen && !state.finished;

// ---------- Helpers ----------
function randomArray(n, dist) {
  const rnd = () => Math.floor(Math.random() * 96) + 5;
  let a;
  switch (dist) {
    case "reversed":
      a = Array.from({ length: n }, (_, i) => Math.round(5 + (95 * (n - 1 - i)) / Math.max(1, n - 1)));
      break;
    case "nearly":
      a = Array.from({ length: n }, (_, i) => Math.round(5 + (95 * i) / Math.max(1, n - 1)));
      for (let k = 0; k < Math.max(1, Math.floor(n * 0.05)); k++) {
        const i = Math.floor(Math.random() * n);
        const j = Math.floor(Math.random() * n);
        [a[i], a[j]] = [a[j], a[i]];
      }
      break;
    case "few": {
      const pool = [15, 35, 55, 75, 95];
      a = Array.from({ length: n }, () => pool[Math.floor(Math.random() * pool.length)]);
      break;
    }
    default:
      a = Array.from({ length: n }, rnd);
  }
  return a;
}

function setStatus(msg, isError = false) {
  statusMsg.textContent = msg;
  statusMsg.classList.toggle("error", isError);
}

function fmtTime(ms) {
  if (ms < 1) return `${(ms * 1000).toFixed(0)} µs`;
  if (ms < 1000) return `${ms.toFixed(1)} ms`;
  return `${(ms / 1000).toFixed(2)} s`;
}

function updateCounts() {
  counts.textContent = `cmp ${state.stats.comparisons} · wr ${state.stats.writes}`;
}

function currentAlgo() {
  return ALGORITHMS[state.algoId];
}

function syncAlgoMeta() {
  const algo = currentAlgo();
  algoName.textContent = algo.name;
  algoComplexity.textContent = algo.complexity;
  const isSearch = algo.type === "search";
  modeLabel.textContent = isSearch ? "Mode: Search" : "Mode: Sort";
  orderControl.hidden = isSearch;
  targetControl.hidden = !isSearch;
}

function updateButtons() {
  const active = isActive();
  // config controls locked whenever a run is in progress (running or paused)
  algoSelect.disabled = active;
  distSelect.disabled = active;
  sizeSlider.disabled = active;
  customInput.disabled = active;
  targetInput.disabled = active;
  randomizeBtn.disabled = active;
  orderAsc.disabled = active;
  orderDesc.disabled = active;

  runBtn.disabled = active;                       // Run only starts a fresh run
  pauseBtn.disabled = !active;                    // Pause/Resume only while active
  pauseBtn.textContent = state.paused ? "Resume" : "Pause";
  stepBtn.disabled = state.running && !state.paused; // Step when idle or paused, not while looping
}

function render(highlights = {}) {
  viz.render(state.arr, highlights);
}

// ---------- Array generation / input ----------
function regenerate(n = Number(sizeSlider.value)) {
  cancelLoop();
  state.gen = null;
  state.running = false;
  state.paused = false;
  state.finished = false;
  state.elapsed = 0;
  state.timing = false;
  state.stats = { comparisons: 0, writes: 0 };
  state.arr = randomArray(n, distSelect.value);
  timeLabel.textContent = "";
  updateCounts();
  setStatus("Ready");
  updateButtons();
  render();
}

function applyCustomValues() {
  if (isActive()) return;
  const raw = customInput.value.trim();
  if (!raw) return;
  const parts = raw.split(",").map((p) => p.trim()).filter((p) => p.length);
  const nums = parts.map(Number);
  if (nums.some((x) => !Number.isFinite(x) || !Number.isInteger(x) || x < 0)) {
    setStatus("Custom values must be non-negative integers, comma-separated.", true);
    return;
  }
  if (nums.length < 2) {
    setStatus("Enter at least 2 values.", true);
    return;
  }
  cancelLoop();
  state.gen = null;
  state.finished = false;
  state.elapsed = 0;
  state.stats = { comparisons: 0, writes: 0 };
  state.arr = nums;
  sizeSlider.value = String(Math.min(150, Math.max(10, nums.length)));
  sizeValue.textContent = String(nums.length);
  timeLabel.textContent = "";
  updateCounts();
  setStatus(`Loaded ${nums.length} custom values`);
  updateButtons();
  render();
}

// ---------- Generator lifecycle ----------
function buildGenerator() {
  const algo = currentAlgo();
  if (state.arr.length < 2) {
    setStatus("Need at least 2 elements.", true);
    return false;
  }
  if (algo.type === "search") {
    const target = Number(targetInput.value);
    if (targetInput.value.trim() === "" || !Number.isFinite(target)) {
      setStatus("Enter a numeric target to search.", true);
      return false;
    }
    if (state.algoId === "binary") {
      state.arr.sort((a, b) => a - b);
      render();
    }
    state.searchTarget = target;
    state.stats = { comparisons: 0, writes: 0 };
    state.gen = algo.fn(state.arr, target, state.stats);
    setStatus(`Searching for ${target}...`);
  } else {
    state.stats = { comparisons: 0, writes: 0 };
    state.gen = algo.fn(state.arr, state.ascending, state.stats);
    setStatus("Running...");
  }
  state.finished = false;
  state.elapsed = 0;
  state.stepsPerFrame = Math.max(1, Math.ceil(state.arr.length / 40));
  updateCounts();
  return true;
}

function startLoop() {
  state.running = true;
  state.paused = false;
  state.segStart = performance.now();
  state.timing = true;
  updateButtons();
  const frame = () => {
    if (!state.running || state.paused) return;
    let res;
    for (let s = 0; s < state.stepsPerFrame; s++) {
      res = state.gen.next();
      if (res.done) break;
    }
    updateCounts();
    if (res.done) { finish(res.value); return; }
    render(res.value.highlights);
    state.raf = requestAnimationFrame(frame);
  };
  state.raf = requestAnimationFrame(frame);
}

function cancelLoop() {
  if (state.raf) cancelAnimationFrame(state.raf);
  state.raf = null;
}

function accumulateTime() {
  if (state.timing) {
    state.elapsed += performance.now() - state.segStart;
    state.timing = false;
  }
}

function run() {
  if (isActive()) return;        // a run is already in progress
  if (!buildGenerator()) return;
  startLoop();
}

function pauseToggle() {
  if (!isActive()) return;
  if (!state.paused) {
    state.paused = true;
    state.running = false;
    cancelLoop();
    accumulateTime();
    setStatus("Paused");
  } else {
    setStatus(currentAlgo().type === "search" ? "Searching..." : "Running...");
    startLoop();
  }
  updateButtons();
}

function stepOnce() {
  if (state.finished) return;
  if (state.running && !state.paused) return;
  if (!state.gen) {
    if (!buildGenerator()) return;
    state.paused = true;
    state.running = false;
    setStatus("Paused");
  }
  const res = state.gen.next();
  updateCounts();
  if (res.done) { finish(res.value); return; }
  render(res.value.highlights);
  updateButtons();
}

function finish(returnValue) {
  accumulateTime();
  cancelLoop();
  state.running = false;
  state.paused = false;
  state.finished = true;
  const algo = currentAlgo();

  if (algo.type === "search") {
    if (returnValue >= 0) {
      render({ [returnValue]: "sorted" });
      setStatus(`Found ${state.searchTarget} at index ${returnValue}`);
    } else {
      render();
      setStatus(`${state.searchTarget} not found`);
    }
  } else {
    const hl = {};
    for (let i = 0; i < state.arr.length; i++) hl[i] = "sorted";
    render(hl);
    setStatus(`Sorted ${state.ascending ? "ascending" : "descending"}`);
  }

  timeLabel.textContent = `time ${fmtTime(state.elapsed)}`;
  state.gen = null;
  updateButtons();
}

// ---------- Events ----------
algoSelect.addEventListener("change", () => {
  if (isActive()) return;
  state.algoId = algoSelect.value;
  syncAlgoMeta();
  regenerate(Number(sizeSlider.value));
});

distSelect.addEventListener("change", () => {
  if (isActive()) return;
  regenerate(Number(sizeSlider.value));
});

orderAsc.addEventListener("click", () => setOrder(true));
orderDesc.addEventListener("click", () => setOrder(false));
function setOrder(asc) {
  if (isActive()) return;
  state.ascending = asc;
  orderAsc.classList.toggle("active", asc);
  orderDesc.classList.toggle("active", !asc);
  orderAsc.setAttribute("aria-pressed", String(asc));
  orderDesc.setAttribute("aria-pressed", String(!asc));
}

sizeSlider.addEventListener("input", () => {
  if (isActive()) return;
  sizeValue.textContent = sizeSlider.value;
  regenerate(Number(sizeSlider.value));
});

customInput.addEventListener("change", applyCustomValues);
customInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") applyCustomValues();
});

randomizeBtn.addEventListener("click", () => regenerate(Number(sizeSlider.value)));
runBtn.addEventListener("click", run);
pauseBtn.addEventListener("click", pauseToggle);
stepBtn.addEventListener("click", stepOnce);
resetBtn.addEventListener("click", () => regenerate(Number(sizeSlider.value)));

themeToggle.addEventListener("click", () => {
  const root = document.documentElement;
  root.dataset.theme = root.dataset.theme === "dark" ? "light" : "dark";
  viz.refreshColors();
  render();
});

let resizeRaf = null;
window.addEventListener("resize", () => {
  if (resizeRaf) cancelAnimationFrame(resizeRaf);
  resizeRaf = requestAnimationFrame(() => {
    viz.resize();
    render();
  });
});

// ---------- Init ----------
syncAlgoMeta();
regenerate(Number(sizeSlider.value));
