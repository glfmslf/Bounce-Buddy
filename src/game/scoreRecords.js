export function normalizeScore(value) {
  const numericScore = Number(value);

  if (!Number.isFinite(numericScore)) {
    return 0;
  }

  return Math.max(0, Math.floor(numericScore));
}

export function shouldUpdateBestScore(score, bestScore) {
  return normalizeScore(score) > normalizeScore(bestScore);
}

export function getBestScoreLabel(mode, bestScore) {
  const label = mode === 'endless' ? '\u65e0\u5c3d\u6700\u4f73' : '\u6700\u4f73';

  return `${label} ${normalizeScore(bestScore)}`;
}
