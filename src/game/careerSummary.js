import { normalizePrecisionCombo } from './comboFeedback.js';

function normalizeCount(value) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return 0;
  }

  return Math.max(0, Math.floor(numericValue));
}

function getLevelRecord(records, level) {
  const record = records?.[String(level)];

  return record && typeof record === 'object' ? record : {};
}

export function getCareerSummary({
  endlessPerformance = {},
  levelCount = 0,
  levelPerformance = {},
  levelStars = {},
} = {}) {
  const safeLevelCount = normalizeCount(levelCount);
  let bestCombo = normalizePrecisionCombo(
    endlessPerformance?.bestCombo,
    endlessPerformance?.bestPerfect
  );
  let clearedLevels = 0;
  let masteredLevels = 0;
  let normalClears = 0;
  let totalStars = 0;

  for (let level = 1; level <= safeLevelCount; level += 1) {
    const stars = Math.min(3, normalizeCount(levelStars?.[String(level)]));
    const record = getLevelRecord(levelPerformance, level);
    totalStars += stars;
    clearedLevels += stars > 0 ? 1 : 0;
    masteredLevels += stars >= 3 ? 1 : 0;
    normalClears += normalizeCount(record.completions);
    bestCombo = Math.max(
      bestCombo,
      normalizePrecisionCombo(record.bestCombo, record.bestPerfect)
    );
  }

  const totalPossibleStars = safeLevelCount * 3;

  return {
    bestCombo,
    clearedLevels,
    completionPercent: totalPossibleStars > 0
      ? Math.round((totalStars / totalPossibleStars) * 100)
      : 0,
    endlessBest: normalizeCount(endlessPerformance?.bestScore),
    endlessRuns: normalizeCount(endlessPerformance?.runs),
    masteredLevels,
    normalClears,
    totalPossibleStars,
    totalStars,
  };
}

export function getCareerStatItems(summary) {
  return [
    { label: '关卡完成', value: summary.clearedLevels + '/' + (summary.totalPossibleStars / 3) },
    { label: '满星关卡', value: String(summary.masteredLevels) },
    { label: '总星星', value: summary.totalStars + '/' + summary.totalPossibleStars },
    { label: '累计通关', value: String(summary.normalClears) },
    { label: '最佳连击', value: String(summary.bestCombo) },
    { label: '无尽最佳', value: String(summary.endlessBest) },
  ];
}