export const overloadBonusScore = 1;
export const overloadFocusBonus = 1;
export const overloadSpeedBonus = 2;
export const overloadDurationLandings = 3;

export function createOverloadState() {
  return { remainingLandings: 0 };
}

export function activateOverload() {
  return { remainingLandings: overloadDurationLandings };
}

export function advanceOverload(state, didActivate = false) {
  if (didActivate) {
    return activateOverload();
  }

  const remainingLandings = Math.max(
    0,
    Math.floor(Number(state?.remainingLandings) || 0) - 1
  );

  return { remainingLandings };
}

export function isOverloadActive(state) {
  return Math.max(0, Math.floor(Number(state?.remainingLandings) || 0)) > 0;
}
