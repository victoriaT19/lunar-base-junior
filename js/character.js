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
function halfCanvas(L) {
  const full = charCanvas(L);
  if (!full) return null;
  if (full.half) return full.half;
  const w = Math.ceil(full.width / 2),
    h = Math.ceil(full.height / 2);
  const src = full.getContext("2d").getImageData(0, 0, full.width, full.height).data;
  const out = document.createElement("canvas");
  out.width = w;
  out.height = h;
  const og = out.getContext("2d");
  const im = og.createImageData(w, h);
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const cols = [];
      for (let dy = 0; dy < 2; dy++)
        for (let dx = 0; dx < 2; dx++) {
          const sx = x * 2 + dx,
            sy = y * 2 + dy;
          if (sx >= full.width || sy >= full.height) continue;
          const p = (sy * full.width + sx) * 4;
          if (src[p + 3] > 0) cols.push([src[p], src[p + 1], src[p + 2]]);
        }
      if (cols.length < 2) continue;
      const cnt = {};
      let best = null,
        bn = 0;
      cols.forEach((c) => {
        const k = c.join(",");
        cnt[k] = (cnt[k] || 0) + 1;
        const lum = c[0] * 0.3 + c[1] * 0.59 + c[2] * 0.11;
        const sc = cnt[k] * 1000 - lum;
        if (sc > bn || !best) {
          bn = sc;
          best = c;
        }
      });
      const dark = cols.filter((c) => c[0] * 0.3 + c[1] * 0.59 + c[2] * 0.11 < 45);
      const pick = dark.length >= 2 ? dark[0] : best;
      const q = (y * w + x) * 4;
      im.data[q] = pick[0];
      im.data[q + 1] = pick[1];
      im.data[q + 2] = pick[2];
      im.data[q + 3] = 255;
    }
  og.putImageData(im, 0, 0);
  out.skin = full.skin;
  full.half = out;
  return out;
}
function spriteOf(L, half) {
  const m = ART[charOf(L)];
  const cv2 = half ? halfCanvas(L) : charCanvas(L);
  if (!cv2) return null;
  const f = half ? 0.5 : 1;
  return { cv: cv2, h: m.h * f, d: m.d * f, ex: m.ex * f, ey: m.ey * f, mx: CMX * f, mt: CMT * f };
}
function drawMira(c, x, y, sc, o) {
  const sp = spriteOf(S, !!o.half);
  if (!sp) return;
  const cv2 = sp.cv;
  const k = o.k || 2;
  const tr = c.getTransform();
  const a = Math.hypot(tr.a, tr.b) || 1;
  const s2 = Math.max(1, Math.round(((76 * k) / sp.h) * a)) / a;
  const t = o.still ? 0 : R.t;
  const walking = o.mode === "walk",
    asleep = o.mode === "sleep";
  const W2 = cv2.width,
    H2 = cv2.height;
  const hip = Math.round(sp.mt + sp.h * 0.8);
  const fr = Math.floor(t * 8) % 4;
  const st = o.half ? 1 : 2;
  let up = 0,
    lL = 0,
    lR = 0;
  if (walking) {
    lL = fr === 0 ? -st : 0;
    lR = fr === 2 ? -st : 0;
    up = fr % 2 === 0 ? -1 : 0;
  } else if (!asleep && !o.still && !A.rm) up = Math.floor(t * 1.4) % 2 ? -1 : 0;
  c.save();
  c.imageSmoothingEnabled = false;
  c.translate(Math.round(x * a) / a, Math.round(y * a) / a);
  c.scale((o.dir || 1) * s2, s2);
  const ox = -Math.round(W2 / 2);
  if (!asleep) {
    c.fillStyle = "rgba(0,0,0,.3)";
    c.fillRect(ox + Math.round(W2 * 0.22), -2, Math.round(W2 * 0.56), o.half ? 2 : 3);
  }
  const hw = Math.round(W2 / 2);
  const sh = walking ? 1 : 0;
  c.drawImage(
    cv2,
    0,
    hip,
    hw,
    H2 - hip,
    ox + (fr === 0 ? sh : fr === 2 ? -sh : 0),
    -H2 + hip + lL,
    hw,
    H2 - hip,
  );
  c.drawImage(
    cv2,
    hw,
    hip,
    W2 - hw,
    H2 - hip,
    ox + hw + (fr === 2 ? sh : fr === 0 ? -sh : 0),
    -H2 + hip + lR,
    W2 - hw,
    H2 - hip,
  );
  c.drawImage(cv2, 0, 0, W2, hip, ox, -H2 + up, W2, hip);
  const blink = asleep || (!o.still && t % 3.7 > 3.56);
  if (blink && cv2.skin) {
    const d = sp.d,
      ey = sp.ey + sp.mt - H2 + up;
    [sp.ex - d / 2, sp.ex + d / 2].forEach((cx) => {
      const x0 = Math.round(cx + sp.mx + ox - d * 0.22),
        w = Math.max(2, Math.round(d * 0.44));
      c.fillStyle = cv2.skin;
      c.fillRect(x0, Math.round(ey - d * 0.24), w, Math.max(2, Math.round(d * 0.46)));
      c.fillStyle = "#2a1a20";
      c.fillRect(x0, Math.round(ey + d * 0.08), w, 1);
    });
  }
  c.restore();
}
function drawSleepHead(c, x, y) {
  const sp = spriteOf(S, true);
  if (!sp) return;
  const d = sp.d,
    ex = sp.ex + sp.mx,
    ey = sp.ey + sp.mt;
  const sx = Math.max(0, Math.round(ex - d * 1.45)),
    sy = Math.max(0, Math.round(ey - d * 1.9)),
    sw = Math.round(d * 2.9),
    shh = Math.round(d * 2.6);
  c.save();
  c.imageSmoothingEnabled = false;
  c.drawImage(sp.cv, sx, sy, sw, shh, Math.round(x - sw / 2), Math.round(y - shh), sw, shh);
  if (sp.cv.skin)
    [ex - d / 2, ex + d / 2].forEach((cx) => {
      const x0 = Math.round(x - sw / 2 + (cx - sx) - d * 0.22),
        w = Math.max(2, Math.round(d * 0.44));
      const yy = Math.round(y - shh + (ey - sy));
      c.fillStyle = sp.cv.skin;
      c.fillRect(x0, yy - Math.round(d * 0.24), w, Math.max(2, Math.round(d * 0.46)));
      c.fillStyle = "#2a1a20";
      c.fillRect(x0, yy + 1, w, 1);
    });
  c.restore();
}
