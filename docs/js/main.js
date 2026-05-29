import { ALGORITHMS } from "./algorithms.js";
import { Visualizer } from "./visualizer.js";
import { DESCRIPTIONS, LEGEND } from "./descriptions.js";

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
const customBtn = $("custom-btn");
const customModal = $("custom-modal");
const customBackdrop = $("custom-backdrop");
const customCancel = $("custom-cancel");
const customApply = $("custom-apply");
const uploadBtn = $("upload-btn");
const fileInput = $("file-input");
const fileChip = $("file-chip");
const fileChipName = $("file-chip-name");
const fileRemove = $("file-remove");
const dropOverlay = $("drop-overlay");
const randomizeBtn = $("randomize-btn");
const stepBtn = $("step-btn");
const pauseBtn = $("pause-btn");
const runBtn = $("run-btn");
const resetBtn = $("reset-btn");
const onboard = $("onboard");
const onboardStart = $("onboard-start");
const themeToggle = $("theme-toggle");
const algoName = $("algo-name");
const algoComplexity = $("algo-complexity");
const infoBtn = $("info-btn");
const exportBtn = $("export-btn");
const exportMenu = $("export-menu");
const drawer = $("drawer");
const drawerBackdrop = $("drawer-backdrop");
const drawerClose = $("drawer-close");
const drawerTitle = $("drawer-title");
const drawerBody = $("drawer-body");
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
  dataSource: "random",
  inputSnapshot: [],
  lastRun: null,
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
  customBtn.disabled = active;
  uploadBtn.disabled = active;
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

// ---------- Info drawer ----------
function yesNo(v) {
  if (v === null || v === undefined) return "n/a";
  return v ? "Yes" : "No";
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function buildDrawerBody(d) {
  const legendRows = LEGEND.map(
    (l) =>
      `<div class="legend-item"><span class="legend-swatch s-${l.state}"></span>${l.label}</div>`
  ).join("");

  return `
    <p class="summary">${d.summary}</p>
    <h3>How it works</h3>
    <p>${d.how}</p>
    <h3>Complexity</h3>
    <table class="cx-table">
      <tr><td>Time (best)</td><td>${d.time.best}</td></tr>
      <tr><td>Time (average)</td><td>${d.time.average}</td></tr>
      <tr><td>Time (worst)</td><td>${d.time.worst}</td></tr>
      <tr><td>Space</td><td>${d.space}</td></tr>
    </table>
    <h3>Properties</h3>
    <div class="props">
      <span class="prop">${d.kind}</span>
      <span class="prop">Stable: ${yesNo(d.stable)}</span>
      <span class="prop">In-place: ${yesNo(d.inPlace)}</span>
    </div>
    <h3>When to use</h3>
    <p>${d.use}</p>
    <h3>Pseudocode</h3>
    <pre class="pseudo">${escapeHtml(d.pseudo)}</pre>
    <h3>Color legend</h3>
    <div class="legend">${legendRows}</div>
  `;
}

function refreshDrawerContent() {
  const algo = currentAlgo();
  const d = DESCRIPTIONS[state.algoId];
  drawerTitle.textContent = algo.name;
  drawerBody.innerHTML = buildDrawerBody(d);
}

function openDrawer() {
  refreshDrawerContent();
  drawerBackdrop.hidden = false;
  requestAnimationFrame(() => drawerBackdrop.classList.add("show"));
  drawer.classList.add("open");
  drawer.setAttribute("aria-hidden", "false");
  drawerClose.focus();
}

function closeDrawer() {
  drawer.classList.remove("open");
  drawer.setAttribute("aria-hidden", "true");
  drawerBackdrop.classList.remove("show");
  setTimeout(() => { drawerBackdrop.hidden = true; }, 220);
  infoBtn.focus();
}

function isDrawerOpen() {
  return drawer.classList.contains("open");
}

// ---------- Export / download ----------
function updateExport() {
  exportBtn.disabled = !state.lastRun;
  if (!state.lastRun) closeExportMenu();
}

function downloadBlob(filename, blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

function runSlug() {
  const r = state.lastRun;
  const ts = r.finishedAt.toISOString().slice(0, 19).replace(/[:T]/g, "-");
  return `sorting-${r.algoId}-n${r.size}-${ts}`;
}

function buildReport() {
  const r = state.lastRun;
  const lines = [];
  lines.push("Sorting Algorithm Visualizer - Run Report");
  lines.push("https://mehdisayn.github.io/Sorting-Algorithm-Visualizer/");
  lines.push(`Generated: ${r.finishedAt.toString()}`);
  lines.push("");
  lines.push(`Algorithm   : ${r.algorithm}`);
  lines.push(`Category    : ${r.type === "sort" ? "Sort" : "Search"}`);
  if (r.type === "sort") lines.push(`Order       : ${r.order}`);
  if (r.type === "search") {
    lines.push(`Target      : ${r.target}`);
    lines.push(`Result      : ${r.result >= 0 ? `found at index ${r.result}` : "not found"}`);
  }
  lines.push(`Data source : ${r.dataSource}`);
  lines.push(`Input size  : ${r.size}`);
  lines.push(`Complexity  : ${r.complexity} (headline)`);
  lines.push("");
  lines.push("Results");
  lines.push("-------");
  lines.push(`Comparisons : ${r.comparisons}`);
  lines.push(`Writes/swaps: ${r.writes}`);
  lines.push(`Time        : ${fmtTime(r.timeMs)}`);
  lines.push("");
  lines.push("Input array");
  lines.push("-----------");
  lines.push(`[${r.input.join(", ")}]`);
  lines.push("");
  lines.push(r.type === "search" ? "Array (search order)" : "Output array");
  lines.push("------------");
  lines.push(`[${r.output.join(", ")}]`);
  lines.push("");
  lines.push("Web app by Syed Mehedi Hussain. Original by Ridwan Hasan Khandakar.");
  return lines.join("\n");
}

function exportTXT() {
  const blob = new Blob([buildReport()], { type: "text/plain;charset=utf-8" });
  downloadBlob(`${runSlug()}.txt`, blob);
}

function exportPNG() {
  const r = state.lastRun;
  const dpr = window.devicePixelRatio || 1;
  const headH = 56;
  const w = viz.cssWidth;
  const h = viz.cssHeight;
  const off = document.createElement("canvas");
  off.width = Math.round(w * dpr);
  off.height = Math.round((h + headH) * dpr);
  const c = off.getContext("2d");
  c.setTransform(dpr, 0, 0, dpr, 0, 0);

  const cs = getComputedStyle(document.documentElement);
  const v = (name, fallback) => (cs.getPropertyValue(name).trim() || fallback);

  c.fillStyle = v("--panel", "#0e0f13");
  c.fillRect(0, 0, w, h + headH);

  c.textAlign = "left";
  c.fillStyle = v("--text", "#fff");
  c.font = `600 17px ${v("--font-ui", "sans-serif")}`;
  c.fillText(r.algorithm, 16, 26);

  c.fillStyle = v("--text-muted", "#888");
  c.font = `12px ${v("--font-mono", "monospace")}`;
  const meta =
    r.type === "sort"
      ? `${r.order} · n=${r.size} · ${r.dataSource} · cmp ${r.comparisons} · wr ${r.writes} · ${fmtTime(r.timeMs)}`
      : `target ${r.target} · ${r.result >= 0 ? "index " + r.result : "not found"} · cmp ${r.comparisons}`;
  c.fillText(meta, 16, 45);

  c.drawImage(canvas, 0, headH, w, h);

  off.toBlob((blob) => { if (blob) downloadBlob(`${runSlug()}.png`, blob); }, "image/png");
}

function toggleExportMenu() {
  if (exportBtn.disabled) return;
  exportMenu.hidden ? openExportMenu() : closeExportMenu();
}
function openExportMenu() { exportMenu.hidden = false; }
function closeExportMenu() { exportMenu.hidden = true; }

// ---------- Array generation / input ----------
function regenerate(n = Number(sizeSlider.value)) {
  clearFileChip();
  cancelLoop();
  state.gen = null;
  state.running = false;
  state.paused = false;
  state.finished = false;
  state.elapsed = 0;
  state.timing = false;
  state.stats = { comparisons: 0, writes: 0 };
  state.arr = randomArray(n, distSelect.value);
  state.dataSource = distSelect.options[distSelect.selectedIndex].text;
  state.lastRun = null;
  timeLabel.textContent = "";
  updateCounts();
  setStatus("Ready");
  updateButtons();
  updateExport();
  render();
}

function applyCustomValues() {
  if (isActive()) return false;
  const raw = customInput.value.trim();
  if (!raw) return false;
  const parts = raw.split(",").map((p) => p.trim()).filter((p) => p.length);
  const nums = parts.map(Number);
  if (nums.some((x) => !Number.isFinite(x) || !Number.isInteger(x) || x < 0)) {
    setStatus("Custom values must be non-negative integers, comma-separated.", true);
    return false;
  }
  if (nums.length < 2) {
    setStatus("Enter at least 2 values.", true);
    return false;
  }
  clearFileChip();
  cancelLoop();
  state.gen = null;
  state.finished = false;
  state.elapsed = 0;
  state.stats = { comparisons: 0, writes: 0 };
  state.arr = nums;
  state.dataSource = "Custom";
  state.lastRun = null;
  sizeSlider.value = String(Math.min(150, Math.max(10, nums.length)));
  sizeValue.textContent = String(nums.length);
  timeLabel.textContent = "";
  updateCounts();
  setStatus(`Loaded ${nums.length} custom values`);
  updateButtons();
  updateExport();
  render();
  return true;
}

// ---------- File loading (upload + drag-and-drop) ----------
function showFileChip(name) {
  fileChipName.textContent = name;
  fileChipName.title = name;
  fileChip.hidden = false;
  uploadBtn.hidden = true;
}

function clearFileChip() {
  fileChip.hidden = true;
  uploadBtn.hidden = false;
}

function loadFile(file) {
  if (!file || isActive()) return;
  const reader = new FileReader();
  reader.onload = () => {
    // Accept .txt / .csv / .json: pull every number token from the text.
    const tokens = String(reader.result).match(/-?\d+(?:\.\d+)?/g);
    if (!tokens || tokens.length < 2) {
      setStatus("No usable numbers found in that file (need at least 2).", true);
      return;
    }
    customInput.value = tokens.join(", ");
    if (applyCustomValues()) {
      state.dataSource = `File: ${file.name}`;
      showFileChip(file.name);
    }
  };
  reader.onerror = () => setStatus("Could not read that file.", true);
  reader.readAsText(file);
}

// ---------- Generator lifecycle ----------
function buildGenerator() {
  const algo = currentAlgo();
  if (state.arr.length < 2) {
    setStatus("Need at least 2 elements.", true);
    return false;
  }
  state.inputSnapshot = state.arr.slice();
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

  state.lastRun = {
    algoId: state.algoId,
    algorithm: algo.name,
    type: algo.type,
    complexity: algo.complexity,
    order: algo.type === "sort" ? (state.ascending ? "Ascending" : "Descending") : null,
    target: algo.type === "search" ? state.searchTarget : null,
    result: algo.type === "search" ? returnValue : null,
    dataSource: state.dataSource,
    size: state.arr.length,
    input: state.inputSnapshot.slice(),
    output: state.arr.slice(),
    comparisons: state.stats.comparisons,
    writes: state.stats.writes,
    timeMs: state.elapsed,
    finishedAt: new Date(),
  };

  state.gen = null;
  updateButtons();
  updateExport();
}

// ---------- Events ----------
algoSelect.addEventListener("change", () => {
  if (isActive()) return;
  state.algoId = algoSelect.value;
  syncAlgoMeta();
  if (isDrawerOpen()) refreshDrawerContent();
  regenerate(Number(sizeSlider.value));
});

infoBtn.addEventListener("click", openDrawer);
algoName.addEventListener("click", openDrawer);
drawerClose.addEventListener("click", closeDrawer);
drawerBackdrop.addEventListener("click", closeDrawer);
window.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  if (!onboard.hidden) dismissOnboard();
  if (isDrawerOpen()) closeDrawer();
  if (!exportMenu.hidden) closeExportMenu();
  if (isCustomOpen()) closeCustomModal();
});

// ---------- Onboarding (first visit) ----------
const ONBOARD_KEY = "sav-onboarded-v1";
function dismissOnboard() {
  onboard.hidden = true;
  try { localStorage.setItem(ONBOARD_KEY, "1"); } catch (e) { /* storage unavailable */ }
}
onboardStart.addEventListener("click", dismissOnboard);
onboard.addEventListener("click", (e) => { if (e.target === onboard) dismissOnboard(); });

function maybeShowOnboarding() {
  let seen = false;
  try { seen = localStorage.getItem(ONBOARD_KEY) === "1"; } catch (e) { seen = false; }
  if (!seen) {
    onboard.hidden = false;
    onboardStart.focus();
  }
}

exportBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  toggleExportMenu();
});
exportMenu.addEventListener("click", (e) => {
  const fmt = e.target.dataset.fmt;
  if (!fmt) return;
  if (fmt === "txt") exportTXT();
  else if (fmt === "png") exportPNG();
  closeExportMenu();
});
document.addEventListener("click", (e) => {
  if (!exportMenu.hidden && !e.target.closest(".export")) closeExportMenu();
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

// Custom values modal
function openCustomModal() {
  if (isActive()) return;
  customBackdrop.hidden = false;
  customModal.hidden = false;
  customInput.focus();
  customInput.select();
}
function closeCustomModal() {
  customModal.hidden = true;
  customBackdrop.hidden = true;
  customBtn.focus();
}
function isCustomOpen() {
  return !customModal.hidden;
}

customBtn.addEventListener("click", openCustomModal);
customCancel.addEventListener("click", closeCustomModal);
customBackdrop.addEventListener("click", closeCustomModal);
customApply.addEventListener("click", () => { if (applyCustomValues()) closeCustomModal(); });

customInput.addEventListener("keydown", (e) => {
  if (e.key === " ") {
    // auto-separate numbers with a comma instead of a space
    e.preventDefault();
    const s = customInput.selectionStart;
    const en = customInput.selectionEnd;
    const before = customInput.value.slice(0, s);
    const after = customInput.value.slice(en);
    if (before === "" || /[,\s]$/.test(before)) return; // no leading or doubled separators
    const ins = ", ";
    customInput.value = before + ins + after;
    const pos = s + ins.length;
    customInput.setSelectionRange(pos, pos);
  } else if (e.key === "Enter") {
    e.preventDefault();
    if (applyCustomValues()) closeCustomModal();
  }
});

uploadBtn.addEventListener("click", () => {
  if (isActive()) return;
  fileInput.click();
});
fileInput.addEventListener("change", () => {
  const file = fileInput.files && fileInput.files[0];
  loadFile(file);
  fileInput.value = ""; // allow re-uploading the same file
});
fileRemove.addEventListener("click", () => {
  if (isActive()) return;
  clearFileChip();
  regenerate(Number(sizeSlider.value));
});

// Drag-and-drop anywhere on the window
function dragHasFiles(e) {
  return e.dataTransfer && Array.from(e.dataTransfer.types || []).includes("Files");
}
let dragDepth = 0;
window.addEventListener("dragenter", (e) => {
  if (!dragHasFiles(e) || isActive()) return;
  e.preventDefault();
  dragDepth++;
  dropOverlay.hidden = false;
});
window.addEventListener("dragover", (e) => {
  if (!dragHasFiles(e) || isActive()) return;
  e.preventDefault();
});
window.addEventListener("dragleave", (e) => {
  if (!dragHasFiles(e)) return;
  dragDepth = Math.max(0, dragDepth - 1);
  if (dragDepth === 0) dropOverlay.hidden = true;
});
window.addEventListener("drop", (e) => {
  if (!dragHasFiles(e)) return;
  e.preventDefault();
  dragDepth = 0;
  dropOverlay.hidden = true;
  if (isActive()) return;
  const file = e.dataTransfer.files && e.dataTransfer.files[0];
  loadFile(file);
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
maybeShowOnboarding();
