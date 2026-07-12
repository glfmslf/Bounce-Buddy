import { getStarThresholds } from './levelGoals.js';

function normalizeCount(value) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return 0;
  }

  return Math.max(0, Math.floor(numericValue));
}

export function getLiveStarProgress({
  completedJumps = 0,
  levelLength = 1,
  missionComplete = false,
  perfectCount = 0,
} = {}) {
  const safeLength = Math.max(1, normalizeCount(levelLength));
  const safeCompleted = Math.min(safeLength, normalizeCount(completedJumps));
  const safePerfect = Math.min(safeCompleted, normalizeCount(perfectCount));
  const remainingJumps = safeLength - safeCompleted;
  const maximumPerfect = safePerfect + remainingJumps;
  const thresholds = getStarThresholds(safeLength);
  const twoStarReady = missionComplete && safePerfect >= thresholds.twoStar;
  const threeStarReady = missionComplete && safePerfect >= thresholds.threeStar;
  const stars = threeStarReady ? 3 : twoStarReady ? 2 : 1;
  let detail = '';

  if (!missionComplete) {
    detail = '高星还需完成任务';
  } else if (threeStarReady) {
    detail = '三星条件已达成';
  } else if (maximumPerfect < thresholds.twoStar) {
    detail = '本局最高 1 星';
  } else if (maximumPerfect < thresholds.threeStar) {
    detail = twoStarReady
      ? '二星已稳 · 三星条件不足'
      : '二星还差 ' + (thresholds.twoStar - safePerfect) + ' Perfect';
  } else if (twoStarReady) {
    detail = '三星还差 ' + (thresholds.threeStar - safePerfect) + ' Perfect';
  } else {
    detail = '二星还差 ' + (thresholds.twoStar - safePerfect) + ' Perfect';
  }

  return {
    detail,
    maximumPerfect,
    stars,
    starText: '★'.repeat(stars) + '☆'.repeat(3 - stars),
    threeStarReady,
    thresholds,
    twoStarReady,
  };
}