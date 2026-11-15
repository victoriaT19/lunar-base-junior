const R = {
  x: 228,
  tx: 228,
  dir: 1,
  mode: "idle",
  mt: 0,
  act: null,
  hearts: [],
  bub: "",
  bubT: 0,
  fault: null,
  faultT: 100,
  storm: { state: 0, t: 0, total: 0, prot: 0 },
  petCool: 0,
  build: false,
  tool: "brick",
  hover: null,
  paused: true,
  t: 0,
  plantAcc: 0,
  cheerAt: -99,
  cheer: "",
  lastSave: 0,
  toasts: [],
  door: 0,
  leave: 0,
  roverX: 900,
  px: 300,
  py: 300,
  dust: Array.from({ length: 16 }, () => ({
    x: Math.random() * 672,
    y: Math.random() * 224,
    s: Math.random() * 8 + 4,
  })),
  newStyle: false,
  storyOpen: false,
  evac: false,
};
const LIVE = { ok: false };
let audio = null,
  muted = false;
const BEDX = GX + 3 * CELL,
  GALX = GX + 7 * CELL,
  CONX = GX + 11 * CELL,
  DOORX = GX + 13.2 * CELL;
const RESV = new Set();
[
  [2, 4],
  [3, 4],
  [2, 5],
  [3, 5],
  [6, 4],
  [7, 4],
  [6, 5],
  [7, 5],
  [10, 4],
  [11, 4],
  [10, 5],
  [11, 5],
  [13, 3],
  [13, 4],
  [13, 5],
].forEach((a) => RESV.add(a[0] + "," + a[1]));

function isHull(c, r) {
  return (r === 1 && c >= 1 && c <= 14) || ((c === 1 || c === 14) && r >= 2 && r <= 5);
}
function homeReady() {
  const deco = ["lamp", "poster", "flag", "plant", "window", "bed"];
  return cnt("table") >= 1 && deco.some((d) => cnt(d) >= 1);
}
function cnt(id) {
  let n = 0;
  for (const k in S.blocks) if (S.blocks[k] === id) n++;
  return n;
}
function shieldVal() {
  let s = 2;
  for (const k in S.blocks) {
    const b = BLK[S.blocks[k]];
    if (b && b.shield) s += b.shield;
  }
  return s;
}
function decor() {
  let m = 0;
  for (const k in S.blocks) {
    const b = BLK[S.blocks[k]];
    if (b && b.mood) m += b.mood;
  }
  return Math.min(30, m);
}
function planMood() {
  let m = 0;
  if (!S.plan) return 0;
  Object.keys(FOODMOOD).forEach((k) => {
    if (S.plan.sel[k]) m += FOODMOOD[k];
  });
  return m;
}
function bedMult() {
  return Math.min(2, 1 + 0.5 * cnt("bed")) * (S.plan && mod("cabins") ? 1.3 : 1);
}
function afford(cost) {
  return Object.keys(cost).every((k) => (k === "units" ? S.units >= cost[k] : S.inv[k] >= cost[k]));
}
function payCost(cost, sign) {
  Object.keys(cost).forEach((k) => {
    if (k === "units") S.units -= sign * cost[k];
    else S.inv[k] -= sign * cost[k];
  });
}
function costTxt(cost) {
  return Object.keys(cost)
    .map((k) => cost[k] + " " + (k === "units" ? "units" : ITEMS[k].n))
    .join(", ");
}

function ensureAudio() {
  if (audio || muted) return;
  try {
    audio = new (window.AudioContext || window.webkitAudioContext)();
  } catch (e) {
    audio = null;
  }
}
function beep(f, d, v) {
  if (!audio || muted || A.vol <= 0) return;
  try {
    const o = audio.createOscillator(),
      g = audio.createGain();
    o.type = "square";
    o.frequency.value = f;
    g.gain.value = (v || 0.03) * A.vol;
    o.connect(g);
    g.connect(audio.destination);
    o.start();
    o.stop(audio.currentTime + d);
  } catch (e) {}
}
setInterval(() => {
  const alarm = !R.paused && (R.fault || R.storm.state === 1 || R.storm.state === 2);
  if (alarm && muted === false && audio) beep(R.storm.state ? 900 : 600, 0.16, 0.02);
  if (alarm && A.cap && Date.now() - (R.lastCap || 0) > 4500) {
    R.lastCap = Date.now();
    R.toasts.push({ m: "🔔 [alarm sounding]", t: 2 });
  }
}, 700);
function toast(m, ms) {
  R.toasts.push({ m, t: (ms || 3500) / 1000 });
  announce(m);
}

function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  return (
    "rgb(" +
    clamp((n >> 16) + amt, 0, 255) +
    "," +
    clamp(((n >> 8) & 255) + amt, 0, 255) +
    "," +
    clamp((n & 255) + amt, 0, 255) +
    ")"
  );
}

const OUT = "#1b1030";
function announce(m) {
  const el = document.getElementById("sr");
  if (!el) return;
  el.textContent = "";
  setTimeout(() => {
    el.textContent = String(m).replace(/<[^>]+>/g, "");
  }, 40);
}
