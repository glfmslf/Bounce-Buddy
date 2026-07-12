function normalizeCount(value) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return 0;
  }

  return Math.max(0, Math.floor(numericValue));
}

function getBestLevelValue(records, key) {
  if (!records || typeof records !== 'object' || Array.isArray(records)) {
    return 0;
  }

  return Math.max(
    0,
    ...Object.values(records).map((record) => normalizeCount(record?.[key]))
  );
}

function getTotalStars(levelStars) {
  if (!levelStars || typeof levelStars !== 'object' || Array.isArray(levelStars)) {
    return 0;
  }

  return Object.values(levelStars).reduce(
    (total, stars) => total + Math.min(3, normalizeCount(stars)),
    0
  );
}

function hasCompletedLevel(levelPerformance) {
  return getBestLevelValue(levelPerformance, 'completions') > 0;
}

function hasCompletedShardMission(levelStars, levelCatalog) {
  return levelCatalog.some((level, index) => (
    level.mission?.type === 'shard' &&
    normalizeCount(levelStars?.[String(index + 1)]) >= 2
  ));
}

export const achievementCatalog = [
  {
    id: 'first-clear',
    icon: '01',
    name: '落地生根',
    description: '首次通关普通关卡',
    getProgress: ({ levelPerformance }) => ({
      current: hasCompletedLevel(levelPerformance) ? 1 : 0,
      target: 1,
    }),
  },
  {
    id: 'first-full-star',
    icon: '3S',
    name: '一闪三星',
    description: '任意关卡获得三星',
    getProgress: ({ levelStars }) => ({
      current: Object.values(levelStars ?? {}).some((stars) => normalizeCount(stars) >= 3) ? 1 : 0,
      target: 1,
    }),
  },
  {
    id: 'combo-ten',
    icon: '10',
    name: '节拍上头',
    description: '达成 10 连击',
    getProgress: ({ endlessPerformance, levelPerformance, runBestCombo }) => ({
      current: Math.max(
        getBestLevelValue(levelPerformance, 'bestCombo'),
        normalizeCount(endlessPerformance?.bestCombo),
        normalizeCount(runBestCombo)
      ),
      target: 10,
    }),
  },
  {
    id: 'shard-mission',
    icon: 'SD',
    name: '星尘快递',
    description: '完成一次星尘任务',
    getProgress: ({ levelCatalog, levelStars }) => ({
      current: hasCompletedShardMission(levelStars, levelCatalog) ? 1 : 0,
      target: 1,
    }),
  },
  {
    id: 'endless-25',
    icon: '25',
    name: '银河长跑',
    description: '无尽模式达到 25 分',
    getProgress: ({ endlessPerformance, runScore }) => ({
      current: Math.max(
        normalizeCount(endlessPerformance?.bestScore),
        normalizeCount(runScore)
      ),
      target: 25,
    }),
  },
  {
    id: 'all-stars',
    icon: '30',
    name: '满天都是星',
    description: '收集全部关卡星星',
    getProgress: ({ levelCatalog, levelStars }) => ({
      current: getTotalStars(levelStars),
      target: levelCatalog.length * 3,
    }),
  },
];

export function normalizeAchievementIds(value) {
  const validIds = new Set(achievementCatalog.map((achievement) => achievement.id));

  if (!Array.isArray(value)) {
    return [];
  }

  return [...new Set(value.filter((id) => validIds.has(id)))];
}

export function getAchievementStates(context, unlockedIds = []) {
  const unlockedSet = new Set(normalizeAchievementIds(unlockedIds));

  return achievementCatalog.map((achievement) => {
    const progress = achievement.getProgress(context);
    const current = Math.min(progress.target, normalizeCount(progress.current));
    const isQualified = current >= progress.target;

    return {
      ...achievement,
      current,
      isQualified,
      isUnlocked: unlockedSet.has(achievement.id) || isQualified,
      target: progress.target,
    };
  });
}

export function resolveAchievements(unlockedIds, context) {
  const previousIds = normalizeAchievementIds(unlockedIds);
  const previousSet = new Set(previousIds);
  const states = getAchievementStates(context, previousIds);
  const newUnlocks = states.filter((achievement) => (
    achievement.isQualified && !previousSet.has(achievement.id)
  ));

  return {
    newUnlocks,
    states,
    unlockedIds: states
      .filter((achievement) => achievement.isUnlocked)
      .map((achievement) => achievement.id),
  };
}

export function getAchievementProgressText(achievement) {
  if (achievement.isUnlocked) {
    return '已解锁';
  }

  return achievement.current + '/' + achievement.target;
}