function normalizeStarCount(stars) {
  const numericStars = Number(stars);

  if (!Number.isFinite(numericStars)) {
    return 0;
  }

  return Math.max(0, Math.min(3, Math.floor(numericStars)));
}

export function getTotalStars(levelStars) {
  if (!levelStars || typeof levelStars !== 'object' || Array.isArray(levelStars)) {
    return 0;
  }

  return Object.values(levelStars).reduce(
    (total, stars) => total + normalizeStarCount(stars),
    0
  );
}

export function getTotalStarCapacity(levelCount) {
  const safeLevelCount = Math.max(0, Math.floor(Number(levelCount) || 0));

  return safeLevelCount * 3;
}

export function isStarCollectionComplete(levelStars, levelCount) {
  const capacity = getTotalStarCapacity(levelCount);

  return capacity > 0 && getTotalStars(levelStars) >= capacity;
}

export function getStarProgressText(levelStars, levelCount) {
  const totalStars = getTotalStars(levelStars);
  const capacity = getTotalStarCapacity(levelCount);

  if (isStarCollectionComplete(levelStars, levelCount)) {
    return `\u5168\u661f\u6536\u96c6\u5b8c\u6210\uff01 ${totalStars}/${capacity}`;
  }

  return `\u661f\u661f ${totalStars}/${capacity}`;
}

export function getStarProgressPercent(levelStars, levelCount) {
  const capacity = getTotalStarCapacity(levelCount);

  if (capacity <= 0) {
    return 0;
  }

  const percent = (getTotalStars(levelStars) / capacity) * 100;
  const clampedPercent = Math.max(0, Math.min(100, percent));

  return Math.round(clampedPercent * 100) / 100;
}

export function getStarProgressRank(levelStars, levelCount) {
  const percent = getStarProgressPercent(levelStars, levelCount);

  if (percent >= 100) {
    return '\u5168\u661f\u5927\u5e08';
  }

  if (percent >= 75) {
    return '\u94f6\u6cb3\u6536\u85cf\u5bb6';
  }

  if (percent >= 50) {
    return '\u661f\u6865\u8dc3\u8fc1\u8005';
  }

  if (percent >= 25) {
    return '\u661f\u5149\u65c5\u4eba';
  }

  return '\u661f\u5c18\u65b0\u624b';
}

export function getLevelCardStatus(stars, isUnlocked = true) {
  if (!isUnlocked) {
    return {
      key: 'locked',
      label: '\u672a\u89e3\u9501',
    };
  }

  const normalizedStars = normalizeStarCount(stars);

  if (normalizedStars === 3) {
    return {
      key: 'mastered',
      label: '\u6ee1\u661f',
    };
  }

  if (normalizedStars > 0) {
    return {
      key: 'cleared',
      label: '\u5df2\u901a\u5173',
    };
  }

  return {
    key: 'ready',
    label: '\u5f85\u6311\u6218',
  };
}

export function getStarRecordText(earnedStars, previousStars) {
  const earned = normalizeStarCount(earnedStars);
  const previous = normalizeStarCount(previousStars);

  if (earned > previous && earned === 3) {
    return '新纪录 · 首次满星';
  }

  if (earned > previous) {
    return '新纪录 · 提升至 ' + earned + ' 星';
  }

  if (previous === 3) {
    return '保持满星纪录';
  }

  return '历史最高 ' + Math.max(earned, previous) + ' 星';
}

export function getStarCollectionSummary(levelStars, levelCount) {
  const totalStars = getTotalStars(levelStars);
  const capacity = getTotalStarCapacity(levelCount);
  const rank = getStarProgressRank(levelStars, levelCount);

  return '总星星 ' + totalStars + '/' + capacity + ' · ' + rank;
}
export function getRecommendedLevel(levelStars, unlockedLevel, levelCount) {
  const safeLevelCount = Math.max(0, Math.floor(Number(levelCount) || 0));

  if (safeLevelCount === 0) {
    return 0;
  }

  const safeUnlockedLevel = Math.max(
    1,
    Math.min(safeLevelCount, Math.floor(Number(unlockedLevel) || 1))
  );

  for (let level = 1; level <= safeUnlockedLevel; level += 1) {
    if (normalizeStarCount(levelStars?.[level]) === 0) {
      return level;
    }
  }

  for (let level = 1; level <= safeUnlockedLevel; level += 1) {
    if (normalizeStarCount(levelStars?.[level]) < 3) {
      return level;
    }
  }

  return safeUnlockedLevel;
}

export function getRecommendedLevelReason(stars) {
  const normalizedStars = normalizeStarCount(stars);

  if (normalizedStars === 0) {
    return '推进新关';
  }

  if (normalizedStars < 3) {
    return '冲击满星';
  }

  return '再次出发';
}