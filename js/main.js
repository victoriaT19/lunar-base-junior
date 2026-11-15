let last = 0,
  hudT = 0;
function updateHud(dt) {
  hudT += dt;
  if (hudT < 0.1) return;
  hudT = 0;
  const n = S.needs;
  const bar = (l, v, c, low) =>
    `<div class="bar ${low ? "low" : ""}"><b><span>${l}</span><span>${Math.round(v)}</span></b><div class="bt"><i style="width:${v}%;background:${c}"></i></div></div>`;
  const net = powerGen() - powerUse();
  $("bars").innerHTML =
    bar("🫧 Oxygen", S.o2, "#4cc9f0", S.o2 < 25) +
    bar(`⚡ Power ${net >= 0 ? "▲" : "▼"}`, S.pwr, "#ffd166", S.pwr < 20) +
    bar("🍲 Food", n.hunger, "#7bd88f", n.hunger < 25) +
    bar("🛠️ Hull", S.hull, "#ff9f45", S.hull < 30) +
    `<div style="font-size:.9em">😴 Rest ${Math.round(n.energy)} · 💛 Mood ${Math.round(n.mood)} · ☢️ ${S.dose.toFixed(1)}/${DLIM} mSv · ⭐ ${S.pts || 0}</div>`;
  const c = CHAPTERS[S.ch];
  const tick = (l, ok) => `<span class="gl ${ok ? "ok" : ""}">${ok ? "✅" : "⬜"} ${l}</span>`;
  const g0 =
    S.ch === 0
      ? `<div class="gls">${tick("🍽️ Table", cnt("table") >= 1)}${tick(
          "🖼️ Decor",
          ["lamp", "poster", "flag", "plant", "window", "bed"].some((d) => cnt(d) >= 1),
        )}${tick("🍲 Eat", S.flags.ate)}${tick("😴 Sleep", S.flags.slept)}${tick("🤖 Hi KAI", S.flags.petted)}</div>`
      : "";
  $("info").innerHTML =
    `<b>${S.name}</b> · ⏳ ${Math.max(0, missionLeft() / DAYLEN).toFixed(1)} days left · ◈ ${S.units} · 🍲 ${S.rations}<br>${c ? `<small>🎯 STEP ${S.ch + 1} OF ${CHAPTERS.length}: ${c.t.toUpperCase()}</small><br>${c.goal}${g0}` : mainDone() ? "<small>🏁 Main mission complete!</small>" : "<small>Plan your mission</small>"}`;
  let b = "";
  if (R.fault)
    b += `<div class="wc">🔧 FAULT: ${R.fault.t} <button data-b="wires">Repair</button></div>`;
  const st = R.storm;
  if (st.state === 1)
    b += `<div class="wc">☢️ STORM IN ${Math.ceil(st.t)} s <button data-b="storm">Shield drill</button></div>`;
  if (st.state === 2)
    b += `<div class="wc">☢️ STORM ACTIVE ${Math.ceil(st.t)} s${st.drilled ? "" : ' <button data-b="storm">Shield drill</button>'}</div>`;
  if (n.hunger < 20) b += `<div class="ww">🍲 ${S.name} is starving</div>`;
  if (S.o2 < 25) b += `<div class="ww">🫧 Oxygen is low! Charge the power and fix faults.</div>`;
  if (S.pwr < 15)
    b += `<div class="ww">⚡ Power is low! Build solar panels or turn off the grow light.</div>`;
  if (mainDone() && !R.ended)
    b += `<div class="wc">🏁 Main mission complete! <button data-b="home">🚀 Return to Earth</button></div>`;
  if (n.energy < 15) b += `<div class="ww">😴 ${S.name} is exhausted</div>`;
  if ($("banners").dataset.h !== b) {
    $("banners").innerHTML = b;
    $("banners").dataset.h = b;
  }
  $("toast").innerHTML = R.toasts.map((t) => `<div>${t.m}</div>`).join("");
}
$("banners").onclick = (e) => {
  const b = e.target.closest("button");
  if (b && b.dataset.b === "home") {
    endGame("win");
    return;
  }
  if (b && !R.paused) {
    startMG(b.dataset.b);
  }
};

function loop(ts) {
  const dt = Math.min(0.05, (ts - last) / 1000) * A.speed;
  last = ts;
  requestAnimationFrame(loop);
  const safe = (f) => {
    try {
      f();
    } catch (e) {
      console.error(e);
    }
  };
  safe(() => update(dt));
  safe(() => mgUpdate(dt));
  safe(() => drawHub(ts));
  safe(() => {
    if ($("prev")) drawPrev();
  });
  safe(() => {
    if (MG) mgDraw(ts);
  });
  safe(() => updateHud(dt));
}

$("bar").onclick = (e) => {
  const b = e.target.closest("button");
  if (b) doAct(b.dataset.a);
};
document.addEventListener("visibilitychange", () => {
  if (document.hidden) writeSave();
});
window.addEventListener("beforeunload", writeSave);

function showTitle() {
  const has = S.started;
  $("titleBox").innerHTML =
    `<h2>🌙 Lunar Base Junior</h2><p>A life-sim on the Moon. Create your astronaut, plan the mission, fly to the Moon, and look after your crew at Hopper Base near the lunar south pole, where NASA plans to land humans with Artemis.</p><ul><li>🎨 Design your astronaut: name, style, skin, hair, eyes and accessories.</li><li>🚀 Plan the ship: every extra module adds weight, travel time and risk.</li><li>🍲😴💛 Keep your astronaut fed, rested and happy.</li><li>🧱 Build and decorate the base block by block.</li><li>🎯 Play power grid, greenhouse, storm shield and dark crater missions, and explore the surface.</li><li>📡 Face real NASA space weather and learn the real science behind it.</li></ul>${has ? `<button id="bCont">▶ Continue as ${S.name}</button> ` : ""}<button id="bNew" class="${has ? "alt" : ""}">New game</button>`;
  if (has)
    $("bCont").onclick = () => {
      $("ovTitle").classList.remove("on");
      ensureAudio();
      R.paused = false;
      if (!S.planned && !S.plan && S.ch < 0) {
        openPlan();
        return;
      }
      if (S.ch === 0 && !S.flags.intro) {
        S.flags.intro = 1;
        showChapter(0);
      }
    };
  $("bNew").onclick = () => {
    if (has && !confirm("Start over? Your current base will be lost.")) return;
    const keep = has
      ? {
          name: S.name,
          suit: S.suit,
          visor: S.visor,
          acc: S.acc,
          skin: S.skin,
          hair: S.hair,
          hairCol: S.hairCol,
          eyes: S.eyes,
          outfit: S.outfit,
          char: S.char,
          preset: S.preset,
          gender: S.gender,
        }
      : {};
    S = Object.assign(defSave(), keep);
    S.started = true;
    PL = null;
    $("ovTitle").classList.remove("on");
    ensureAudio();
    R.newStyle = true;
    openStyle();
  };
}
function reportExp() {
  const e = S.lastExp;
  if (!e) return;
  S.lastExp = null;
  addPts(30 * (e.disc || 0) + 5 * (e.items || 0), "expedition");
  spend(4, 4, "expedition");
  toast(
    `🚀 Expedition complete: ${e.items} items, ${e.units} units, ${e.disc} new discoveries.`,
    6000,
  );
  writeSave();
}
if (S.started && S.lastExp && !S.evac) {
  $("ovTitle").classList.remove("on");
  R.paused = false;
  reportExp();
} else showTitle();
if (S.started && S.evac) {
  S.evac = false;
  evacuate();
}

async function loadDonki() {
  try {
    const end = new Date(),
      start = new Date(Date.now() - 30 * 864e5);
    const f = (x) => x.toISOString().slice(0, 10);
    const r = await fetch(
      `https://api.nasa.gov/DONKI/CME?startDate=${f(start)}&endDate=${f(end)}&api_key=${APIKEY}`,
    );
    if (!r.ok) throw new Error("x");
    const j = await r.json();
    const list = j
      .map((e) => {
        const a = e.cmeAnalyses && e.cmeAnalyses[0];
        return a && a.speed ? { id: e.activityID, speed: a.speed, t: e.startTime } : null;
      })
      .filter(Boolean);
    if (!list.length) throw new Error("x");
    const best = list.reduce((a, b) => (b.speed > a.speed ? b : a));
    LIVE.ok = true;
    LIVE.id = best.id;
    LIVE.speed = best.speed;
    LIVE.cmes = list
      .slice()
      .sort((a, b) => b.speed - a.speed)
      .slice(0, 6);
  } catch (e) {
    LIVE.ok = false;
  }
}

function openA11y() {
  const tg = (k, label, desc) =>
    `<div class="row"><div><b>${label}</b><small>${desc}</small></div><button data-ax="${k}" aria-pressed="${!!A[k]}" class="${A[k] ? "on" : "alt"}">${A[k] ? "ON" : "OFF"}</button></div>`;
  openModal(
    head("♿ Accessibility") +
      `<div class="row"><div><b>Game speed</b><small>Slows everything down, including timers and minigames. Take your time.</small></div><div>${[
        0.5, 0.75, 1,
      ]
        .map(
          (v) =>
            `<button data-ax="speed" data-v="${v}" aria-pressed="${A.speed === v}" class="${A.speed === v ? "on" : "alt"}">${v}×</button>`,
        )
        .join(" ")}</div></div>` +
      `<div class="row"><div><b>Volume</b><small>Zero is silent.</small></div><input type="range" id="volr" min="0" max="1" step="0.1" value="${A.vol}" aria-label="Volume"></div>` +
      tg("rm", "Reduce motion", "Fewer flashes, no storm streaks, calmer animations.") +
      tg("hc", "High contrast", "Stronger borders and colors.") +
      tg("big", "Large text", "Bigger text everywhere.") +
      tg("cap", "Sound captions", "Show text for important sounds, like alarms.") +
      tg(
        "toggleMine",
        "Toggle mining (expedition)",
        "Click once to start the mining beam and again to stop, instead of holding.",
      ) +
      `<div class="real">Keyboard: Tab and Shift+Tab move between buttons, Enter or Space activates, Esc closes menus. Shortcuts at the base: E eat, Z sleep, P pet, M missions, C craft, B build, S style, X expedition, W space weather, A accessibility. Important events are announced to screen readers. These settings are shared with the expedition and saved in this browser.</div>`,
  );
  $("volr").oninput = (e) => {
    A.vol = +e.target.value;
    saveA();
  };
}
window.addEventListener("keydown", (e) => {
  const tag = (e.target && e.target.tagName) || "";
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
  const k = e.key.toLowerCase();
  if (k === "escape" && $("ovMenu").classList.contains("on")) {
    closeModal();
    return;
  }
  if (
    (k === "enter" || k === " ") &&
    e.target &&
    e.target.classList &&
    e.target.classList.contains("pc")
  ) {
    e.preventDefault();
    e.target.click();
    return;
  }
  if (
    (k === "enter" || k === " ") &&
    e.target &&
    e.target.classList &&
    e.target.classList.contains("sw")
  ) {
    e.preventDefault();
    e.target.click();
    return;
  }
  if (R.paused || MG || e.ctrlKey || e.metaKey || e.altKey) return;
  const map = {
    e: "eat",
    z: "sleep",
    p: "pet",
    m: "missions",
    c: "craft",
    b: "build",
    s: "style",
    x: "exp",
    w: "wx",
    a: "a11y",
  };
  if (map[k]) {
    e.preventDefault();
    doAct(map[k]);
  }
});
document.querySelectorAll(".overlay").forEach((o) => {
  o.setAttribute("role", "dialog");
  o.setAttribute("aria-modal", "true");
  new MutationObserver(() => {
    if (o.classList.contains("on")) {
      setTimeout(() => {
        const b = o.querySelector("button,input");
        if (b) b.focus();
        const h = o.querySelector("h2");
        if (h) announce(h.textContent);
      }, 60);
    }
  }).observe(o, { attributes: true, attributeFilter: ["class"] });
});
async function loadTech() {
  try {
    const raw = localStorage.getItem("lbj_tech");
    if (raw) {
      const o = JSON.parse(raw);
      if (Date.now() - o.at < 12 * 3600 * 1000 && o.items.length) {
        LIVE.tech = o.items;
        return;
      }
    }
  } catch (e) {}
  try {
    const since = new Date(Date.now() - 14 * 864e5).toISOString().slice(0, 10);
    const r = await fetch(
      "https://api.nasa.gov/techport/api/projects?updatedSince=" + since + "&api_key=" + APIKEY,
    );
    if (!r.ok) return;
    const j = await r.json();
    const ids = j.projects
      .map((p) => p.projectId)
      .sort(() => Math.random() - 0.5)
      .slice(0, 8);
    const items = [];
    for (const id of ids) {
      if (items.length >= 3) break;
      const d = await fetch(
        "https://api.nasa.gov/techport/api/projects/" + id + "?api_key=" + APIKEY,
      );
      if (!d.ok) continue;
      const p = (await d.json()).project;
      if (!p || !p.title) continue;
      items.push({
        id: p.projectId,
        title: p.title,
        org: p.leadOrganization && p.leadOrganization.organizationName,
        trl: p.trlCurrent,
      });
    }
    LIVE.tech = items;
    localStorage.setItem("lbj_tech", JSON.stringify({ at: Date.now(), items }));
    if (PL && $("ovPlan").classList.contains("on")) renderPlan();
  } catch (e) {}
}
function techBox() {
  if (!LIVE.tech || !LIVE.tech.length) return "";
  return `<div class="real">🛰️ <b style="color:var(--txt)">Real NASA technology in development (TechPort):</b><br>${LIVE.tech
    .map(
      (t) =>
        `• ${String(t.title).replace(/</g, "&lt;")}${t.org ? " · " + t.org : ""}${t.trl ? " · TRL " + t.trl : ""}`,
    )
    .join(
      "<br>",
    )}<br><small>Real projects updated in the last two weeks. Space agencies test technologies like these for life support, shielding and power.</small></div>`;
}
applyLevel();
loadDonki();
loadWx();
loadTech();
