// Canvas renderer: draws the array as bars, coloring each bar by the current step's
// highlight state. Decoupled from algorithm logic.

export class Visualizer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.cssWidth = 0;
    this.cssHeight = 0;
    this.zoom = 1;   // 1 = fit-to-width; >1 = expanded/zoomed
    this.panX = 0;   // horizontal scroll offset in CSS px
    this.refreshColors();
    this.resize();
  }

  maxPan() {
    return Math.max(0, this.cssWidth * this.zoom - this.cssWidth);
  }

  setPan(x) {
    this.panX = Math.min(Math.max(x, 0), this.maxPan());
  }

  refreshColors() {
    const s = getComputedStyle(document.documentElement);
    const pick = (name) => s.getPropertyValue(name).trim();
    this.colors = {
      idle: pick("--bar-idle"),
      compare: pick("--bar-compare"),
      swap: pick("--bar-swap"),
      sorted: pick("--bar-sorted"),
      target: pick("--bar-target"),
    };
    this.textColor = pick("--text-muted");
    this.gridColor = pick("--hair");
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.cssWidth = rect.width;
    this.cssHeight = rect.height;
    this.canvas.width = Math.round(rect.width * dpr);
    this.canvas.height = Math.round(rect.height * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  render(arr, highlights = {}) {
    const { ctx } = this;
    const w = this.cssWidth;
    const h = this.cssHeight;
    ctx.clearRect(0, 0, w, h);

    const n = arr.length;
    if (n === 0) return;

    this.setPan(this.panX); // keep within bounds (e.g. after resize / new data)

    const content = w * this.zoom;
    const gap = n > 60 && this.zoom === 1 ? 0 : Math.max(1, Math.floor((content / n) * 0.18));
    const barW = (content - gap * (n - 1)) / n;
    const maxVal = Math.max(...arr, 1);

    const padTop = 12;
    const showLabels = barW >= 22;
    const labelSpace = showLabels ? 18 : 0;
    const usableH = h - padTop - labelSpace;

    // faint horizontal gridlines (instrument baseline feel)
    ctx.strokeStyle = this.gridColor || "rgba(255,255,255,0.06)";
    ctx.lineWidth = 1;
    const lines = 5;
    for (let g = 1; g <= lines; g++) {
      const gy = Math.round((g / (lines + 1)) * h) + 0.5;
      ctx.beginPath();
      ctx.moveTo(0, gy);
      ctx.lineTo(w, gy);
      ctx.stroke();
    }

    ctx.font = "11px " + getComputedStyle(document.documentElement).getPropertyValue("--font-mono");
    ctx.textAlign = "center";

    const radius = barW >= 6 ? Math.min(barW / 2, 5) : 0;
    const canRound = typeof ctx.roundRect === "function";

    for (let i = 0; i < n; i++) {
      const x = i * (barW + gap) - this.panX;
      if (x + barW < 0 || x > w) continue; // off-screen, skip
      const barH = Math.max(2, (arr[i] / maxVal) * usableH);
      const y = h - barH;
      const state = highlights[i];

      if (state) {
        ctx.fillStyle = this.colors[state];
        ctx.shadowColor = this.colors[state];
        ctx.shadowBlur = 14;
      } else {
        ctx.fillStyle = this.colors.idle;
        ctx.shadowBlur = 0;
      }

      if (radius && canRound) {
        ctx.beginPath();
        ctx.roundRect(x, y, barW, barH, [radius, radius, 0, 0]);
        ctx.fill();
      } else {
        ctx.fillRect(x, y, barW, barH);
      }
      ctx.shadowBlur = 0;

      if (showLabels) {
        ctx.fillStyle = this.textColor;
        ctx.fillText(String(arr[i]), x + barW / 2, h - barH - 5);
      }
    }
  }
}
