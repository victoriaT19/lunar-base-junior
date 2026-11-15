function setBub(m, s) {
  R.bub = m;
  R.bubT = s || 3;
}
function doAct(a) {
  ensureAudio();
  if (R.paused && a !== "snd") return;
  if (R.mode === "sleep" || R.mode === "eat" || R.leave > 0) return;
  if (a === "eat") {
    R.act = { t: "eat", p: STAND.eat };
  } else if (a === "sleep") {
    R.act = { t: "sleep", p: STAND.sleep };
  } else if (a === "pet") {
    pet();
  } else if (a === "missions") {
    R.act = { t: "missions", p: STAND.missions };
  } else if (a === "craft") {
    R.act = { t: "craft", p: STAND.craft };
  } else if (a === "exp") {
    if (!mod("airlock")) {
      toast(
        "🚪 Your ship has no airlock, so nobody can go outside. Try the dust maze mission instead.",
        4500,
      );
      setBub("No airlock... we can't go out.", 3);
      return;
    }
    R.act = { t: "exp", p: STAND.exp };
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
  if (R.act) {
    goTo(R.act.p[0], R.act.p[1]);
  }
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
      y: (R.sy || 400) - 70,
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
  if (R.build) dropHeld();
  R.build = !R.build;
  $("bBuild").className = R.build ? "on" : "";
  $("pal").className = R.build ? "on" : "";
  document.body.classList.toggle("building", R.build);
  if (R.build) buildPalette();
}
const SHORTN = {
  brick: "Brick",
  polymer: "Shield",
  window: "Window",
  solar: "Solar",
  plant: "Plant",
  bed: "Bunk",
  lamp: "Lamp",
  poster: "Poster",
  antenna: "Antenna",
  flag: "Flag",
  table: "Table",
  "mod:sleep": "Bedroom",
  "mod:garden": "Garden",
  "mod:wall": "H wall",
  "mod:cozy": "Lounge",
  "mod:yard": "Sun farm",
};
const COSTI = {
  regolith: "🪨",
  ilmenite: "🔶",
  carbon: "⚫",
  ice: "🧊",
  metal: "🔩",
  polymer: "🟪",
  solar: "🔋",
  units: "◈",
};
function costIcons(cost) {
  return Object.keys(cost)
    .map((k) => `${COSTI[k] || ""}${cost[k]}`)
    .join(" ");
}
function buildPalette() {
  const all = [
    ...Object.keys(BLK).map((k) => ({
      k,
      e: BLK[k].e,
      n: SHORTN[k] || BLK[k].n,
      full: BLK[k].n,
      cost: BLK[k].cost,
    })),
    ...Object.keys(MODS).map((k) => ({
      k,
      e: MODS[k].e,
      n: SHORTN[k] || MODS[k].n,
      full: MODS[k].n + " (room)",
      cost: modCost(MODS[k]),
    })),
    ...Object.keys(S.stash || {})
      .filter((id) => S.stash[id] > 0 && BLK[id])
      .map((id) => ({
        k: "stash:" + id,
        e: BLK[id].e,
        n: (SHORTN[id] || BLK[id].n) + " ×" + S.stash[id],
        full: BLK[id].n + " (stored)",
        cost: null,
        tag: "stored",
      })),
    {
      k: "move",
      e: "✋",
      n: "Move",
      full: R.holding ? "Carrying: " + BLK[R.holding.id].n : "Move a piece",
      cost: null,
      tag: "pick up",
    },
    { k: "store", e: "📦", n: "Store", full: "Put a piece in storage", cost: null, tag: "keep it" },
    { k: "erase", e: "🧽", n: "Remove", full: "Remove a piece", cost: null, tag: "refund" },
  ];
  const sel = all.find((a) => a.k === R.tool);
  $("pal").innerHTML =
    `<div class="palh"><span class="pbig" aria-hidden="true">${sel ? sel.e : "🧱"}</span><b>${sel ? sel.full : "Pick a piece"}</b><small>${!sel ? "then tap the base" : sel.cost ? "Cost: " + costIcons(sel.cost) : sel.k === "move" ? (R.holding ? "Tap a free spot" : "Tap a piece to pick up") : sel.k === "store" ? "Tap a piece to store" : sel.k === "erase" ? "Gives it back" : "Free: it was stored"}</small><small>${sel && BLK[heldId()] && !String(heldId()).startsWith("mod:") ? (WALLI.has(heldId()) ? "🧱 Goes on a wall" : "🪑 Goes on the floor") : "🏠 −" + sizePenalty().toFixed(1) + " days"}</small><small class="bal">You have: ◈${S.units} 🪨${S.inv.regolith} 🔩${S.inv.metal} 🟪${S.inv.polymer} 🔋${S.inv.solar}</small></div>` +
    all
      .map(
        (a) =>
          `<button data-tool="${a.k}" class="${R.tool === a.k ? "on" : ""} ${a.cost && !afford(a.cost) ? "no" : ""}" title="${a.full}${a.cost ? ": " + costTxt(a.cost) : ""}" aria-label="${a.full}${a.cost ? ", costs " + costTxt(a.cost) : ""}"><i aria-hidden="true">${a.e}</i><span>${a.n}</span><small>${a.cost ? costIcons(a.cost) : a.tag || ""}</small></button>`,
      )
      .join("") +
    `<button class="palx" data-x="1" aria-label="Close build mode" title="Close">✕</button>`;
}
$("pal").onclick = (e) => {
  const b = e.target.closest("button");
  if (!b) return;
  if (b.dataset.x) {
    toggleBuild();
    return;
  }
  if (b.dataset.tool !== R.tool) dropHeld();
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
      0.18 *
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
  moveAstro(dt);
  if (R.mt > 0) {
    R.mt -= dt;
    if (R.mt <= 0) {
      if (R.mode === "eat") {
        n.hunger = Math.min(100, n.hunger + 55);
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
