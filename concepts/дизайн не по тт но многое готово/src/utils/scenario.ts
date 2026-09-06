// Deterministic candle scenario generator (seeded). Replaces seedrandom + scenario-gen.
export type Candle = { o: number; h: number; l: number; c: number; v: number };
export type ScenarioKind = "false_breakout" | "true_breakout" | "pump_dump" | "range_chop" | "whale_wick" | "news_fade";

export type Scenario = {
  history: Candle[];
  future: Candle[];
  level: number; // key S/R level
  kind: ScenarioKind;
};

export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hashSeed(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mk(rand: () => number, prev: number, drift: number, vol: number, volBase: number, volMult = 1): Candle {
  const o = prev;
  const move = (rand() - 0.5) * 2 * vol + drift;
  const c = o * (1 + move / 100);
  const hi = Math.max(o, c) * (1 + (rand() * vol * 0.5) / 100);
  const lo = Math.min(o, c) * (1 - (rand() * vol * 0.5) / 100);
  const v = volBase * (0.6 + rand() * 0.8) * volMult;
  return { o, h: hi, l: lo, c, v };
}

export function generateScenario(seed: string, kind: ScenarioKind): Scenario {
  const rand = mulberry32(hashSeed(seed));
  const base = 40000 + rand() * 30000;
  const vol = 0.55;
  const volBase = 100;
  const history: Candle[] = [];
  let p = base;

  // Phase A: trend up into a range (20 candles)
  for (let i = 0; i < 18; i++) {
    const c = mk(rand, p, 0.12, vol, volBase);
    history.push(c);
    p = c.c;
  }
  // Phase B: consolidate under a level (14 candles)
  const level = p * 1.012;
  for (let i = 0; i < 14; i++) {
    const c = mk(rand, p, (level * 0.992 - p) / p * 8, vol * 0.8, volBase * 0.85);
    if (c.h > level) { c.h = level * (1 - rand() * 0.001); c.c = Math.min(c.c, level * 0.998); }
    history.push(c);
    p = c.c;
  }

  const future: Candle[] = [];
  const push = (c: Candle) => { future.push(c); p = c.c; };

  switch (kind) {
    case "false_breakout": {
      // one candle closes above on weak volume, then returns and dumps
      const b = mk(rand, p, 0, vol * 0.3, volBase * 0.45);
      b.c = level * 1.006; b.h = level * 1.011; b.l = Math.min(b.o, b.c) * 0.998;
      history.push(b); p = b.c;
      for (let i = 0; i < 3; i++) push(mk(rand, p, -0.25, vol * 0.7, volBase * 0.7));
      for (let i = 0; i < 9; i++) push(mk(rand, p, -0.42, vol, volBase * 1.4));
      break;
    }
    case "true_breakout": {
      const b = mk(rand, p, 0, vol * 0.3, volBase * 2.4);
      b.c = level * 1.012; b.h = level * 1.016; b.l = b.o * 0.998;
      history.push(b); p = b.c;
      // retest
      for (let i = 0; i < 3; i++) push(mk(rand, p, -0.22, vol * 0.6, volBase * 0.8));
      for (let i = 0; i < 9; i++) push(mk(rand, p, 0.55, vol, volBase * 1.6));
      break;
    }
    case "pump_dump": {
      for (let i = 0; i < 3; i++) { const c = mk(rand, p, 1.4, vol * 0.7, volBase * 2.2); history.push(c); p = c.c; }
      for (let i = 0; i < 2; i++) push(mk(rand, p, 0.6, vol * 0.8, volBase * 1.5));
      for (let i = 0; i < 10; i++) push(mk(rand, p, -1.1, vol * 1.3, volBase * 2.6));
      break;
    }
    case "range_chop": {
      for (let i = 0; i < 12; i++) {
        const target = level * (0.985 + rand() * 0.012);
        push(mk(rand, p, ((target - p) / p) * 40, vol * 0.9, volBase * 0.6));
      }
      break;
    }
    case "whale_wick": {
      const w = mk(rand, p, 0, vol * 0.2, volBase * 3.2);
      w.l = p * 0.955; w.c = p * 0.996; w.h = p * 1.002;
      push(w);
      for (let i = 0; i < 11; i++) push(mk(rand, p, 0.35, vol * 0.7, volBase * 1.2));
      break;
    }
    case "news_fade": {
      for (let i = 0; i < 2; i++) push(mk(rand, p, 1.0, vol * 0.6, volBase * 2.0));
      for (let i = 0; i < 10; i++) push(mk(rand, p, -0.5, vol, volBase * 1.1));
      break;
    }
  }
  return { history, future, level, kind };
}

export function avgVolume(c: Candle[], n = 14) {
  const s = c.slice(-n);
  return s.reduce((a, x) => a + x.v, 0) / Math.max(1, s.length);
}

export function pnlPercent(entry: number, exit: number, dir: "long" | "short" | "flat") {
  if (dir === "flat") return 0;
  const raw = ((exit - entry) / entry) * 100;
  return dir === "long" ? raw : -raw;
}
