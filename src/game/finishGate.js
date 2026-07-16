export const finishApproachJumpCount = 3;

function normalizeLanding(value) {
  return Math.max(0, Math.floor(Number(value) || 0));
}

export function getFinishGateState({
  currentLanding = 0,
  endLanding = 0,
  mode = 'level',
  visibleLandingCount = 0,
} = {}) {
  const current = normalizeLanding(currentLanding);
  const end = normalizeLanding(endLanding);
  const visibleCount = Math.max(1, normalizeLanding(visibleLandingCount));
  const remaining = Math.max(0, end - current);
  const isLevelMode = mode === 'level' && end > current;

  return {
    isNear: isLevelMode && remaining <= finishApproachJumpCount,
    remaining,
    visible: isLevelMode && remaining < visibleCount,
  };
}

export function isEnteringFinishApproach({
  endLanding = 0,
  landingIndex = 0,
  mode = 'level',
} = {}) {
  return mode === 'level' &&
    normalizeLanding(endLanding) - normalizeLanding(landingIndex) ===
      finishApproachJumpCount;
}
