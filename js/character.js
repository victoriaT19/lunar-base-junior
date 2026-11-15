const CHARS = ["short", "curly", "long", "bun", "mohawk"];
const ACCK = [null, "glasses", "goggles", "headphones"];
const SPW = 24,
  SPH = 34;
const SCACHE = {};

function ready(im) {
  if (im instanceof HTMLCanvasElement) return true;
  return !!im && im.complete && im.naturalWidth > 0;
}
function hexRgb(h) {
  const n = parseInt(String(h).replace("#", ""), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function tint(c, k) {
  return c.map((v) =>
    Math.max(0, Math.min(255, Math.round(k >= 1 ? v + (255 - v) * (k - 1) : v * k))),
  );
}
function mixc(a, b, t) {
  return a.map((v, i) => Math.round(v + (b[i] - v) * t));
}
function charOf(L) {
  return CHARS.includes(L.char) ? L.char : "short";
}
function lookPal(L) {
  const sk = hexRgb(SKINS[L.skin >= 0 ? L.skin : 2] || SKINS[2]);
  const hc = hexRgb(HAIRC[L.hairCol >= 0 ? L.hairCol : 2] || HAIRC[2]);
  const ec = hexRgb(EYEC[L.eyes >= 0 ? L.eyes : 3] || EYEC[3]);
  const tc = hexRgb(L.suit || "#ff9f45");
  return {
    o: [26, 16, 32],
    s: sk,
    l: tint(sk, 1.22),
    S: tint(sk, 0.78),
    h: hc,
    j: tint(hc, 1.3),
    H: tint(hc, 0.62),
    e: [255, 255, 255],
    i: ec,
    p: [16, 20, 40],
    c: mixc(sk, [240, 110, 120], 0.45),
    m: [150, 40, 50],
    w: [238, 241, 255],
    a: [238, 241, 255],
    W: [180, 188, 214],
    g: [120, 128, 160],
    G: [80, 86, 112],
    t: tc,
    b: [58, 63, 90],
    k: [43, 111, 214],
    y: [255, 209, 102],
    v: [43, 111, 214],
    r: [255, 93, 115],
  };
}
function spriteCanvas(L, frame) {
  const ch = charOf(L);
  const ac = ACCK[L.acc] || "";
  const key = [ch, ac, L.skin, L.hairCol, L.eyes, L.suit, frame].join("|");
  if (SCACHE[key]) return SCACHE[key];
  const set = SPR[ch + "|" + ac] || SPR[ch + "|"];
  const rows = set[frame] || set[0];
  const pal = lookPal(L);
  const cv2 = document.createElement("canvas");
  cv2.width = SPW;
  cv2.height = SPH;
  const g = cv2.getContext("2d");
  const im = g.createImageData(SPW, SPH);
  rows.forEach((r, y) => {
    for (let x = 0; x < r.length; x++) {
      const c = pal[r[x]];
      if (!c) continue;
      const q = (y * SPW + x) * 4;
      im.data[q] = c[0];
      im.data[q + 1] = c[1];
      im.data[q + 2] = c[2];
      im.data[q + 3] = 255;
    }
  });
  g.putImageData(im, 0, 0);
  SCACHE[key] = cv2;
  return cv2;
}
function charCanvas(L) {
  return spriteCanvas(L, 0);
}
function drawMira(c, x, y, sc, o) {
  const t = o.still ? 0 : R.t;
  const walking = o.mode === "walk",
    asleep = o.mode === "sleep";
  const blink = asleep || (!o.still && t % 3.7 > 3.56);
  const frame = walking ? Math.floor(t * 8) % 4 : blink ? 4 : 0;
  const cv2 = spriteCanvas(S, frame);
  const k = o.k || 2;
  const tr = c.getTransform();
  const a = Math.hypot(tr.a, tr.b) || 1;
  const s2 = Math.max(1, Math.round(((76 * k) / SPH) * a)) / a;
  const breathe = !walking && !asleep && !o.still && !A.rm && Math.floor(t * 1.2) % 2 ? -1 : 0;
  c.save();
  c.imageSmoothingEnabled = false;
  c.translate(Math.round(x * a) / a, Math.round(y * a) / a);
  c.scale((o.dir || 1) * s2, s2);
  if (!asleep) {
    c.fillStyle = "rgba(0,0,0,.3)";
    c.fillRect(-8, -1, 16, 2);
  }
  c.drawImage(cv2, -SPW / 2, -SPH + breathe);
  c.restore();
}
function drawSleepHead(c, x, y) {
  const cv2 = spriteCanvas(S, 4);
  c.save();
  c.imageSmoothingEnabled = false;
  c.drawImage(cv2, 0, 0, SPW, 19, Math.round(x - SPW), Math.round(y - 38), SPW * 2, 38);
  c.restore();
}
function headIcon(c2, look) {
  const cv2 = spriteCanvas(look, 0);
  c2.imageSmoothingEnabled = false;
  const s = Math.max(1, Math.floor(Math.min(c2.canvas.width / 20, c2.canvas.height / 20)));
  c2.drawImage(
    cv2,
    2,
    0,
    20,
    20,
    (c2.canvas.width - 20 * s) / 2,
    (c2.canvas.height - 20 * s) / 2,
    20 * s,
    20 * s,
  );
}
