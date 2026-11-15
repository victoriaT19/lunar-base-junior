const ITEMS = {
  regolith: { n: "Regolith", c: "#b9bdd0" },
  ilmenite: { n: "Ilmenite", c: "#ff9f45" },
  carbon: { n: "Carbon", c: "#3a3a4a" },
  ice: { n: "Water ice", c: "#6fe3ff" },
  metal: { n: "Metal plate", c: "#cfd6ff" },
  polymer: { n: "Polymer plate", c: "#b388ff" },
  solar: { n: "Solar cell", c: "#2a56d8" },
};
const BLK = {
  brick: { n: "Regolith brick", e: "🧱", cost: { regolith: 2 }, shield: 0.3 },
  polymer: { n: "Polymer wall", e: "🛡️", cost: { polymer: 1 }, shield: 1 },
  window: { n: "Window", e: "🪟", cost: { metal: 1, regolith: 1 }, mood: 1.5 },
  solar: { n: "Solar panel", e: "☀️", cost: { solar: 1 }, ext: true },
  plant: { n: "Plant box", e: "🌱", cost: { metal: 1, regolith: 3 } },
  bed: { n: "Extra bunk", e: "🛏️", cost: { metal: 2, regolith: 2 } },
  lamp: { n: "Lamp", e: "💡", cost: { metal: 1 }, mood: 1 },
  poster: { n: "Earth poster", e: "🖼️", cost: { units: 15 }, mood: 2 },
  antenna: { n: "Antenna", e: "📡", cost: { metal: 2, solar: 1 }, ext: true, mood: 1 },
  flag: { n: "White flag", e: "🏳️", cost: { units: 25 }, mood: 3 },
  table: { n: "Dining table", e: "🍽️", cost: { units: 10 }, mood: 1 },
};
const RC = [
  {
    n: "Smelt a metal plate",
    cost: { ilmenite: 3 },
    give: { metal: 1 },
    fx: "+1 Metal plate",
  },
  {
    n: "Press a polymer plate",
    cost: { ice: 3, carbon: 2 },
    give: { polymer: 1 },
    fx: "+1 Polymer plate",
  },
  {
    n: "Assemble a solar cell",
    cost: { metal: 1, carbon: 1, regolith: 2 },
    give: { solar: 1 },
    fx: "+1 Solar cell",
  },
  { n: "Make meal packs", cost: { ice: 2 }, rat: 2, fx: "+2 rations" },
];
const SHOP = [
  ["rat", 10, "1 ration"],
  ["metal", 40, "1 Metal plate"],
  ["polymer", 60, "1 Polymer plate"],
  ["solar", 70, "1 Solar cell"],
];

const CAPKG = 7500;
const MAND = [
  {
    id: "airlock",
    n: "Airlock",
    kg: 500,
    d: "Decompression chamber to go outside safely. Every lunar base needs one.",
  },
  {
    id: "eclss",
    n: "Life support (ECLSS)",
    kg: 800,
    d: "Makes oxygen from water by electrolysis, removes CO₂ and recycles up to 98% of the water, including sweat and urine.",
  },
  {
    id: "power",
    n: "Power generation and storage",
    kg: 900,
    d: "Big solar panels, plus lithium-ion batteries for when the Sun is gone.",
  },
  {
    id: "prop",
    n: "Propulsion and attitude control",
    kg: 1200,
    d: "Engines for the trip and the landing, and to dodge space junk.",
  },
  {
    id: "dock",
    n: "Docking ports",
    kg: 300,
    d: "Hatches for cargo ships and crew capsules to connect.",
  },
  {
    id: "therm",
    n: "Thermal control",
    kg: 400,
    d: "Radiators and fluid loops carry away heat from equipment and the Sun.",
  },
  {
    id: "comms",
    n: "Comms and command computers",
    kg: 250,
    d: "Antennas and computers that keep contact with Mission Control.",
  },
  {
    id: "hyg",
    n: "Hygiene and sanitation",
    kg: 150,
    d: "Vacuum toilet, wet wipes and rinse-free shampoo.",
  },
  {
    id: "emerg",
    n: "Emergency rations (4 meals)",
    kg: 40,
    d: "Dehydrated meals for the trip.",
    rat: 4,
  },
];
const OPTS = [
  {
    id: "lab",
    n: "Science lab",
    kg: 600,
    d: "Scans and samples give +50% units. Studies biology, fluids and materials.",
  },
  {
    id: "arm",
    n: "Robotic arm",
    kg: 350,
    d: "Moves heavy modules and helps with repairs: the repair minigame gets 10 more seconds.",
  },
  {
    id: "gym",
    n: "Gym and exercise area",
    kg: 450,
    d: "Treadmill with harness and resistance machines. Without exercise, fatigue builds 30% faster.",
  },
  {
    id: "cupola",
    n: "Observation cupola",
    kg: 300,
    d: "Panoramic windows to Earth. Mood +4.",
  },
  {
    id: "cabins",
    n: "Private cabins",
    kg: 400,
    d: "Sound-proof bunks. Better sleep and mood +3.",
  },
  {
    id: "greenhouse",
    n: "Space greenhouse",
    kg: 700,
    d: "Plant boxes produce 50% more rations and plant care gives +1 ration.",
  },
];
const GEAR = [
  {
    id: "food1",
    n: "Dehydrated and thermostabilized meals",
    kg: 120,
    d: "Soups, instant noodles, powdered milk. +6 rations.",
    rat: 6,
  },
  {
    id: "food2",
    n: "Tortillas instead of bread",
    kg: 20,
    d: "Bread makes crumbs that get into instruments. +2 rations, mood +2.",
    rat: 2,
  },
  {
    id: "food3",
    n: "Variety box",
    kg: 80,
    d: "Smoked meat, mac and cheese, broccoli au gratin, granola, nuts, chocolate, cookies. +4 rations, mood +3.",
    rat: 4,
  },
  {
    id: "food4",
    n: "Condiments and drinks",
    kg: 40,
    d: "Hot sauce, mustard, honey, peanut butter, coffee, green tea, lemonade, cocoa. Mood +3.",
  },
  {
    id: "med",
    n: "Saline and medical kit",
    kg: 150,
    d: "Health monitoring and care in flight. Radiation dose -10%.",
  },
  {
    id: "suits",
    n: "Enhanced EVA suit layer",
    kg: 250,
    d: "Pressurized suits with an extra shielding layer. Start with +20 hazard protection.",
  },
  {
    id: "instr",
    n: "Scientific instruments and computers",
    kg: 300,
    d: "Run experiments and collect data. Scanning is 40% faster.",
  },
  {
    id: "personal",
    n: "Personal and symbolic items",
    kg: 60,
    d: "Family photos and a bolt from an old mission. Mood +5.",
  },
  {
    id: "hyg2",
    n: "Extra hygiene supplies",
    kg: 40,
    d: "Swallowable toothpaste and no-bath wipes. Mood +2.",
  },
];
const FOODMOOD = { food2: 2, food3: 3, food4: 3, personal: 5, hyg2: 2, cupola: 4, cabins: 3 };

let CHAPTERS = [
  {
    t: "Arrival",
    x: 'Hopper Base hums quietly around you, but it is still a mess of boxes. "Welcome home," says KAI, your helper robot. "First, let us make this place comfortable: open Build and place a dining table and one decoration. Then eat, sleep and say hi to me. After that, Mission Control will send your mission."',
    d: "Astronauts on the ISS follow strict schedules for eating, sleeping and exercise. Looking after the person is as important as looking after the machines.",
    goal: "Make the base cozy, eat, sleep and say hi to KAI.",
    ok: () => S.flags.ate && S.flags.slept && S.flags.petted && homeReady(),
  },
  {
    t: "First Alarm",
    x: 'A red light starts blinking over the console. Something in the base just failed. Mission Control stays calm: "Open the repair job and reconnect the wires. You can do it."',
    d: "Space hardware fails. Energetic particles can flip bits and burn out electronics, which is why spacecraft use shielding and radiation-hardened parts.",
    goal: "Fix the broken power grid (🎯 Missions).",
    ok: () => (S.flags.repaired || 0) >= 1,
    start() {
      spawnFault();
    },
  },
  {
    t: "Over the Ridge",
    x: "Out there is everything the base needs: ore, ice and carbon. Some of it hides in craters that have not seen the Sun in billions of years. Go out through the airlock, or drive the rover into a dark crater.",
    d: "In 2009 NASA's LCROSS probe hit a permanently shadowed crater and found water ice. NASA's LRO has mapped the south pole since the same year.",
    goal: "Bring 6 things home from outside.",
    ok: () => (S.lootTotal || 0) >= 6,
  },
  {
    t: "Walls of Hydrogen",
    x: 'Mission Control sounds serious. "Space weather is picking up. Radiation is the one thing you cannot see. Build walls that stop it, and craft the polymer to do it."',
    d: "Hydrogen-rich polymers such as polyethylene are among the best radiation shields known, so NASA studies them for deep space habitats.",
    goal: "Make a polymer plate (🔧 Craft), then build a 🛡️ Shield wall.",
    ok: () => cnt("polymer") >= 1,
  },
  {
    t: "The Storm",
    x: "The alarm cuts through the base. The Sun has thrown a huge cloud of charged particles toward the Moon. In forty seconds it arrives. There is no air and no magnetic field to stop it. Use the storm drill to hold the line.",
    d: "Solar particle storms like this are tracked by NASA's DONKI database. In August 1972, between Apollo 16 and 17, one of the biggest ever struck. Luckily no astronauts were on the Moon.",
    goal: "Survive the solar storm: play ☢️ Storm shield!",
    ok: () => (S.flags.storms || 0) >= 1,
    start() {
      startStorm();
    },
  },
  {
    t: "Outpost",
    x: "The storm is over and the base is still standing. Now it is time to make it a home: solar power, a window with a view of Earth and an antenna to call your family.",
    d: "Artemis plans a lasting presence near the lunar south pole, where ice and long periods of sunlight make an outpost possible.",
    goal: "Build 3 ☀️ Solar, 1 📡 Antenna and 1 🪟 Window.",
    ok: () => cnt("solar") >= 3 && cnt("antenna") >= 1 && cnt("window") >= 1,
  },
];
