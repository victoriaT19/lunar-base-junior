const RMC = 10,
  RMR = 8,
  TW = 56,
  TH = 32,
  ROX = 200,
  ROY = 196,
  WALLH = 96;
const WALLI = new Set(["window", "poster", "brick", "polymer", "solar", "antenna"]);
const STATIONS = {
  bunk: { tiles: ["0,1", "0,2"], stand: [1.3, 2.0], label: "BUNK" },
  galley: { tiles: ["5,0", "6,0"], stand: [6.0, 1.3], label: "GALLEY" },
  console: { tiles: ["7,0", "8,0"], stand: [8.0, 1.3], label: "CONSOLE" },
};
const DOORSLOTS = ["R:2", "R:3"];
const STAND = {
  eat: [6.0, 1.3],
  sleep: [1.3, 2.0],
  missions: [8.0, 1.3],
  craft: [8.0, 1.3],
  exp: [3.0, 0.7],
};
const STANDT = ["1,2", "6,1", "8,1", "2,0", "3,0"];
const RESV2 = new Set([
  ...Object.values(STATIONS).flatMap((s) => s.tiles),
  ...DOORSLOTS,
  ...STANDT,
]);
const STATT = new Set(Object.values(STATIONS).flatMap((s) => s.tiles));
R.keys = {};
R.path = [];
const OUTC = "#1a1020";
const RB = document.createElement("canvas");
RB.width = W;
RB.height = H;
const RBX = RB.getContext("2d");
RBX.imageSmoothingEnabled = false;
let ROOMBG = null;

if (!S.roomV) {
  S.blocks = {};
  S.roomV = 1;
}
if (S.roomV < 2) {
  S.stash = S.stash || {};
  Object.keys(S.blocks).forEach((k) => {
    if (k.startsWith("L:") || DOORSLOTS.includes(k)) {
      S.stash[S.blocks[k]] = (S.stash[S.blocks[k]] || 0) + 1;
      delete S.blocks[k];
    }
  });
  S.roomV = 2;
}
if (S.roomV < 3) {
  S.stash = S.stash || {};
  Object.keys(S.blocks).forEach((k) => {
    if (DOORSLOTS.includes(k) || k === "5,0" || k === "6,0" || STANDT.includes(k)) {
      S.stash[S.blocks[k]] = (S.stash[S.blocks[k]] || 0) + 1;
      delete S.blocks[k];
    }
  });
  S.roomV = 3;
}
R.cx = 3;
R.cy = 4;
R.tcx = 3;
R.tcy = 4;

function iso(c, r) {
  return [ROX + c * TW, ROY + r * TH];
}
function astroScreen() {
  return iso(R.cx, R.cy);
}
function shade2(hex, k) {
  const n = parseInt(hex.slice(1), 16);
  const f = (v) => Math.max(0, Math.min(255, Math.round(v * k)));
  return `rgb(${f((n >> 16) & 255)},${f((n >> 8) & 255)},${f(n & 255)})`;
}
function px(x, y, w, h, col) {
  ctx.fillStyle = col;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}
function pxLine(a, b, col) {
  ctx.fillStyle = col;
  const dx = b[0] - a[0],
    dy = b[1] - a[1];
  const n = Math.max(Math.abs(dx), Math.abs(dy), 1);
  for (let i = 0; i <= n; i++)
    ctx.fillRect(Math.round(a[0] + (dx * i) / n), Math.round(a[1] + (dy * i) / n), 1, 1);
}
function poly(pts, fill, stroke) {
  if (fill) {
    ctx.fillStyle = fill;
    const ys = pts.map((p) => p[1]);
    const y0 = Math.ceil(Math.min(...ys) - 0.5),
      y1 = Math.floor(Math.max(...ys) - 0.5);
    for (let y = y0; y <= y1; y++) {
      const sy = y + 0.5;
      const xs = [];
      for (let i = 0; i < pts.length; i++) {
        const a = pts[i],
          b = pts[(i + 1) % pts.length];
        if ((a[1] <= sy && b[1] > sy) || (b[1] <= sy && a[1] > sy))
          xs.push(a[0] + ((sy - a[1]) * (b[0] - a[0])) / (b[1] - a[1]));
      }
      xs.sort((p, q) => p - q);
      for (let i = 0; i + 1 < xs.length; i += 2) {
        const x0 = Math.round(xs[i]),
          x1 = Math.round(xs[i + 1]);
        if (x1 > x0) ctx.fillRect(x0, y, x1 - x0, 1);
      }
    }
  }
  if (stroke)
    for (let i = 0; i < pts.length; i++) pxLine(pts[i], pts[(i + 1) % pts.length], stroke);
}
function pxEllipse(cx, cy, rx, ry, col) {
  ctx.fillStyle = col;
  for (let y = -ry; y <= ry; y++) {
    const w = Math.round(rx * Math.sqrt(Math.max(0, 1 - (y * y) / (ry * ry))));
    ctx.fillRect(Math.round(cx - w), Math.round(cy + y), w * 2, 1);
  }
}
function isoBox(c, r, w, d, z0, h, col) {
  const up = (p, z) => [p[0], p[1] - z];
  const a = iso(c, r),
    b = iso(c + w, r),
    e = iso(c + w, r + d),
    f = iso(c, r + d);
  const top = [up(a, z0 + h), up(b, z0 + h), up(e, z0 + h), up(f, z0 + h)];
  poly([up(f, z0), up(e, z0), up(e, z0 + h), up(f, z0 + h)], shade2(col, 0.7), OUTC);
  poly([up(e, z0), up(b, z0), up(b, z0 + h), up(e, z0 + h)], shade2(col, 0.85), OUTC);
  poly(top, col, OUTC);
  pxLine([top[0][0], top[0][1] + 1], [top[1][0] - 1, top[1][1] + 1], shade2(col, 1.15));
  return top;
}

function drawSkyBg() {
  const bands = ["#02030f", "#04061a", "#070b24", "#0a0f2e", "#0d1338"];
  const bh = 70;
  bands.forEach((c, i) => px(0, i * bh, W, bh, c));
  px(0, bands.length * bh, W, H, bands[bands.length - 1]);
  for (let i = 1; i < bands.length; i++)
    for (let x = 0; x < W; x += 2) px(x + (i % 2), i * bh - 1, 1, 1, bands[i]);
  for (let i = 0; i < 110; i++) {
    const sx = Math.floor((i * 137.5) % W),
      sy = Math.floor((i * 61.3) % 330);
    px(sx, sy, 1, 1, i % 9 === 0 ? "#9fd0ff" : "#cfd8ff");
    if (i % 13 === 0) {
      px(sx - 1, sy, 3, 1, "#ffffff");
      px(sx, sy - 1, 1, 3, "#ffffff");
    }
  }
  const ex = 852,
    ey = 214,
    er = 22;
  pxEllipse(ex, ey, er + 1, er + 1, OUTC);
  pxEllipse(ex, ey, er, er, "#2f6fe0");
  [
    [-12, -10, 9, 5],
    [4, -4, 12, 6],
    [-8, 6, 7, 4],
    [8, 10, 6, 3],
  ].forEach(([x, y, w, h]) => pxEllipse(ex + x, ey + y, w, h, "#4cd37a"));
  for (let y = -er; y <= er; y++) {
    const w = Math.round(er * Math.sqrt(Math.max(0, 1 - (y * y) / (er * er))));
    px(ex + w - 6, ey + y, 6, 1, "rgba(0,0,30,.45)");
  }
  px(ex - 12, ey - 14, 6, 2, "rgba(255,255,255,.5)");
  const hz = 286;
  for (let x = 0; x < W; x += 2) {
    const h = Math.round(
      26 + Math.sin(x / 41) * 12 + Math.sin(x / 17 + 1) * 6 + ((x * 7919) % 13) / 3,
    );
    px(x, hz - h, 2, h + 4, "#2e3250");
    px(x, hz - h, 2, 1, "#4a4f75");
  }
  for (let x = 0; x < W; x += 2) {
    const h = Math.round(12 + Math.sin(x / 63 + 2) * 8 + Math.sin(x / 23) * 3);
    px(x, hz + 14 - h, 2, h + 4, "#454a6c");
    px(x, hz + 14 - h, 2, 1, "#6a6f94");
  }
  const bandsG = ["#5c6082", "#64688a", "#6c7092", "#74789a"];
  bandsG.forEach((c, i) => px(0, hz + 16 + i * 60, W, 60, c));
  px(0, hz + 16 + bandsG.length * 60, W, H, bandsG[bandsG.length - 1]);
  for (let i = 1; i < bandsG.length; i++)
    for (let x = 0; x < W; x += 2) px(x + (i % 2), hz + 16 + i * 60 - 1, 1, 1, bandsG[i]);
  [
    [110, 350, 40, 11],
    [820, 330, 52, 14],
    [690, 500, 34, 9],
    [250, 495, 28, 8],
    [905, 470, 22, 6],
    [60, 430, 18, 5],
  ].forEach(([x, y, rx, ry]) => {
    pxEllipse(x, y - 2, rx + 3, ry + 2, "#8a8eae");
    pxEllipse(x, y, rx, ry, "#4f5372");
    pxEllipse(
      x + Math.round(rx * 0.2),
      y + 1,
      Math.round(rx * 0.7),
      Math.round(ry * 0.6),
      "#454966",
    );
  });
  for (let i = 0; i < 90; i++)
    px((i * 97) % W, hz + 22 + ((i * 53) % 230), 2, 1, i % 3 ? "#8286a6" : "#50547a");
  const rx0 = 840,
    ry0 = 392;
  px(rx0 - 20, ry0 - 12, 40, 12, OUTC);
  px(rx0 - 19, ry0 - 11, 38, 10, "#e6e9f6");
  px(rx0 + 4, ry0 - 10, 12, 5, "#3fa7ff");
  px(rx0 - 19, ry0 - 3, 38, 2, "#ff9f45");
  [-14, 10].forEach((dx) => {
    px(rx0 + dx - 1, ry0 - 1, 10, 10, OUTC);
    px(rx0 + dx, ry0, 8, 8, "#3a3f5a");
    px(rx0 + dx + 3, ry0 + 3, 2, 2, "#8f97bd");
  });
  px(rx0 - 12, ry0 - 22, 2, 10, "#8f97bd");
  px(rx0 - 15, ry0 - 24, 8, 2, "#ffd166");
}
function wallFace(side, i, fn) {
  if (side !== "R") return;
  const base = iso(i, 0);
  const Q = (x, y, w, h, col) => px(base[0] + x, base[1] + y, w, h, col);
  fn(TW, Q);
}
function drawWallItem(id, w, t, Q) {
  if (id === "window") {
    Q(3, -88, w - 6, 46, OUTC);
    Q(5, -86, w - 10, 42, "#0a0f33");
    Q(9, -80, 1, 1, "#fff");
    Q(20, -70, 1, 1, "#fff");
    Q(11, -62, 9, 9, "#2f6fe0");
    Q(13, -61, 4, 3, "#4cd37a");
    Q(5, -66, w - 10, 2, "#8f97bd");
    Q(w / 2 - 1, -86, 2, 42, "#8f97bd");
  } else if (id === "poster") {
    Q(5, -86, w - 10, 36, OUTC);
    Q(7, -84, w - 14, 32, "#f4f6ff");
    Q(9, -80, w - 18, 18, "#2f6fe0");
    Q(12, -75, 6, 5, "#4cd37a");
    Q(9, -58, w - 18, 2, "#ff9f45");
  } else if (id === "brick") {
    Q(1, -WALLH + 8, w - 2, WALLH - 10, "#8f8575");
    for (let y = -WALLH + 8, j = 0; y < -2; y += 10, j++) {
      Q(1, y, w - 2, 1, "#5c5446");
      Q(j % 2 ? 8 : 20, y, 1, 10, "#5c5446");
    }
  } else if (id === "polymer") {
    Q(1, -WALLH + 8, w - 2, WALLH - 10, "#5a3aa8");
    Q(3, -WALLH + 10, w - 6, WALLH - 14, "#8a60e0");
    Q(10, -62, 2, 16, "#e8dcff");
    Q(20, -62, 2, 16, "#e8dcff");
    Q(12, -55, 8, 2, "#e8dcff");
  } else if (id === "solar") {
    Q(3, -92, w - 6, 44, OUTC);
    for (let j = 0; j < 3; j++)
      for (let i = 0; i < 2; i++)
        Q(5 + i * 12, -90 + j * 14, 11, 13, j % 2 === i % 2 ? "#2d5bd6" : "#3a6ff0");
    Q(w / 2 - 1, -48, 2, 14, "#8f97bd");
  } else if (id === "antenna") {
    Q(w / 2 - 1, -74, 2, 28, "#cfd6ff");
    Q(w / 2 - 9, -80, 18, 2, "#cfd6ff");
    Q(w / 2 - 11, -84, 2, 4, "#cfd6ff");
    Q(w / 2 + 9, -84, 2, 4, "#cfd6ff");
    Q(w / 2 - 2, -88, 4, 4, Math.sin(t / 200) > 0 ? "#ff5d73" : "#7a1630");
  }
}
function buildRoomBg() {
  const save = ctx;
  const c2 = document.createElement("canvas");
  c2.width = W;
  c2.height = H;
  ctx = c2.getContext("2d");
  drawSkyBg();
  const a = iso(0, 0),
    b = iso(RMC, 0),
    f = iso(0, RMR),
    e = iso(RMC, RMR);
  const SW = 14,
    FD = 24,
    RW = e[0] - f[0];
  poly(
    [
      [f[0] - SW, f[1] + FD],
      [e[0] + SW, e[1] + FD],
      [e[0] + SW + 34, e[1] + FD + 12],
      [f[0] - SW + 34, f[1] + FD + 12],
    ],
    "rgba(20,22,44,.42)",
  );
  [
    [f[0] - 60, f[1] + 40, 7],
    [f[0] + 120, f[1] + 70, 5],
    [e[0] + 60, e[1] - 40, 6],
    [e[0] + 40, e[1] + 56, 8],
    [f[0] + 380, f[1] + 76, 4],
    [f[0] - 40, f[1] - 120, 5],
  ].forEach(([x, y, r]) => {
    pxEllipse(x, y + 2, r + 2, Math.max(2, r / 2), "rgba(20,22,44,.35)");
    pxEllipse(x, y, r, Math.max(2, Math.round(r * 0.6)), "#8a8eae");
    px(x - r + 2, y - 1, r, 1, "#a9adc8");
  });
  px(f[0] - SW - 1, f[1] - 1, RW + SW * 2 + 2, FD + 2, OUTC);
  px(f[0] - SW, f[1], RW + SW * 2, FD, "#3c4370");
  px(f[0] - SW, f[1] + 8, RW + SW * 2, 1, "#2e3460");
  for (let i = 0; i <= RMC; i++) px(f[0] + i * TW, f[1] + 1, 1, FD - 2, "#2e3460");
  [0.2, 0.5, 0.8].forEach((u) => {
    px(f[0] + RW * u - 3, f[1] + 13, 6, 4, "#ffd166");
    px(f[0] + RW * u - 2, f[1] + 14, 4, 2, "#ff9f45");
  });
  for (let r = 0; r < RMR; r++)
    for (let c = 0; c < RMC; c++) {
      const p = iso(c, r);
      px(p[0], p[1], TW, TH, (c + r) % 2 ? "#585e8c" : "#636a9a");
      px(p[0], p[1], TW, 1, "#4a5080");
      px(p[0], p[1], 1, TH, "#4a5080");
      px(p[0] + 2, p[1] + 2, TW - 4, 1, "#6f76a8");
    }
  px(a[0] - SW - 1, a[1] - WALLH - 11, RW + SW * 2 + 2, WALLH + 12, OUTC);
  px(a[0], a[1] - WALLH, RW, WALLH, "#666da2");
  px(a[0] - SW, a[1] - WALLH - 10, RW + SW * 2, 10, "#454d82");
  px(a[0] - SW, a[1] - WALLH - 10, RW + SW * 2, 2, "#5a62a0");
  px(a[0], a[1] - 12, RW, 12, "#565d92");
  px(a[0], a[1] - 12, RW, 1, "#7a80b8");
  px(a[0], a[1] - 2, RW, 2, "#3a4170");
  px(f[0] - SW - 1, a[1] - WALLH - 1, SW + 1, f[1] - a[1] + WALLH + 1, OUTC);
  px(f[0] - SW, a[1] - WALLH, SW, f[1] - a[1] + WALLH, "#4a5180");
  px(f[0] - 3, a[1] - WALLH, 3, f[1] - a[1] + WALLH, "#5d6496");
  px(e[0], a[1] - WALLH - 1, SW + 1, f[1] - a[1] + WALLH + 1, OUTC);
  px(e[0], a[1] - WALLH, SW, f[1] - a[1] + WALLH, "#4a5180");
  px(e[0], a[1] - WALLH, 3, f[1] - a[1] + WALLH, "#5d6496");
  px(f[0] - SW, f[1] - 6, RW + SW * 2, 6, "#8a90c8");
  px(f[0] - SW, f[1] - 6, RW + SW * 2, 1, "#b4b9e6");
  for (let i = 0; i < RMC; i++)
    wallFace("R", i, (w, Q) => {
      Q(w - 1, -WALLH, 1, WALLH - 12, "#565d92");
      Q(4, -WALLH + 6, 2, 2, "#8a90c8");
      Q(w - 6, -WALLH + 6, 2, 2, "#8a90c8");
      Q(w / 2 - 4, -WALLH + 16, 8, 2, i % 2 ? "#3fd8f5" : "#7bd88f");
    });
  ctx = save;
  ROOMBG = c2;
}
function drawRoomWalls(t) {
  for (const k in S.blocks) {
    if (!k.includes(":")) continue;
    const [side, i] = k.split(":");
    wallFace(side, +i, (w, Q) => drawWallItem(S.blocks[k], w, t, Q));
  }
  const op = R.door;
  const blink = R.leave > 0 ? "#ff5d73" : Math.sin(t / 300) > 0 ? "#7bd88f" : "#2d6b3f";
  wallFace("R", 3, (w, Q) => {
    Q(-w + 4, -94, w * 2 - 8, 94, OUTC);
    Q(-w + 6, -92, w * 2 - 12, 92, "#0a0f33");
    Q(-w + 6, -92 + op * 86, w * 2 - 12, 92 - op * 86, "#ff9f45");
    Q(-w + 6, -92 + op * 86, w * 2 - 12, 3, "#ffc27a");
    Q(-10, -78 + op * 86, 20, 16, OUTC);
    Q(-8, -76 + op * 86, 16, 12, "#1b2368");
    Q(-4, -102, 8, 5, blink);
  });
}
function floorItemDraw(id, c, r, t) {
  if (id === "bed") {
    isoBox(c + 0.1, r + 0.1, 0.8, 0.8, 0, 10, "#ff9f45");
    isoBox(c + 0.15, r + 0.12, 0.7, 0.25, 10, 4, "#f4f6ff");
  } else if (id === "table") {
    [
      [0.2, 0.2],
      [0.7, 0.2],
      [0.2, 0.7],
      [0.7, 0.7],
    ].forEach(([dx, dy]) => isoBox(c + dx, r + dy, 0.1, 0.1, 0, 14, "#8a5a2a"));
    isoBox(c + 0.1, r + 0.1, 0.8, 0.8, 14, 4, "#c98a4a");
    const p = iso(c + 0.5, r + 0.5);
    px(p[0] - 6, p[1] - 25, 12, 5, OUTC);
    px(p[0] - 5, p[1] - 24, 10, 3, "#ff9f45");
  } else if (id === "lamp") {
    const p = iso(c + 0.5, r + 0.5);
    pxEllipse(p[0], p[1], 30, 15, "rgba(255,216,74,.12)");
    isoBox(c + 0.4, r + 0.4, 0.2, 0.2, 0, 4, "#3a3f5a");
    px(p[0] - 1, p[1] - 36, 2, 34, "#8f97bd");
    px(p[0] - 8, p[1] - 45, 16, 10, OUTC);
    px(p[0] - 7, p[1] - 44, 14, 8, "#ffd84a");
    px(p[0] - 7, p[1] - 44, 14, 2, "#fff4b0");
  } else if (id === "plant") {
    isoBox(c + 0.28, r + 0.28, 0.44, 0.44, 0, 10, "#c4622d");
    const p = iso(c + 0.5, r + 0.5);
    [
      [-7, -19, 8],
      [6, -21, 8],
      [0, -28, 8],
      [-3, -35, 6],
      [5, -32, 5],
    ].forEach(([dx, dy, s]) => {
      px(p[0] + dx - s / 2 - 1, p[1] + dy - s / 2 - 1, s + 2, s + 2, "#123a1a");
      px(p[0] + dx - s / 2, p[1] + dy - s / 2, s, s, "#5fd36a");
      px(p[0] + dx - s / 2, p[1] + dy - s / 2, s, 2, "#9af0a0");
    });
  } else if (id === "flag") {
    const p = iso(c + 0.5, r + 0.5);
    px(p[0] - 1, p[1] - 50, 2, 50, "#cfd6ff");
    const wv = Math.sin(t / 300) > 0 ? 1 : 0;
    px(p[0] + 1, p[1] - 50, 22, 15, OUTC);
    px(p[0] + 1, p[1] - 49 + wv, 21, 13, "#f4f6ff");
    px(p[0] + 1, p[1] - 39 + wv, 21, 3, "#c9cee8");
  }
}
function stationDraw(k, t) {
  if (k === "bunk") {
    isoBox(0.05, 1.05, 0.9, 1.9, 0, 14, "#3a3f5a");
    isoBox(0.1, 1.1, 0.8, 1.8, 14, 6, "#ff9f45");
    isoBox(0.15, 1.15, 0.7, 0.4, 20, 4, "#f4f6ff");
  } else if (k === "galley") {
    const x0 = iso(5, 0)[0] + 3,
      w = TW * 2 - 6,
      by = Math.round(iso(0, 0.95)[1]);
    px(x0 - 1, by - 27, w + 2, 28, OUTC);
    px(x0, by - 26, w, 26, "#c9cee8");
    const dw = Math.floor((w - 8) / 3);
    for (let d = 0; d < 3; d++) {
      const dx = x0 + 4 + d * dw;
      px(dx, by - 22, dw - 3, 18, "#b4b9d6");
      px(dx, by - 22, dw - 3, 1, "#e6e9f6");
      px(dx + dw - 9, by - 14, 4, 2, "#3a3f5a");
    }
    const ty = by - 43;
    px(x0 - 3, ty - 1, w + 6, 18, OUTC);
    px(x0 - 2, ty, w + 4, 16, "#eef1ff");
    px(x0 - 2, ty, w + 4, 2, "#ffffff");
    px(x0 - 2, ty + 14, w + 4, 2, "#b4b9d6");
    const mx = x0 + 6;
    px(mx - 1, ty - 15, 36, 27, OUTC);
    px(mx, ty - 14, 34, 5, "#5a6080");
    px(mx, ty - 9, 34, 20, "#2a2f45");
    px(mx + 3, ty - 6, 20, 13, OUTC);
    px(mx + 4, ty - 5, 18, 11, Math.sin(t / 300) > 0 ? "#ff9f45" : "#ff8a30");
    px(mx + 6, ty + 1, 14, 3, "#ffd166");
    px(mx + 8, ty - 1, 4, 2, "#7bd88f");
    px(mx + 26, ty - 5, 5, 2, "#7bd88f");
    px(mx + 26, ty - 1, 5, 2, "#ff5d73");
    px(mx + 26, ty + 3, 5, 2, "#ffd166");
    const cx = x0 + w / 2 + 6;
    px(cx - 11, ty + 3, 22, 8, OUTC);
    px(cx - 10, ty + 4, 20, 6, "#d9dcef");
    px(cx - 9, ty + 5, 5, 4, "#ff5d73");
    px(cx - 3, ty + 5, 5, 4, "#ffd166");
    px(cx + 3, ty + 5, 5, 4, "#7bd88f");
    const vx = x0 + w - 28;
    px(vx - 1, ty - 27, 26, 38, OUTC);
    px(vx, ty - 26, 24, 36, "#1c2246");
    for (let i = 0; i < 12; i++) px(vx + i * 2, ty - 26, 2, 3, i % 2 ? "#ff3d6e" : "#5a6bff");
    px(
      vx,
      ty - 23,
      24,
      30,
      Math.floor(t / 600) % 2 ? "rgba(255,80,160,.18)" : "rgba(120,100,255,.18)",
    );
    px(vx + 4, ty + 3, 16, 7, OUTC);
    px(vx + 5, ty + 4, 14, 5, "#c4622d");
    [
      [6, -4, 5],
      [11, -8, 6],
      [15, -3, 5],
      [9, -13, 4],
    ].forEach(([dx, dy, sz]) => {
      px(vx + dx - 1, ty + dy - 1, sz + 2, sz + 2, "#123a1a");
      px(vx + dx, ty + dy, sz, sz, "#7be08a");
      px(vx + dx, ty + dy, sz, 1, "#b6f5bf");
    });
  } else if (k === "console") {
    isoBox(7.05, 0.05, 1.9, 0.9, 0, 24, "#454d82");
    wallFace("R", 7, (w, Q) => {
      Q(4, -80, w * 2 - 8, 42, OUTC);
      Q(
        6,
        -78,
        w * 2 - 12,
        38,
        R.fault ? (Math.sin(t / 120) > 0 ? "#ff5d73" : "#5a1630") : "#103a5a",
      );
      if (!R.fault)
        for (let i = 0; i < 24; i++)
          Q(8 + i * 2, -60 + Math.round(Math.sin(t / 260 + i * 0.5) * 7), 2, 2, "#3fd8f5");
    });
  }
}
function drawAstro(t) {
  const [sx, sy] = astroScreen();
  R.x = sx;
  R.sy = sy;
  if (R.mode === "sleep") {
    const p = iso(0.5, 1.45);
    drawSleepHead(ctx, p[0], p[1] - 20);
    isoBox(0.12, 1.6, 0.76, 1.3, 20, 5, "#4cc9f0");
    const q = iso(0.5, 1.2);
    const zt = Math.floor(t / 400) % 3;
    for (let i = 0; i <= zt; i++) {
      const zx = Math.round(q[0] + 14 + i * 10),
        zy = Math.round(q[1] - 60 - i * 12);
      px(zx, zy, 6, 1, "#ffffff");
      px(zx + 4, zy + 1, 1, 1, "#ffffff");
      px(zx + 3, zy + 2, 1, 1, "#ffffff");
      px(zx + 2, zy + 3, 1, 1, "#ffffff");
      px(zx + 1, zy + 4, 1, 1, "#ffffff");
      px(zx, zy + 5, 6, 1, "#ffffff");
    }
    return;
  }
  const fade = R.leave > 0 ? Math.max(0, R.leave / 1.4) : 1;
  ctx.globalAlpha = fade;
  drawMira(ctx, Math.round(sx), Math.round(sy + 4), 0.95, {
    mode: R.mode,
    dir: R.dir,
    k: 0.75,
    half: true,
  });
  ctx.globalAlpha = 1;
}
const KAIM = [
  "..kkkkk..",
  ".kwwwwwk.",
  "kwwbbbwwk",
  "kwbbebbwk",
  "kwwbbbwwk",
  "kgggggggk",
  ".kkkkkkk.",
];
function drawKai(t) {
  const tx = R.x - R.dir * 40,
    ty = R.sy - 82 + Math.sin(t / 380) * 6;
  R.px += (tx - R.px) * 0.05;
  R.py += (ty - R.py) * 0.05;
  const x = Math.round(R.px),
    y = Math.round(R.py);
  const C = {
    k: OUTC,
    w: "#cfd6ff",
    g: "#555b7a",
    b: R.fault ? "#ff5d73" : "#4cc9f0",
    e: "#04061a",
  };
  const s = 3;
  KAIM.forEach((row, j) => {
    for (let i = 0; i < row.length; i++)
      if (row[i] !== ".") px(x - 13 + i * s, y - 10 + j * s, s, s, C[row[i]]);
  });
  const sp = Math.floor(t / 60) % 2;
  px(x - 14 - sp * 3, y - 14, 10 + sp * 3, 2, "#e6ebff");
  px(x + 4, y - 14, 10 + sp * 3, 2, "#e6ebff");
  px(x - 1, y - 13, 2, 3, "#9aa3c8");
}
function drawScene(t) {
  if (!ROOMBG) buildRoomBg();
  ctx.drawImage(ROOMBG, 0, 0);
  for (let i = 0; i < 12; i++) {
    const on = Math.sin(t / 400 + i * 1.7) > 0.6;
    if (on) px(Math.floor((i * 211) % W), Math.floor((i * 71) % 300), 1, 1, "#ffffff");
  }
  drawRoomWalls(t);
  const list = [];
  for (const k in S.blocks) {
    if (k.includes(":")) continue;
    const [c, r] = k.split(",").map(Number);
    list.push({ d: r + 0.5 + c * 0.001, f: () => floorItemDraw(S.blocks[k], c, r, t) });
  }
  Object.keys(STATIONS).forEach((k) => {
    const s = STATIONS[k];
    const [c, r] = s.tiles[s.tiles.length - 1].split(",").map(Number);
    list.push({ d: r + 0.4 + c * 0.001, f: () => stationDraw(k, t) });
  });
  list.push({ d: R.cy, f: () => drawAstro(t) });
  list.sort((a, b) => a.d - b.d).forEach((o) => o.f());
  drawKai(t);
  if (R.build && R.hover) drawHover(t);
  const st = R.storm;
  if (st.state === 2) {
    px(0, 0, W, H, "rgba(255,150,30,.12)");
    for (let i = 0; i < 30; i++) {
      const sx = Math.floor((i * 53 + t * 0.1) % W),
        sy = Math.floor(((t * 0.8 + i * 41) % 160) * 1.2);
      for (let j = 0; j < 7; j++) px(sx - j, sy + j * 2, 1, 2, "#ffd25a");
    }
  }
  if (R.fault || st.state === 1)
    px(0, 0, W, H, `rgba(255,0,40,${0.03 + 0.05 * Math.abs(Math.sin(t / 220))})`);
}
function drawLabels(t) {
  const PFn = (n) => `${n}px "Press Start 2P", monospace`;
  const lab = (txt, x, y, col) => {
    ctx.font = PFn(6);
    ctx.textAlign = "center";
    ctx.fillStyle = OUTC;
    ctx.fillText(txt, x + 1, y + 1);
    ctx.fillStyle = col || "#ffffff";
    ctx.fillText(txt, x, y);
  };
  if (R.bub && R.bubT > 0 && R.mode !== "sleep") {
    ctx.font = PFn(7);
    const w = Math.ceil(ctx.measureText(R.bub).width) + 16;
    const bxp = Math.round(clamp(R.x - w / 2, 10, W - w - 10)),
      byp = Math.round(R.sy - 108);
    ctx.fillStyle = OUTC;
    ctx.fillRect(bxp - 2, byp - 2, w + 4, 26);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(bxp, byp, w, 22);
    ctx.fillStyle = OUTC;
    ctx.fillRect(Math.round(R.x) - 4, byp + 24, 8, 2);
    ctx.fillRect(Math.round(R.x) - 2, byp + 26, 4, 2);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(Math.round(R.x) - 3, byp + 22, 6, 2);
    ctx.fillStyle = OUTC;
    ctx.textAlign = "left";
    ctx.fillText(R.bub, bxp + 8, byp + 15);
  }
  R.hearts.forEach((h) => {
    ctx.globalAlpha = Math.min(1, h.l * 2);
    ctx.font = "20px serif";
    ctx.textAlign = "center";
    ctx.fillText(h.e, h.x, h.y);
  });
  ctx.globalAlpha = 1;
  ctx.textAlign = "left";
}
function drawHub(t) {
  const main = ctx;
  ctx = RBX;
  ctx.clearRect(0, 0, W, H);
  drawScene(t);
  ctx = main;
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, W, H);
  ctx.drawImage(RB, 0, 0, W, H);
  drawLabels(t);
}
function heldId() {
  if (R.tool === "move") return R.holding ? R.holding.id : null;
  if (R.tool.startsWith("stash:")) return R.tool.slice(6);
  return R.tool;
}
function pickMode() {
  return R.tool === "erase" || R.tool === "store" || (R.tool === "move" && !R.holding);
}
function dropHeld() {
  if (!R.holding) return;
  const h = R.holding;
  R.holding = null;
  if (!S.blocks[h.from]) S.blocks[h.from] = h.id;
  else {
    S.stash = S.stash || {};
    S.stash[h.id] = (S.stash[h.id] || 0) + 1;
  }
  writeSave();
}
function drawHover(t) {
  const hv = R.hover;
  const id = heldId();
  const pick = pickMode();
  const wallTool =
    WALLI.has(id) ||
    (String(id).startsWith("mod:") && MODS[id].cells.every((x) => WALLI.has(x[2])));
  const freeSpot = (k) => !S.blocks[k] && !RESV2.has(k);
  if (hv.k.includes(":")) {
    const [side, i] = hv.k.split(":");
    const ok = pick ? !!S.blocks[hv.k] && !RESV2.has(hv.k) : wallTool && freeSpot(hv.k);
    wallFace(side, +i, (w, Q) => {
      Q(0, -WALLH, w, WALLH, ok ? "rgba(123,216,143,.35)" : "rgba(255,93,115,.35)");
      if (ok && !pick && WALLI.has(id)) {
        ctx.globalAlpha = 0.75;
        drawWallItem(id, w, t, Q);
        ctx.globalAlpha = 1;
      }
    });
  } else {
    const [c, r] = hv.k.split(",").map(Number);
    const ok = pick ? !!S.blocks[hv.k] && !RESV2.has(hv.k) : !wallTool && freeSpot(hv.k);
    poly(
      [iso(c, r), iso(c + 1, r), iso(c + 1, r + 1), iso(c, r + 1)],
      ok ? "rgba(123,216,143,.4)" : "rgba(255,93,115,.4)",
      "#ffffff",
    );
    if (ok && !pick && !wallTool && BLK[id]) {
      ctx.globalAlpha = 0.75;
      floorItemDraw(id, c, r, t);
      ctx.globalAlpha = 1;
    }
  }
}
function pickRoom(ev) {
  const rc = cv.getBoundingClientRect();
  const x = ((ev.clientX - rc.left) / rc.width) * W,
    y = ((ev.clientY - rc.top) / rc.height) * H;
  const c = (x - ROX) / TW,
    r = (y - ROY) / TH;
  if (c >= 0 && c < RMC && r >= 0 && r < RMR)
    return { k: Math.floor(c) + "," + Math.floor(r), c, r, x, y };
  if (c >= 0 && c < RMC && y >= ROY - WALLH && y < ROY) return { k: "R:" + Math.floor(c), x, y };
  return { k: null, x, y };
}
function freeWallSlots() {
  const out = [];
  for (let i = 0; i < RMC; i++) out.push("R:" + i);
  return out.filter((k) => !S.blocks[k] && !RESV2.has(k) && k !== "R:7" && k !== "R:8");
}
function freeFloorNear(c, r) {
  const out = [];
  for (let rr = 0; rr < RMR; rr++)
    for (let cc = 0; cc < RMC; cc++) {
      const k = cc + "," + rr;
      if (!S.blocks[k] && !RESV2.has(k)) out.push({ k, d: Math.abs(cc - c) + Math.abs(rr - r) });
    }
  return out.sort((a, b) => a.d - b.d).map((o) => o.k);
}
function placeAt(hv) {
  const k = hv.k;
  if (!k) return;
  if (R.tool === "store" || (R.tool === "move" && !R.holding)) {
    if (!S.blocks[k] || RESV2.has(k)) {
      toast(
        R.tool === "store" ? "📦 Tap a piece to store it." : "✋ Tap a piece to pick it up.",
        1500,
      );
      return;
    }
    const id = S.blocks[k];
    delete S.blocks[k];
    if (R.tool === "store") {
      S.stash = S.stash || {};
      S.stash[id] = (S.stash[id] || 0) + 1;
      toast("📦 Stored: " + BLK[id].n, 1500);
    } else R.holding = { id, from: k };
    beep(650, 0.05);
    writeSave();
    buildPalette();
    return;
  }
  if ((R.tool === "move" && R.holding) || R.tool.startsWith("stash:")) {
    const id = heldId();
    if (!BLK[id]) return;
    const wall = WALLI.has(id);
    if (wall !== k.includes(":")) {
      toast(wall ? "🧱 This one goes on a wall." : "🪑 This one goes on the floor.", 1800);
      return;
    }
    if (S.blocks[k] || RESV2.has(k) || k === "R:7" || k === "R:8") {
      toast("That spot is taken.", 1500);
      return;
    }
    if (!wall && k === Math.floor(R.cx) + "," + Math.floor(R.cy)) {
      toast("Your astronaut is standing there.", 1500);
      return;
    }
    S.blocks[k] = id;
    if (R.tool === "move") R.holding = null;
    else {
      S.stash[id]--;
      if (S.stash[id] <= 0) {
        delete S.stash[id];
        R.tool = "move";
      }
    }
    beep(900, 0.07);
    writeSave();
    buildPalette();
    return;
  }
  if (R.tool === "erase") {
    if (S.blocks[k] && !RESV2.has(k)) {
      const b = BLK[S.blocks[k]];
      if (b) payCost(b.cost, -1);
      delete S.blocks[k];
      beep(500, 0.06);
      writeSave();
      buildPalette();
    }
    return;
  }
  if (R.tool.startsWith("mod:")) {
    const m = MODS[R.tool];
    const cost = modCost(m);
    if (!afford(cost)) {
      toast("Not enough: " + costIcons(cost), 2200);
      return;
    }
    const [c0, r0] = k.includes(",") ? k.split(",").map(Number) : [2, 2];
    const walls = freeWallSlots();
    const floors = freeFloorNear(c0, r0);
    const plan = [];
    for (const x of m.cells) {
      const slot = WALLI.has(x[2]) ? walls.shift() : floors.shift();
      if (!slot) {
        toast("No free space for this room.", 2000);
        return;
      }
      plan.push([slot, x[2]]);
    }
    payCost(cost, 1);
    plan.forEach(([s, id]) => (S.blocks[s] = id));
    beep(900, 0.07);
    S.pwr = Math.max(0, (S.pwr == null ? 80 : S.pwr) - 1);
    writeSave();
    buildPalette();
    return;
  }
  const b = BLK[R.tool];
  if (!b) return;
  const wall = WALLI.has(R.tool);
  if (wall !== k.includes(":")) {
    toast(wall ? "🧱 This one goes on a wall." : "🪑 This one goes on the floor.", 1800);
    return;
  }
  if (RESV2.has(k) || k === "R:7" || k === "R:8") {
    toast("That spot is taken.", 1500);
    return;
  }
  if (S.blocks[k]) {
    toast("Occupied. Remove it first.", 1500);
    return;
  }
  if (!wall && k === Math.floor(R.cx) + "," + Math.floor(R.cy)) {
    toast("Your astronaut is standing there.", 1500);
    return;
  }
  if (!afford(b.cost)) {
    toast("Not enough: " + costIcons(b.cost), 2200);
    return;
  }
  payCost(b.cost, 1);
  S.blocks[k] = R.tool;
  beep(900, 0.07);
  S.pwr = Math.max(0, (S.pwr == null ? 80 : S.pwr) - 1);
  writeSave();
  buildPalette();
}
function canPlaceMod() {
  return { ok: true };
}
function nearStation(c, r) {
  for (const k in STATIONS)
    if (STATIONS[k].tiles.includes(Math.floor(c) + "," + Math.floor(r))) return k;
  return null;
}
cv.addEventListener("pointermove", (e) => {
  if (R.build) R.hover = pickRoom(e).k ? pickRoom(e) : null;
});
cv.addEventListener("pointerleave", () => {
  R.hover = null;
});
cv.addEventListener("pointerdown", (e) => {
  ensureAudio();
  if (R.paused) return;
  const p = pickRoom(e);
  if (R.build) {
    placeAt(p);
    return;
  }
  if (Math.abs(p.x - R.x) < 18 && p.y > R.sy - 64 && p.y < R.sy + 6) {
    doAct("pet");
    return;
  }
  if (!p.k) return;
  if (p.k === "R:2" || p.k === "R:3") {
    doAct("exp");
    return;
  }
  if (p.k.includes(":")) return;
  const st = nearStation(p.c, p.r);
  if (st === "bunk") doAct("sleep");
  else if (st === "galley") doAct("eat");
  else if (st === "console") doAct("missions");
  else if (R.mode !== "sleep" && R.mode !== "eat" && R.leave <= 0) {
    R.act = null;
    goTo(clamp(p.c, 0.4, RMC - 0.4), clamp(p.r, 0.4, RMR - 0.4));
  }
});
function blockedTile(c, r) {
  if (c < 0 || r < 0 || c >= RMC || r >= RMR) return true;
  const k = c + "," + r;
  return STATT.has(k) || !!S.blocks[k];
}
function freeAt(x, y) {
  if (x < 0.25 || y < 0.25 || x > RMC - 0.25 || y > RMR - 0.25) return false;
  const m = 0.22;
  return [
    [x - m, y - m],
    [x + m, y - m],
    [x - m, y + m],
    [x + m, y + m],
  ].every(([a, b]) => !blockedTile(Math.floor(a), Math.floor(b)));
}
function findPath(c0, r0, c1, r1) {
  const key = (c, r) => c + "," + r;
  const prev = {};
  const q = [[c0, r0]];
  prev[key(c0, r0)] = null;
  const D = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
    [1, 1],
    [1, -1],
    [-1, 1],
    [-1, -1],
  ];
  while (q.length) {
    const [c, r] = q.shift();
    if (c === c1 && r === r1) {
      const out = [];
      let k = key(c, r);
      while (k) {
        const [a, b] = k.split(",").map(Number);
        out.unshift([a + 0.5, b + 0.5]);
        k = prev[k];
      }
      return out;
    }
    for (const [dx, dy] of D) {
      const nc = c + dx,
        nr = r + dy;
      if (prev[key(nc, nr)] !== undefined || blockedTile(nc, nr)) continue;
      if (dx && dy && (blockedTile(c + dx, r) || blockedTile(c, r + dy))) continue;
      prev[key(nc, nr)] = key(c, r);
      q.push([nc, nr]);
    }
  }
  return null;
}
function nearestFree(c, r) {
  let best = null,
    bd = 1e9;
  for (let rr = 0; rr < RMR; rr++)
    for (let cc = 0; cc < RMC; cc++) {
      if (blockedTile(cc, rr)) continue;
      const d = Math.hypot(cc - c, rr - r);
      if (d < bd) {
        bd = d;
        best = [cc, rr];
      }
    }
  return best;
}
function goTo(c, r) {
  let tc = Math.floor(c),
    tr = Math.floor(r);
  let fx = c,
    fy = r;
  if (blockedTile(tc, tr)) {
    const n = nearestFree(c, r);
    if (!n) return;
    [tc, tr] = n;
    fx = tc + 0.5;
    fy = tr + 0.5;
  }
  const p = findPath(Math.floor(R.cx), Math.floor(R.cy), tc, tr);
  if (!p) {
    R.path = [];
    return;
  }
  R.path = p.slice(1);
  if (R.path.length) R.path[R.path.length - 1] = [fx, fy];
  else R.path = [[fx, fy]];
  R.tcx = fx;
  R.tcy = fy;
}
function tryMove(dx, dy) {
  const nx = R.cx + dx,
    ny = R.cy + dy;
  if (freeAt(nx, ny)) {
    R.cx = nx;
    R.cy = ny;
  } else if (freeAt(nx, R.cy)) R.cx = nx;
  else if (freeAt(R.cx, ny)) R.cy = ny;
}
const MOVEK = {
  w: "up",
  arrowup: "up",
  s: "down",
  arrowdown: "down",
  a: "left",
  arrowleft: "left",
  d: "right",
  arrowright: "right",
};
function roomKeysOk(e) {
  const tag = (e.target && e.target.tagName) || "";
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return false;
  if (typeof MG !== "undefined" && MG) return false;
  return !document.querySelector(".overlay.on");
}
window.addEventListener("keydown", (e) => {
  const k = e.key.toLowerCase();
  if (!MOVEK[k] || !roomKeysOk(e)) return;
  e.preventDefault();
  R.keys[MOVEK[k]] = true;
});
window.addEventListener("keyup", (e) => {
  const k = e.key.toLowerCase();
  if (MOVEK[k]) R.keys[MOVEK[k]] = false;
});
window.addEventListener("blur", () => (R.keys = {}));
function moveAstro(dt) {
  if (R.mode !== "walk" && R.mode !== "idle" && R.mode !== "wave") return;
  const kx = (R.keys.right ? 1 : 0) - (R.keys.left ? 1 : 0),
    ky = (R.keys.down ? 1 : 0) - (R.keys.up ? 1 : 0);
  if ((kx || ky) && R.mode !== "wave" && R.leave <= 0) {
    R.act = null;
    R.path = [];
    let dc = kx,
      dr = ky;
    const n = Math.hypot(dc, dr) || 1;
    dc /= n;
    dr /= n;
    tryMove(dc * 2.6 * dt, dr * 2.6 * dt);
    if (kx) R.dir = kx > 0 ? 1 : -1;
    R.mode = "walk";
    R.tcx = R.cx;
    R.tcy = R.cy;
    return;
  }
  if (R.path.length && R.mode !== "wave") {
    const [tx, ty] = R.path[0];
    const dx = tx - R.cx,
      dy = ty - R.cy;
    const dist = Math.hypot(dx, dy);
    if (dist < 0.08) {
      R.cx = tx;
      R.cy = ty;
      R.path.shift();
    } else {
      const sp = Math.min(dist, 2.6 * dt);
      R.cx += (dx / dist) * sp;
      R.cy += (dy / dist) * sp;
      const sdx = dx;
      if (Math.abs(sdx) > 0.01) R.dir = sdx > 0 ? 1 : -1;
    }
    R.mode = "walk";
    return;
  }
  if (R.mode === "walk") R.mode = "idle";
  if (R.act && R.mode === "idle") {
    const a = R.act;
    R.act = null;
    arrive(a);
  }
}
