function openModal(html) {
  R.paused = true;
  $("menuBox").innerHTML = html;
  $("ovMenu").classList.add("on");
}
function closeModal() {
  R.newStyle = false;
  $("ovMenu").classList.remove("on");
  R.paused = false;
  writeSave();
}
function invHtml(where) {
  return `<div class="inv">${Object.keys(ITEMS)
    .map(
      (k) =>
        `<span style="border-left:4px solid ${ITEMS[k].c}" title="${ITEMS[k].src}">${ITEMS[k].n}: <b>${S.inv[k]}</b>${where ? `<small class="iw">${ITEMS[k].w}</small>` : ""}</span>`,
    )
    .join("")}<span>🍲 ${S.rations}</span><span>◈ ${S.units}</span></div>`;
}
function helpBox(title, lines) {
  return `<details class="help"><summary>${title}</summary><ul>${lines.map((l) => `<li>${l.replace(/<[^>]+>/g, "")}</li>`).join("")}</ul></details>`;
}
const HELP_UNITS =
  "◈ <b>Units</b> are the base money. You earn them by finishing tasks, chapters and expeditions, and you spend them on supplies (Workshop) and some decorations (Build).";
function tags(rw, cost, time) {
  return `<span class="tags"><span class="tg good">🏅 ${rw}</span><span class="tg bad">🫧 −${cost[0]} ⚡ −${cost[1]}</span>${time ? `<span class="tg">⏱️ ${time}</span>` : ""}</span>`;
}
function head(title) {
  return `<div style="display:flex;justify-content:space-between;align-items:center"><h2>${title}</h2><button class="alt" data-m="close">✕ Close</button></div>`;
}

function openMissions() {
  const f = R.fault;
  const st = R.storm;
  openModal(
    head("🎯 Mission board") +
      helpBox("💡 Tips", [
        "These are <b>optional tasks</b>. They help you earn units and points, fix problems and keep the base alive. The <b>main goal</b> is always shown at the top right of the screen.",
        "🏅 green tag: what you <b>win</b>. 🫧⚡ red tag: the <b>oxygen and power it costs</b> to start. ⏱️: how long you have.",
        "<b>URGENT</b> means something is broken right now: fix it soon or the hull gets damaged.",
        HELP_UNITS,
        "⭐ Every task you finish also gives points. Points become stars at the end of the mission.",
      ]) +
      invHtml() +
      `<div class="row"><div><b>⚡ Power grid repair${f ? " (URGENT: " + f.t + ")" : ""}</b><small>${f ? "Rotate the power tiles to bring solar power back to every module." : "No fault right now. Practice for +10 units."}</small>${tags(f ? "+20 ◈ · +15 🛡️ hull · ⭐50" : "+10 ◈ · +15 🛡️ hull · ⭐50", [2, 3], "50 s")}</div><button data-m="wires">Play</button></div>` +
      `<div class="row"><div><b>🔌 Fix the wires</b><small>Connect each colored plug to the socket with the same color before time runs out.</small>${tags("+10 ◈ · +5 🛡️ hull · ⭐50", [2, 3], "25 s")}</div><button data-m="plugs">Play</button></div>` +
      `<div class="row"><div><b>🌱 Greenhouse</b><small>Plant, water and light a tomato plant step by step. Too much light burns it and wastes power!</small>${tags("+3 🍲 · +10 🫧 · ⭐40", [1, 1], "")}</div><button data-m="garden">Open</button></div>` +
      `<div class="row"><div><b>☢️ Storm shield drill${st.state ? " (LIVE STORM!)" : ""}</b><small>${st.state ? "Block the particles with your polymer shield to cut the real dose." : "Practice for +15 units. In a real storm it cuts your dose by up to 60%."}</small>${tags(st.state ? "−60% storm dose · ⭐30-70" : "+15 ◈ · ⭐30-70", [2, 3], "28 s")}</div><button data-m="storm">${st.state ? "Defend!" : "Practice"}</button></div>` +
      `<div class="row"><div><b>🚙 Dark crater rover</b><small>Drive into a dark crater, scan for ice and minerals and bring them home.</small>${tags("ice, ilmenite, regolith · ⭐50", [2, 3], "45 s")}</div><button data-m="maze">Play</button></div>` +
      `<div class="row"><div><b>🚀 Surface expedition</b><small>${mod("airlock") ? "Explore the open lunar surface, mine, scan discoveries and bring loot home." : "Your ship has no airlock, so this is locked."}</small>${tags("materials, discoveries · ⭐30 each", [4, 4], "until oxygen runs low")}</div><button data-m="exp" ${mod("airlock") ? "" : "disabled"}>${tr("Go")}</button></div>`,
  );
}
function openCraft() {
  openModal(
    head("🔧 Workshop") +
      helpBox("💡 Tips", [
        "<b>Craft</b> turns raw materials (regolith, ilmenite, ice, carbon) into useful parts: metal plates, polymer plates, solar cells, oxygen and meals.",
        "Get raw materials on <b>expeditions</b> or in the <b>dark crater rover</b>. The bar at the top shows what you have now.",
        "The <b>Supply store</b> sells things for units. " + HELP_UNITS,
        "Parts are used in <b>Build</b>: for example, a 🛡️ shield wall needs a polymer plate and a ☀️ solar panel needs a solar cell.",
      ]) +
      invHtml() +
      RC.map(
        (r, i) =>
          `<div class="row"><div><b>${r.n}</b><small>${tr("Needs")} ${costTxt(r.cost)} → ${tr(r.fx)}</small></div><button data-craft="${i}" ${afford(r.cost) ? "" : "disabled"}>Make</button></div>`,
      ).join("") +
      `<div class="row"><div><b>Install polymer plate in suit</b><small>Uses 1 Polymer plate. +20 hazard protection on expeditions. Installed: ${S.polyL}/5</small></div><button data-inst="1" ${S.inv.polymer >= 1 && S.polyL < 5 ? "" : "disabled"}>Install</button></div>` +
      `<h3 style="margin:10px 0 4px">Supply store</h3>` +
      SHOP.map(
        (s) =>
          `<div class="row"><div><b>${s[0] === "rat" ? "Ration" : ITEMS[s[0]].n}</b><small>${s[1]} units · ${s[2]}</small></div><button data-buy="${s[0]}" data-cost="${s[1]}" ${S.units >= s[1] ? "" : "disabled"}>Buy</button></div>`,
      ).join(""),
  );
}
const FACEN = ["Round", "Oval", "Wide", "Heart", "Square", "Long"];
const EYESN = ["Big", "Tall", "Sleepy", "Fierce", "Sparkly", "Dots"];
const BROWN = ["Thick", "Thin", "Cool", "Arch", "Unibrow"];
const MOUTHN = ["Smile", "Smirk", "Tongue", "Grin", "Line", "Oh!"];
const NAMES_LIST = [
  "Davi",
  "Luna",
  "Zeca",
  "Clara",
  "Igor",
  "Pedro",
  "Mila",
  "Caio",
  "Julia",
  "Leo",
  "Rafa",
  "Nina",
  "Bento",
  "Lia",
  "Teo",
];
const CHARN = {
  en: ["Spiky", "Curly", "Long", "Bun", "Mohawk"],
  pt: ["Espetado", "Cacheado", "Longo", "Coque", "Moicano"],
};
const TXT = {
  en: {
    title: "CUSTOMIZE YOUR ASTRONAUT",
    sub: "Create your character and join the adventure!",
    boy: "BOY",
    girl: "GIRL",
    name: "ASTRONAUT NAME",
    ph: "Type your name...",
    go: "READY! LET'S PLAY!",
    skin: "SKIN TONE",
    face: "FACE SHAPE",
    hair: "HAIR",
    hairCol: "HAIR COLOR",
    eyeS: "EYE SHAPE",
    eyes: "EYE COLOR",
    brows: "EYEBROWS",
    mouth: "MOUTH",
    acc: "ACCESSORIES",
    outfit: "OUTFIT",
    suit: "SUIT STRIPES",
    style: "CHOOSE YOUR STYLE!",
    foot: "Mix everything you like and create a unique astronaut!",
    orig: "Original colors from the art",
  },
  pt: {
    title: "PERSONALIZE SEU ASTRONAUTA",
    sub: "Crie seu personagem e embarque nessa aventura!",
    boy: "MENINO",
    girl: "MENINA",
    name: "NOME DO ASTRONAUTA",
    ph: "Digite seu nome...",
    go: "PRONTO! VAMOS JOGAR!",
    skin: "TOM DE PELE",
    face: "FORMATO DO ROSTO",
    hair: "CABELO",
    hairCol: "COR DO CABELO",
    eyeS: "FORMATO DOS OLHOS",
    eyes: "COR DOS OLHOS",
    brows: "SOBRANCELHA",
    mouth: "BOCA",
    acc: "ACESSÓRIOS",
    outfit: "UNIFORME",
    suit: "COR DO TRAJE",
    style: "ESCOLHA SEU ESTILO!",
    foot: "Misture tudo como quiser e crie um astronauta único!",
    orig: "Cores originais da arte",
  },
};
function tx(k) {
  return TXT[S.lang === "pt" ? "pt" : "en"][k];
}
const PRESETS = {
  classic: {
    n: { en: "Classic", pt: "Clássico" },
    d: { en: "Balanced and adventurous", pt: "Equilibrado e aventureiro" },
    c: "#a066ff",
    bg: "#2a1a5e",
    look: {
      char: "classic",
      skin: -1,
      hairCol: -1,
      eyes: -1,
      acc: 0,
      suit: "#ff9f45",
      gender: 0,
    },
  },
  creative: {
    n: { en: "Creative", pt: "Criativo" },
    d: { en: "Colorful and imaginative", pt: "Colorido e imaginativo" },
    c: "#4a9cff",
    bg: "#13306e",
    look: {
      char: "creative",
      skin: -1,
      hairCol: -1,
      eyes: -1,
      acc: 0,
      suit: "#14a8c8",
      gender: 0,
    },
  },
  bold: {
    n: { en: "Bold", pt: "Ousado" },
    d: { en: "Fun and full of attitude", pt: "Divertido e cheio de atitude" },
    c: "#ff5fa8",
    bg: "#5e1640",
    look: {
      char: "bold",
      skin: -1,
      hairCol: -1,
      eyes: -1,
      acc: 0,
      suit: "#ff5fa8",
      gender: 1,
    },
  },
  nerd: {
    n: { en: "Nerd", pt: "Nerd" },
    d: { en: "Smart and curious", pt: "Inteligente e curioso" },
    c: "#35c46a",
    bg: "#123e2a",
    look: {
      char: "nerd",
      skin: -1,
      hairCol: -1,
      eyes: -1,
      acc: 0,
      suit: "#7bd88f",
      gender: 0,
    },
  },
  explorer: {
    n: { en: "Explorer", pt: "Explorador" },
    d: { en: "Brave and determined", pt: "Corajoso e destemido" },
    c: "#ffc83a",
    bg: "#4e3810",
    look: {
      char: "explorer",
      skin: -1,
      hairCol: -1,
      eyes: -1,
      acc: 0,
      suit: "#ffd166",
      gender: 1,
    },
  },
};
function openStyle() {
  const lang = S.lang === "pt" ? "pt" : "en";
  const pix = (key, names) =>
    names
      .map(
        (nm, i) =>
          `<button class="pix ${S[key] === (key === "char" ? CHARS[i] : i) ? "on" : ""}" aria-pressed="${S[key] === (key === "char" ? CHARS[i] : i)}" aria-label="${nm}" title="${nm}" data-k="${key}" data-v="${key === "char" ? CHARS[i] : i}"><canvas data-ic="${key}:${key === "char" ? CHARS[i] : i}" width="40" height="40"></canvas></button>`,
      )
      .join("");
  const sw = (arr, key) =>
    arr
      .map(
        (c, i) =>
          `<button class="swb ${S[key] === i ? "on" : ""}" aria-pressed="${S[key] === i}" aria-label="${tx(key)} ${i + 1}" data-k="${key}" data-v="${i}" style="background:${c}"></button>`,
      )
      .join("") +
    `<button class="swb orig ${S[key] < 0 ? "on" : ""}" aria-pressed="${S[key] < 0}" aria-label="${tx("orig")}" title="${tx("orig")}" data-k="${key}" data-v="-1">★</button>`;
  const swc = (arr, key) =>
    arr
      .map(
        (c, i) =>
          `<button class="swb ${S[key] === c ? "on" : ""}" aria-pressed="${S[key] === c}" aria-label="${tx(key)} ${i + 1}" data-k="${key}" data-v="${c}" style="background:${c}"></button>`,
      )
      .join("");
  const row = (key, inner, ic) =>
    `<div class="opt"><canvas class="ico" data-ic="${ic || "row:" + key}" width="40" height="40"></canvas><div class="ob"><div class="olbl">${tx(key)}</div><div class="chips">${inner}</div></div></div>`;
  const cards = Object.keys(PRESETS)
    .map((k) => {
      const p = PRESETS[k];
      return `<button class="scard ${S.preset === k ? "on" : ""}" style="--sc:${p.c};--sbg:${p.bg}" data-preset="${k}" aria-pressed="${S.preset === k}"><canvas data-ic="preset:${k}" width="78" height="78"></canvas><span><b>${p.n[lang]}</b><small>${p.d[lang]}</small></span></button>`;
    })
    .join("");
  openModal(
    (R.newStyle
      ? ""
      : `<div style="text-align:right"><button class="alt" data-m="close" aria-label="Close">✕</button></div>`) +
      `<div class="crx"><div class="cpanel"><div class="ctitle">★ ${tx("title")} ★</div><div class="csub">${tx("sub")}</div><canvas id="prev" class="prev" width="240" height="330" aria-label="${S.name}"></canvas>
<div class="cbox"><div class="clbl">${tx("name")}</div><div class="nrow"><input type="text" id="nm" maxlength="12" value="${S.name}" placeholder="${tx("ph")}" aria-label="${tx("name")}"><button class="dice" data-dice="1" aria-label="Random name">🎲</button></div></div>` +
      (R.newStyle ? `<button id="bStart" class="go">🚀 ${tx("go")}</button>` : "") +
      `</div><div class="cpanel">${row("skin", sw(SKINS, "skin"))}${row("hair", pix("char", CHARN[lang]))}${row("hairCol", sw(HAIRC, "hairCol"))}${row("eyes", sw(EYEC, "eyes"))}${row("acc", pix("acc", ACCS))}${row("suit", swc(SUITS, "suit"))}</div></div>
<div class="cfoot"><div>🚀 ${tx("foot")}</div><div><span>Lunar Base Junior</span></div></div>`,
  );
  if (R.newStyle)
    $("bStart").onclick = () => {
      R.newStyle = false;
      $("ovMenu").classList.remove("on");
      writeSave();
      openPlan();
    };
  $("nm").oninput = (e) => {
    S.name = e.target.value.slice(0, 12) || "Mira";
  };
  renderIcons();
  drawPrev();
  setTimeout(drawPrev, 150);
  setTimeout(drawPrev, 600);
}
function renderIcons() {
  document.querySelectorAll("#menuBox canvas[data-ic]").forEach((cv2) => {
    const [key, v] = cv2.dataset.ic.split(":");
    const c2 = cv2.getContext("2d");
    c2.imageSmoothingEnabled = false;
    c2.clearRect(0, 0, cv2.width, cv2.height);
    const fit = (im, sx, sy, sw, sh) => {
      if (!ready(im)) return false;
      const s3 = Math.min(cv2.width / sw, cv2.height / sh);
      const w = sw * s3,
        h = sh * s3;
      c2.imageSmoothingEnabled = false;
      c2.drawImage(im, sx, sy, sw, sh, (cv2.width - w) / 2, (cv2.height - h) / 2, w, h);
      return true;
    };
    let ok = true;
    if (key === "row") {
      const M = {
        skin: [
          "..kkkkkk..",
          ".kssssssk.",
          "kssssssssk",
          "ksspsspssk",
          "kssssssssk",
          "ksskkkkssk",
          ".kssssssk.",
          "..kkkkkk..",
        ],
        hair: [
          "..hhhhhh..",
          ".hhhhhhhh.",
          "hhhhhhhhhh",
          "hhsssssshh",
          "hspsssspsh",
          "hssssssssh",
          ".sskkkkss.",
          "..ssssss..",
        ],
        hairCol: [
          "...hh.....",
          "..hhhh....",
          ".hhllhh...",
          ".hhlhhhh..",
          "hhhhhhhhh.",
          "hhhhhhhhhh",
          ".hhhhhhhhh",
          "..hhhhhhh.",
          "...hhhhh..",
        ],
        eyes: [
          "..kkkkkk..",
          ".kwwwwwwk.",
          "kwwiiiiwwk",
          "kwwippiwwk",
          "kwwippiwwk",
          "kwwiiiiwwk",
          ".kwwwwwwk.",
          "..kkkkkk..",
        ],
        acc: ["kkkk..kkkk", "kwlk..kwlk", "kllkkkkllk", "kllk..kllk", "kkkk..kkkk"],
        suit: [
          "..gggggg..",
          ".gwwwwwwg.",
          "gwwwwwwwwg",
          "gwwbbbbwwg",
          "gwwbybbwwg",
          "gwwbbbbwwg",
          "goooooooog",
          "gwwwwwwwwg",
          "gwwg..gwwg",
          "ggg....ggg",
        ],
      }[v];
      const C = {
        k: "#1a1020",
        s: S.skin >= 0 && SKINS[S.skin] ? SKINS[S.skin] : "#e0a678",
        h: S.hairCol >= 0 && HAIRC[S.hairCol] ? HAIRC[S.hairCol] : "#6a4020",
        l: "#ffffff55",
        i: S.eyes >= 0 && EYEC[S.eyes] ? EYEC[S.eyes] : "#2a6fb0",
        p: "#1a1020",
        w: "#f4f6ff",
        g: "#8f97bd",
        b: "#2b6fd6",
        y: "#ffd166",
        o: S.suit || "#ff9f45",
      };
      if (M) {
        const px = 4,
          ox = (cv2.width - M[0].length * px) / 2,
          oy = (cv2.height - M.length * px) / 2;
        M.forEach((r, y) => {
          for (let x = 0; x < r.length; x++)
            if (r[x] !== ".") {
              c2.fillStyle = C[r[x]];
              c2.fillRect(ox + x * px, oy + y * px, px, px);
            }
        });
      }
    } else if (key === "char") {
      headIcon(c2, Object.assign({}, S, { char: v, acc: 0 }));
    } else if (key === "acc") {
      if (+v === 0) {
        c2.strokeStyle = "#9aa3c8";
        c2.lineWidth = 4;
        c2.beginPath();
        c2.arc(20, 20, 12, 0, 7);
        c2.moveTo(11, 29);
        c2.lineTo(29, 11);
        c2.stroke();
      } else headIcon(c2, Object.assign({}, S, { acc: +v }));
    }
    if (!ok) setTimeout(renderIcons, 120);
  });
}
function drawPrev() {
  const p = $("prev");
  if (!p) return;
  const c = p.getContext("2d");
  c.imageSmoothingEnabled = false;
  const Q = (x, y, w, h, col) => {
    c.fillStyle = col;
    c.fillRect(x, y, w, h);
  };
  Q(0, 0, 240, 330, "#0a0f33");
  for (let i = 0; i < 40; i++)
    Q((i * 53) % 236, (i * 97) % 180, i % 5 ? 2 : 4, i % 5 ? 2 : 4, i % 7 ? "#cfd8ff" : "#6fe3ff");
  const disc = (cx, cy, r, col) => {
    for (let y = -r; y <= r; y += 4)
      for (let x = -r; x <= r; x += 4) if (x * x + y * y <= r * r) Q(cx + x, cy + y, 4, 4, col);
  };
  disc(40, 52, 22, "#6a3bb0");
  disc(34, 44, 8, "#8f5fe0");
  for (let a = 0; a < 6.28; a += 0.12) {
    const x = 40 + Math.cos(a) * 40,
      y = 54 + Math.sin(a) * 9;
    if (!(Math.sin(a) < 0 && Math.abs(Math.cos(a)) < 0.55))
      Q(Math.round(x / 4) * 4, Math.round(y / 4) * 4, 4, 4, "#c9a6ff");
  }
  disc(206, 50, 20, "#2f6fe0");
  disc(200, 44, 8, "#35c46a");
  disc(212, 58, 6, "#35c46a");
  disc(196, 128, 8, "#4a4f6a");
  for (let x = 0; x < 240; x += 4) {
    const hh = 30 + Math.round(Math.abs(Math.sin(x / 23)) * 22 + Math.abs(Math.sin(x / 9)) * 6);
    Q(x, 248 - hh, 4, hh + 90, "#1f2b6e");
    Q(x, 248 - hh, 4, 4, "#3a4aa8");
  }
  [
    [110, 30, "#1a2560"],
    [86, 22, "#22307a"],
    [62, 16, "#2a3a92"],
  ].forEach(([rx, ry, col]) => {
    for (let y = -ry; y <= ry; y += 4)
      for (let x = -rx; x <= rx; x += 4)
        if ((x * x) / (rx * rx) + (y * y) / (ry * ry) <= 1) Q(120 + x, 304 + y, 4, 4, col);
  });
  drawMira(c, 120, 312, 1, { mode: "idle", dir: 1, k: 3.2 });
}
function openStory() {
  const rows = CHAPTERS.map(
    (c, i) =>
      `<div class="row"><div><b>${i < S.ch ? "✅" : i === S.ch ? "▶️" : "🔒"} ${i + 1}. ${c.t}</b><small>${i <= S.ch ? c.goal : "Locked"}</small></div></div>`,
  ).join("");
  const disc = S.disc.length
    ? S.disc
        .map(
          (d) =>
            `<div class="row" style="align-items:flex-start"><div><b>🔭 ${d.name}</b><small>${d.fact}</small>${d.img ? `<small>NASA image: ${(d.title || "").replace(/</g, "")}</small>` : ""}</div>${d.img ? `<img src="${d.img}" alt="" style="width:120px;border-radius:8px">` : ""}</div>`,
        )
        .join("")
    : `<div class="row">No discoveries yet. Scan ◆ markers on expeditions.</div>`;
  const p = S.plan;
  openModal(
    head("📖 Story") +
      `<p><button class="alt" id="bTut" type="button">❓ How to play</button></p>` +
      rows +
      (p
        ? `<h3 style="margin:10px 0 4px">Your mission plan</h3><div class="row"><div><small>Launch mass ${Math.round(p.mass)} kg · transit ${p.days.toFixed(1)} days</small></div></div>`
        : "") +
      `<h3 style="margin:10px 0 4px">Codex</h3>` +
      disc +
      `<h3 style="margin:10px 0 4px">📡 NASA data in this game</h3><table><tr><th>What</th><th>Real source</th><th>In the game</th></tr>
<tr><td>Cosmic radiation 1.37 mSv/day</td><td>Chang'e-4 lander</td><td>Constant dose meter</td></tr>
<tr><td>Dose limit 250 mSv</td><td>NASA health standard</td><td>Your astronaut is evacuated if reached</td></tr>
<tr><td>Solar storms</td><td>Aug 1972 event and live <a href="https://api.nasa.gov" target="_blank" rel="noopener">DONKI</a> data</td><td>The storm. ${LIVE.ok ? "Live: " + LIVE.id + ", " + Math.round(LIVE.speed) + " km/s" : "Offline: modeled on 1972"}</td></tr>
<tr><td>Ice in shadowed craters</td><td>LRO and LCROSS</td><td>Ice only in dark craters</td></tr>
<tr><td>Hydrogen-rich polymers shield radiation</td><td>NASA radiation research</td><td>Polymer walls and plates</td></tr>
<tr><td>Veggie plant growth</td><td>ISS Veggie experiment</td><td>Plant care minigame</td></tr>
<tr><td>ISS life support, food and exercise</td><td>NASA ISS operations</td><td>Mission planning screen</td></tr>
<tr><td>Photos of discoveries</td><td><a href="https://images.nasa.gov" target="_blank" rel="noopener">NASA Image and Video Library</a></td><td>Codex</td></tr>
</table><p style="color:var(--mut)"><a href="https://api.nasa.gov" target="_blank" rel="noopener">api.nasa.gov</a> · <a href="https://data.nasa.gov" target="_blank" rel="noopener">data.nasa.gov</a> · <a href="https://images.nasa.gov" target="_blank" rel="noopener">images.nasa.gov</a> · <a href="https://earthdata.nasa.gov" target="_blank" rel="noopener">earthdata.nasa.gov</a> · <a href="https://lunar.gsfc.nasa.gov" target="_blank" rel="noopener">lunar.gsfc.nasa.gov</a></p><p style="color:var(--mut);font-size:.85em">Educational project. Values are approximate. Not an official NASA product.</p>`,
  );
}

$("menuBox").onclick = (e) => {
  const b = e.target.closest("button,.sw");
  if (!b) return;
  ensureAudio();
  const d = b.dataset;
  if (d.m === "close") {
    closeModal();
    return;
  }
  if (d.m === "exp") {
    R.paused = false;
    $("ovMenu").classList.remove("on");
    R.act = { t: "exp", p: STAND.exp };
    goTo(STAND.exp[0], STAND.exp[1]);
    return;
  }
  if (d.m === "garden") {
    openGarden();
    return;
  }
  if (d.m) {
    startMG(d.m);
    return;
  }
  if (d.craft !== undefined) {
    const r = RC[+d.craft];
    if (afford(r.cost)) {
      payCost(r.cost, 1);
      if (r.give) Object.keys(r.give).forEach((k) => (S.inv[k] += r.give[k]));
      if (r.rat) S.rations += r.rat;
      beep(900, 0.1);
      openCraft();
    }
    return;
  }
  if (d.inst) {
    if (S.inv.polymer >= 1 && S.polyL < 5) {
      S.inv.polymer--;
      S.polyL++;
      beep(1100, 0.15);
      toast("🛡️ Polymer plate installed in the suit.", 3000);
      openCraft();
    }
    return;
  }
  if (d.buy) {
    const c = +d.cost;
    if (S.units >= c) {
      S.units -= c;
      if (d.buy === "rat") S.rations++;
      else S.inv[d.buy]++;
      beep(800, 0.08);
      openCraft();
    }
    return;
  }
  if (d.ax) {
    if (d.ax === "speed") A.speed = +d.v;
    else A[d.ax] = !A[d.ax];
    saveA();
    applyA();
    openA11y();
    return;
  }
  if (d.k) {
    S[d.k] = /^-?\d+$/.test(d.v) ? +d.v : d.v;
    openStyle();
    return;
  }
  if (d.preset) {
    Object.assign(S, PRESETS[d.preset].look);
    S.preset = d.preset;
    openStyle();
    return;
  }
  if (d.dice) {
    S.name = NAMES_LIST[Math.floor(Math.random() * NAMES_LIST.length)];
    openStyle();
    return;
  }
  if (d.lang) {
    S.lang = S.lang === "pt" ? "en" : "pt";
    openStyle();
    return;
  }
  if (d.art) {
    S.art = d.art;
    openStyle();
    return;
  }
  for (const k of ["skin", "hairCol", "eyes", "hair", "outfit", "acc"]) {
    if (d[k] !== undefined) {
      S[k] = +d[k];
      openStyle();
      return;
    }
  }
  if (d.suit) {
    S.suit = d.suit;
    openStyle();
    return;
  }
  if (d.visor) {
    S.visor = d.visor;
    openStyle();
    return;
  }
};
