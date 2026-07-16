export const phaseBonusScore = 1;
export const phaseFocusBonus = 1;
export const phaseCycleSeconds = 1.6;

function normalizeCycle(value) {
  return ((value % 1) + 1) % 1;
}

export function getPhasePlatformState(platform, elapsedSeconds = 0) {
  const offset = Number.isFinite(platform?.phaseOffset)
    ? platform.phaseOffset
    : 0;
  const safeElapsed = Number.isFinite(elapsedSeconds)
    ? elapsedSeconds
    : 0;
  const cycle = normalizeCycle(safeElapsed / phaseCycleSeconds + offset);
  const intensity = (Math.sin(cycle * Math.PI * 2) + 1) / 2;

  return {
    active: intensity >= 0.5,
    cycle,
    intensity,
  };
}