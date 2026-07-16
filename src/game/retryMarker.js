const retryReasons = new Set(['color', 'miss']);

function normalizeCount(value) {
  return Math.max(0, Math.floor(Number(value) || 0));
}

export function createRetryMarker({ jump = 0, level = 1, reason = 'miss', x = 0 } = {}) {
  const normalizedJump = normalizeCount(jump);

  if (normalizedJump < 1) {
    return null;
  }

  return {
    jump: normalizedJump,
    level: Math.max(1, normalizeCount(level)),
    reason: retryReasons.has(reason) ? reason : 'miss',
    x: Number.isFinite(Number(x)) ? Number(x) : 0,
  };
}

export function getRetryMarkerState(marker, {
  currentJump = 0,
  level = 1,
  mode = 'level',
  visibleLandingCount = 0,
} = {}) {
  const normalizedCurrentJump = normalizeCount(currentJump);
  const visibleCount = Math.max(1, normalizeCount(visibleLandingCount));
  const isActive = Boolean(
    marker &&
    mode === 'level' &&
    marker.level === Math.max(1, normalizeCount(level)) &&
    marker.jump > normalizedCurrentJump
  );
  const distance = isActive ? marker.jump - normalizedCurrentJump : 0;

  return {
    distance,
    isActive,
    isNext: isActive && distance === 1,
    visible: isActive && distance < visibleCount,
  };
}

export function isRetryMarkerRecovered(marker, {
  jump = 0,
  level = 1,
  mode = 'level',
} = {}) {
  return Boolean(
    marker &&
    mode === 'level' &&
    marker.level === Math.max(1, normalizeCount(level)) &&
    marker.jump === normalizeCount(jump)
  );
}

export function getRetryMarkerText(marker) {
  if (!marker) {
    return '';
  }

  const reasonText = marker.reason === 'color' ? '颜色不匹配' : '偏离平台';
  return `上次失误：第 ${marker.jump} 跳 · ${reasonText}`;
}
