function normalizeCount(value) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return 0;
  }

  return Math.max(0, Math.floor(numericValue));
}

export function getDeathProgressSummary({
  completedJumps,
  mode = 'level',
  totalJumps,
}) {
  const completed = normalizeCount(completedJumps);

  if (mode === 'endless') {
    return {
      completed,
      isEndless: true,
      label: '本局前进 ' + completed + ' 跳',
      percent: null,
      text: '无尽挑战',
      total: null,
    };
  }

  const total = normalizeCount(totalJumps);
  const clampedCompleted = Math.min(completed, total);
  const remaining = Math.max(0, total - clampedCompleted);
  const percent = total > 0 ? (clampedCompleted / total) * 100 : 0;

  return {
    completed: clampedCompleted,
    isEndless: false,
    label: remaining > 0
      ? '距离终点还差 ' + remaining + ' 跳'
      : '已抵达终点',
    percent: Math.round(percent * 100) / 100,
    text: '本关 ' + clampedCompleted + '/' + total,
    total,
  };
}