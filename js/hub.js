function blockXY(c, r) {
  return [GX + c * CELL, GY + r * CELL];
}
function drawBlock(c, id, x, y, t) {
  c.save();
  c.translate(x, y);
  if (id === "brick") {
    c.fillStyle = "#8f8575";
    c.fillRect(1, 1, CELL - 2, CELL - 2);
    c.strokeStyle = "#5c5446";
    c.lineWidth = 2;
    c.strokeRect(1, 1, CELL - 2, CELL - 2);
    c.beginPath();
    c.moveTo(1, CELL / 2);
    c.lineTo(CELL - 1, CELL / 2);
    c.moveTo(CELL / 2, 1);
    c.lineTo(CELL / 2, CELL / 2);
    c.moveTo(CELL / 4, CELL / 2);
    c.lineTo(CELL / 4, CELL - 1);
    c.stroke();
  } else if (id === "polymer") {
    c.fillStyle = "#7b4fd0";
    c.fillRect(1, 1, CELL - 2, CELL - 2);
    c.strokeStyle = "#d9c6ff";
    c.lineWidth = 2;
    c.strokeRect(5, 5, CELL - 10, CELL - 10);
    c.fillStyle = "#e8dcff";
    c.font = "bold 18px sans-serif";
    c.textAlign = "center";
    c.fillText("H", CELL / 2, CELL / 2 + 6);
  } else if (id === "window") {
    c.fillStyle = "#cfd6ff";
    c.fillRect(4, 4, CELL - 8, CELL - 8);
    c.fillStyle = "#04061a";
    c.fillRect(8, 8, CELL - 16, CELL - 16);
    c.fillStyle = "#4f8cff";
    c.beginPath();
    c.arc(CELL / 2 + 4, CELL / 2, 9, 0, 7);
    c.fill();
    c.fillStyle = "#4cd37a";
    c.beginPath();
    c.arc(CELL / 2 + 1 + Math.sin(t / 3000) * 3, CELL / 2 - 3, 4, 0, 7);
    c.fill();
  } else if (id === "solar") {
    c.fillStyle = "#cfd6ff";
    c.fillRect(CELL / 2 - 2, CELL - 14, 4, 14);
    c.save();
    c.translate(CELL / 2, CELL - 14);
    c.rotate(Math.sin(t / 2500) * 0.12);
    c.fillStyle = "#2a56d8";
    c.fillRect(-CELL / 2 + 3, -CELL + 22, CELL - 6, CELL - 26);
    c.strokeStyle = "#9bb4ff";
    c.lineWidth = 1;
    for (let i = 1; i < 4; i++) {
      c.beginPath();
      c.moveTo(-CELL / 2 + 3 + (i * (CELL - 6)) / 4, -CELL + 22);
      c.lineTo(-CELL / 2 + 3 + (i * (CELL - 6)) / 4, -4);
      c.stroke();
    }
    c.restore();
  } else if (id === "plant") {
    c.fillStyle = "#6b4a2a";
    c.fillRect(6, CELL - 20, CELL - 12, 20);
    c.fillStyle = "#3a8a3a";
    for (let i = 0; i < 3; i++) {
      c.save();
      c.translate(14 + i * 14, CELL - 20);
      c.rotate(Math.sin(t / 500 + i) * 0.12);
      c.beginPath();
      c.ellipse(0, -12, 6, 13, 0, 0, 7);
      c.fill();
      c.restore();
    }
  } else if (id === "bed") {
    c.fillStyle = "#555b7a";
    c.fillRect(3, CELL - 22, CELL - 6, 22);
    c.fillStyle = S.suit;
    c.fillRect(5, CELL - 30, CELL - 12, 12);
    c.fillStyle = "#e8ecff";
    c.fillRect(6, CELL - 34, 16, 8);
  } else if (id === "lamp") {
    const g = c.createRadialGradient(CELL / 2, 14, 2, CELL / 2, 14, 40);
    g.addColorStop(0, "rgba(255,230,140,.55)");
    g.addColorStop(1, "rgba(255,230,140,0)");
    c.fillStyle = g;
    c.fillRect(-20, -20, CELL + 40, CELL + 40);
    c.fillStyle = "#ffd166";
    c.beginPath();
    c.arc(CELL / 2, 14, 7, 0, 7);
    c.fill();
    c.strokeStyle = "#cfd6ff";
    c.lineWidth = 2;
    c.beginPath();
    c.moveTo(CELL / 2, 0);
    c.lineTo(CELL / 2, 7);
    c.stroke();
  } else if (id === "poster") {
    c.fillStyle = "#f5f0e0";
    c.fillRect(8, 6, CELL - 16, CELL - 12);
    c.fillStyle = "#1b2468";
    c.fillRect(11, 9, CELL - 22, CELL - 24);
    c.fillStyle = "#4f8cff";
    c.beginPath();
    c.arc(CELL / 2, CELL / 2 - 3, 8, 0, 7);
    c.fill();
  } else if (id === "antenna") {
    c.strokeStyle = "#cfd6ff";
    c.lineWidth = 3;
    c.beginPath();
    c.moveTo(CELL / 2, CELL);
    c.lineTo(CELL / 2, 10);
    c.stroke();
    c.beginPath();
    c.arc(CELL / 2, 10, 12, Math.PI * 1.15, Math.PI * 1.85);
    c.stroke();
    c.fillStyle = Math.sin(t / 200) > 0 ? "#ff5d73" : "#7a1630";
    c.beginPath();
    c.arc(CELL / 2, 8, 3, 0, 7);
    c.fill();
  } else if (id === "table") {
    c.fillStyle = "#1a1020";
    c.fillRect(4, CELL - 30, CELL - 8, 8);
    c.fillStyle = "#c98a4a";
    c.fillRect(5, CELL - 29, CELL - 10, 5);
    c.fillStyle = "#8a5a2a";
    c.fillRect(9, CELL - 22, 5, 22);
    c.fillRect(CELL - 14, CELL - 22, 5, 22);
    c.fillStyle = "#ff9f45";
    c.fillRect(CELL / 2 - 6, CELL - 36, 12, 6);
    c.fillStyle = "#ffffff";
    c.fillRect(CELL / 2 - 8, CELL - 31, 16, 2);
  } else if (id === "flag") {
    c.strokeStyle = "#cfd6ff";
    c.lineWidth = 3;
    c.beginPath();
    c.moveTo(14, CELL);
    c.lineTo(14, 6);
    c.stroke();
    const w = Math.sin(t / 300) * 2;
    c.fillStyle = "#f4f6ff";
    c.beginPath();
    c.moveTo(14, 6);
    c.lineTo(42, 6 + w);
    c.lineTo(42, 24 + w);
    c.lineTo(14, 24);
    c.fill();
    c.fillStyle = "#c9cee8";
    c.fillRect(14, 20, 28, 4);
  }
  c.restore();
}

function drawDrone(t) {
  const dx = -R.dir * 50,
    tx = R.x + dx,
    ty = FLOORY - 168 + Math.sin(t / 380) * 7;
  R.px += (tx - R.px) * 0.05;
  R.py += (ty - R.py) * 0.05;
  const x = R.px,
    y = R.py;
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = "rgba(255,255,255,.5)";
  ctx.lineWidth = 2;
  const sp = Math.sin(t / 20) * 14;
  ctx.beginPath();
  ctx.moveTo(-18 - sp / 2, -14);
  ctx.lineTo(18 + sp / 2, -14);
  ctx.stroke();
  ctx.strokeStyle = "#9aa3c8";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, -8);
  ctx.lineTo(0, -14);
  ctx.stroke();
  ctx.fillStyle = "#cfd6ff";
  ctx.beginPath();
  ctx.ellipse(0, 0, 16, 11, 0, 0, 7);
  ctx.fill();
  ctx.fillStyle = "#555b7a";
  ctx.fillRect(-16, 2, 32, 4);
  ctx.fillStyle = R.fault ? (Math.sin(t / 120) > 0 ? "#ff5d73" : "#7a1630") : "#4cc9f0";
  const bl = t % 3500 > 3380;
  ctx.beginPath();
  ctx.ellipse(R.dir * 5, -1, 6, bl ? 1 : 6, 0, 0, 7);
  ctx.fill();
  ctx.fillStyle = "#04061a";
  ctx.beginPath();
  ctx.arc(R.dir * 5 + R.dir * (Math.sin(t / 900) * 1.5), -1, 2, 0, 7);
  ctx.fill();
  ctx.restore();
  if (R.fault) {
    ctx.fillStyle = "#ff5d73";
    ctx.font = "bold 18px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("!", x, y - 24);
  }
}

function drawHub(t) {
  ctx.clearRect(0, 0, W, H);
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "#02030f");
  g.addColorStop(0.6, "#0c1235");
  g.addColorStop(1, "#141a4d");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 80; i++) {
    const sx = (i * 137.5) % W,
      sy = (i * 61.3) % 250;
    ctx.globalAlpha = 0.35 + 0.55 * Math.sin(t / 500 + i);
    ctx.fillStyle = "#fff";
    ctx.fillRect(sx, sy, 1.6, 1.6);
  }
  ctx.globalAlpha = 1;
  ctx.save();
  ctx.beginPath();
  ctx.arc(860, 46, 25, 0, 7);
  ctx.clip();
  ctx.fillStyle = "#2f6fe0";
  ctx.fillRect(830, 16, 60, 60);
  ctx.fillStyle = "#4cd37a";
  for (let k = 0; k < 3; k++) {
    const cx0 = 860 + (((t / 90 + k * 34) % 100) - 50);
    ctx.beginPath();
    ctx.ellipse(cx0, 40 + k * 7, 14, 8, 0, 0, 7);
    ctx.fill();
  }
  ctx.fillStyle = "rgba(255,255,255,.35)";
  ctx.beginPath();
  ctx.ellipse(850, 36, 16, 5, 0.3, 0, 7);
  ctx.fill();
  const sh = ctx.createRadialGradient(850, 36, 5, 860, 46, 30);
  sh.addColorStop(0, "rgba(0,0,0,0)");
  sh.addColorStop(1, "rgba(0,0,20,.6)");
  ctx.fillStyle = sh;
  ctx.fillRect(830, 16, 60, 60);
  ctx.restore();
  ctx.fillStyle = "#7d819c";
  ctx.beginPath();
  ctx.moveTo(0, FLOORY);
  for (let x = 0; x <= W; x += 48) ctx.lineTo(x, FLOORY - 3 - Math.sin(x / 90) * 3);
  ctx.lineTo(W, H);
  ctx.lineTo(0, H);
  ctx.fill();
  ctx.fillStyle = "#5d617c";
  ctx.fillRect(0, FLOORY + 56, W, H);
  ctx.fillStyle = "rgba(40,44,70,.5)";
  [
    [120, FLOORY + 80, 40],
    [800, FLOORY + 85, 50],
    [500, FLOORY + 95, 30],
  ].forEach((a) => {
    ctx.beginPath();
    ctx.ellipse(a[0], a[1], a[2] * 1.5, a[2] * 0.4, 0, 0, 7);
    ctx.fill();
  });
  const x0 = GX + 2 * CELL,
    y0 = GY + 2 * CELL;
  ctx.fillStyle = "#232c63";
  ctx.fillRect(x0, y0, 12 * CELL, 4 * CELL);
  for (let i = 0; i < 12; i++) {
    ctx.fillStyle = i % 2 ? "rgba(255,255,255,.03)" : "rgba(255,255,255,.015)";
    ctx.fillRect(x0 + i * CELL, y0, CELL, 4 * CELL);
  }
  ctx.fillStyle = "#3b4585";
  ctx.fillRect(x0, FLOORY - 6, 12 * CELL, 6);
  ctx.strokeStyle = "#4a5598";
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(x0, y0 + 12);
  ctx.lineTo(x0 + 12 * CELL, y0 + 12);
  ctx.stroke();
  ctx.fillStyle = "#8fd3ff";
  for (let i = 0; i < 14; i++) {
    const px = x0 + ((t * 0.05 + i * 52) % (12 * CELL));
    ctx.globalAlpha = 0.7;
    ctx.fillRect(px, y0 + 10, 6, 4);
  }
  ctx.globalAlpha = 1;
  [x0 + 3 * CELL, x0 + 9 * CELL].forEach((fx) => {
    ctx.fillStyle = "#2a3270";
    ctx.beginPath();
    ctx.arc(fx, y0 + 34, 14, 0, 7);
    ctx.fill();
    ctx.strokeStyle = "#9aa3c8";
    ctx.lineWidth = 3;
    for (let b = 0; b < 3; b++) {
      const a = t / 90 + b * 2.094;
      ctx.beginPath();
      ctx.moveTo(fx, y0 + 34);
      ctx.lineTo(fx + Math.cos(a) * 12, y0 + 34 + Math.sin(a) * 12);
      ctx.stroke();
    }
  });
  for (let i = 0; i < 10; i++) {
    const on = Math.sin(t / 400 + i * 1.7) > 0;
    ctx.fillStyle = on ? "#7bd88f" : "#244a36";
    ctx.fillRect(x0 + 20 + i * 58, y0 + 3, 8, 5);
  }
  for (let c = 1; c <= 14; c++)
    for (let r = 1; r <= 5; r++) {
      if (!isHull(c, r)) continue;
      const [bx, by] = blockXY(c, r);
      ctx.fillStyle = "#6f78a8";
      ctx.fillRect(bx, by, CELL, CELL);
      ctx.fillStyle = "#5a6392";
      ctx.fillRect(bx + 2, by + 2, CELL - 4, CELL - 4);
      ctx.fillStyle = "#8d96c4";
      [
        [6, 6],
        [CELL - 8, 6],
        [6, CELL - 8],
        [CELL - 8, CELL - 8],
      ].forEach((p) => ctx.fillRect(bx + p[0], by + p[1], 3, 3));
    }
  const dopen = R.door;
  const dx0 = GX + 14 * CELL + 6,
    dy0 = GY + 3 * CELL + 6,
    dw = CELL - 12,
    dh = 3 * CELL - 6;
  ctx.fillStyle = "#04061a";
  ctx.fillRect(dx0, dy0, dw, dh);
  ctx.fillStyle = "#ff9f45";
  ctx.fillRect(dx0, dy0, dw, dh * (1 - dopen));
  ctx.fillStyle = "#1b2468";
  ctx.fillRect(dx0 + 6, dy0 + 8, dw - 12, 34 * (1 - dopen));
  ctx.fillStyle = R.leave > 0 ? "#ff5d73" : Math.sin(t / 300) > 0 ? "#7bd88f" : "#2d6b3f";
  ctx.beginPath();
  ctx.arc(dx0 + dw / 2, dy0 - 2, 3, 0, 7);
  ctx.fill();
  ctx.font = "bold 10px sans-serif";
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.fillText("AIRLOCK", GX + 14 * CELL + CELL / 2, GY + 3 * CELL + 62);
  const bx2 = GX + 2 * CELL + 4,
    by2 = FLOORY - 60;
  ctx.fillStyle = "#555b7a";
  ctx.fillRect(bx2, by2 + 30, 2 * CELL - 8, 30);
  ctx.fillStyle = "#3a3f5c";
  ctx.fillRect(bx2, by2 + 56, 6, 8);
  ctx.fillRect(bx2 + 2 * CELL - 14, by2 + 56, 6, 8);
  ctx.fillStyle = S.suit;
  ctx.fillRect(bx2 + 8, by2 + 18, 2 * CELL - 24, 14);
  ctx.fillStyle = "#e8ecff";
  ctx.fillRect(bx2 + 10, by2 + 10, 26, 12);
  ctx.fillStyle = "#fff";
  ctx.font = "bold 10px sans-serif";
  ctx.fillText("BUNK", bx2 + CELL - 4, by2 + 78);
  const gxx = GX + 6 * CELL + 4;
  ctx.fillStyle = "#4a5384";
  ctx.fillRect(gxx, FLOORY - 64, 2 * CELL - 8, 64);
  ctx.fillStyle = "#cfd6ff";
  ctx.fillRect(gxx + 4, FLOORY - 60, 36, 56);
  ctx.fillStyle = "#9aa3c8";
  ctx.fillRect(gxx + 34, FLOORY - 44, 3, 12);
  ctx.fillStyle = "#1b2468";
  ctx.fillRect(gxx + 48, FLOORY - 52, 44, 24);
  ctx.fillStyle = "#7bd88f";
  ctx.font = "bold 12px sans-serif";
  ctx.fillText("🍲 " + S.rations, gxx + 70, FLOORY - 35);
  ctx.fillStyle = Math.sin(t / 700) > 0 ? "#ffd166" : "#6b5410";
  ctx.beginPath();
  ctx.arc(gxx + 98, FLOORY - 48, 3, 0, 7);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.font = "bold 10px sans-serif";
  ctx.fillText("GALLEY", gxx + CELL - 4, FLOORY + 14);
  const cx2 = GX + 10 * CELL + 4;
  ctx.fillStyle = "#4a5384";
  ctx.fillRect(cx2, FLOORY - 40, 2 * CELL - 8, 40);
  ctx.fillStyle = "#1b2468";
  ctx.fillRect(cx2 + 6, FLOORY - 92, 2 * CELL - 20, 50);
  ctx.fillStyle = R.fault ? (Math.sin(t / 120) > 0 ? "#ff5d73" : "#5a1630") : "#103a5a";
  ctx.fillRect(cx2 + 12, FLOORY - 86, 2 * CELL - 32, 38);
  if (!R.fault) {
    ctx.strokeStyle = "#4cc9f0";
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i <= 20; i++) {
      const px = cx2 + 14 + i * 3.6,
        py = FLOORY - 68 + Math.sin(t / 260 + i * 0.5) * 9 + Math.sin(t / 110 + i) * 3;
      if (i) ctx.lineTo(px, py);
      else ctx.moveTo(px, py);
    }
    ctx.stroke();
    ctx.fillStyle = "#7bd88f";
    ctx.font = "bold 9px sans-serif";
    ctx.fillText("ONLINE", cx2 + CELL - 8, FLOORY - 52);
  } else {
    ctx.fillStyle = "#04061a";
    ctx.font = "bold 12px sans-serif";
    ctx.fillText("FAULT", cx2 + CELL - 8, FLOORY - 62);
  }
  ctx.fillStyle = "#fff";
  ctx.font = "bold 10px sans-serif";
  ctx.fillText("CONSOLE", cx2 + CELL - 4, FLOORY + 14);
  for (const k in S.blocks) {
    const p = k.split(",").map(Number);
    const [bx, by] = blockXY(p[0], p[1]);
    drawBlock(ctx, S.blocks[k], bx, by, t);
  }
  ctx.fillStyle = "rgba(200,220,255,.35)";
  R.dust.forEach((d) => {
    const dx = (d.x + t * 0.012 * d.s) % (12 * CELL),
      dy = (d.y + Math.sin(t / 1500 + d.s) * 8 + t * 0.004 * d.s) % (4 * CELL - 10);
    ctx.fillRect(x0 + dx, y0 + dy + 14, 1.8, 1.8);
  });
  const rx = R.roverX;
  ctx.fillStyle = "#cfd6ff";
  ctx.beginPath();
  ctx.roundRect(rx - 22, FLOORY - 24, 44, 14, 5);
  ctx.fill();
  ctx.fillStyle = "#555b7a";
  ctx.beginPath();
  ctx.arc(rx - 14, FLOORY - 8, 7, 0, 7);
  ctx.arc(rx + 14, FLOORY - 8, 7, 0, 7);
  ctx.fill();
  ctx.fillStyle = "#4cc9f0";
  ctx.fillRect(rx - 4, FLOORY - 32, 12, 8);
  if (R.mode === "sleep") {
    ctx.save();
    ctx.translate(bx2 + 2 * CELL - 14, by2 + 46);
    ctx.rotate(-Math.PI / 2);
    drawMira(ctx, 0, 0, 0.8, { mode: "sleep", dir: 1, k: 1.5 });
    ctx.restore();
    ctx.fillStyle = S.suit;
    ctx.globalAlpha = 0.95;
    ctx.beginPath();
    ctx.roundRect(bx2 + 30, by2 + 26, 2 * CELL - 42, 16, 6);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.fillStyle = "#fff";
    ctx.font = "bold 22px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("z", bx2 + 50, by2 - 6 - ((t / 10) % 20));
    ctx.fillText("Z", bx2 + 66, by2 - 26 - ((t / 12) % 20));
  } else {
    const fade = R.leave > 0 ? Math.max(0, R.leave / 1.4) : 1;
    ctx.globalAlpha = fade;
    drawMira(ctx, R.x, FLOORY, 0.95, { mode: R.mode, dir: R.dir });
    ctx.globalAlpha = 1;
  }
  drawDrone(t);
  const day = (S.t % DAYLEN) / DAYLEN;
  if (day > 0.62) {
    ctx.fillStyle = `rgba(5,10,45,${Math.min(0.3, (day - 0.62) * 1.2)})`;
    ctx.fillRect(x0, y0, 12 * CELL, 4 * CELL);
  }
  const flick = R.fault && Math.sin(t / 90) > 0.6;
  if (flick) {
    ctx.fillStyle = "rgba(0,0,10,.5)";
    ctx.fillRect(x0, y0, 12 * CELL, 4 * CELL);
  }
  if (R.bub && R.bubT > 0 && R.mode !== "sleep") {
    ctx.font = "bold 13px sans-serif";
    const w = ctx.measureText(R.bub).width + 22;
    const bxp = clamp(R.x - w / 2, GX + 2 * CELL, GX + 14 * CELL - w),
      byp = FLOORY - 206;
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.roundRect(bxp, byp, w, 28, 10);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(R.x - 6, byp + 28);
    ctx.lineTo(R.x, byp + 38);
    ctx.lineTo(R.x + 6, byp + 28);
    ctx.fill();
    ctx.fillStyle = "#1b2468";
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
  if (R.build) {
    ctx.strokeStyle = "rgba(255,255,255,.18)";
    ctx.lineWidth = 1;
    for (let r = 0; r <= 7; r++) {
      ctx.beginPath();
      ctx.moveTo(GX, GY + r * CELL);
      ctx.lineTo(GX + GC * CELL, GY + r * CELL);
      ctx.stroke();
    }
    for (let c = 0; c <= GC; c++) {
      ctx.beginPath();
      ctx.moveTo(GX + c * CELL, GY);
      ctx.lineTo(GX + c * CELL, GY + 7 * CELL);
      ctx.stroke();
    }
    if (R.hover) {
      const [c, r] = R.hover;
      if (c >= 0 && c < GC && r >= 0 && r < 7) {
        const [bx, by] = blockXY(c, r);
        if (R.tool.startsWith("mod:")) {
          const m = MODS[R.tool];
          const okm = canPlaceMod(c, r, m).ok;
          m.cells.forEach((x) => {
            const [qx, qy] = blockXY(c + x[0], r + x[1]);
            ctx.fillStyle = okm ? "rgba(123,216,143,.35)" : "rgba(255,93,115,.35)";
            ctx.fillRect(qx, qy, CELL, CELL);
            ctx.globalAlpha = 0.7;
            drawBlock(ctx, x[2], qx, qy, t);
            ctx.globalAlpha = 1;
          });
        } else {
          const ok = canPlace(c, r, R.tool).ok;
          ctx.fillStyle = ok ? "rgba(123,216,143,.35)" : "rgba(255,93,115,.35)";
          ctx.fillRect(bx, by, CELL, CELL);
          if (R.tool !== "erase") {
            ctx.globalAlpha = 0.7;
            drawBlock(ctx, R.tool, bx, by, t);
            ctx.globalAlpha = 1;
          }
        }
      }
    }
  }
  const st = R.storm;
  if (st.state === 2) {
    ctx.fillStyle = "rgba(255,150,30,.12)";
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = "rgba(255,210,90,.8)";
    ctx.lineWidth = 2;
    for (let i = 0; i < 30; i++) {
      const sx = (i * 53 + t * 0.1) % W,
        sy = ((t * 0.8 + i * 41) % GY) * 1.2 + ((i * 17) % GY);
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

function canPlace(c, r, id) {
  if (c < 0 || c >= GC || r < 0 || r >= 7) return { ok: false, why: "Outside the map." };
  if (isHull(c, r)) return { ok: false, why: "That is the hull." };
  if (RESV.has(c + "," + r)) return { ok: false, why: "That space is taken by the furniture." };
  const key = c + "," + r;
  if (id === "erase") return { ok: !!S.blocks[key], why: "Nothing to remove." };
  if (S.blocks[key]) return { ok: false, why: "Occupied. Remove it first." };
  const b = BLK[id];
  const exterior = r <= 0 || r === 6 || c <= 0 || c >= 15;
  const interior = r >= 2 && r <= 5 && c >= 2 && c <= 13;
  if (b.ext && !exterior) return { ok: false, why: "This one goes outside." };
  if (!b.ext && !exterior && !interior) return { ok: false, why: "Not here." };
  if (!b.ext && exterior && id !== "brick" && id !== "polymer")
    return { ok: false, why: "Build that inside the base." };
  return { ok: true };
}
function cellAt(ev) {
  const r = cv.getBoundingClientRect();
  const x = ((ev.clientX - r.left) / r.width) * W,
    y = ((ev.clientY - r.top) / r.height) * H;
  return { c: Math.floor((x - GX) / CELL), r: Math.floor((y - GY) / CELL), x, y };
}
cv.addEventListener("pointermove", (e) => {
  if (R.build) {
    const p = cellAt(e);
    R.hover = [p.c, p.r];
  }
});
cv.addEventListener("pointerleave", () => {
  R.hover = null;
});
cv.addEventListener("pointerdown", (e) => {
  ensureAudio();
  if (R.paused) return;
  const p = cellAt(e);
  if (R.build) {
    const { c, r } = p;
    const key = c + "," + r;
    if (R.tool === "erase") {
      if (S.blocks[key] && !RESV.has(key)) {
        const b = BLK[S.blocks[key]];
        payCost(b.cost, -1);
        delete S.blocks[key];
        beep(500, 0.06);
        writeSave();
      }
      return;
    }
    if (R.tool.startsWith("mod:")) {
      const m = MODS[R.tool];
      const q = canPlaceMod(c, r, m);
      if (!q.ok) {
        toast(q.why, 1800);
        return;
      }
      const cost = modCost(m);
      if (!afford(cost)) {
        toast("You need " + costTxt(cost) + ".", 2200);
        return;
      }
      payCost(cost, 1);
      m.cells.forEach((x) => {
        S.blocks[c + x[0] + "," + (r + x[1])] = x[2];
      });
      beep(900, 0.07);
      writeSave();
      return;
    }
    const chk = canPlace(c, r, R.tool);
    if (!chk.ok) {
      toast(chk.why, 1800);
      return;
    }
    const b = BLK[R.tool];
    if (!afford(b.cost)) {
      toast("You need " + costTxt(b.cost) + ".", 2200);
      return;
    }
    payCost(b.cost, 1);
    S.blocks[key] = R.tool;
    beep(900, 0.07);
    writeSave();
    return;
  }
  if (Math.abs(p.x - R.x) < 40 && p.y > FLOORY - 170 && p.y < FLOORY + 10) {
    doAct("pet");
    return;
  }
  if (p.y > GY + 2 * CELL && p.y < FLOORY + 5) {
    if (p.x > BEDX - 60 && p.x < BEDX + 60) doAct("sleep");
    else if (p.x > GALX - 60 && p.x < GALX + 60) doAct("eat");
    else if (p.x > CONX - 60 && p.x < CONX + 60) doAct("missions");
    else if (p.x > DOORX - 30) doAct("exp");
  }
});

function setBub(m, s) {
  R.bub = m;
  R.bubT = s || 3;
}
function doAct(a) {
  ensureAudio();
  if (R.paused && a !== "snd") return;
  if (R.mode === "sleep" || R.mode === "eat" || R.leave > 0) return;
  if (a === "eat") {
    R.act = { t: "eat", x: GALX };
  } else if (a === "sleep") {
    R.act = { t: "sleep", x: BEDX };
  } else if (a === "pet") {
    pet();
  } else if (a === "missions") {
    R.act = { t: "missions", x: CONX };
  } else if (a === "craft") {
    R.act = { t: "craft", x: CONX };
  } else if (a === "exp") {
    if (!mod("airlock")) {
      toast(
        "🚪 Your ship has no airlock, so nobody can go outside. Try the dust maze mission instead.",
        4500,
      );
      setBub("No airlock... we can't go out.", 3);
      return;
    }
    R.act = { t: "exp", x: DOORX };
  } else if (a === "style") {
    openStyle();
  } else if (a === "story") {
    openStory();
  } else if (a === "a11y") {
    openA11y();
  } else if (a === "wx") {
    openWx();
  } else if (a === "build") {
    toggleBuild();
  } else if (a === "snd") {
    muted = !muted;
    $("bSnd").textContent = muted ? "🔇" : "🔊";
    if (!muted) ensureAudio();
  }
  if (R.act && R.build) toggleBuild();
  if (R.act) R.tx = R.act.x;
}
function pet() {
  if (R.petCool > 0) return;
  R.petCool = 0.9;
  R.mode = "wave";
  R.mt = 0.9;
  S.needs.mood = Math.min(100, S.needs.mood + 6);
  S.flags.petted = true;
  S.flags.pets = (S.flags.pets || 0) + 1;
  for (let i = 0; i < 4; i++)
    R.hearts.push({
      x: R.x + rnd(-20, 20),
      y: FLOORY - 150,
      vy: -rnd(30, 60),
      l: 1.2,
      e: ["❤️", "💛", "✨"][i % 3],
    });
  beep(1200, 0.08, 0.02);
  setBub(
    ["Hehe, that tickles!", "You're the best!", "Hello, friend!"][Math.floor(Math.random() * 3)],
    2,
  );
}
function arrive(a) {
  if (a.t === "eat") {
    if (S.rations <= 0) {
      toast("No rations left! Grow plants, craft meal packs or buy rations in Craft.", 3500);
      setBub("I'm out of food...", 3);
      return;
    }
    S.rations--;
    R.mode = "eat";
    R.mt = 1.6;
  } else if (a.t === "sleep") {
    R.mode = "sleep";
    R.mt = 6;
  } else if (a.t === "missions") {
    openMissions();
  } else if (a.t === "craft") {
    openCraft();
  } else if (a.t === "exp") {
    R.leave = 1.4;
    writeSave();
    toast("Cycling the airlock...", 1500);
  }
}
function goExpedition() {
  writeSave();
  location.href = "expedition.html";
}

function toggleBuild() {
  R.build = !R.build;
  $("bBuild").className = R.build ? "on" : "";
  $("pal").className = R.build ? "on" : "";
  if (R.build) buildPalette();
}
function buildPalette() {
  $("pal").innerHTML =
    `<div class="palh">🧱 BUILD MODE: pick a piece, then click an empty spot in the base. Modules are ready-made rooms. Every block makes the base bigger, and a bigger base uses more mission time.</div>` +
    Object.keys(BLK)
      .map(
        (k) =>
          `<button data-tool="${k}" class="${R.tool === k ? "on" : ""}">${BLK[k].e} ${BLK[k].n}<small>${costTxt(BLK[k].cost)}</small></button>`,
      )
      .join("") +
    Object.keys(MODS)
      .map(
        (k) =>
          `<button data-tool="${k}" class="${R.tool === k ? "on" : ""}">${MODS[k].e} ${MODS[k].n} (room)<small>${costTxt(modCost(MODS[k]))}</small></button>`,
      )
      .join("") +
    `<button data-tool="erase" class="${R.tool === "erase" ? "on" : ""}">🧽 Remove<small>refunds the cost</small></button>`;
}
$("pal").onclick = (e) => {
  const b = e.target.closest("button");
  if (!b) return;
  R.tool = b.dataset.tool;
  buildPalette();
};

function spawnFault() {
  const F = [
    { k: "power", t: "Power regulator fault", fx: "Lights flicker and the batteries drain." },
    { k: "air", t: "CO₂ scrubber jam", fx: "The air gets stale." },
    { k: "water", t: "Water pump leak", fx: "Water pressure drops." },
  ];
  if (R.fault) return;
  R.fault = F[Math.floor(Math.random() * F.length)];
  R.faultT = rnd(90, 140);
  toast("🔧 FAULT: " + R.fault.t + ". " + R.fault.fx, 5000);
  beep(300, 0.4);
}
function startStorm() {
  const total =
    (LIVE.ok ? clamp(150 + (LIVE.speed / 3000) * 450, 150, 600) : 450) *
    0.5 *
    (S.plan && S.plan.storm ? S.plan.storm : 1);
  R.storm = {
    state: 1,
    t: 45,
    total,
    prot: 0,
    drilled: false,
    label: LIVE.ok
      ? `real CME ${LIVE.id} (${Math.round(LIVE.speed)} km/s)`
      : "modeled on the August 1972 storm",
  };
  toast("☢️ NASA space weather alert: " + R.storm.label + ". Arrives in 45 s!", 6000);
  beep(500, 0.3);
}

function update(dt) {
  R.t += dt;
  if (R.paused) return;
  const n = S.needs;
  const fm = R.fault ? 2 : 1;
  const sleeping = R.mode === "sleep";
  S.t += dt * (sleeping ? 6 : 1);
  if (missionLeft() <= 0 && !R.timeUp) {
    showTimeUp();
    return;
  }
  tickLife(dt);
  if (R.ended) return;
  const dk = 600 / DAYLEN;
  n.hunger = Math.max(
    0,
    n.hunger -
      0.5 *
        dk *
        fm *
        dt *
        (sleeping ? 1.5 : 1) *
        (1.3 - (S.plan ? S.plan.ls : 60) / 200) *
        (S.plan && S.plan.need ? S.plan.need : 1),
  );
  if (sleeping) n.energy = Math.min(100, n.energy + ((70 * bedMult()) / 6) * dt);
  else
    n.energy = Math.max(
      0,
      n.energy -
        0.32 *
          dk *
          fm *
          dt *
          (mod("gym") ? 1 : 1.3) *
          (1.3 - (S.plan ? S.plan.res : 60) / 200) *
          (S.plan && S.plan.need ? S.plan.need : 1),
    );
  let tgt =
    45 +
    decor() +
    planMood() +
    (n.hunger > 45 ? 12 : n.hunger < 20 ? -25 : 0) +
    (n.energy > 45 ? 12 : n.energy < 20 ? -25 : 0) +
    (R.fault ? -18 : 0) +
    (cnt("window") ? 4 : 0);
  n.mood += (tgt - n.mood) * Math.min(1, 0.06 * dt);
  n.mood = clamp(n.mood, 0, 100);
  if (!(R.fault && R.fault.k === "power")) {
    R.plantAcc += ((cnt("plant") * dt) / 80) * (mod("greenhouse") ? 1.5 : 1);
    while (R.plantAcc >= 1) {
      R.plantAcc -= 1;
      S.rations++;
      toast("🌱 A plant box produced a ration.", 2500);
    }
  }
  S.dose +=
    (GCR / DAYLEN) *
    Math.exp(-shieldVal() / 6) *
    dt *
    (sleeping ? 6 : 1) *
    (mod("med") ? 0.9 : 1) *
    (1.25 - (S.plan ? S.plan.sh : 40) / 200);
  if (S.dose >= DLIM && !R.evac) {
    evacuate();
    return;
  }
  R.petCool = Math.max(0, R.petCool - dt);
  if (!R.fault && S.ch >= 2 && R.storm.state === 0) {
    R.faultT -= dt;
    if (R.faultT <= 0) spawnFault();
  }
  if (!R.storyOpen) {
    if (S.ch === 1 && !R.fault && !(S.flags.repaired >= 1)) spawnFault();
    if (S.ch === 4 && R.storm.state === 0 && !(S.flags.storms >= 1)) startStorm();
  }
  const st = R.storm;
  if (st.state === 1) {
    st.t -= dt;
    if (st.t <= 0) {
      st.state = 2;
      st.t = 15;
      toast("☢️ STORM FRONT ARRIVED!", 3000);
    }
  } else if (st.state === 2) {
    st.t -= dt;
    if (st.t <= 0) {
      const d =
        st.total *
        Math.exp(-shieldVal() / 6) *
        (1 - 0.6 * st.prot) *
        (mod("med") ? 0.9 : 1) *
        (1.25 - (S.plan ? S.plan.sh : 40) / 200);
      S.dose += d;
      const hd = 14 * Math.exp(-shieldVal() / 6) * (1 - 0.6 * st.prot);
      S.hull = Math.max(0, (S.hull == null ? 100 : S.hull) - hd);
      S.flags.storms = (S.flags.storms || 0) + 1;
      R.storm = { state: 0, t: 0, total: 0, prot: 0 };
      toast(`The storm passed. Your walls and drill cut it to ${d.toFixed(0)} mSv.`, 6000);
    }
  }
  if (R.leave > 0) {
    R.door = Math.min(1, R.door + dt * 2);
    R.roverX += dt * 40;
    R.leave -= dt;
    if (R.leave <= 0) goExpedition();
  }
  if (R.mode === "walk" || R.mode === "idle" || R.mode === "wave") {
    const dx = R.tx - R.x;
    if (Math.abs(dx) > 3 && R.mode !== "wave") {
      R.x += Math.sign(dx) * Math.min(130 * dt, Math.abs(dx));
      R.dir = dx > 0 ? 1 : -1;
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
  if (R.mt > 0) {
    R.mt -= dt;
    if (R.mt <= 0) {
      if (R.mode === "eat") {
        n.hunger = Math.min(100, n.hunger + 45);
        n.mood = Math.min(100, n.mood + 3);
        S.flags.ate = true;
      }
      if (R.mode === "sleep") {
        S.flags.slept = true;
        n.mood = Math.min(100, n.mood + 5);
        setBub("Good morning!", 3);
      }
      R.mode = "idle";
    }
  }
  if (R.bubT > 0) R.bubT -= dt;
  else {
    let m = "";
    if (n.hunger < 25) m = "I'm starving! 🍲";
    else if (n.energy < 25) m = "So sleepy... 😴";
    else if (R.fault) m = "Alarm! Something is broken!";
    else if (R.storm.state === 1) m = "A storm is coming!";
    else if (n.mood < 30) m = "I feel down. Pet me?";
    else if (R.t - R.cheerAt > 14) {
      R.cheerAt = R.t;
      m = [
        "What a view of Earth.",
        "Let's build something!",
        "Moon dust everywhere...",
        "Reporting for duty!",
      ][Math.floor(Math.random() * 4)];
    }
    if (m) setBub(m, 3.5);
  }
  R.hearts.forEach((h) => {
    h.y += h.vy * dt;
    h.l -= dt;
  });
  R.hearts = R.hearts.filter((h) => h.l > 0);
  R.toasts.forEach((t) => (t.t -= dt));
  R.toasts = R.toasts.filter((t) => t.t > 0).slice(-3);
  R.lastSave += dt;
  if (R.lastSave > 5) {
    R.lastSave = 0;
    writeSave();
  }
  checkChapter();
}

function checkChapter() {
  if (S.ch < 0 || R.storyOpen) return;
  if (S.ch >= CHAPTERS.length) return;
  const c = CHAPTERS[S.ch];
  if (c.ok()) {
    S.units += 60;
    toast("✅ Chapter complete: " + c.t + " (+60 units)", 4000);
    addPts(100, "chapter complete");
    beep(1200, 0.2);
    S.ch++;
    writeSave();
    if (S.ch < CHAPTERS.length) showChapter(S.ch);
    else showEnding();
  }
}
function showChapter(i) {
  const c = CHAPTERS[i];
  R.paused = true;
  R.storyOpen = true;
  $("storyBox").innerHTML =
    `<div style="color:var(--mut);font-size:.8em">CHAPTER ${i + 1} OF ${CHAPTERS.length}</div><h2>${c.t}</h2><p>${c.x}</p><div class="real">📡 <b style="color:var(--txt)">Real data:</b> ${c.d}</div><p><b>Goal:</b> ${c.goal}</p><button id="bCh">Continue</button>`;
  $("ovStory").classList.add("on");
  $("bCh").onclick = () => {
    $("ovStory").classList.remove("on");
    R.paused = false;
    R.storyOpen = false;
    if (c.start) c.start();
    writeSave();
  };
}
function showEnding() {
  R.paused = true;
  R.storyOpen = true;
  $("storyBox").innerHTML =
    `<h2>🏆 Outpost established!</h2><p>${S.name} did it. The storm is behind you, the base is shielded, solar panels are humming and the antenna is talking to home. Hopper Base is no longer a crash site: it is a place to live.</p><ul><li>📅 Day ${Math.floor(S.t / DAYLEN) + 1}</li><li>🔭 Discoveries: ${S.disc.length}</li><li>☢️ Radiation dose: ${S.dose.toFixed(0)} of ${DLIM} mSv</li><li>🧱 Blocks built: ${Object.keys(S.blocks).length}</li><li>🚀 Expeditions: ${S.exp}</li></ul><div class="real">📡 Every number in this game comes from real NASA data or published mission results. Open Story to see where.</div><button id="bCh">Keep playing</button>`;
  $("ovStory").classList.add("on");
  $("bCh").onclick = () => {
    $("ovStory").classList.remove("on");
    R.paused = false;
    R.storyOpen = false;
  };
}
function evacuate() {
  R.evac = true;
  endGame("dose");
  return;
  R.paused = true;
  $("endBox").innerHTML =
    `<h2>☢️ ${S.name} was evacuated</h2><p>The radiation dose reached the ${DLIM} mSv limit. Space agencies set limits like this so astronauts stay healthy. More shielding, shorter trips and taking the storm drill seriously would have kept ${S.name} on the Moon.</p><button id="bNew">Start a new mission</button>`;
  $("ovEnd").classList.add("on");
  $("bNew").onclick = () => {
    const keep = {
      name: S.name,
      suit: S.suit,
      visor: S.visor,
      acc: S.acc,
      skin: S.skin,
      hair: S.hair,
      hairCol: S.hairCol,
      eyes: S.eyes,
      outfit: S.outfit,
    };
    S = Object.assign(defSave(), keep, { started: true, ch: -1 });
    writeSave();
    location.reload();
  };
}
