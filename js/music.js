const MUSIC = {
  on: true,
  track: 0,
  step: 0,
  next: 0,
  timer: null,
  bus: null,
  delay: null,
};
const SONGS = [
  {
    name: "Lunar Drift",
    bpm: 72,
    chords: [
      [57, 60, 64, 67],
      [53, 57, 60, 64],
      [55, 59, 62, 65],
      [52, 55, 59, 62],
    ],
    arp: [0, 2, 1, 3, 2, 1, 3, 0],
    bass: true,
    kick: [0, 8],
    wave: "triangle",
  },
  {
    name: "Signal",
    bpm: 92,
    chords: [
      [50, 53, 57, 60],
      [46, 50, 53, 58],
      [48, 51, 55, 58],
      [45, 49, 52, 57],
    ],
    arp: [0, 3, 2, 3, 1, 3, 2, 3],
    bass: true,
    kick: [0, 6, 8, 14],
    wave: "square",
  },
];
const midi = (n) => 440 * Math.pow(2, (n - 69) / 12);
function musicBus() {
  if (!audio) return null;
  if (MUSIC.bus) return MUSIC.bus;
  const g = audio.createGain();
  g.gain.value = 0.12 * (A.vol == null ? 1 : A.vol);
  const d = audio.createDelay(1);
  d.delayTime.value = 0.33;
  const fb = audio.createGain();
  fb.gain.value = 0.35;
  const lp = audio.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 2200;
  d.connect(fb);
  fb.connect(d);
  d.connect(lp);
  lp.connect(g);
  g.connect(audio.destination);
  MUSIC.bus = g;
  MUSIC.delay = d;
  return g;
}
function note(freq, t, dur, vol, type, toDelay) {
  const o = audio.createOscillator(),
    g = audio.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(vol, t + Math.min(0.08, dur / 3));
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g);
  g.connect(MUSIC.bus);
  if (toDelay) g.connect(MUSIC.delay);
  o.start(t);
  o.stop(t + dur + 0.05);
}
function kick(t) {
  const o = audio.createOscillator(),
    g = audio.createGain();
  o.frequency.setValueAtTime(120, t);
  o.frequency.exponentialRampToValueAtTime(40, t + 0.18);
  g.gain.setValueAtTime(0.5, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.25);
  o.connect(g);
  g.connect(MUSIC.bus);
  o.start(t);
  o.stop(t + 0.3);
}
function musicTick() {
  if (!audio || muted || !MUSIC.on || document.hidden) return;
  if (!musicBus()) return;
  MUSIC.bus.gain.value = 0.12 * (A.vol == null ? 1 : A.vol);
  const want = (R.storm && R.storm.state) || (typeof MG !== "undefined" && MG) ? 1 : 0;
  if (want !== MUSIC.track && MUSIC.step % 16 === 0) MUSIC.track = want;
  const song = SONGS[MUSIC.track];
  const sp = 60 / song.bpm / 2;
  if (MUSIC.next < audio.currentTime) MUSIC.next = audio.currentTime + 0.05;
  while (MUSIC.next < audio.currentTime + 0.25) {
    const t = MUSIC.next,
      s = MUSIC.step % 16,
      bar = Math.floor(MUSIC.step / 16) % song.chords.length;
    const ch = song.chords[bar];
    if (s === 0) ch.forEach((n) => note(midi(n), t, sp * 15, 0.05, "sine", false));
    if (s % 2 === 0) note(midi(ch[song.arp[(s / 2) % 8]] + 12), t, sp * 1.6, 0.06, song.wave, true);
    if (song.bass && (s === 0 || s === 8))
      note(midi(ch[0] - 12), t, sp * 6, 0.12, "triangle", false);
    if (song.kick.includes(s)) kick(t);
    if (MUSIC.track === 1 && s % 4 === 2) note(midi(ch[3] + 24), t, 0.06, 0.03, "square", true);
    MUSIC.step++;
    MUSIC.next += sp;
  }
}
setInterval(musicTick, 90);
