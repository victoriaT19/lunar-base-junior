const W = 960,
  H = 540,
  CELL = 56,
  GX = 32,
  GY = 84,
  GC = 16,
  FLOORY = GY + 6 * CELL;
const $ = (id) => document.getElementById(id);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const rnd = (a, b) => a + Math.random() * (b - a);
const cv = $("cv");
let ctx = cv.getContext("2d");
ctx.scale(2, 2);
ctx.imageSmoothingEnabled = false;
const GCR = 1.37,
  DLIM = 250;
let DAYLEN = 60;
const LEVELS = [
  {
    id: "a11",
    n: "Apollo 11",
    yr: "1969",
    tag: "Short",
    days: 8.14,
    dur: "8 d 3 h 18 min",
    surf: "21 h 36 min on the lunar surface",
    crew: "3 astronauts, 2 walked on the Moon",
    fact: "First crewed Moon landing. Brought back about 21.5 kg of samples.",
    day: 1200,
    need: 0.85,
    storm: 0.7,
  },
  {
    id: "a17",
    n: "Apollo 17",
    yr: "1972",
    tag: "Classic",
    days: 12.58,
    dur: "12 d 13 h 52 min",
    surf: "About 75 h on the surface and 22 h of moonwalks",
    crew: "3 astronauts, 2 on the surface",
    fact: "The last crewed Moon landing so far. Brought back about 110 kg of samples.",
    day: 600,
    need: 1,
    storm: 1,
  },
  {
    id: "art1",
    n: "Artemis I",
    yr: "2022",
    tag: "Long haul",
    days: 25.45,
    dur: "25 d 10 h 53 min",
    surf: "Orion flew around the Moon without a crew",
    crew: "Uncrewed test flight for Artemis",
    fact: "Traveled about 2.25 million km and flew farther than any spacecraft built for humans.",
    day: 200,
    need: 1.2,
    storm: 1.3,
  },
];
function lvNow() {
  return LEVELS[S.level == null ? 1 : S.level] || LEVELS[1];
}
function applyLevel() {
  DAYLEN = S.plan && S.plan.day ? S.plan.day : lvNow().day;
}
function levelPicker() {
  return `<h3 style="margin:6px 0 0">Mission level: a real mission and its real duration</h3><div class="lvs">${LEVELS.map(
    (l, i) =>
      `<div class="lv ${(S.level == null ? 1 : S.level) === i ? "sel" : ""}" data-lv="${i}" tabindex="0" role="button" aria-pressed="${(S.level == null ? 1 : S.level) === i}"><b>${l.tag}: ${l.n} (${l.yr})</b><small>Real length: <b style="display:inline;font-family:inherit;font-size:1em;color:#fff">${l.dur}</b><br>${l.surf}.<br>${l.crew}.<br>${l.fact}<br><span style="color:var(--teal)">In the game: 1 mission day = ${Math.round(l.day / 60)} min, about ${Math.round((Math.max(1, l.days - 6) * l.day) / 60)} min of play</span></small></div>`,
  ).join("")}</div>`;
}

const SAVEKEY = "lbj_save_v1";
function defSave() {
  return {
    o2: 100,
    pwr: 80,
    hull: 100,
    pts: 0,
    best: {},
    garden: { stage: 0 },
    name: "Mira",
    suit: "#ff9f45",
    visor: "#1b2468",
    acc: 0,
    skin: -1,
    hair: 1,
    hairCol: -1,
    eyes: -1,
    outfit: 0,
    gender: 0,
    face: 1,
    eyeS: 1,
    brows: 0,
    mouth: 0,
    art: "toon",
    char: "short",
    lang: "en",
    level: 1,
    preset: "classic",
    inv: { regolith: 0, ilmenite: 0, carbon: 0, ice: 0, metal: 0, polymer: 0, solar: 0 },
    units: 60,
    rations: 4,
    dose: 0,
    needs: { hunger: 85, energy: 85, mood: 80 },
    t: 0,
    blocks: {},
    ch: -1,
    flags: {},
    disc: [],
    polyL: 0,
    lootTotal: 0,
    exp: 0,
    evac: false,
    started: false,
    plan: null,
    planned: false,
  };
}
function loadSave() {
  return fixSave(loadSave0());
}
function fixSave(o) {
  o.lang = "en";
  if (!(o.acc >= 0 && o.acc <= 3)) o.acc = 0;
  return o;
}
function loadSave0() {
  try {
    const r = localStorage.getItem(SAVEKEY);
    if (r) {
      const o = JSON.parse(r);
      return Object.assign(defSave(), o);
    }
  } catch (e) {}
  return defSave();
}
function writeSave() {
  try {
    localStorage.setItem(SAVEKEY, JSON.stringify(S));
  } catch (e) {}
}
let S = loadSave();
function mod(id) {
  if (MAND.some((m) => m.id === id)) return true;
  return S.plan ? !!S.plan.sel[id] : true;
}

const SKINS = ["#ffe0c2", "#f6c9a0", "#e0a678", "#c68642", "#a0663a", "#80502e", "#5e3a22"];
const HAIRC = [
  "#17141a",
  "#3b2314",
  "#7a4a24",
  "#d9442e",
  "#ff9a2e",
  "#ffd23f",
  "#ff5fa8",
  "#8a4be0",
  "#2f6fe0",
];
const HAIRN = ["Spiky", "Messy", "Long", "Puff", "Ponytail", "Buns"];
const EYEC = [
  "#4a2a14",
  "#7a4a24",
  "#2e8b57",
  "#2a6fb0",
  "#1b3a8a",
  "#14a8c8",
  "#8a4be0",
  "#222222",
];
const OUTN = ["Flight suit", "Hoodie", "Lab coat", "Striped jumpsuit"];
const SUITS = [
  "#ff9f45",
  "#4cc9f0",
  "#7bd88f",
  "#ff7aa8",
  "#b388ff",
  "#ffd166",
  "#ff5d73",
  "#e8ecff",
];
const VISORS = ["#1b2468", "#0e5e6f", "#6a1b9a", "#3b3b3b", "#8a4b08", "#0b6b3a"];
const ACCS = ["None", "Glasses", "Goggles", "Headphones"];

const A = Object.assign(
  {
    speed: 1,
    vol: 1,
    cap: true,
    big: false,
    toggleMine: false,
    rm: !!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches),
    hc: !!(window.matchMedia && matchMedia("(prefers-contrast: more)").matches),
  },
  (() => {
    try {
      return JSON.parse(localStorage.getItem("lbj_a11y") || "{}");
    } catch (e) {
      return {};
    }
  })(),
);
function saveA() {
  try {
    localStorage.setItem("lbj_a11y", JSON.stringify(A));
  } catch (e) {}
}
function applyA() {
  document.body.classList.toggle("hc", !!A.hc);
  document.body.classList.toggle("big", !!A.big);
  document.body.classList.toggle("rm", !!A.rm);
}
applyA();
