function normalizeLevelNumber(value) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return 1;
  }

  return Math.max(1, Math.floor(numericValue));
}

export function getLevelRouteSeed(levelNumber) {
  let state = Math.imul(normalizeLevelNumber(levelNumber), 0x9e3779b1) ^ 0x51f15e5d;

  state ^= state >>> 16;
  state = Math.imul(state, 0x7feb352d);
  state ^= state >>> 15;
  state = Math.imul(state, 0x846ca68b);
  state ^= state >>> 16;

  return state >>> 0;
}

export function getLevelRouteSeeds(levelCount) {
  const count = Math.max(0, Math.floor(Number(levelCount) || 0));

  return Array.from({ length: count }, (_, index) => getLevelRouteSeed(index + 1));
}