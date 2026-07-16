import { normalizeLandingCombo } from './comboFeedback.js';

function normalizeCount(value) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return 0;
  }

  return Math.max(0, Math.floor(numericValue));
}

export function normalizePerformanceRecord(record) {
  const bestPerfect = normalizeCount(record?.bestPerfect);

  return {
    bestCombo: normalizeLandingCombo(record?.bestCombo),
    bestPerfect,
    completions: normalizeCount(record?.completions),
  };
}

export function normalizeLevelPerformanceMap(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value).map(([level, record]) => [
      String(level),
      normalizePerformanceRecord(record),
    ])
  );
}

export function getLevelPerformance(records, level) {
  return normalizePerformanceRecord(records?.[String(level)]);
}

export function updateLevelPerformance(records, level, {
  combo = 0,
  perfect = 0,
} = {}) {
  const normalizedRecords = normalizeLevelPerformanceMap(records);
  const levelKey = String(Math.max(1, Math.floor(Number(level) || 1)));
  const previous = getLevelPerformance(normalizedRecords, levelKey);
  const nextPerfect = normalizeCount(perfect);
  const nextCombo = normalizeLandingCombo(combo);
  const record = {
    bestCombo: Math.max(previous.bestCombo, nextCombo),
    bestPerfect: Math.max(previous.bestPerfect, nextPerfect),
    completions: previous.completions + 1,
  };

  return {
    didImproveCombo: nextCombo > previous.bestCombo,
    didImprovePerfect: nextPerfect > previous.bestPerfect,
    previous,
    record,
    records: {
      ...normalizedRecords,
      [levelKey]: record,
    },
  };
}

export function getLevelPerformanceText(record) {
  const normalized = normalizePerformanceRecord(record);

  if (normalized.completions === 0) {
    return '暂无详细纪录';
  }

  return '最佳 Perfect ' +
    normalized.bestPerfect +
    ' · 连击 ' +
    normalized.bestCombo;
}

export function getPerformanceResultText(result) {
  const recordText = getLevelPerformanceText(result?.record);

  if (result?.didImprovePerfect && result?.didImproveCombo) {
    return '双纪录刷新 · ' + recordText;
  }

  if (result?.didImprovePerfect) {
    return 'Perfect 纪录刷新 · ' + recordText;
  }

  if (result?.didImproveCombo) {
    return '连击纪录刷新 · ' + recordText;
  }

  return '保持纪录 · ' + recordText;
}