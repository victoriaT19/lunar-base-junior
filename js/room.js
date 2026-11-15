const RMC = 10,
  RMR = 8,
  TW = 62,
  TH = 31,
  ROX = 455,
  ROY = 168,
  WALLH = 112;
const WALLI = new Set(["window", "poster", "brick", "polymer", "solar", "antenna"]);
const STATIONS = {
  bunk: { tiles: ["0,1", "0,2"], stand: [1.3, 2.0], label: "BUNK" },
  galley: { tiles: ["3,0", "4,0"], stand: [4.0, 1.3], label: "GALLEY" },
  console: { tiles: ["7,0", "8,0"], stand: [8.0, 1.3], label: "CONSOLE" },
};
const DOORSLOTS = ["L:5", "L:6"];
const STAND = {
  eat: [4.0, 1.3],
  sleep: [1.3, 2.0],
  missions: [8.0, 1.3],
  craft: [8.0, 1.3],
  exp: [0.6, 6.0],
};
const RESV2 = new Set([...Object.values(STATIONS).flatMap((s) => s.tiles), ...DOORSLOTS]);

if (!S.roomV) {
  S.blocks = {};
  S.roomV = 1;
}
R.cx = 3;
R.cy = 4;
R.tcx = 3;
R.tcy = 4;

function iso(c, r) {
  return [ROX + ((c - r) * TW) / 2, ROY + ((c + r) * TH) / 2];
}
function astroScreen() {
  return iso(R.cx, R.cy);
}
function shade2(hex, k) {
  const n = parseInt(hex.slice(1), 16);
  const f = (v) => Math.max(0, Math.min(255, Math.round(v * k)));
  return `rgb(${f((n >> 16) & 255)},${f((n >> 8) & 255)},${f(n & 255)})`;
}
function poly(pts, fill, stroke) {
  ctx.beginPath();
  pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
  ctx.closePath();
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 1;
    ctx.stroke();
  }
}
function isoBox(c, r, w, d, z0, h, col) {
  const up = (p, z) => [p[0], p[1] - z];
  const a = iso(c, r),
    b = iso(c + w, r),
    e = iso(c + w, r + d),
    f = iso(c, r + d);
  const top = [up(a, z0 + h), up(b, z0 + h), up(e, z0 + h), up(f, z0 + h)];
  poly([up(f, z0), up(e, z0), up(e, z0 + h), up(f, z0 + h)], shade2(col, 0.72), "#1a1020");
  poly([up(e, z0), up(b, z0), up(b, z0 + h), up(e, z0 + h)], shade2(col, 0.86), "#1a1020");
  poly(top, col, "#1a1020");
  return top;
}

function drawSky(t) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "#02030f");
  g.addColorStop(0.6, "#0c1235");
  g.addColorStop(1, "#141a4d");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 90; i++) {
    const sx = (i * 137.5) % W,
      sy = (i * 61.3) % 330;
    ctx.globalAlpha = 0.35 + 0.55 * Math.sin(t / 500 + i);
    ctx.fillStyle = "#fff";
    ctx.fillRect(sx, sy, 1.6, 1.6);
  }
  ctx.globalAlpha = 1;
  ctx.save();
  ctx.beginPath();
  ctx.arc(850, 230, 25, 0, 7);
  ctx.clip();
  ctx.fillStyle = "#2f6fe0";
  ctx.fillRect(820, 200, 60, 60);
  ctx.fillStyle = "#4cd37a";
  for (let k = 0; k < 3; k++) {
    const cx0 = 850 + (((t / 90 + k * 34) % 100) - 50);
    ctx.beginPath();
    ctx.ellipse(cx0, 224 + k * 7, 14, 8, 0, 0, 7);
    ctx.fill();
  }
  ctx.restore();
  ctx.fillStyle = "#6f7390";
  ctx.beginPath();
  ctx.ellipse(ROX + 40, ROY + 300, 520, 150, 0, 0, 7);
  ctx.fill();
  ctx.fillStyle = "#5d6180";
  [
    [150, 470, 50],
    [790, 440, 60],
    [640, 500, 34],
  ].forEach(([x, y, r]) => {
    ctx.beginPath();
    ctx.ellipse(x, y, r, r * 0.35, 0, 0, 7);
    ctx.fill();
  });
}

function wallFace(side, i, fn) {
  ctx.save();
  if (side === "R") {
    const p = iso(i, 0);
    ctx.translate(p[0], p[1]);
    ctx.transform(1, 0.5, 0, 1, 0, 0);
  } else {
    const p = iso(0, i + 1);
    ctx.translate(p[0], p[1]);
    ctx.transform(1, -0.5, 0, 1, 0, 0);
  }
  fn(TW / 2);
  ctx.restore();
}
function drawWallItem(id, w, t) {
  const Q = (x, y, ww, hh, c) => {
    ctx.fillStyle = c;
    ctx.fillRect(x, y, ww, hh);
  };
  if (id === "window") {
    Q(3, -86, w - 6, 44, "#1a1020");
    Q(5, -84, w - 10, 40, "#0a0f33");
    Q(9, -78, 2, 2, "#fff");
    Q(18, -62, 2, 2, "#fff");
    Q(12, -56, 8, 8, "#2f6fe0");
    Q(13, -55, 4, 3, "#4cd37a");
    Q(5, -64, w - 10, 2, "#8f97bd");
  } else if (id === "poster") {
    Q(5, -84, w - 10, 34, "#1a1020");
    Q(7, -82, w - 14, 30, "#f4f6ff");
    Q(10, -78, w - 20, 18, "#2f6fe0");
    Q(13, -73, 6, 5, "#4cd37a");
  } else if (id === "brick") {
    Q(1, -WALLH + 8, w - 2, WALLH - 10, "#8f8575");
    for (let y = -WALLH + 8; y < 0; y += 12) Q(1, y, w - 2, 1, "#5c5446");
  } else if (id === "polymer") {
    Q(1, -WALLH + 8, w - 2, WALLH - 10, "#7b4fd0");
    Q(4, -WALLH + 12, w - 8, WALLH - 18, "#9a70f0");
    ctx.fillStyle = "#e8dcff";
    ctx.font = "bold 14px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("H", w / 2, -48);
  } else if (id === "solar") {
    Q(3, -90, w - 6, 40, "#1a1020");
    for (let j = 0; j < 3; j++)
      for (let i = 0; i < 2; i++)
        Q(5 + i * 11, -88 + j * 13, 10, 12, j % 2 === i % 2 ? "#2d5bd6" : "#3a6ff0");
    Q(w / 2 - 1, -50, 2, 14, "#8f97bd");
  } else if (id === "antenna") {
    ctx.strokeStyle = "#cfd6ff";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(w / 2, -70, 10, Math.PI * 0.1, Math.PI * 0.9);
    ctx.stroke();
    Q(w / 2 - 1, -70, 2, 24, "#cfd6ff");
    Q(w / 2 - 2, -84, 4, 4, Math.sin(t / 200) > 0 ? "#ff5d73" : "#7a1630");
  }
}
function drawRoomWalls(t) {
  const wallTop = (p) => [p[0], p[1] - WALLH];
  const a = iso(0, 0),
    b = iso(RMC, 0),
    f = iso(0, RMR);
  poly([wallTop(f), wallTop(a), [a[0], a[1] - WALLH - 10], [f[0], f[1] - WALLH - 10]], "#3a4170");
  poly([wallTop(a), wallTop(b), [b[0], b[1] - WALLH - 10], [a[0], a[1] - WALLH - 10]], "#454d82");
  poly([f, a, wallTop(a), wallTop(f)], "#5d6496", "#1a1020");
  poly([a, b, wallTop(b), wallTop(a)], "#6b72a8", "#1a1020");
  for (let i = 0; i < RMC; i++)
    wallFace("R", i, (w) => {
      ctx.fillStyle = "rgba(0,0,0,.12)";
      ctx.fillRect(w - 1, -WALLH, 1, WALLH);
      ctx.fillStyle = "#8a90c8";
      ctx.fillRect(3, -WALLH + 6, 2, 2);
      ctx.fillStyle = i % 2 ? "#3fd8f5" : "#7bd88f";
      ctx.fillRect(w / 2 - 3, -WALLH + 14, 6, 2);
    });
  for (let i = 0; i < RMR; i++)
    wallFace("L", i, (w) => {
      ctx.fillStyle = "rgba(0,0,0,.14)";
      ctx.fillRect(w - 1, -WALLH, 1, WALLH);
      ctx.fillStyle = "#7a80b8";
      ctx.fillRect(3, -WALLH + 6, 2, 2);
    });
  for (const k in S.blocks) {
    if (!k.includes(":")) continue;
    const [side, i] = k.split(":");
    wallFace(side, +i, (w) => drawWallItem(S.blocks[k], w, t));
  }
  wallFace("L", 5, (w) => {
    const op = R.door;
    ctx.fillStyle = "#1a1020";
    ctx.fillRect(-w + 4, -92, w * 2 - 8, 92);
    ctx.fillStyle = "#0a0f33";
    ctx.fillRect(-w + 6, -90, w * 2 - 12, 90);
    ctx.fillStyle = "#ff9f45";
    ctx.fillRect(-w + 6, -90 + op * 84, w * 2 - 12, 90 - op * 84);
    ctx.fillStyle = "#1b2368";
    ctx.fillRect(-10, -76 + op * 84, 20, 16);
    ctx.fillStyle = R.leave > 0 ? "#ff5d73" : Math.sin(t / 300) > 0 ? "#7bd88f" : "#2d6b3f";
    ctx.fillRect(-4, -100, 8, 5);
  });
  const lp = iso(0, 6);
  ctx.fillStyle = "#fff";
  ctx.font = "bold 9px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("AIRLOCK", lp[0] - 8, lp[1] - 104);
}
function drawFloor() {
  for (let r = 0; r < RMR; r++)
    for (let c = 0; c < RMC; c++)
      poly(
        [iso(c, r), iso(c + 1, r), iso(c + 1, r + 1), iso(c, r + 1)],
        (c + r) % 2 ? "#585e8c" : "#636a9a",
        "rgba(26,16,32,.35)",
      );
  const f = iso(0, RMR),
    e = iso(RMC, RMR),
    b = iso(RMC, 0);
  poly([f, e, [e[0], e[1] + 10], [f[0], f[1] + 10]], "#3a4170", "#1a1020");
  poly([e, b, [b[0], b[1] + 10], [e[0], e[1] + 10]], "#454d82", "#1a1020");
}
function floorItemDraw(id, c, r, t) {
  if (id === "bed") {
    const top = isoBox(c + 0.1, r + 0.1, 0.8, 0.8, 0, 10, "#ff9f45");
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
    ctx.fillStyle = "#ff9f45";
    ctx.fillRect(p[0] - 5, p[1] - 24, 10, 5);
  } else if (id === "lamp") {
    const p = iso(c + 0.5, r + 0.5);
    ctx.fillStyle = "rgba(255,216,74,.12)";
    ctx.beginPath();
    ctx.ellipse(p[0], p[1], 34, 17, 0, 0, 7);
    ctx.fill();
    isoBox(c + 0.4, r + 0.4, 0.2, 0.2, 0, 4, "#3a3f5a");
    ctx.fillStyle = "#8f97bd";
    ctx.fillRect(p[0] - 1, p[1] - 36, 2, 34);
    ctx.fillStyle = "#1a1020";
    ctx.fillRect(p[0] - 8, p[1] - 44, 16, 9);
    ctx.fillStyle = "#ffd84a";
    ctx.fillRect(p[0] - 7, p[1] - 43, 14, 7);
  } else if (id === "plant") {
    isoBox(c + 0.25, r + 0.25, 0.5, 0.5, 0, 10, "#c4622d");
    const p = iso(c + 0.5, r + 0.5);
    [
      [-7, -18, 9],
      [6, -20, 8],
      [0, -27, 9],
      [-3, -34, 6],
    ].forEach(([dx, dy, s]) => {
      ctx.fillStyle = "#1a3a1a";
      ctx.fillRect(p[0] + dx - s / 2 - 1, p[1] + dy - s / 2 - 1, s + 2, s + 2);
      ctx.fillStyle = "#5fd36a";
      ctx.fillRect(p[0] + dx - s / 2, p[1] + dy - s / 2, s, s);
    });
  } else if (id === "flag") {
    const p = iso(c + 0.5, r + 0.5);
    ctx.fillStyle = "#cfd6ff";
    ctx.fillRect(p[0] - 1, p[1] - 48, 2, 48);
    const w = Math.sin(t / 300) * 2;
    ctx.fillStyle = "#f4f6ff";
    ctx.beginPath();
    ctx.moveTo(p[0] + 1, p[1] - 48);
    ctx.lineTo(p[0] + 22, p[1] - 46 + w);
    ctx.lineTo(p[0] + 22, p[1] - 34 + w);
    ctx.lineTo(p[0] + 1, p[1] - 34);
    ctx.fill();
  }
}
function stationDraw(k, t) {
  if (k === "bunk") {
    isoBox(0.05, 1.05, 0.9, 1.9, 0, 14, "#3a3f5a");
    isoBox(0.1, 1.1, 0.8, 1.8, 14, 6, "#ff9f45");
    isoBox(0.15, 1.15, 0.7, 0.4, 20, 4, "#f4f6ff");
  } else if (k === "galley") {
    isoBox(3.05, 0.05, 1.9, 0.9, 0, 30, "#c9cee8");
    const top = iso(3.6, 0.5);
    isoBox(3.15, 0.1, 0.6, 0.8, 30, 20, "#eef1ff");
    ctx.fillStyle = "#1a1020";
    ctx.font = "bold 9px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("🍲 " + S.rations, top[0] + 30, top[1] - 26);
  } else if (k === "console") {
    isoBox(7.05, 0.05, 1.9, 0.9, 0, 24, "#454d82");
    wallFace("R", 7, (w) => {
      ctx.fillStyle = "#1a1020";
      ctx.fillRect(4, -78, w * 2 - 8, 40);
      ctx.fillStyle = R.fault ? (Math.sin(t / 120) > 0 ? "#ff5d73" : "#5a1630") : "#103a5a";
      ctx.fillRect(6, -76, w * 2 - 12, 36);
      ctx.strokeStyle = "#3fd8f5";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let i = 0; i < 20; i++) {
        const x = 8 + i * 2.4,
          y = -58 + Math.sin(t / 260 + i * 0.5) * 7;
        i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      if (!R.fault) ctx.stroke();
    });
  }
  const s = STATIONS[k];
  const p = iso(s.stand[0], s.stand[1] + 0.6);
  ctx.fillStyle = "rgba(255,255,255,.85)";
  ctx.font = "bold 9px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(s.label, p[0], p[1] + 12);
}
function drawAstro(t) {
  const [sx, sy] = astroScreen();
  R.x = sx;
  R.sy = sy;
  if (R.mode === "sleep") {
    const p = iso(0.5, 2.75);
    ctx.save();
    ctx.translate(p[0], p[1] - 22);
    ctx.rotate(Math.atan2(-TH / 2, TW / 2) + Math.PI / 2);
    drawMira(ctx, 0, 0, 0.8, { mode: "sleep", dir: 1, k: 0.95 });
    ctx.restore();
    isoBox(0.12, 1.9, 0.76, 0.95, 20, 5, "#4cc9f0");
    ctx.fillStyle = "#fff";
    ctx.font = "bold 18px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("z", p[0] + 20, p[1] - 70 - ((t / 10) % 20));
    ctx.fillText("Z", p[0] + 34, p[1] - 90 - ((t / 12) % 20));
    return;
  }
  const fade = R.leave > 0 ? Math.max(0, R.leave / 1.4) : 1;
  ctx.globalAlpha = fade;
  drawMira(ctx, sx, sy + 4, 0.95, { mode: R.mode, dir: R.dir, k: 1.35 });
  ctx.globalAlpha = 1;
}
function drawKai(t) {
  const tx = R.x - R.dir * 40,
    ty = R.sy - 128 + Math.sin(t / 380) * 6;
  R.px += (tx - R.px) * 0.05;
  R.py += (ty - R.py) * 0.05;
  const x = R.px,
    y = R.py;
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = "rgba(255,255,255,.5)";
  ctx.lineWidth = 2;
  const sp = Math.sin(t / 20) * 10;
  ctx.beginPath();
  ctx.moveTo(-14 - sp / 2, -11);
  ctx.lineTo(14 + sp / 2, -11);
  ctx.stroke();
  ctx.fillStyle = "#cfd6ff";
  ctx.beginPath();
  ctx.ellipse(0, 0, 13, 9, 0, 0, 7);
  ctx.fill();
  ctx.fillStyle = "#555b7a";
  ctx.fillRect(-13, 2, 26, 3);
  ctx.fillStyle = R.fault ? (Math.sin(t / 120) > 0 ? "#ff5d73" : "#7a1630") : "#4cc9f0";
  const bl = t % 3500 > 3380;
  ctx.beginPath();
  ctx.ellipse(R.dir * 4, -1, 5, bl ? 1 : 5, 0, 0, 7);
  ctx.fill();
  ctx.restore();
}
function drawHub(t) {
  ctx.clearRect(0, 0, W, H);
  drawSky(t);
  drawFloor();
  drawRoomWalls(t);
  const list = [];
  for (const k in S.blocks) {
    if (k.includes(":")) continue;
    const [c, r] = k.split(",").map(Number);
    list.push({ d: c + r + 0.5, f: () => floorItemDraw(S.blocks[k], c, r, t) });
  }
  Object.keys(STATIONS).forEach((k) => {
    const s = STATIONS[k];
    const [c, r] = s.tiles[s.tiles.length - 1].split(",").map(Number);
    list.push({ d: c + r + 0.4, f: () => stationDraw(k, t) });
  });
  list.push({ d: R.cx + R.cy, f: () => drawAstro(t) });
  list.sort((a, b) => a.d - b.d).forEach((o) => o.f());
  drawKai(t);
  if (R.build && R.hover) drawHover(t);
  if (R.bub && R.bubT > 0 && R.mode !== "sleep") {
    ctx.font = "bold 13px sans-serif";
    const w = ctx.measureText(R.bub).width + 22;
    const bxp = clamp(R.x - w / 2, 10, W - w - 10),
      byp = R.sy - 170;
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.roundRect(bxp, byp, w, 28, 10);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(R.x - 6, byp + 28);
    ctx.lineTo(R.x, byp + 38);
    ctx.lineTo(R.x + 6, byp + 28);
    ctx.fill();
    ctx.fillStyle = "#1b1b2f";
    ctx.textAlign = "left";
    ctx.fillText(R.bub, bxp + 11, byp + 19);
  }
  R.hearts.forEach((h) => {
    ctx.globalAlpha = Math.min(1, h.l * 2);
    ctx.font = "22px serif";
    ctx.textAlign = "center";
    ctx.fillText(h.e, h.x, h.y);
  });
  ctx.globalAlpha = 1;
  const st = R.storm;
  if (st.state === 2) {
    ctx.fillStyle = "rgba(255,150,30,.12)";
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = "rgba(255,210,90,.8)";
    ctx.lineWidth = 2;
    for (let i = 0; i < 30; i++) {
      const sx = (i * 53 + t * 0.1) % W,
        sy = ((t * 0.8 + i * 41) % 160) * 1.2;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(sx - 7, sy + 14);
      ctx.stroke();
    }
  }
  if (R.fault || st.state === 1) {
    ctx.fillStyle = `rgba(255,0,40,${0.03 + 0.05 * Math.abs(Math.sin(t / 220))})`;
    ctx.fillRect(0, 0, W, H);
  }
  ctx.textAlign = "left";
}
function drawHover(t) {
  const hv = R.hover;
  const wallTool =
    WALLI.has(R.tool) ||
    (R.tool.startsWith("mod:") && MODS[R.tool].cells.every((x) => WALLI.has(x[2])));
  if (hv.k.includes(":")) {
    const [side, i] = hv.k.split(":");
    const ok =
      R.tool === "erase"
        ? !!S.blocks[hv.k] && !RESV2.has(hv.k)
        : wallTool && !S.blocks[hv.k] && !RESV2.has(hv.k);
    wallFace(side, +i, (w) => {
      ctx.fillStyle = ok ? "rgba(123,216,143,.35)" : "rgba(255,93,115,.35)";
      ctx.fillRect(0, -WALLH, w, WALLH);
      if (ok && R.tool !== "erase" && WALLI.has(R.tool)) {
        ctx.globalAlpha = 0.7;
        drawWallItem(R.tool, w, t);
        ctx.globalAlpha = 1;
      }
    });
  } else {
    const [c, r] = hv.k.split(",").map(Number);
    const ok =
      R.tool === "erase" ? !!S.blocks[hv.k] : !wallTool && !S.blocks[hv.k] && !RESV2.has(hv.k);
    poly(
      [iso(c, r), iso(c + 1, r), iso(c + 1, r + 1), iso(c, r + 1)],
      ok ? "rgba(123,216,143,.4)" : "rgba(255,93,115,.4)",
      "#fff",
    );
    if (ok && R.tool !== "erase" && !wallTool && BLK[R.tool]) {
      ctx.globalAlpha = 0.7;
      floorItemDraw(R.tool, c, r, t);
      ctx.globalAlpha = 1;
    }
  }
}
function pickRoom(ev) {
  const rc = cv.getBoundingClientRect();
  const x = ((ev.clientX - rc.left) / rc.width) * W,
    y = ((ev.clientY - rc.top) / rc.height) * H;
  const fx = (x - ROX) / (TW / 2),
    fy = (y - ROY) / (TH / 2);
  const c = (fx + fy) / 2,
    r = (fy - fx) / 2;
  if (c >= 0 && c < RMC && r >= 0 && r < RMR)
    return { k: Math.floor(c) + "," + Math.floor(r), c, r, x, y };
  if (x >= ROX && x < ROX + (RMC * TW) / 2) {
    const u = (x - ROX) / (TW / 2);
    const by = ROY + (u * TH) / 2;
    if (y <= by && y >= by - WALLH) return { k: "R:" + Math.floor(u), x, y };
  }
  if (x < ROX && x >= ROX - (RMR * TW) / 2) {
    const u = (ROX - x) / (TW / 2);
    const by = ROY + (u * TH) / 2;
    if (y <= by && y >= by - WALLH) return { k: "L:" + Math.floor(u), x, y };
  }
  return { k: null, x, y };
}
function freeWallSlots() {
  const out = [];
  for (let i = 0; i < RMC; i++) out.push("R:" + i);
  for (let i = 0; i < RMR; i++) out.push("L:" + i);
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
  if (Math.abs(p.x - R.x) < 26 && p.y > R.sy - 110 && p.y < R.sy + 6) {
    doAct("pet");
    return;
  }
  if (!p.k) return;
  if (p.k === "L:5" || p.k === "L:6") {
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
    R.tcx = clamp(p.c, 0.4, RMC - 0.4);
    R.tcy = clamp(p.r, 0.4, RMR - 0.4);
  }
});
function moveAstro(dt) {
  if (R.mode !== "walk" && R.mode !== "idle" && R.mode !== "wave") return;
  const dx = R.tcx - R.cx,
    dy = R.tcy - R.cy;
  const dist = Math.hypot(dx, dy);
  if (dist > 0.06 && R.mode !== "wave") {
    const sp = Math.min(dist, 2.6 * dt);
    R.cx += (dx / dist) * sp;
    R.cy += (dy / dist) * sp;
    const sdx = dx - dy;
    if (Math.abs(sdx) > 0.01) R.dir = sdx > 0 ? 1 : -1;
    R.mode = "walk";
  } else {
    if (R.mode === "walk") R.mode = "idle";
    if (R.act && R.mode === "idle") {
      const a = R.act;
      R.act = null;
      arrive(a);
    }
  }
}
