import { getMissionTypeLabel } from './shardProgress.js';

export function getStarThresholds(levelLength) {
  const safeLength = Math.max(1, Math.floor(Number(levelLength) || 1));

  return {
    twoStar: Math.ceil(safeLength * 0.5),
    threeStar: Math.ceil(safeLength * 0.8),
  };
}


export function calculateLevelStars({
  levelLength,
  missionComplete = false,
  perfectCount = 0,
}) {
  const thresholds = getStarThresholds(levelLength);
  const normalizedPerfectCount = Math.max(0, Math.floor(Number(perfectCount) || 0));

  if (!missionComplete) {
    return 1;
  }

  if (normalizedPerfectCount >= thresholds.threeStar) {
    return 3;
  }

  if (normalizedPerfectCount >= thresholds.twoStar) {
    return 2;
  }

  return 1;
}
export function getMissionGoalText(mission) {
  const type = getMissionTypeLabel(mission?.type);
  const target = Math.max(1, Math.floor(Number(mission?.target) || 1));

  return `\u4efb\u52a1 ${type} ${target}`;
}

export function getLevelGoalPreview(level) {
  const thresholds = getStarThresholds(level?.length);

  return [
    getMissionGoalText(level?.mission),
    `\u4e8c\u661f \u4efb\u52a1 + Perfect ${thresholds.twoStar}`,
    `\u4e09\u661f \u4efb\u52a1 + Perfect ${thresholds.threeStar}`,
  ].join(' \u00b7 ');
}

export function getNextLevelGoalText(level) {
  if (!level) {
    return '\u5168\u90e8\u5173\u5361\u5df2\u5b8c\u6210';
  }

  return `\u4e0b\u4e00\u5173\u76ee\u6807\uff1a${getLevelGoalPreview(level)}`;
}
