export const reboundShieldComboTarget = 10;

function normalizeCount(value) {
  return Math.max(0, Math.floor(Number(value) || 0));
}

export function getReboundShieldProgress(combo, isReady = false) {
  if (isReady) {
    return reboundShieldComboTarget;
  }

  return normalizeCount(combo) % reboundShieldComboTarget;
}

export function shouldChargeReboundShield(combo, isReady = false) {
  const normalizedCombo = normalizeCount(combo);

  return !isReady &&
    normalizedCombo > 0 &&
    normalizedCombo % reboundShieldComboTarget === 0;
}

export function canUseReboundShield({
  hasSafePlatform = false,
  isGameRunning = false,
  isReady = false,
} = {}) {
  return Boolean(isReady && isGameRunning && hasSafePlatform);
}
