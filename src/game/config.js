export const bestScoreStorageKey = 'bounceBuddyBestScore';
export const speedUpScoreInterval = 10;
export const maxRuntimeSpeedLevel = 100;

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
    label: '红色',
    ball: 0x5d1824,
    emissive: 0xff3f5f,
    pad: 0x6d1228,
    edge: 0xff9aac,
  },
  blue: {
    label: '蓝色',
    ball: 0x183c6d,
    emissive: 0x29d7ff,
    pad: 0x123b6d,
    edge: 0xa6f6ff,
  },
  yellow: {
    label: '黄色',
    ball: 0x625018,
    emissive: 0xffd257,
    pad: 0x6d5212,
    edge: 0xffef9a,
  },
};

export const colorOrder = ['red', 'blue', 'yellow'];

export const wildcardPad = {
  label: '彩虹',
  pad: 0xf4fbff,
  emissive: 0xffffff,
  edge: 0xffffff,
};
