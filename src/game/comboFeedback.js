function normalizeCombo(value) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return 0;
  }

  return Math.max(0, Math.floor(numericValue));
}

export function normalizePrecisionCombo(combo, perfect) {
  return Math.min(normalizeCombo(combo), normalizeCombo(perfect));
}

export function getNextPrecisionCombo(combo, isPerfectLanding = false) {
  return isPerfectLanding ? normalizeCombo(combo) + 1 : 0;
}

export function getComboBreakFeedbackText(combo, isPerfectLanding = false) {
  const previousCombo = normalizeCombo(combo);

  if (isPerfectLanding || previousCombo < 2) {
    return '';
  }

  return previousCombo + ' \u8fde\u51fb\u4e2d\u65ad';
}

export function getComboMilestone(value) {
  const combo = normalizeCombo(value);

  if (combo === 0 || combo % 5 !== 0) {
    return null;
  }

  const isMajor = combo % 10 === 0;

  return {
    combo,
    detail: isMajor ? '节奏拉满' : '继续保持',
    kicker: isMajor ? '节奏爆发' : '连击里程碑',
    level: isMajor ? 'major' : 'minor',
    title: combo + ' 连击',
  };
}

export function getComboFeedbackText(value) {
  const milestone = getComboMilestone(value);

  if (!milestone) {
    return '';
  }

  return milestone.level === 'major'
    ? '连击 x' + milestone.combo + '，节奏拉满'
    : '连击 x' + milestone.combo;
}

export function withComboFeedback(message, value) {
  const comboFeedback = getComboFeedbackText(value);

  return comboFeedback ? message + ' · ' + comboFeedback : message;
}