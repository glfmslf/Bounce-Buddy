export const shardLandingInterval = 4;

export function isShardLanding(landingIndex) {
  const normalizedIndex = Math.floor(Number(landingIndex));

  return Number.isFinite(normalizedIndex) &&
    normalizedIndex > 0 &&
    normalizedIndex % shardLandingInterval === 0;
}


export function canCollectShard(platform, isPerfectLanding, alreadyCollected = false) {
  return Boolean(platform?.hasShard) &&
    Boolean(isPerfectLanding) &&
    !alreadyCollected;
}
export function getMissionTypeLabel(type) {
  switch (type) {
    case 'rainbow':
      return '彩虹';
    case 'shard':
      return '星尘';
    case 'perfect':
    default:
      return 'Perfect';
  }
}

export function getMissionProgressValue(mission, progress = {}) {
  switch (mission?.type) {
    case 'rainbow':
      return Math.max(0, Math.floor(Number(progress.rainbow) || 0));
    case 'shard':
      return Math.max(0, Math.floor(Number(progress.shard) || 0));
    case 'perfect':
    default:
      return Math.max(0, Math.floor(Number(progress.perfect) || 0));
  }
}