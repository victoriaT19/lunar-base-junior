const CHARS = ["hero", "classic", "creative", "bold", "nerd", "explorer"];
const ACCK = [null, "glasses", "goggles", "headphones"];
const AIMG = { ch: {}, lab: {}, acc: {}, row: {}, bust: {} };
const ACACHE = {};
function img(src) {
  const im = new Image();
  im.src = src;
  return im;
}
if (typeof ART !== "undefined") {
  CHARS.forEach((k) => {
    AIMG.ch[k] = img(ART[k].img);
    AIMG.lab[k] = img(ART[k].lab);
    AIMG.bust[k] = img(ART.bust[k]);
  });
  Object.keys(ART.acc).forEach((k) => (AIMG.acc[k] = img(ART.acc[k])));
  Object.keys(ART.row).forEach((k) => (AIMG.row[k] = img(ART.row[k])));
}
function ready(im) {
  if (im instanceof HTMLCanvasElement) return true;
  return !!im && im.complete && im.naturalWidth > 0;
}
function hexRgb(h) {
  const n = parseInt(String(h).replace("#", ""), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function charOf(L) {
  return CHARS.includes(L.char) ? L.char : "hero";
}
const CMX = 8,
  CMT = 14;
function charCanvas(L) {
  if (typeof ART === "undefined") return null;
  const k = charOf(L);
  const tg = [
    null,
    L.skin >= 0 && SKINS[L.skin] ? hexRgb(SKINS[L.skin]) : null,
    L.hairCol >= 0 && HAIRC[L.hairCol] ? hexRgb(HAIRC[L.hairCol]) : null,
    L.eyes >= 0 && EYEC[L.eyes] ? hexRgb(EYEC[L.eyes]) : null,
    L.suit ? hexRgb(L.suit) : null,
  ];
  const key = [k, L.skin, L.hairCol, L.eyes, L.suit, L.acc].join("|");
  if (ACACHE[key]) return ACACHE[key];
  const base = AIMG.ch[k],
    lab = AIMG.lab[k],
    meta = ART[k];
  if (!ready(base) || !ready(lab)) return null;
  const accN = ACCK[L.acc] || null;
  const MX = CMX,
    MT = CMT;
  const cv2 = document.createElement("canvas");
  cv2.width = meta.w + MX * 2;
  cv2.height = meta.h + MT;
  const g = cv2.getContext("2d");
  const t1 = document.createElement("canvas");
  t1.width = meta.w;
  t1.height = meta.h;
  const g1 = t1.getContext("2d");
  g1.drawImage(base, 0, 0);
  const px = g1.getImageData(0, 0, meta.w, meta.h);
  g1.clearRect(0, 0, meta.w, meta.h);
  g1.drawImage(lab, 0, 0);
  const lb = g1.getImageData(0, 0, meta.w, meta.h).data;
  const d = px.data;
  const ramp = (T, lv) =>
    T.map((v) =>
      Math.round(lv === 0 ? v + (255 - v) * 0.36 : lv === 1 ? v : lv === 2 ? v * 0.82 : v * 0.68),
    );
  for (let p = 0; p < d.length; p += 4) {
    const li = Math.round(lb[p] / 60);
    if (!li || !tg[li] || !d[p + 3]) continue;
    const c3 = ramp(tg[li], Math.round(lb[p + 1] / 60));
    d[p] = c3[0];
    d[p + 1] = c3[1];
    d[p + 2] = c3[2];
  }
  g1.putImageData(px, 0, 0);
  g.imageSmoothingEnabled = false;
  g.drawImage(t1, MX, MT);
  if (accN) drawAcc(g, accN, k, meta.ex + MX, meta.ey + MT, meta.d);
  const sk = g.getImageData(
    Math.round(meta.ex + MX - meta.d * 0.5),
    Math.round(meta.ey + MT + meta.d * 0.42),
    1,
    1,
  ).data;
  cv2.skin = `rgb(${sk[0]},${sk[1]},${sk[2]})`;
  ACACHE[key] = cv2;
  return cv2;
}
function drawAcc(g, n, k, ex, ey, d) {
  const P = (x, y, w, h, c) => {
    g.fillStyle = c;
    g.fillRect(
      Math.round(x),
      Math.round(y),
      Math.max(1, Math.round(w)),
      Math.max(1, Math.round(h)),
    );
  };
  const D = "#1a1020";
  if (n === "glasses" && k !== "nerd") {
    const fw = Math.round(d * 0.66),
      fh = Math.round(d * 0.52);
    const xs = [ex - d / 2, ex + d / 2].map((c) => Math.round(c - fw / 2));
    const y0 = Math.round(ey - fh / 2);
    xs.forEach((x0) => {
      g.fillStyle = "rgba(190,225,255,.28)";
      g.fillRect(x0 + 1, y0 + 1, fw - 2, fh - 2);
      P(x0, y0, fw, 1, D);
      P(x0, y0 + fh - 1, fw, 1, D);
      P(x0, y0, 1, fh, D);
      P(x0 + fw - 1, y0, 1, fh, D);
      P(x0 + 1, y0 + 1, 2, 1, "#ffffff");
    });
    P(xs[0] + fw, y0 + 2, xs[1] - xs[0] - fw, 1, D);
    P(xs[0] - 2, y0 + 2, 2, 1, D);
    P(xs[1] + fw, y0 + 2, 2, 1, D);
  } else if (n === "goggles") {
    P(ex - d * 1.15, ey - d * 0.12, d * 2.3, d * 0.22, "#3a3f5a");
    const fw = Math.round(d * 0.74),
      fh = Math.round(d * 0.58);
    [ex - d / 2, ex + d / 2].forEach((c) => {
      const x0 = Math.round(c - fw / 2),
        y0 = Math.round(ey - fh / 2);
      P(x0, y0, fw, fh, D);
      P(x0 + 1, y0 + 1, fw - 2, fh - 2, "#ff9f45");
      P(x0 + 2, y0 + 2, fw - 4, fh - 4, "#2b6fd6");
      P(x0 + 2, y0 + 2, 2, 2, "#9fd0ff");
    });
  } else if (n === "headphones" && k !== "explorer") {
    const rx = d * 1.22,
      cy = ey + d * 0.12,
      ry = d * 1.75;
    for (let a = 0; a <= Math.PI; a += 0.06) {
      const x = ex + Math.cos(a) * rx,
        y = cy - Math.sin(a) * ry;
      P(x - 1, y - 1, 3, 3, D);
    }
    for (let a = 0.1; a <= Math.PI - 0.1; a += 0.06) {
      const x = ex + Math.cos(a) * rx,
        y = cy - Math.sin(a) * ry;
      P(x, y, 1, 1, "#6a7090");
    }
    const cw = Math.round(d * 0.42),
      ch = Math.round(d * 0.62);
    [ex - rx - cw / 2, ex + rx - cw / 2].forEach((x0) => {
      P(x0, cy - ch / 2, cw, ch, D);
      P(x0 + 1, cy - ch / 2 + 1, cw - 2, ch - 2, "#4a5070");
      P(x0 + 1, cy - ch / 2 + 2, cw - 2, 2, "#ff5d73");
    });
  }
}
function drawMira(c, x, y, sc, o) {
  const cv2 = charCanvas(S);
  if (!cv2) return;
  const meta = ART[charOf(S)];
  const k = o.k || 2;
  const tr = c.getTransform();
  const a = Math.hypot(tr.a, tr.b) || 1;
  const s2 = Math.max(1, Math.round(((76 * k) / meta.h) * a)) / a;
  const t = o.still ? 0 : R.t;
  const walking = o.mode === "walk",
    asleep = o.mode === "sleep";
  const W = cv2.width,
    H = cv2.height;
  const hip = Math.round(CMT + meta.h * 0.8);
  const fr = Math.floor(t * 8) % 4;
  let up = 0,
    lL = 0,
    lR = 0;
  if (walking) {
    lL = fr === 0 ? -2 : 0;
    lR = fr === 2 ? -2 : 0;
    up = fr % 2 === 0 ? -1 : 0;
  } else if (!asleep && !o.still && !A.rm) up = Math.floor(t * 1.4) % 2 ? -1 : 0;
  c.save();
  c.imageSmoothingEnabled = false;
  c.translate(Math.round(x * a) / a, Math.round(y * a) / a);
  c.scale((o.dir || 1) * s2, s2);
  const ox = -Math.round(W / 2);
  if (!asleep) {
    c.fillStyle = "rgba(0,0,0,.28)";
    c.fillRect(ox + Math.round(W * 0.22), -2, Math.round(W * 0.56), 3);
  }
  const hw = Math.round(W / 2);
  c.drawImage(
    cv2,
    0,
    hip,
    hw,
    H - hip,
    ox + (walking ? (fr === 0 ? 1 : fr === 2 ? -1 : 0) : 0),
    -H + hip + lL,
    hw,
    H - hip,
  );
  c.drawImage(
    cv2,
    hw,
    hip,
    W - hw,
    H - hip,
    ox + hw + (walking ? (fr === 2 ? 1 : fr === 0 ? -1 : 0) : 0),
    -H + hip + lR,
    W - hw,
    H - hip,
  );
  c.drawImage(cv2, 0, 0, W, hip, ox, -H + up, W, hip);
  const blink = asleep || (!o.still && t % 3.7 > 3.56);
  if (blink && cv2.skin) {
    const d = meta.d,
      ey = meta.ey + CMT - H + up;
    [meta.ex - d / 2, meta.ex + d / 2].forEach((cx) => {
      const x0 = Math.round(cx + CMX + ox - d * 0.22),
        w = Math.round(d * 0.44);
      c.fillStyle = cv2.skin;
      c.fillRect(x0, Math.round(ey - d * 0.24), w, Math.round(d * 0.46));
      c.fillStyle = "#2a1a20";
      c.fillRect(x0 + 1, Math.round(ey + d * 0.08), w - 2, 1);
    });
  }
  c.restore();
}
