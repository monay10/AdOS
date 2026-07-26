// Deterministic seeded PRNG (mulberry32). No Math.random, no wall-clock.
// Same seed -> identical sequence, so the demo world is reproducible.

export function makeRng(seed) {
  let a = seed >>> 0;
  return function rng() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function makeHelpers(rng) {
  const int = (min, max) => min + Math.floor(rng() * (max - min + 1));
  const pick = (arr) => arr[Math.floor(rng() * arr.length)];
  const pickN = (arr, n) => {
    const copy = [...arr];
    const out = [];
    for (let i = 0; i < n && copy.length; i++) out.push(copy.splice(Math.floor(rng() * copy.length), 1)[0]);
    return out;
  };
  const bool = (p = 0.5) => rng() < p;
  return { int, pick, pickN, bool };
}
