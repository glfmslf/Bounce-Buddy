import { normalizeEndlessPerformance } from './endlessPerformance.js';
import { normalizePerformanceRecord } from './levelPerformance.js';

function normalizeCount(value) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return 0;
  }

  return Math.max(0, Math.floor(numericValue));
}

function getComparisonText(label, current, best) {
  const difference = current - best;

  if (difference > 0) {
    return `${label} +${difference}`;
  }

  if (difference === 0) {
    return `${label} \u5df2\u5e73`;
  }

  return `${label} \u5dee ${Math.abs(difference)}`;
}

function getProgressFromMetrics({
  firstRunLabel,
  hasHistory,
  metrics,
  recordLabel,
}) {
  if (!hasHistory) {
    return {
      detail: metrics
        .map(({ current, label }) => `${label} ${current}`)
        .join(' \u00b7 '),
      headline: firstRunLabel,
      state: 'first',
    };
  }

  const isAtStart = metrics.every(({ current }) => current === 0);

  if (isAtStart) {
    return {
      detail: metrics
        .map(({ best, label }) => `\u5386\u53f2 ${label} ${best}`)
        .join(' \u00b7 '),
      headline: '\u7eaa\u5f55\u8ffd\u8e2a\u4e2d',
      state: 'chasing',
    };
  }

  const improvedMetrics = metrics.filter(({ best, current }) => current > best);
  const tiedMetrics = metrics.filter(({ best, current }) => current === best);
  const detail = metrics
    .map(({ best, current, label }) => getComparisonText(label, current, best))
    .join(' \u00b7 ');

  if (improvedMetrics.length === metrics.length) {
    return {
      detail,
      headline: '\u53cc\u7eaa\u5f55\u5237\u65b0\u4e2d',
      state: 'record',
    };
  }

  if (improvedMetrics.length > 0) {
    return {
      detail,
      headline: improvedMetrics[0].label + ' \u7eaa\u5f55\u5237\u65b0\u4e2d',
      state: 'record',
    };
  }

  if (tiedMetrics.length === metrics.length) {
    return {
      detail,
      headline: '\u8ffd\u5e73' + recordLabel,
      state: 'tied',
    };
  }

  if (tiedMetrics.length > 0) {
    return {
      detail,
      headline: tiedMetrics[0].label + ' \u5df2\u8ffd\u5e73',
      state: 'tied',
    };
  }

  return {
    detail,
    headline: '\u8ffd\u8d76' + recordLabel,
    state: 'chasing',
  };
}

export function getRunRecordProgress({
  endlessRecord,
  levelRecord,
  maxCombo = 0,
  mode = 'level',
  perfect = 0,
  score = 0,
} = {}) {
  const safeCombo = normalizeCount(maxCombo);

  if (mode === 'endless') {
    const record = normalizeEndlessPerformance(endlessRecord);

    return getProgressFromMetrics({
      firstRunLabel: '\u9996\u5c40\u7eaa\u5f55\u5efa\u7acb\u4e2d',
      hasHistory: (
        record.runs > 0 ||
        record.bestScore > 0 ||
        record.bestCombo > 0
      ),
      metrics: [
        {
          best: record.bestScore,
          current: normalizeCount(score),
          label: '\u5206\u6570',
        },
        {
          best: record.bestCombo,
          current: safeCombo,
          label: '\u8fde\u51fb',
        },
      ],
      recordLabel: '\u65e0\u5c3d\u6700\u4f73',
    });
  }

  const record = normalizePerformanceRecord(levelRecord);

  return getProgressFromMetrics({
    firstRunLabel: '\u9996\u901a\u7eaa\u5f55\u5efa\u7acb\u4e2d',
    hasHistory: record.completions > 0,
    metrics: [
      {
        best: record.bestPerfect,
        current: normalizeCount(perfect),
        label: 'Perfect',
      },
      {
        best: record.bestCombo,
        current: safeCombo,
        label: '\u8fde\u51fb',
      },
    ],
    recordLabel: '\u672c\u5173\u6700\u4f73',
  });
}
