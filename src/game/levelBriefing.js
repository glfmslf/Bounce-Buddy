import { getStarThresholds } from './levelGoals.js';
import { normalizePerformanceRecord } from './levelPerformance.js';
import { normalizeRouteIntensity } from './routeIntensity.js';

function normalizeStars(value) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return 0;
  }

  return Math.max(0, Math.min(3, Math.floor(numericValue)));
}

export function getLevelBriefing({
  baseSpeed = 1,
  level,
  levelNumber = 1,
  performance,
  stars = 0,
} = {}) {
  const safeLevelNumber = Math.max(1, Math.floor(Number(levelNumber) || 1));
  const length = Math.max(1, Math.floor(Number(level?.length) || 1));
  const intensity = normalizeRouteIntensity(level?.intensity);
  const earnedStars = normalizeStars(stars);
  const record = normalizePerformanceRecord(performance);
  const thresholds = getStarThresholds(length);
  const speed = Math.max(1, Math.floor(Number(baseSpeed) || 1));

  let actionLabel = '\u5f00\u59cb\u6311\u6218';

  if (earnedStars === 3) {
    actionLabel = '\u518d\u6218\u4e00\u6b21';
  } else if (earnedStars > 0) {
    actionLabel = '\u51b2\u51fb\u6ee1\u661f';
  }

  return {
    actionLabel,
    intensity,
    kicker: `\u7b2c ${safeLevelNumber} \u5173`,
    recordText: record.completions > 0
      ? `\u6700\u4f73 Perfect ${record.bestPerfect} \u00b7 \u8fde\u51fb ${record.bestCombo} \u00b7 \u901a\u5173 ${record.completions} \u6b21`
      : '\u9996\u6b21\u6311\u6218\uff0c\u8fd8\u6ca1\u6709\u5386\u53f2\u7eaa\u5f55',
    routeText: `\u8def\u7ebf\u5f3a\u5ea6 ${intensity}/5 \u00b7 \u56fa\u5b9a\u8def\u7ebf`,
    starText: '\u5386\u53f2\u6700\u9ad8 ' + '\u2605'.repeat(earnedStars) + '\u2606'.repeat(3 - earnedStars),
    summary: `${length} \u8df3\u5230\u7ec8\u70b9 \u00b7 \u8d77\u6b65 ${speed} \u6863`,
    threeStarText: `\u4efb\u52a1\u8fbe\u6210 + Perfect ${thresholds.threeStar}`,
    title: level?.name || `\u672a\u547d\u540d\u5173\u5361 ${safeLevelNumber}`,
    twoStarText: `\u4efb\u52a1\u8fbe\u6210 + Perfect ${thresholds.twoStar}`,
  };
}
