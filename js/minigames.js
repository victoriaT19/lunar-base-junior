let MG = null;
const mg = $("mg"),
  mc = mg.getContext("2d");
mc.scale(2, 2);
const PF = (n) => `${n}px "Press Start 2P", monospace`;
function Q(x, y, w, h, c) {
  mc.fillStyle = c;
  mc.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}
function mask(rows, x, y, px, col) {
  rows.forEach((r, j) => {
    for (let i = 0; i < r.length; i++) if (r[i] === "#") Q(x + i * px, y + j * px, px, px, col);
  });
}
const ICO = {
  drop: ["...#...", "..###..", ".#####.", ".#####.", "#######", ".#####.", "..###.."],
  sun: ["#..#..#", ".#####.", ".#####.", "#######", ".#####.", ".#####.", "#..#..#"],
  flask: ["..###..", "...#...", "...#...", "..###..", ".#####.", "#######", "#######"],
};
const TOOLS = [
  { n: "WATER", ic: "drop", c: "#4cc9f0" },
  { n: "LIGHT", ic: "sun", c: "#ffd166" },
  { n: "FOOD", ic: "flask", c: "#7bd88f" },
];
const GRID = { c: 6, r: 5, s: 60, ox: 140, oy: 62, tg: [0, 2, 4], src: 2 };
const DIRS = [
  [0, -1, 1, 4],
  [1, 0, 2, 8],
  [0, 1, 4, 1],
  [-1, 0, 8, 2],
];
const rotm = (m) => ((m << 1) | (m >> 3)) & 15;
function mgPos(e) {
  const r = mg.getBoundingClientRect();
  return {
    x: ((e.clientX - r.left) / r.width) * 640,
    y: ((e.clientY - r.top) / r.height) * 420,
  };
}
function genGrid() {
  const { c, r } = GRID;
  const m = Array.from({ length: r }, () => Array(c).fill(0));
  const seen = Array.from({ length: r }, () => Array(c).fill(false));
  const st = [[0, GRID.src]];
  seen[GRID.src][0] = true;
  while (st.length) {
    const [x, y] = st[st.length - 1];
    const o = DIRS.filter(([dx, dy]) => {
      const nx = x + dx,
        ny = y + dy;
      return nx >= 0 && ny >= 0 && nx < c && ny < r && !seen[ny][nx];
    });
    if (!o.length) {
      st.pop();
      continue;
    }
    const [dx, dy, b, ob] = o[Math.floor(Math.random() * o.length)];
    m[y][x] |= b;
    m[y + dy][x + dx] |= ob;
    seen[y + dy][x + dx] = true;
    st.push([x + dx, y + dy]);
  }
  m[GRID.src][0] |= 8;
  GRID.tg.forEach((ty) => (m[ty][c - 1] |= 2));
  MG.tiles = m.map((row) =>
    row.map((v) => {
      let t = v;
      const k = 1 + Math.floor(Math.random() * 3);
      for (let i = 0; i < k; i++) t = rotm(t);
      return t;
    }),
  );
  MG.cur = [0, GRID.src];
  MG.spin = {};
  MG.pow = gridPow();
}
function gridPow() {
  const { c, r } = GRID;
  const t = MG.tiles;
  const on = Array.from({ length: r }, () => Array(c).fill(false));
  if (t[GRID.src][0] & 8) {
    const q = [[0, GRID.src]];
    on[GRID.src][0] = true;
    while (q.length) {
      const [x, y] = q.shift();
      DIRS.forEach(([dx, dy, b, ob]) => {
        const nx = x + dx,
          ny = y + dy;
        if (
          nx >= 0 &&
          ny >= 0 &&
          nx < c &&
          ny < r &&
          !on[ny][nx] &&
          t[y][x] & b &&
          t[ny][nx] & ob
        ) {
          on[ny][nx] = true;
          q.push([nx, ny]);
        }
      });
    }
  }
  const lit = GRID.tg.map((ty) => on[ty][c - 1] && !!(t[ty][c - 1] & 2));
  return { on, lit, n: lit.filter(Boolean).length };
}
function spinTile(x, y) {
  MG.tiles[y][x] = rotm(MG.tiles[y][x]);
  MG.spin[x + "," + y] = 0.12;
  beep(520 + y * 40, 0.04);
  MG.pow = gridPow();
  if (MG.pow.n === 3) {
    beep(1100, 0.15);
    finishMG(true);
  }
}
function plantUse(i) {
  const p = MG.pl[i];
  if (!p) return;
  if (p.need && p.need.k === MG.tool) {
    p.g = Math.min(100, p.g + 16);
    p.need = null;
    MG.combo++;
    MG.pop.push({
      x: 140 + i * 180,
      y: 150,
      m: MG.combo > 2 ? "x" + MG.combo + "!" : "+",
      c: "#7bd88f",
      t: 0,
    });
    beep(800 + Math.min(MG.combo, 6) * 80, 0.06);
  } else {
    p.h = Math.max(0, p.h - 8);
    MG.combo = 0;
    MG.pop.push({ x: 140 + i * 180, y: 150, m: "OOPS", c: "#ff5d73", t: 0 });
    beep(180, 0.12);
  }
}
function startMG(kind) {
  $("ovMenu").classList.remove("on");
  R.paused = true;
  spend(2, 3, "task");
  MG = { kind, t: 0, res: null, rt: 0, keys: {} };
  const T = {
    wires: [
      "⚡ Power grid repair",
      "Click the tiles to rotate them and bring solar power to all 3 modules. Keyboard: arrows to move, Space to rotate.",
    ],
    plant: [
      "🌱 Greenhouse",
      "Pick a tool (1 water, 2 light, 3 food), then click the plant that asks for it. Wrong tool hurts the plant. On the ISS, Veggie grows lettuce under red and blue LEDs.",
    ],
    storm: [
      "☢️ Storm shield",
      "Move the polyethylene shield with the mouse, finger or arrow keys. Block protons (yellow) and heavy ions (red). Plastic full of hydrogen stops radiation better than metal.",
    ],
    maze: [
      "🚙 Dark crater rover",
      "Arrows or WASD to drive. The crater is dark: press Space to scan. Collect ice and minerals before time runs out.",
    ],
  }[kind];
  $("mgTitle").textContent = T[0];
  $("mgHelp").textContent = T[1];
  if (kind === "wires") {
    MG.max = 50 + (S.plan && mod("arm") ? 10 : 0);
    genGrid();
    let g = 0;
    while (MG.pow.n === 3 && g++ < 20) {
      MG.tiles[GRID.src][0] = rotm(MG.tiles[GRID.src][0]);
      MG.pow = gridPow();
    }
  } else if (kind === "plant") {
    MG.max = 32;
    MG.pl = [0, 1, 2].map(() => ({ g: 10, h: 100, need: null }));
    MG.tool = 0;
    MG.sel = 1;
    MG.sp = 0.8;
    MG.combo = 0;
    MG.pop = [];
  } else if (kind === "storm") {
    MG.max = 28;
    MG.sx = 320;
    MG.tx = 320;
    MG.parts = [];
    MG.blocked = 0;
    MG.hit = 0;
    MG.total = 0;
    MG.sp = 0.6;
    MG.burst = 6;
    MG.warn = 0;
    MG.glow = 0;
    MG.shake = 0;
  } else {
    genMaze();
    MG.max = 45;
    MG.dir = null;
    MG.face = 1;
    MG.mt = 0;
    MG.scan = 0;
    MG.scd = 0;
    MG.seen = {};
    MG.got = { regolith: 0, ilmenite: 0, ice: 0 };
    revealMaze(2.7);
  }
  $("ovMG").classList.add("on");
}
function revealMaze(rad) {
  for (let y = 0; y < 15; y++)
    for (let x = 0; x < 21; x++)
      if (Math.hypot(x - MG.x, y - MG.y) <= rad) MG.seen[x + "," + y] = 1;
}
function genMaze() {
  const MC = 21,
    MR = 15;
  const g = Array.from({ length: MR }, () => Array(MC).fill(1));
  const st = [[1, 1]];
  g[1][1] = 0;
  const dirs = [
    [2, 0],
    [-2, 0],
    [0, 2],
    [0, -2],
  ];
  while (st.length) {
    const [x, y] = st[st.length - 1];
    const o = dirs.filter(([dx, dy]) => {
      const nx = x + dx,
        ny = y + dy;
      return nx > 0 && ny > 0 && nx < MC - 1 && ny < MR - 1 && g[ny][nx] === 1;
    });
    if (!o.length) {
      st.pop();
      continue;
    }
    const [dx, dy] = o[Math.floor(Math.random() * o.length)];
    g[y + dy / 2][x + dx / 2] = 0;
    g[y + dy][x + dx] = 0;
    st.push([x + dx, y + dy]);
  }
  for (let i = 0; i < 14; i++) {
    const x = 1 + Math.floor(Math.random() * (MC - 2)),
      y = 1 + Math.floor(Math.random() * (MR - 2));
    if (g[y][x] === 1 && (x % 2 === 0) !== (y % 2 === 0)) g[y][x] = 0;
  }
  const fl = [];
  for (let y = 0; y < MR; y++)
    for (let x = 0; x < MC; x++) if (g[y][x] === 0 && (x > 2 || y > 2)) fl.push([x, y]);
  fl.sort(() => Math.random() - 0.5);
  const items = {};
  fl.slice(0, 15).forEach(([x, y], i) => {
    items[x + "," + y] = i < 8 ? "regolith" : i < 11 ? "ilmenite" : "ice";
  });
  MG.g = g;
  MG.items = items;
  MG.x = 1;
  MG.y = 1;
}
function finishMG(ok, data) {
  if (MG.res) return;
  MG.res = { ok, data };
  MG.rt = 0;
}
function applyMG() {
  const m = MG;
  MG = null;
  $("ovMG").classList.remove("on");
  const r = m.res;
  let msg = "";
  if (r.ok && !m.kai)
    addPts(m.kind === "storm" ? Math.round(30 + 40 * (r.data || 0)) : 50, "task done");
  if (m.kind === "wires" && r.ok) S.hull = Math.min(100, (S.hull == null ? 100 : S.hull) + 15);
  if (m.kind === "wires") {
    if (r.ok) {
      if (R.fault) {
        R.fault = null;
        S.flags.repaired = (S.flags.repaired || 0) + 1;
        S.units += 20;
        msg = "🔧 Fault repaired! +20 units";
      } else {
        S.units += 10;
        msg = "Nice practice! +10 units";
      }
      S.needs.mood = Math.min(100, S.needs.mood + 6);
    } else msg = "The wires got tangled. Try again!";
  } else if (m.kind === "plant") {
    let n = r.data;
    if (n > 0 && S.plan && mod("greenhouse")) n += 1;
    S.rations += n;
    S.units += n * 5;
    S.needs.mood = Math.min(100, S.needs.mood + 4);
    S.flags.plants = (S.flags.plants || 0) + 1;
    msg = n
      ? `🌱 Harvest! +${n} rations, +${n * 5} units. Plants need balanced water, light and nutrients, just like on the ISS.`
      : "The plant wilted. Try again!";
  } else if (m.kind === "storm") {
    const f = r.data;
    if (R.storm.state) {
      R.storm.prot = Math.max(R.storm.prot, f);
      R.storm.drilled = true;
      msg = `☢️ You blocked ${Math.round(f * 100)}% of the particles. The storm will hit softer.`;
    } else {
      S.units += 15;
      msg = `Drill done: blocked ${Math.round(f * 100)}%. +15 units`;
    }
  } else {
    const g = r.data;
    S.inv.regolith += g.regolith;
    S.inv.ilmenite += g.ilmenite;
    S.inv.ice += g.ice;
    S.lootTotal = (S.lootTotal || 0) + g.regolith + g.ilmenite + g.ice;
    S.needs.mood = Math.min(100, S.needs.mood + 4);
    msg = `🚙 Collected ${g.regolith} regolith, ${g.ilmenite} ilmenite, ${g.ice} ice.`;
  }
  toast(msg, 5000);
  writeSave();
  R.paused = false;
}
$("mgKai").onclick = () => {
  if (!MG || MG.res) return;
  S.o2 = Math.max(1, Math.floor((S.o2 == null ? 100 : S.o2) / 2));
  MG.kai = true;
  if (MG.kind === "maze") {
    Object.values(MG.items).forEach((v) => MG.got[v]++);
    MG.items = {};
  }
  toast("🤖 KAI did it super fast... but the base used half of its oxygen!", 4000);
  finishMG(
    true,
    MG.kind === "plant" ? 2 : MG.kind === "storm" ? 1 : MG.kind === "maze" ? MG.got : 0,
  );
};
$("mgQuit").onclick = () => {
  if (!MG) return;
  if (!MG.res)
    MG.res = {
      ok: false,
      data:
        MG.kind === "plant"
          ? 0
          : MG.kind === "storm"
            ? MG.total
              ? MG.blocked / MG.total
              : 0
            : MG.kind === "maze"
              ? MG.got
              : 0,
    };
  MG.rt = 9;
};
mg.addEventListener("pointerdown", (e) => {
  if (!MG || MG.res) return;
  ensureAudio();
  const p = mgPos(e);
  if (MG.kind === "wires") {
    const x = Math.floor((p.x - GRID.ox) / GRID.s),
      y = Math.floor((p.y - GRID.oy) / GRID.s);
    if (x >= 0 && y >= 0 && x < GRID.c && y < GRID.r) {
      MG.cur = [x, y];
      spinTile(x, y);
    }
  } else if (MG.kind === "plant") {
    if (p.y > 360 && p.y < 408) {
      for (let i = 0; i < 3; i++)
        if (p.x > 115 + i * 140 && p.x < 245 + i * 140) {
          MG.tool = i;
          beep(600, 0.03);
        }
      return;
    }
    for (let i = 0; i < 3; i++)
      if (Math.abs(p.x - (140 + i * 180)) < 75 && p.y > 70 && p.y < 350) {
        MG.sel = i;
        plantUse(i);
      }
  } else if (MG.kind === "storm") {
    MG.tx = p.x;
  }
});
mg.addEventListener("pointermove", (e) => {
  if (MG && MG.kind === "storm" && !MG.res) MG.tx = mgPos(e).x;
});
const MDIR = {
  arrowup: "u",
  arrowdown: "d",
  arrowleft: "l",
  arrowright: "r",
  w: "u",
  s: "d",
  a: "l",
  d: "r",
};
window.addEventListener("keydown", (e) => {
  if (!MG) return;
  const k = e.key.toLowerCase();
  MG.keys[k] = true;
  if (["arrowup", "arrowdown", "arrowleft", "arrowright", " ", "enter"].includes(k))
    e.preventDefault();
  if (MG.res) return;
  if (MG.kind === "wires") {
    const d = MDIR[k];
    if (d) {
      const v = { u: [0, -1], d: [0, 1], l: [-1, 0], r: [1, 0] }[d];
      MG.cur = [clamp(MG.cur[0] + v[0], 0, GRID.c - 1), clamp(MG.cur[1] + v[1], 0, GRID.r - 1)];
    }
    if (k === " " || k === "enter") spinTile(MG.cur[0], MG.cur[1]);
  } else if (MG.kind === "plant") {
    if (["1", "2", "3"].includes(k)) MG.tool = +k - 1;
    if (k === "arrowleft" || k === "a") MG.sel = Math.max(0, MG.sel - 1);
    if (k === "arrowright" || k === "d") MG.sel = Math.min(2, MG.sel + 1);
    if (k === " " || k === "enter") plantUse(MG.sel);
  } else if (MG.kind === "maze") {
    if (MDIR[k]) MG.dir = MDIR[k];
    if (k === " " && MG.scd <= 0) {
      MG.scan = 1.4;
      MG.scd = 5;
      revealMaze(6);
      beep(1200, 0.08);
    }
  }
});
window.addEventListener("keyup", (e) => {
  if (!MG) return;
  const k = e.key.toLowerCase();
  MG.keys[k] = false;
  if (MG.kind === "maze" && MDIR[k] && MG.dir === MDIR[k]) MG.dir = null;
});

function mgUpdate(dt) {
  if (!MG) return;
  if (MG.res) {
    MG.rt += dt;
    if (MG.rt > 2.4) applyMG();
    return;
  }
  MG.t += dt;
  const left = MG.max - MG.t;
  if (MG.kind === "wires") {
    Object.keys(MG.spin).forEach((k) => {
      MG.spin[k] -= dt;
      if (MG.spin[k] <= 0) delete MG.spin[k];
    });
    if (left <= 0) finishMG(false);
  } else if (MG.kind === "plant") {
    MG.sp -= dt;
    if (MG.sp <= 0 && left > 2) {
      const free = MG.pl.map((p, i) => i).filter((i) => !MG.pl[i].need);
      if (free.length) {
        const i = free[Math.floor(Math.random() * free.length)];
        const T = Math.max(2.6, 4.4 - MG.t * 0.05);
        MG.pl[i].need = { k: Math.floor(Math.random() * 3), t: T, T };
      }
      MG.sp = Math.max(0.8, 1.9 - MG.t * 0.035);
    }
    MG.pl.forEach((p, i) => {
      if (p.need) {
        p.need.t -= dt;
        if (p.need.t <= 0) {
          p.need = null;
          p.h = Math.max(0, p.h - 22);
          MG.combo = 0;
          MG.pop.push({ x: 140 + i * 180, y: 150, m: "TOO LATE", c: "#ff9f45", t: 0 });
          beep(160, 0.1);
        }
      } else if (p.h > 40) p.g = Math.min(100, p.g + 1.4 * dt);
    });
    MG.pop.forEach((q) => (q.t += dt));
    MG.pop = MG.pop.filter((q) => q.t < 0.9);
    if (left <= 0) {
      const sum = MG.pl.reduce((a, p) => a + (p.h > 0 ? p.g : 0), 0);
      const n = sum >= 210 ? 3 : sum >= 140 ? 2 : sum >= 70 ? 1 : 0;
      finishMG(n > 0, n);
    }
  } else if (MG.kind === "storm") {
    if (MG.keys.arrowleft || MG.keys.a) MG.tx -= 440 * dt;
    if (MG.keys.arrowright || MG.keys.d) MG.tx += 440 * dt;
    MG.tx = clamp(MG.tx, 70, 570);
    MG.sx += (MG.tx - MG.sx) * Math.min(1, 14 * dt);
    MG.glow = Math.max(0, MG.glow - dt * 3);
    MG.shake = Math.max(0, MG.shake - dt * 3);
    const spawn = (x, heavy, v) => {
      const tx = 320 + rnd(-26, 26),
        ty = 360;
      const d = Math.hypot(tx - x, ty + 10);
      MG.parts.push({
        x,
        y: -10,
        vx: ((tx - x) / d) * v,
        vy: ((ty + 10) / d) * v,
        heavy,
        tr: [],
      });
    };
    if (left > 1.5) {
      MG.sp -= dt;
      if (MG.sp <= 0) {
        const heavy = Math.random() < 0.22;
        spawn(rnd(20, 620), heavy, heavy ? 120 + MG.t * 3 : 170 + MG.t * 6);
        MG.sp = Math.max(0.22, 0.62 - MG.t * 0.014);
      }
      MG.burst -= dt;
      if (MG.burst <= 1.2 && MG.warn <= 0) {
        MG.warn = 1.2;
        MG.side = Math.random() < 0.5 ? 0 : 1;
      }
      if (MG.warn > 0) {
        MG.warn -= dt;
        if (MG.warn <= 0) {
          for (let i = 0; i < 6; i++) spawn((MG.side ? 400 : 40) + i * 36, false, 230 + i * 8);
          MG.burst = 7;
        }
      }
    }
    MG.parts.forEach((p) => {
      p.tr.unshift([p.x, p.y]);
      if (p.tr.length > 4) p.tr.pop();
      p.x += p.vx * dt;
      p.y += p.vy * dt;
    });
    MG.parts = MG.parts.filter((p) => {
      const w = p.heavy ? 2 : 1;
      if (p.y > 272 && p.y < 296 && Math.abs(p.x - MG.sx) < 66) {
        MG.blocked += w;
        MG.total += w;
        MG.glow = 1;
        beep(p.heavy ? 500 : 1000, 0.03, 0.02);
        return false;
      }
      if (p.y > 345) {
        MG.hit += w;
        MG.total += w;
        MG.shake = 1;
        beep(140, 0.06, 0.03);
        return false;
      }
      return true;
    });
    if (left <= 0) finishMG(true, MG.total ? MG.blocked / MG.total : 0);
  } else {
    MG.scan = Math.max(0, MG.scan - dt);
    MG.scd = Math.max(0, MG.scd - dt);
    MG.mt += dt;
    while (MG.mt >= 0.11) {
      MG.mt -= 0.11;
      if (MG.dir) {
        const d = { u: [0, -1], d: [0, 1], l: [-1, 0], r: [1, 0] }[MG.dir];
        if (d[0]) MG.face = d[0];
        const nx = MG.x + d[0],
          ny = MG.y + d[1];
        if (MG.g[ny] && MG.g[ny][nx] === 0) {
          MG.x = nx;
          MG.y = ny;
          revealMaze(2.7);
          const k = nx + "," + ny;
          if (MG.items[k]) {
            MG.got[MG.items[k]]++;
            delete MG.items[k];
            beep(900, 0.05);
          }
        }
      }
    }
    if (left <= 0 || !Object.keys(MG.items).length) finishMG(true, MG.got);
  }
}
function drawPipe(x, y, s, m, on, sp) {
  const cx = x + s / 2,
    cy = y + s / 2;
  mc.save();
  mc.translate(cx, cy);
  if (sp > 0) mc.rotate((-sp / 0.12) * (Math.PI / 2));
  const seg = (w, col) => {
    mc.fillStyle = col;
    mc.fillRect(-w / 2, -w / 2, w, w);
    if (m & 1) mc.fillRect(-w / 2, -s / 2, w, s / 2);
    if (m & 2) mc.fillRect(0, -w / 2, s / 2, w);
    if (m & 4) mc.fillRect(-w / 2, 0, w, s / 2);
    if (m & 8) mc.fillRect(-s / 2, -w / 2, s / 2, w);
  };
  seg(18, "#0b0f2a");
  seg(12, on ? "#3fd8f5" : "#6a7299");
  if (on) seg(4, "#e6fdff");
  else seg(4, "#8f97bd");
  mc.restore();
}
function drawPlant(cx, p, sel, t) {
  const base = 300;
  Q(cx - 34, base, 68, 10, "#8a3f22");
  Q(cx - 30, base + 10, 60, 32, "#c4622d");
  Q(cx - 30, base + 10, 60, 4, "#e08446");
  Q(cx - 26, base - 4, 52, 6, "#4a3020");
  const wilt = p.h < 35;
  const sc = wilt ? "#9b8a3c" : "#2f8f3f",
    lc = wilt ? "#c2ad4a" : "#5fd36a",
    ld = wilt ? "#8a7a30" : "#36a447";
  const hgt = Math.round(14 + p.g * 1.5);
  const sway = Math.round(Math.sin(t / 600 + cx) * 2);
  Q(cx - 3, base - hgt, 6, hgt, "#123a1a");
  Q(cx - 2, base - hgt, 4, hgt, sc);
  for (let yy = base - 18, j = 0; yy > base - hgt + 6; yy -= 20, j++) {
    const dir = j % 2 ? 1 : -1;
    const lx = dir > 0 ? cx + 2 : cx - 24;
    Q(lx + sway, yy - 2, 22, 10, "#123a1a");
    Q(lx + 1 + sway, yy - 1, 20, 8, lc);
    Q(lx + 1 + sway, yy + 4, 20, 3, ld);
  }
  if (p.g >= 70) {
    [
      [-12, -hgt + 10],
      [10, -hgt + 22],
      [-6, -hgt + 30],
    ].forEach(([dx, dy]) => {
      Q(cx + dx - 1, base + dy - 1, 10, 10, "#5a0d0d");
      Q(cx + dx, base + dy, 8, 8, "#ff4f4f");
      Q(cx + dx + 1, base + dy + 1, 3, 3, "#ffb3b3");
    });
  }
  Q(cx - 30, base + 48, 60, 6, "#0b0f2a");
  Q(
    cx - 29,
    base + 49,
    (58 * p.h) / 100,
    4,
    p.h > 50 ? "#7bd88f" : p.h > 25 ? "#ffd166" : "#ff5d73",
  );
  if (sel) {
    mc.strokeStyle = "#ffd166";
    mc.lineWidth = 2;
    mc.strokeRect(cx - 70, 70, 140, 290);
  }
  if (p.need) {
    const by = Math.max(60, base - hgt - 58);
    const tool = TOOLS[p.need.k];
    const urgent = p.need.t < 1.4 && Math.floor(t / 120) % 2;
    Q(cx - 24, by - 2, 48, 46, "#0b0f2a");
    Q(cx - 22, by, 44, 42, urgent ? "#ffe3e3" : "#ffffff");
    Q(cx - 4, by + 42, 8, 8, "#ffffff");
    mask(ICO[tool.ic], cx - 14, by + 6, 4, tool.c);
    Q(cx - 22, by + 54, 44, 5, "#0b0f2a");
    Q(cx - 21, by + 55, (42 * p.need.t) / p.need.T, 3, p.need.t < 1.4 ? "#ff5d73" : "#7bd88f");
  }
}
function drawRover(x, y, f) {
  mc.save();
  mc.translate(x, y);
  mc.scale(f, 1);
  Q(-11, -7, 22, 11, "#0b0f2a");
  Q(-10, -6, 20, 9, "#eef1ff");
  Q(2, -5, 7, 4, "#3fa7ff");
  Q(-10, 0, 20, 3, "#ff9f45");
  Q(-9, 3, 6, 6, "#0b0f2a");
  Q(3, 3, 6, 6, "#0b0f2a");
  Q(-7, 5, 2, 2, "#8f97bd");
  Q(5, 5, 2, 2, "#8f97bd");
  Q(-6, -11, 2, 5, "#8f97bd");
  Q(-8, -12, 6, 2, "#ffd166");
  mc.restore();
}
function drawItem(kind, x, y, t) {
  const b = Math.round(Math.sin(t / 250 + x) * 1);
  if (kind === "ice") {
    Q(x - 7, y - 7 + b, 14, 14, "#0b0f2a");
    Q(x - 6, y - 6 + b, 12, 12, "#9fe8ff");
    Q(x - 6, y - 6 + b, 12, 3, "#e6fbff");
    Q(x - 4, y - 2 + b, 3, 3, "#ffffff");
  } else if (kind === "ilmenite") {
    Q(x - 6, y - 5 + b, 12, 11, "#0b0f2a");
    Q(x - 5, y - 4 + b, 10, 9, "#4b4f63");
    Q(x - 3, y - 2 + b, 3, 3, "#ff9f45");
    Q(x + 1, y + 1 + b, 2, 2, "#ff9f45");
  } else {
    Q(x - 7, y - 3 + b, 8, 7, "#0b0f2a");
    Q(x - 6, y - 2 + b, 6, 5, "#c9ccd8");
    Q(x, y - 5 + b, 8, 8, "#0b0f2a");
    Q(x + 1, y - 4 + b, 6, 6, "#9ea2b5");
  }
}
function mgDraw(t) {
  if (!MG) return;
  const left = Math.max(0, MG.max - MG.t);
  mc.save();
  if (MG.kind === "storm" && MG.shake > 0)
    mc.translate(Math.round(rnd(-3, 3) * MG.shake), Math.round(rnd(-3, 3) * MG.shake));
  Q(0, 0, 640, 420, "#0a0e2a");
  if (MG.kind === "wires") {
    for (let i = 0; i < 40; i++) Q((i * 97) % 640, (i * 53) % 420, 2, 2, "#1d2660");
    const { c, r, s, ox, oy } = GRID;
    Q(ox - 8, oy - 8, c * s + 16, r * s + 16, "#0b0f2a");
    Q(ox - 6, oy - 6, c * s + 12, r * s + 12, "#2a3470");
    for (let y = 0; y < r; y++)
      for (let x = 0; x < c; x++) {
        const px = ox + x * s,
          py = oy + y * s;
        Q(px + 2, py + 2, s - 4, s - 4, "#161d4a");
        Q(px + 2, py + 2, s - 4, 3, "#222b66");
        Q(px + 5, py + 5, 3, 3, "#2f3a80");
        Q(px + s - 8, py + s - 8, 3, 3, "#2f3a80");
        drawPipe(px, py, s, MG.tiles[y][x], MG.pow.on[y][x], MG.spin[x + "," + y] || 0);
      }
    const [cx2, cy2] = MG.cur;
    mc.strokeStyle = "#ffd166";
    mc.lineWidth = 3;
    mc.strokeRect(ox + cx2 * s + 1.5, oy + cy2 * s + 1.5, s - 3, s - 3);
    const sy = oy + GRID.src * s + s / 2;
    Q(ox - 30, sy - 6, 30, 12, "#0b0f2a");
    Q(ox - 30, sy - 3, 30, 6, "#3fd8f5");
    Q(30, sy - 46, 80, 92, "#0b0f2a");
    Q(34, sy - 42, 72, 84, "#8f97bd");
    for (let j = 0; j < 4; j++)
      for (let i = 0; i < 3; i++)
        Q(38 + i * 23, sy - 38 + j * 20, 20, 17, i % 2 === j % 2 ? "#2d5bd6" : "#3a6ff0");
    Q(38, sy - 38, 64, 2, "#9fc4ff");
    mc.fillStyle = "#ffd166";
    mc.font = PF(8);
    mc.textAlign = "center";
    mc.fillText("SOLAR", 70, sy + 62);
    const NM = ["LAB", "HAB", "AIR"];
    GRID.tg.forEach((ty, i) => {
      const my = oy + ty * s + s / 2;
      const on = MG.pow.lit[i];
      Q(ox + c * s, my - 6, 22, 12, "#0b0f2a");
      Q(ox + c * s, my - 3, 22, 6, on ? "#3fd8f5" : "#6a7299");
      Q(ox + c * s + 22, my - 26, 72, 52, "#0b0f2a");
      Q(ox + c * s + 24, my - 24, 68, 48, "#c9cee8");
      Q(ox + c * s + 24, my - 24, 68, 6, "#eef1ff");
      Q(ox + c * s + 32, my - 12, 20, 16, on ? "#ffd84a" : "#2a2f4a");
      Q(ox + c * s + 58, my - 12, 20, 16, on ? "#ffd84a" : "#2a2f4a");
      mc.fillStyle = on ? "#1b6b2a" : "#6a2a2a";
      mc.font = PF(7);
      mc.fillText(NM[i], ox + c * s + 58, my + 18);
    });
    mc.fillStyle = "#fff";
    mc.font = PF(9);
    mc.textAlign = "left";
    mc.fillText(`POWER ${MG.pow.n}/3`, 470, 26);
  } else if (MG.kind === "plant") {
    Q(0, 0, 640, 420, "#10233a");
    for (let x = 0; x < 640; x += 32) Q(x, 0, 2, 360, "#163050");
    Q(0, 30, 640, 14, "#0b0f2a");
    for (let x = 8; x < 640; x += 16) Q(x, 36, 8, 5, x % 32 === 8 ? "#ff3d6e" : "#5a6bff");
    mc.fillStyle = "rgba(200,80,255,.07)";
    mc.fillRect(0, 44, 640, 300);
    Q(0, 344, 640, 12, "#3a2a20");
    MG.pl.forEach((p, i) => drawPlant(140 + i * 180, p, MG.sel === i, t));
    TOOLS.forEach((tl, i) => {
      const x = 115 + i * 140;
      const on = MG.tool === i;
      Q(x, 362, 130, 44, on ? "#ffd166" : "#0b0f2a");
      Q(x + 3, 365, 124, 38, on ? "#2a3470" : "#1b2350");
      mask(ICO[tl.ic], x + 10, 370, 4, tl.c);
      mc.fillStyle = "#fff";
      mc.font = PF(8);
      mc.textAlign = "left";
      mc.fillText(i + 1 + " " + tl.n, x + 44, 389);
    });
    MG.pop.forEach((q) => {
      mc.fillStyle = q.c;
      mc.font = PF(10);
      mc.textAlign = "center";
      mc.fillText(q.m, q.x, q.y - q.t * 40);
    });
    const sum = MG.pl.reduce((a, p) => a + (p.h > 0 ? p.g : 0), 0);
    Q(220, 8, 244, 16, "#0b0f2a");
    Q(222, 10, (240 * Math.min(sum, 300)) / 300, 12, "#7bd88f");
    [70, 140, 210].forEach((v) => Q(222 + (240 * v) / 300, 8, 2, 16, "#ffd166"));
    mc.fillStyle = "#fff";
    mc.font = PF(8);
    mc.textAlign = "left";
    mc.fillText("HARVEST", 480, 21);
    if (MG.combo > 1) {
      mc.fillStyle = "#ffd166";
      mc.fillText("COMBO x" + MG.combo, 470, 60);
    }
  } else if (MG.kind === "storm") {
    for (let i = 0; i < 60; i++)
      Q((i * 131) % 640, (i * 71) % 300, 2, 2, i % 6 ? "#2a3470" : "#cfd8ff");
    Q(560, 30, 40, 40, "#ff9f45");
    Q(566, 36, 28, 28, "#ffd166");
    if (MG.warn > 0 && Math.floor(t / 100) % 2) {
      mc.fillStyle = "rgba(255,120,40,.18)";
      mc.fillRect(0, 0, 640, 420);
      mc.fillStyle = "#ffd166";
      mc.font = PF(14);
      mc.textAlign = "center";
      mc.fillText(MG.side ? "FLARE! >>>" : "<<< FLARE!", 320, 120);
    }
    Q(0, 398, 640, 22, "#8a8fa8");
    Q(0, 398, 640, 4, "#b9bdd0");
    for (let x = 0; x < 640; x += 46) Q(x + 10, 408, 10, 4, "#6f7490");
    drawMira(mc, 320, 400, 1, { mode: "idle", dir: 1, k: 1.05 });
    MG.parts.forEach((p) => {
      const sz = p.heavy ? 10 : 6;
      const col = p.heavy ? "#ff5d73" : "#ffd166";
      p.tr.forEach((q, i) => {
        mc.globalAlpha = 0.5 - i * 0.12;
        Q(q[0] - sz / 4, q[1] - sz / 4, sz / 2, sz / 2, col);
      });
      mc.globalAlpha = 1;
      Q(p.x - sz / 2 - 1, p.y - sz / 2 - 1, sz + 2, sz + 2, "#2a0a0a");
      Q(p.x - sz / 2, p.y - sz / 2, sz, sz, col);
      Q(p.x - sz / 2, p.y - sz / 2, sz / 2, sz / 2, "#ffffff");
    });
    const gx = MG.sx;
    if (MG.glow > 0) {
      mc.globalAlpha = MG.glow * 0.5;
      Q(gx - 74, 272, 148, 30, "#e6dcff");
      mc.globalAlpha = 1;
    }
    Q(gx - 68, 278, 136, 18, "#0b0f2a");
    Q(gx - 66, 280, 132, 14, "#b9a3ff");
    Q(gx - 66, 280, 132, 4, "#e6dcff");
    Q(gx - 66, 290, 132, 4, "#7b5fd0");
    mc.fillStyle = "#3a1d80";
    mc.font = PF(7);
    mc.textAlign = "center";
    mc.fillText("H H H H", gx, 291);
    const pct = MG.total ? Math.round((MG.blocked / MG.total) * 100) : 100;
    mc.fillStyle = "#fff";
    mc.font = PF(9);
    mc.textAlign = "left";
    mc.fillText(`BLOCKED ${pct}%`, 440, 26);
  } else {
    const MS = 26,
      ox = 47,
      oy = 15;
    for (let y = 0; y < 15; y++)
      for (let x = 0; x < 21; x++) {
        const px = ox + x * MS,
          py = oy + y * MS;
        if (MG.g[y][x]) {
          Q(px, py, MS, MS, "#2d3158");
          Q(px, py, MS, 5, "#4a4f80");
          Q(px + 4, py + 10, 4, 4, "#3a3f6c");
        } else {
          Q(px, py, MS, MS, "#a5a9bd");
          if ((x * 7 + y * 13) % 5 === 0) Q(px + 8, py + 12, 3, 3, "#8a8ea4");
          if ((x * 11 + y * 3) % 7 === 0) Q(px + 17, py + 5, 2, 2, "#c4c7d6");
        }
      }
    Object.keys(MG.items).forEach((k) => {
      if (!MG.seen[k]) return;
      const [x, y] = k.split(",").map(Number);
      drawItem(MG.items[k], ox + x * MS + MS / 2, oy + y * MS + MS / 2, t);
    });
    drawRover(ox + MG.x * MS + MS / 2, oy + MG.y * MS + MS / 2 + 2, MG.face);
    for (let y = 0; y < 15; y++)
      for (let x = 0; x < 21; x++) {
        const d = Math.hypot(x - MG.x, y - MG.y);
        const lit = d <= 2.7 || (MG.scan > 0 && d <= 6);
        if (lit) continue;
        Q(ox + x * MS, oy + y * MS, MS, MS, MG.seen[x + "," + y] ? "rgba(5,8,26,.6)" : "#05081a");
      }
    mc.fillStyle = "#fff";
    mc.font = PF(8);
    mc.textAlign = "left";
    const left2 = Object.keys(MG.items).length;
    mc.fillText(`LEFT ${left2}`, 470, 12);
    mc.fillStyle = MG.scd > 0 ? "#6a7299" : "#3fd8f5";
    mc.fillText(MG.scd > 0 ? `SCAN ${Math.ceil(MG.scd)}s` : "SPACE: SCAN", 140, 12);
  }
  mc.fillStyle = left < 6 && Math.floor(t / 250) % 2 ? "#ff5d73" : "#ffffff";
  mc.font = PF(10);
  mc.textAlign = "left";
  mc.fillText("TIME " + Math.ceil(left), 10, MG.kind === "maze" ? 12 : 24);
  if (MG.res) {
    Q(0, 160, 640, 100, "#0b0f2a");
    Q(0, 164, 640, 92, MG.res.ok ? "#14402a" : "#4a1420");
    mc.fillStyle = MG.res.ok ? "#7bd88f" : "#ff5d73";
    mc.font = PF(22);
    mc.textAlign = "center";
    mc.fillText(MG.res.ok ? "SUCCESS!" : "TIME'S UP!", 320, 222);
  }
  mc.restore();
  mc.textAlign = "left";
}
