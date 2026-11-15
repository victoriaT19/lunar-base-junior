let PL = null;

function planGraphs(c) {
  const g = (l, v, max, col, txt) =>
    `<div class="l"><span>${l}</span><b>${txt}</b></div><div class="massbar"><i style="width:${clamp((v / max) * 100, 0, 100)}%;background:${col}"></i></div>`;
  return (
    g(
      "⏳ Mission time",
      c.missionDays,
      lvNow().days,
      "#5aa9ff",
      c.missionDays.toFixed(1) + " days at the Moon",
    ) +
    g("🫧 Life support", c.ls, 100, "#4cc9f0", Math.round(c.ls) + " / 100") +
    g("🛡️ Protective shield", c.sh, 100, "#b388ff", Math.round(c.sh) + " / 100") +
    g("💪 Resilience", c.res, 100, "#7bd88f", Math.round(c.res) + " / 100")
  );
}
function sizePenalty() {
  return Object.keys(S.blocks).length * 0.012 * (S.plan ? S.plan.missionDays : 6);
}
function missionTotal() {
  return Math.max(1, (S.plan ? S.plan.missionDays : 12.58) - sizePenalty()) * DAYLEN;
}
function missionLeft() {
  return missionTotal() - S.t;
}
function showTimeUp() {
  R.timeUp = true;
  endGame(mainDone() ? "win" : "late");
  return;
  R.paused = true;
  const done = S.ch >= CHAPTERS.length;
  $("endBox").innerHTML =
    `<h2>${done ? "🏁 Mission time is over" : "⏳ Mission time ran out"}</h2><p>${done ? S.name + " finished the whole story and the mission clock ran out. Time to head home." : "The mission clock hit zero before the outpost was finished. A heavier ship and a bigger base both cost mission time: every extra kilogram and every extra block took days away."}</p><ul><li>📅 Days on the Moon: ${Math.floor(S.t / DAYLEN)}</li><li>🔭 Discoveries: ${S.disc.length}</li><li>🧱 Blocks built: ${Object.keys(S.blocks).length}</li><li>☢️ Dose: ${S.dose.toFixed(0)} of ${DLIM} mSv</li></ul><button id="bNew2">Start a new mission</button>`;
  $("ovEnd").classList.add("on");
  $("bNew2").onclick = () => {
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
const MODS = {
  "mod:sleep": {
    n: "Sleeping nook",
    e: "🛏️",
    cells: [
      [0, 0, "bed"],
      [0, -1, "lamp"],
      [1, 0, "poster"],
    ],
  },
  "mod:garden": {
    n: "Garden row",
    e: "🌱",
    cells: [
      [0, 0, "plant"],
      [1, 0, "plant"],
      [2, 0, "plant"],
      [1, -1, "lamp"],
    ],
  },
  "mod:wall": {
    n: "Wall of hydrogen",
    e: "🛡️",
    cells: [
      [0, 0, "polymer"],
      [0, -1, "polymer"],
      [0, -2, "polymer"],
    ],
  },
  "mod:cozy": {
    n: "Cozy corner",
    e: "🪟",
    cells: [
      [0, 0, "window"],
      [1, 0, "window"],
      [2, 0, "poster"],
    ],
  },
  "mod:yard": {
    n: "Solar yard",
    e: "☀️",
    cells: [
      [0, 0, "solar"],
      [1, 0, "solar"],
      [2, 0, "solar"],
    ],
  },
};
function modCost(m) {
  const t = {};
  m.cells.forEach((c) => {
    const b = BLK[c[2]];
    Object.keys(b.cost).forEach((k) => (t[k] = (t[k] || 0) + b.cost[k]));
  });
  return t;
}
const APIKEY = "QqdH8KW98DC7pqKqLCGc7zd68wKcH6CPgQnGPhbk";
async function loadWx() {
  try {
    const raw = localStorage.getItem("lbj_wx2");
    if (raw) {
      const o = JSON.parse(raw);
      if (Date.now() - o.at < 6 * 3600 * 1000) {
        LIVE.flr = o.flr;
        LIVE.sep = o.sep;
        LIVE.gst = o.gst;
        return;
      }
    }
  } catch (e) {}
  try {
    const f = (x) => x.toISOString().slice(0, 10);
    const end = new Date();
    const q = (days) =>
      `startDate=${f(new Date(Date.now() - days * 864e5))}&endDate=${f(end)}&api_key=${APIKEY}`;
    const get = async (ep, days) => {
      const r = await fetch("https://api.nasa.gov/DONKI/" + ep + "?" + q(days));
      return r.ok ? await r.json() : [];
    };
    const [fl, sp, gs] = await Promise.all([get("FLR", 30), get("SEP", 30), get("GST", 60)]);
    const byTime = (p, q2) => (p.t < q2.t ? 1 : -1);
    LIVE.flr = fl
      .filter((x) => x.classType)
      .map((x) => ({
        id: x.flrID,
        cls: x.classType,
        t: x.peakTime || x.beginTime,
        ar: x.activeRegionNum,
      }))
      .sort(byTime)
      .slice(0, 8);
    LIVE.sep = sp
      .map((x) => ({ id: x.sepID, t: x.eventTime }))
      .sort(byTime)
      .slice(0, 6);
    LIVE.gst = gs
      .map((x) => ({
        id: x.gstID,
        t: x.startTime,
        kp: Math.max(0, ...(x.allKpIndex || []).map((k) => k.kpIndex || 0)),
      }))
      .sort(byTime)
      .slice(0, 6);
    localStorage.setItem(
      "lbj_wx2",
      JSON.stringify({ at: Date.now(), flr: LIVE.flr, sep: LIVE.sep, gst: LIVE.gst }),
    );
  } catch (e) {}
}
function openWx() {
  const fmt = (t) => (t || "").replace("T", " ").replace("Z", "").slice(0, 16);
  const empty = (n, m) => `<tr><td colspan="${n}">${m}</td></tr>`;
  const flr =
    LIVE.flr && LIVE.flr.length
      ? LIVE.flr
          .map(
            (x) =>
              `<tr><td>${fmt(x.t)}</td><td><b>${x.cls}</b></td><td>${x.ar ? "AR " + x.ar : "-"}</td></tr>`,
          )
          .join("")
      : empty(3, "No notable flares catalogued in the last 30 days: a quiet Sun, or no live data.");
  const sep =
    LIVE.sep && LIVE.sep.length
      ? LIVE.sep.map((x) => `<tr><td>${fmt(x.t)}</td><td>${x.id}</td></tr>`).join("")
      : empty(
          2,
          "No solar particle events in the last 30 days. The Sun has been quiet on that front.",
        );
  const gst =
    LIVE.gst && LIVE.gst.length
      ? LIVE.gst.map((x) => `<tr><td>${fmt(x.t)}</td><td>Kp ${x.kp}</td></tr>`).join("")
      : empty(2, "No geomagnetic storms in the last 60 days, or no live data.");
  const cme =
    LIVE.cmes && LIVE.cmes.length
      ? LIVE.cmes
          .map((x) => `<tr><td>${fmt(x.t)}</td><td>${Math.round(x.speed)} km/s</td></tr>`)
          .join("")
      : empty(2, "No live data right now.");
  openModal(
    head("📡 Space weather forecast") +
      `<p style="color:var(--mut);margin-top:0">Real events from NASA's DONKI database. The storm in this game is sized from the fastest recent coronal mass ejection (CME). ${LIVE.ok ? "Next storm source: <b>" + LIVE.id + "</b> at " + Math.round(LIVE.speed) + " km/s." : "Offline: the game uses a storm modeled on August 1972."}</p><h3 style="margin:8px 0 2px">🌪️ Fastest CMEs, last 30 days</h3><table><tr><th>Start (UTC)</th><th>Speed</th></tr>${cme}</table><h3 style="margin:10px 0 2px">🧲 Geomagnetic storms, last 60 days</h3><table><tr><th>Start (UTC)</th><th>Strength</th></tr>${gst}</table><h3 style="margin:10px 0 2px">☀️ Solar flares, last 30 days</h3><table><tr><th>Peak time (UTC)</th><th>Class</th><th>Region</th></tr>${flr}</table><h3 style="margin:10px 0 2px">⚡ Solar particle events (radiation storms), last 30 days</h3><table><tr><th>Time (UTC)</th><th>ID</th></tr>${sep}</table><p style="color:var(--mut);font-size:.85em">Flare classes B, C, M and X: each letter is about 10 times stronger than the one before. Kp measures Earth's geomagnetic activity from 0 to 9. Source: <a href="https://api.nasa.gov" target="_blank" rel="noopener">api.nasa.gov (DONKI)</a>.</p>`,
  );
}
function planCalc(sel) {
  let m = 0;
  MAND.forEach((i) => (m += i.kg));
  let rat = 0;
  MAND.forEach((i) => {
    if (i.rat) rat += i.rat;
  });
  [...OPTS, ...GEAR].forEach((i) => {
    if (sel[i.id]) {
      m += i.kg;
      if (i.rat) rat += i.rat;
    }
  });
  const days = 3 + (m - 4000) / 1500;
  const used = Math.ceil(days);
  const dose = days * GCR * 0.8 * (sel.med ? 0.9 : 1);
  const missionDays = Math.max(0.5, lvNow().days - 2 * days);
  const ls = clamp(
    30 + rat * 2.5 + (sel.greenhouse ? 15 : 0) + (sel.cabins ? 5 : 0) + (sel.med ? 8 : 0),
    0,
    100,
  );
  const sh = clamp(30 + (sel.suits ? 30 : 0) + (sel.med ? 8 : 0), 0, 100);
  const res = clamp(
    20 +
      (sel.arm ? 20 : 0) +
      (sel.gym ? 15 : 0) +
      (sel.cabins ? 15 : 0) +
      (sel.cupola ? 10 : 0) +
      (sel.lab ? 8 : 0) +
      (sel.instr ? 7 : 0) +
      (sel.personal ? 10 : 0) +
      (sel.hyg2 ? 5 : 0) +
      (sel.food3 ? 5 : 0) +
      (sel.food4 ? 5 : 0),
    0,
    100,
  );
  return { m, days, rat, used, left: rat - used, dose, missionDays, ls, sh, res };
}
function openPlan() {
  if (!PL) PL = { sel: S.plan ? { ...S.plan.sel } : {} };
  R.paused = true;
  renderPlan();
  $("ovPlan").classList.add("on");
}
function renderPlan() {
  const c = planCalc(PL.sel);
  const over = c.m > CAPKG;
  const card = (i, lock) =>
    `<div class="pc ${lock ? "lock" : PL.sel[i.id] ? "sel" : ""}" data-id="${i.id}" tabindex="0" role="button" aria-pressed="${lock ? "true" : !!PL.sel[i.id]}"><div style="font-size:1.2em">${lock ? "🔒" : PL.sel[i.id] ? "✅" : "⬜"}</div><div><b>${i.n}</b><small>${i.d}</small></div><div class="kg">${i.kg} kg</div></div>`;
  const left = c.left;
  $("planBox").innerHTML =
    `<h2>🚀 Phase 1 · Pack the ship on Earth</h2><p style="margin:0 0 6px;color:var(--mut)">Everything on the ship has mass. A heavier ship takes longer to reach the Moon, and a longer trip eats more food and collects more radiation. The real mission length minus the trip there and back is your time at the Moon, so a heavy, slow ship leaves fewer days to work. Pick what ${S.name} really needs.</p>${helpBox("How this screen works", ["🔒 <b>Required systems</b> are always on the ship. 🧩 <b>Optional modules</b> are your choice: each one helps (better health, faster scans, more food) but adds kilograms.", "Heavier ship = longer trip = fewer days on the Moon, more food eaten and more radiation on the way. Watch the <b>Mission time</b> graph on the right.", "<b>Mission level</b> picks a real NASA mission and its real duration. Short missions are easier.", "🗺️ <b>Missions</b>: earn stars to unlock new missions.", "When you are happy, press 🚀 Launch."])}${missionBoard()}${levelPicker()}${techBox()}
<div class="plan"><div class="catgrid">
<h3>🔒 Required systems</h3>${MAND.map((i) => card(i, true)).join("")}
<h3>🧩 Optional modules</h3>${OPTS.map((i) => card(i, false)).join("")}
<h3>🎒 Supplies and gear</h3>${GEAR.map((i) => card(i, false)).join("")}
</div><div><div class="sum">
<b>Mission graphs</b>${planGraphs(c)}<b>Ship summary</b>
<div class="massbar"><i style="width:${Math.min(100, (c.m / CAPKG) * 100)}%;background:${over ? "var(--bad)" : c.m > CAPKG * 0.9 ? "var(--warn)" : "var(--ok)"}"></i></div>
<div class="l"><span>Launch mass</span><b class="${over ? "no" : ""}">${Math.round(c.m)} / ${CAPKG} kg</b></div>
<div class="l"><span>🕒 Transit time</span><b>${c.days.toFixed(1)} days</b></div>
<div class="l"><span>🍲 Meals packed</span><b>${c.rat}</b></div>
<div class="l"><span>🍴 Eaten in transit</span><b>-${c.used}</b></div>
<div class="l"><span>🍲 Meals at arrival</span><b class="${left <= 0 ? "no" : "ok"}">${Math.max(0, left)}</b></div>
<div class="l"><span>☢️ Dose in transit</span><b>${c.dose.toFixed(1)} mSv</b></div>
<div class="l"><span>🚪 Can go outside</span><b class="ok">Yes (airlock included)</b></div>
<p style="color:var(--mut);font-size:.85em">${over ? "Too heavy! Remove something." : left <= 0 ? "You will arrive hungry. Pack more food or a lighter ship." : "Heavier ship = longer trip = more food and radiation."}</p>
<button id="bLaunch" style="width:100%" ${over ? "disabled" : ""}>🚀 Launch</button></div></div></div>`;
}
$("planBox").onclick = (e) => {
  const lvc = e.target.closest(".lv");
  if (lvc) {
    S.level = +lvc.dataset.lv;
    applyLevel();
    renderPlan();
    const lf = document.querySelector('.lv[data-lv="' + lvc.dataset.lv + '"]');
    if (lf) lf.focus();
    return;
  }
  const p = e.target.closest(".pc");
  if (p && !p.classList.contains("lock")) {
    PL.sel[p.dataset.id] = !PL.sel[p.dataset.id];
    const fid = p.dataset.id;
    renderPlan();
    const ff = document.querySelector('.pc[data-id="' + fid + '"]');
    if (ff) ff.focus();
    return;
  }
  if (e.target.id === "bLaunch") launch();
};
function launch() {
  const c = planCalc(PL.sel);
  if (c.m > CAPKG) return;
  S.plan = {
    sel: { ...PL.sel },
    mass: c.m,
    days: c.days,
    missionDays: c.missionDays,
    baseDays: lvNow().days,
    day: lvNow().day,
    need: lvNow().need,
    storm: lvNow().storm,
    level: S.level == null ? 1 : S.level,
    ls: c.ls,
    sh: c.sh,
    res: c.res,
  };
  S.planned = true;
  applyLevel();
  S.rations = Math.max(0, c.left);
  S.needs.hunger = 85 - Math.max(0, -c.left) * 15;
  S.dose = c.dose;
  S.polyL = PL.sel.suits ? 1 : 0;
  S.needs.mood = 80;
  writeSave();
  $("ovPlan").classList.remove("on");
  showTransit(c);
}
function showTransit(c) {
  R.paused = true;
  R.storyOpen = true;
  const days = Math.ceil(c.days);
  $("storyBox").innerHTML =
    `<h2>🚀 Transit to the Moon</h2><div class="massbar"><i id="tbar" style="width:0;background:var(--blue)"></i></div><div id="tlog" style="min-height:120px;color:var(--mut)"></div><div id="tend"></div>`;
  $("ovStory").classList.add("on");
  let d = 0;
  const iv = setInterval(() => {
    d++;
    $("tbar").style.width = Math.min(100, (d / days) * 100) + "%";
    $("tlog").innerHTML +=
      `<div>Day ${d}: 🍴 one meal eaten · ☢️ +${(c.dose / days).toFixed(1)} mSv${d === days ? " · Moon in sight!" : ""}</div>`;
    if (d >= days) {
      clearInterval(iv);
      $("tend").innerHTML =
        `<p>Arrival after <b>${c.days.toFixed(1)} days</b>. Meals left: <b>${Math.max(0, c.left)}</b>. Dose so far: <b>${c.dose.toFixed(1)} mSv</b>. Mission time available: <b>${c.missionDays.toFixed(1)} days</b> (real ${lvNow().n}: ${lvNow().dur}). Apollo crews took about 3 days to reach the Moon.${c.left < 0 ? " <span class='no'>The crew went hungry on the way.</span>" : ""}</p><button id="bLand">🌙 Land at Hopper Base</button>`;
      $("bLand").onclick = () => {
        $("ovStory").classList.remove("on");
        R.storyOpen = false;
        S.ch = 0;
        S.flags.intro = 1;
        writeSave();
        showChapter(0);
      };
    }
  }, 650);
}
