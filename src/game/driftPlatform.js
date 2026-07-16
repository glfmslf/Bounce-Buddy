export const driftBonusScore = 1;
export const driftFocusBonus = 1;
export const driftCycleSeconds = 2.3;

function normalizeCycle(value) {
  return ((value % 1) + 1) % 1;
}

export function getDriftPlatformState(platform, elapsedSeconds = 0) {
  const originX = Number.isFinite(platform?.x) ? platform.x : 0;
  const targetX = Number.isFinite(platform?.driftTargetX)
    ? platform.driftTargetX
    : originX;
  const offset = Number.isFinite(platform?.driftOffset)
    ? platform.driftOffset
    : 0;
  const safeElapsed = Number.isFinite(elapsedSeconds) ? elapsedSeconds : 0;
  const cycle = normalizeCycle(safeElapsed / driftCycleSeconds + offset);
  const angle = cycle * Math.PI * 2;
  const progress = (1 - Math.cos(angle)) / 2;
  const velocity = Math.sin(angle);

  return {
    cycle,
    direction: velocity >= 0 ? 1 : -1,
    midpointX: (originX + targetX) / 2,
    progress,
    speed: Math.abs(velocity),
    x: originX + (targetX - originX) * progress,
  };
}
