export const bestScoreStorageKey = 'bounceBuddyBestScore';
export const endlessBestScoreStorageKey = 'bounceBuddyEndlessBestScore';
export const endlessPerformanceStorageKey = 'bounceBuddyEndlessPerformance';
export const endlessRunHistoryStorageKey = 'bounceBuddyEndlessRunHistory';
export const tutorialSeenStorageKey = 'bounceBuddyTutorialSeen';
export const soundEnabledStorageKey = 'bounceBuddySoundEnabled';
export const lowPowerStorageKey = 'bounceBuddyLowPower';
export const speedUpScoreInterval = 10;
export const unlockedLevelStorageKey = 'bounceBuddyUnlockedLevel';
export const levelStarsStorageKey = 'bounceBuddyLevelStars';
export const levelPerformanceStorageKey = 'bounceBuddyLevelPerformance';
export const achievementStorageKey = 'bounceBuddyAchievements';
export const levelCatalog = [
  { intensity: 1, name: '\u7cd6\u971c\u8d77\u8df3', length: 8, mission: { type: 'perfect', target: 4 } },
  { intensity: 1, name: '\u84dd\u8393\u5f2f\u9053', length: 10, mission: { type: 'perfect', target: 6 } },
  { intensity: 2, name: '\u67e0\u6aac\u95ea\u7535', length: 12, mission: { type: 'shard', target: 2 } },
  { intensity: 2, name: '\u5f69\u8679\u6362\u8272\u7ad9', length: 14, mission: { type: 'rainbow', target: 2 } },
  { intensity: 3, name: '\u9713\u8679\u4e09\u8fde\u8df3', length: 16, mission: { type: 'perfect', target: 11 } },
  { intensity: 3, name: '\u661f\u5c51\u6a2a\u79fb\u8bfe', length: 18, mission: { type: 'shard', target: 3 } },
  { intensity: 4, name: '\u7126\u7cd6\u6025\u8f6c\u5f2f', length: 20, mission: { type: 'perfect', target: 14 } },
  { intensity: 4, name: '\u6781\u5149\u7ec8\u70b9\u7ebf', length: 22, mission: { type: 'rainbow', target: 3 } },
  { intensity: 5, name: '\u94f6\u6cb3\u5f39\u8df3\u676f', length: 24, mission: { type: 'shard', target: 4 } },
  { intensity: 5, name: '\u5b87\u5b99\u51a0\u519b\u8def', length: 26, mission: { type: 'rainbow', target: 4 } },
];

export const lanePositions = [-2.4, 0, 2.4];
export const platformHalfWidth = 0.86;
export const visibleLandingCount = 12;
export const maxPlatformsPerLanding = 2;
export const minWildcardGap = 3;
export const maxWildcardGap = 6;

export const bounceHeight = 3.05;
export const baseY = 0.62;
export const nearZ = 3.2;
export const landingGap = 2.88;

export const starPaletteHex = [
  0x8ff4ff,
  0xd9fbff,
  0x78a7ff,
];

export const gameColors = {
  red: {
    label: '\u7ea2\u8272',
    ball: 0x5d1824,
    emissive: 0xff3f5f,
    pad: 0x6d1228,
    edge: 0xff9aac,
  },
  blue: {
    label: '\u84dd\u8272',
    ball: 0x183c6d,
    emissive: 0x29d7ff,
    pad: 0x123b6d,
    edge: 0xa6f6ff,
  },
  yellow: {
    label: '\u9ec4\u8272',
    ball: 0x625018,
    emissive: 0xffd257,
    pad: 0x6d5212,
    edge: 0xffef9a,
  },
};

export const colorOrder = ['red', 'blue', 'yellow'];

export const wildcardPad = {
  label: '\u5f69\u8679',
  pad: 0xf4fbff,
  emissive: 0xffffff,
  edge: 0xffffff,
};
