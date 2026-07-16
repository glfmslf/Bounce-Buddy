export const focusChargeTarget = 3;
export const focusDurationSeconds = 2.4;
export const focusTimeScale = 0.52;

function normalizeCount(value) {
  return Math.max(0, Math.floor(Number(value) || 0));
}

export function normalizeFocusCharge(value) {
  return Math.min(focusChargeTarget, normalizeCount(value));
}

export function isFocusReady(charge) {
  return normalizeFocusCharge(charge) >= focusChargeTarget;
}

export function getFocusChargeAfterLanding({
  charge = 0,
  isPerfectLanding = false,
} = {}) {
  const normalizedCharge = normalizeFocusCharge(charge);

  if (isFocusReady(normalizedCharge)) {
    return normalizedCharge;
  }

  return isPerfectLanding
    ? normalizeFocusCharge(normalizedCharge + 1)
    : 0;
}

export function canActivateFocus({
  charge = 0,
  isActive = false,
  isBlocked = false,
  isGameOver = false,
  isGameRunning = false,
  isLevelComplete = false,
  isPaused = false,
} = {}) {
  return isFocusReady(charge) &&
    !isActive &&
    !isBlocked &&
    !isGameOver &&
    isGameRunning &&
    !isLevelComplete &&
    !isPaused;
}
