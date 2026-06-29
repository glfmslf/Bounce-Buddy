export function getScoreSpeedBonus(mode, score, interval) {
  if (mode !== 'endless') {
    return 0;
  }

  const safeInterval = Math.max(1, Math.floor(Number(interval) || 1));
  const safeScore = Math.max(0, Math.floor(Number(score) || 0));
  return Math.floor(safeScore / safeInterval);
}

export function didSpeedIncrease(previousSpeedLevel, nextSpeedLevel) {
  return Math.floor(Number(nextSpeedLevel) || 0) > Math.floor(Number(previousSpeedLevel) || 0);
}

export function getSpeedUpFeedbackText(didSpeedChange, speedLevel) {
  return didSpeedChange ? `\u63d0\u901f\u5230 ${speedLevel} \u6863` : '';
}

export function withSpeedUpFeedback(message, didSpeedChange, speedLevel) {
  const speedFeedback = getSpeedUpFeedbackText(didSpeedChange, speedLevel);
  return speedFeedback ? `${message} \u00b7 ${speedFeedback}` : message;
}