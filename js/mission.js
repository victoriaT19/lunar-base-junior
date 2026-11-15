const MISSIONS = [
  { id: "hopper", n: "Hopper Base: first landing", e: "🏠", need: 0 },
  { id: "debris", n: "Moon debris cleanup", e: "🧹", need: 4 },
  { id: "greenhouse", n: "A new lunar greenhouse", e: "🌱", need: 8 },
  { id: "signal", n: "Investigate a strange signal", e: "📡", need: 12 },
];
const PTS_GOAL = 900;

function totalStars() {
  return Object.values(S.best || {}).reduce((a, b) => a + b, 0);
}
function starsFor(p) {
  return Math.max(1, Math.min(5, 1 + Math.floor((p / PTS_GOAL) * 4)));
}
function starTxt(n) {
  return "★".repeat(n) + "☆".repeat(5 - n);
}
function addPts(n, why) {
  S.pts = (S.pts || 0) + n;
  toast(`⭐ +${n}`, 1800);
}
function mainDone() {
  return S.ch >= CHAPTERS.length;
}
function spend(o2, pwr, why) {
  S.o2 = clamp((S.o2 == null ? 100 : S.o2) - o2, 0, 100);
  S.pwr = clamp((S.pwr == null ? 80 : S.pwr) - pwr, 0, 100);
  S.needs.energy = Math.max(0, S.needs.energy - 1);
  if (why) toast(`🫧 −${o2}  ⚡ −${pwr}`, 1400);
}
function missionBoard() {
  const ts = totalStars();
  return `<h3 style="margin:6px 0 4px">🗺️ Missions</h3><div class="mboard">${MISSIONS.map((m) => {
    const open = ts >= m.need && m.id === "hopper";
    const best = (S.best || {})[m.id] || 0;
    return `<div class="mcard ${open ? "" : "locked"}" aria-label="${m.n}${open ? "" : ", locked"}"><span class="mico">${open ? m.e : "🔒"}</span><b>${m.n}</b><small>${open ? (best ? "Best: " + starTxt(best) : "Playing now") : m.need > ts ? `Needs ${m.need} ★ (you have ${ts})` : "Coming soon"}</small></div>`;
  }).join("")}</div>`;
}

function powerUse() {
  return 0.1 + Object.keys(S.blocks).length * 0.004 + (S.garden && S.garden.led ? 0.3 : 0);
}
function powerGen() {
  if (R.fault && R.fault.k === "power") return 0;
  return (0.14 + cnt("solar") * 0.07) * (R.storm.state === 2 ? 0.5 : 1);
}
function tickLife(dt) {
  if (S.o2 == null) S.o2 = 100;
  if (S.pwr == null) S.pwr = 80;
  if (S.hull == null) S.hull = 100;
  S.pwr = clamp(S.pwr + (powerGen() - powerUse()) * dt, 0, 100);
  const lsOn = S.pwr > 0.5 && !(R.fault && R.fault.k === "air");
  const plantO2 = S.garden && S.garden.stage >= 2 && !S.garden.dead ? 0.015 : 0;
  S.o2 = clamp(S.o2 + ((lsOn ? 0.05 : -0.45) + plantO2) * dt, 0, 100);
  if (R.fault) S.hull = clamp(S.hull - 0.1 * dt, 0, 100);
  tickGarden(dt);
  if (S.needs.hunger <= 0) S.starvT = (S.starvT || 0) + dt;
  else S.starvT = 0;
  if (S.o2 <= 0) return endGame("o2");
  if (S.hull <= 0) return endGame("hull");
  if (S.starvT > 60) return endGame("food");
}

function endGame(kind) {
  if (R.ended) return;
  R.ended = true;
  R.paused = true;
  const win = kind === "win";
  const st = win ? starsFor(S.pts || 0) : 0;
  if (win) {
    S.best = S.best || {};
    S.best.hopper = Math.max(S.best.hopper || 0, st);
  }
  const T = {
    win: [
      "🏆 Mission complete!",
      `${S.name} finished the main mission and came home in time. Mission Control is cheering and kids all over the world watched the landing!`,
    ],
    late: [
      "😢 Home, but the mission failed",
      `${S.name} came back to Earth, but the main mission was not finished when the time ran out. A lot of people worked for years on this mission and many of them are really upset... Next time, plan the ship lighter and keep the base small so you have more time.`,
    ],
    o2: [
      "💀 The oxygen ran out",
      `Without oxygen, nobody can survive. The life support needs power to make oxygen, and every task uses a little bit. Keep the batteries charged and repair faults fast.`,
    ],
    hull: [
      "💥 The base collapsed",
      `Faults that are not repaired and radiation storms slowly damage the base. When the hull reached zero, Hopper Base fell apart. Repair the power grid quickly and build shielding walls.`,
    ],
    food: [
      "💀 The food ran out",
      `${S.name} went too long without eating. Pack more meals on the ship, grow plants in the greenhouse and do not waste rations.`,
    ],
    dose: [
      "☢️ Too much radiation",
      `The radiation dose reached the ${DLIM} mSv limit and ${S.name} had to be rescued. Space agencies set limits like this to keep astronauts healthy. More shielding and taking the storm drill seriously would help.`,
    ],
  }[kind];
  $("endBox").innerHTML =
    `<h2>${T[0]}</h2><p>${T[1]}</p>${win ? `<div class="stars" aria-label="${st} of 5 stars">${starTxt(st)}</div>` : ""}<ul><li>⭐ Points: ${S.pts || 0} (${PTS_GOAL} for 5 stars)</li><li>📅 Days on the Moon: ${Math.floor(S.t / DAYLEN)}</li><li>🔭 Discoveries: ${S.disc.length}</li><li>🧱 Blocks built: ${Object.keys(S.blocks).length}</li><li>☢️ Dose: ${S.dose.toFixed(0)} of ${DLIM} mSv</li></ul>${missionBoard()}<button id="bAgain">🔁 Try a new mission</button>`;
  $("ovEnd").classList.add("on");
  announce(T[0]);
  writeSave();
  $("bAgain").onclick = restartMission;
}
function restartMission() {
  const keep = {
    name: S.name,
    suit: S.suit,
    acc: S.acc,
    skin: S.skin,
    hairCol: S.hairCol,
    eyes: S.eyes,
    char: S.char,
    level: S.level,
    best: S.best || {},
  };
  S = Object.assign(defSave(), keep, { started: true, ch: -1 });
  writeSave();
  location.reload();
}

function tickGarden(dt) {
  const g = S.garden;
  if (!g || g.stage === 0 || g.dead) return;
  if (g.stage >= 2) g.water = Math.max(0, g.water - 0.55 * dt);
  if (g.led) {
    g.ledT += dt;
    if (g.stage >= 2 && g.stage < 4 && g.water > 15) {
      g.grow = Math.min(100, g.grow + 1.3 * dt);
      if (g.grow >= 40) g.stage = 3;
      if (g.grow >= 100) g.stage = 4;
    }
    if (g.ledT > 75) {
      g.dead = true;
      g.led = false;
      S.pwr = Math.max(0, S.pwr - 25);
      toast(
        "🔥 The grow light stayed on too long! The plant burned and the base lost a lot of power.",
        5000,
      );
    }
  } else g.ledT = Math.max(0, g.ledT - 2 * dt);
  if (g.stage >= 2 && g.water <= 0) {
    g.dry = (g.dry || 0) + dt;
    if (g.dry > 30) {
      g.dead = true;
      g.led = false;
      toast("🥀 The plant dried out. Water it more often next time.", 4500);
    }
  } else g.dry = 0;
  if (R.gardenOpen) {
    R.gardenT = (R.gardenT || 0) + dt;
    if (R.gardenT > 0.5) {
      R.gardenT = 0;
      renderGarden();
    }
  }
}
function gardenAct(a) {
  const g = S.garden;
  if (a === "seed") {
    S.garden = { stage: 1, water: 0, grow: 0, led: false, ledT: 0, dead: false };
    spend(1, 1, "planting");
  } else if (a === "water" && g && !g.dead && g.stage >= 1) {
    if (S.inv.ice <= 0 && S.units < 5) {
      toast("💧 No water! Collect ice on expeditions or buy water for 5 units.", 3500);
      return;
    }
    if (S.inv.ice > 0) S.inv.ice--;
    else S.units -= 5;
    g.water = 100;
    if (g.stage === 1) g.stage = 2;
    spend(1, 1, "watering");
  } else if (a === "led" && g && !g.dead && g.stage >= 2) {
    g.led = !g.led;
    if (g.led) spend(0, 2, "grow light on");
  } else if (a === "harvest" && g && g.stage === 4 && !g.dead) {
    S.rations += 3;
    S.o2 = Math.min(100, S.o2 + 10);
    S.flags.plants = (S.flags.plants || 0) + 1;
    addPts(40, "harvest");
    S.garden = { stage: 0 };
    toast("🍅 Harvest! +3 rations and +10 oxygen. Plants make oxygen while they grow.", 4500);
  } else if (a === "clear") {
    S.garden = { stage: 0 };
  }
  renderGarden();
}
function openGarden() {
  R.gardenOpen = true;
  openModal(head("🌱 Lunar greenhouse") + `<div id="gardenBox"></div>`);
  renderGarden();
}
function renderGarden() {
  const box = $("gardenBox");
  if (!box) {
    R.gardenOpen = false;
    return;
  }
  const g = S.garden || { stage: 0 };
  const ST = ["Empty tray", "Seed planted", "Sprout", "Growing", "Ripe tomatoes!"];
  const ic = g.dead ? "🥀" : ["🪴", "🫘", "🌱", "🌿", "🍅"][g.stage];
  const bar = (l, v, c) =>
    `<div class="gbar"><span>${l}</span><div class="bt"><i style="width:${clamp(v, 0, 100)}%;background:${c}"></i></div></div>`;
  const step = (n, t, done) => `<li class="${done ? "ok" : ""}">${done ? "✅" : n + "."} ${t}</li>`;
  box.innerHTML = `<div class="garden"><div class="gplant" aria-hidden="true">${ic}</div><div><b>${g.dead ? "The plant died" : ST[g.stage]}</b>${g.stage >= 2 && !g.dead ? bar("💧 Water", g.water, "#4cc9f0") + bar("🌱 Growth", g.grow, "#7bd88f") + bar("💡 Light time", (g.ledT / 75) * 100, g.ledT > 55 ? "#ff5d73" : "#ffd166") : ""}<ol class="gsteps">${step(1, "Plant a seed in the grow pillow", g.stage >= 1)}${step(2, "Water it (uses 1 ice or 5 units)", g.stage >= 2)}${step(3, "Turn on the red and blue LED light to grow it, but turn it off before the light bar fills up!", g.stage >= 3)}${step(4, "Harvest the tomatoes", false)}</ol><div class="gbtns2">${g.stage === 0 || g.dead ? `<button data-g="${g.dead ? "clear" : "seed"}">${g.dead ? "🧹 Clean the tray" : "🫘 Plant seed"}</button>` : ""}${g.stage >= 1 && !g.dead && g.stage < 4 ? `<button data-g="water">💧 Water</button>` : ""}${g.stage >= 2 && !g.dead && g.stage < 4 ? `<button data-g="led" class="${g.led ? "on" : ""}">💡 LED ${g.led ? "ON (uses power)" : "OFF"}</button>` : ""}${g.stage === 4 && !g.dead ? `<button data-g="harvest">🍅 Harvest</button>` : ""}</div></div></div><div class="real">🔬 Real science: plants in space grow without soil (hydroponics) because lunar regolith has no organic matter. NASA's Veggie experiment uses "plant pillows" with clay and fertilizer so water does not form bubbles around the roots in low gravity. Red and blue LEDs give plants exactly the light they need for photosynthesis while saving power. Every action here costs a little oxygen and power, just like on a real base.</div>`;
  box.querySelectorAll("[data-g]").forEach((b) => (b.onclick = () => gardenAct(b.dataset.g)));
}
