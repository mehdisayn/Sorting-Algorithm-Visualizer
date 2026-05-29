import { ALGORITHMS } from "./algorithms.js";
import { Visualizer } from "./visualizer.js";

// ---------- Elements ----------
const $ = (id) => document.getElementById(id);
const canvas = $("canvas");
const algoSelect = $("algo-select");
const orderControl = $("order-control");
const targetControl = $("target-control");
const targetInput = $("target-input");
const orderAsc = $("order-asc");
const orderDesc = $("order-desc");
const sizeSlider = $("size-slider");
const sizeValue = $("size-value");
const customInput = $("custom-input");
const randomizeBtn = $("randomize-btn");
const runBtn = $("run-btn");
const resetBtn = $("reset-btn");
const themeToggle = $("theme-toggle");
const algoName = $("algo-name");
const algoComplexity = $("algo-complexity");
const modeLabel = $("mode-label");
const statusMsg = $("status-msg");
const timeLabel = $("time-label");

// ---------- State ----------
const state = {
  arr: [],
  algoId: "bubble",
  ascending: true,
  running: false,
  raf: null,
  startTime: 0,
};

const viz = new Visualizer(canvas);

// ---------- Helpers ----------
function randomArray(n) {
  return Array.from({ length: n }, () => Math.floor(Math.random() * 96) + 5);
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

function setControlsDisabled(disabled) {
  algoSelect.disabled = disabled;
  sizeSlider.disabled = disabled;
  customInput.disabled = disabled;
  targetInput.disabled = disabled;
  randomizeBtn.disabled = disabled;
  orderAsc.disabled = disabled;
  orderDesc.disabled = disabled;
  runBtn.disabled = disabled;
}

function render(highlights = {}) {
  viz.render(state.arr, highlights);
}

// ---------- Array generation / input ----------
function regenerate(n = Number(sizeSlider.value)) {
  stop();
  state.arr = randomArray(n);
  timeLabel.textContent = "";
  setStatus("Ready");
  render();
}

function applyCustomValues() {
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
  stop();
  state.arr = nums;
  sizeSlider.value = String(Math.min(150, Math.max(10, nums.length)));
  sizeValue.textContent = String(nums.length);
  timeLabel.textContent = "";
  setStatus(`Loaded ${nums.length} custom values`);
  render();
}

// ---------- Run / animation ----------
function run() {
  if (state.running || state.arr.length < 2) return;
  const algo = currentAlgo();
  let gen;

  if (algo.type === "search") {
    const target = Number(targetInput.value);
    if (targetInput.value.trim() === "" || !Number.isFinite(target)) {
      setStatus("Enter a numeric target to search.", true);
      return;
    }
    if (state.algoId === "binary") {
      state.arr.sort((a, b) => a - b);
      render();
    }
    gen = algo.fn(state.arr, target);
    setStatus(`Searching for ${target}...`);
  } else {
    gen = algo.fn(state.arr, state.ascending);
    setStatus("Running...");
  }

  state.running = true;
  state.startTime = performance.now();
  setControlsDisabled(true);
  resetBtn.disabled = false;

  const stepsPerFrame = Math.max(1, Math.ceil(state.arr.length / 40));

  const frame = () => {
    if (!state.running) return;
    let res;
    for (let s = 0; s < stepsPerFrame; s++) {
      res = gen.next();
      if (res.done) break;
    }
    if (res.done) {
      finish(res.value);
      return;
    }
    render(res.value.highlights);
    state.raf = requestAnimationFrame(frame);
  };
  state.raf = requestAnimationFrame(frame);
}

function finish(returnValue) {
  state.running = false;
  if (state.raf) cancelAnimationFrame(state.raf);
  const dur = performance.now() - state.startTime;
  const algo = currentAlgo();

  if (algo.type === "search") {
    if (returnValue >= 0) {
      render({ [returnValue]: "sorted" });
      setStatus(`Found ${targetInput.value} at index ${returnValue}`);
    } else {
      render();
      setStatus(`${targetInput.value} not found`);
    }
  } else {
    const hl = {};
    for (let i = 0; i < state.arr.length; i++) hl[i] = "sorted";
    render(hl);
    setStatus(`Sorted ${state.ascending ? "ascending" : "descending"}`);
  }

  timeLabel.textContent = `Time: ${fmtTime(dur)}`;
  setControlsDisabled(false);
}

function stop() {
  state.running = false;
  if (state.raf) cancelAnimationFrame(state.raf);
  setControlsDisabled(false);
}

// ---------- Events ----------
algoSelect.addEventListener("change", () => {
  if (state.running) return;
  state.algoId = algoSelect.value;
  syncAlgoMeta();
  render();
});

orderAsc.addEventListener("click", () => setOrder(true));
orderDesc.addEventListener("click", () => setOrder(false));
function setOrder(asc) {
  if (state.running) return;
  state.ascending = asc;
  orderAsc.classList.toggle("active", asc);
  orderDesc.classList.toggle("active", !asc);
  orderAsc.setAttribute("aria-pressed", String(asc));
  orderDesc.setAttribute("aria-pressed", String(!asc));
}

sizeSlider.addEventListener("input", () => {
  if (state.running) return;
  sizeValue.textContent = sizeSlider.value;
  regenerate(Number(sizeSlider.value));
});

customInput.addEventListener("change", applyCustomValues);
customInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") applyCustomValues();
});

randomizeBtn.addEventListener("click", () => regenerate(Number(sizeSlider.value)));
runBtn.addEventListener("click", run);
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
