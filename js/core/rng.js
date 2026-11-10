// Deterministic pseudo-random generator (mulberry32).
// All combat rolls go through this so a seed + action sequence is reproducible.

export class RNG {
  constructor(seed = 1) {
    this.seed = seed >>> 0;
    this.state = this.seed;
  }

  next() {
    this.state = (this.state + 0x6d2b79f5) >>> 0;
    let t = this.state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  int(min, max) {
    const lo = Math.ceil(min);
    const hi = Math.floor(max);
    if (hi <= lo) return lo;
    return lo + Math.floor(this.next() * (hi - lo + 1));
  }

  chance(p) {
    return this.next() < p;
  }

  pick(list) {
    if (!list.length) return null;
    return list[Math.floor(this.next() * list.length)];
  }

  fork(salt = 0) {
    return new RNG((this.state ^ (salt * 2654435761)) >>> 0);
  }
}

export function hashString(text) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
