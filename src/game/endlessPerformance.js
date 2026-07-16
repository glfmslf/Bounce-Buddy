import { normalizeLandingCombo } from './comboFeedback.js';

function normalizeCount(value) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return 0;
  }

  return Math.max(0, Math.floor(numericValue));
}

export function normalizeEndlessPerformance(record, fallbackScore = 0) {
  const bestPerfect = normalizeCount(record?.bestPerfect);
  const bestScore = Math.max(
    normalizeCount(record?.bestScore),
    normalizeCount(fallbackScore)
  );

  return {
    bestCombo: normalizeLandingCombo(record?.bestCombo),
    bestPerfect,
    bestScore,
    bestShards: normalizeCount(record?.bestShards),
    runs: normalizeCount(record?.runs),
  };
}

export function updateEndlessPerformance(record, run = {}) {
  const previous = normalizeEndlessPerformance(record);
  const perfect = normalizeCount(run.perfect);
  const values = {
    combo: normalizeLandingCombo(run.combo, normalizeCount(run.score)),
    perfect,
    score: normalizeCount(run.score),
    shards: normalizeCount(run.shards),
  };
  const improved = {
    combo: values.combo > previous.bestCombo,
    perfect: values.perfect > previous.bestPerfect,
    score: values.score > previous.bestScore,
    shards: values.shards > previous.bestShards,
  };
  const next = {
    bestCombo: Math.max(previous.bestCombo, values.combo),
    bestPerfect: Math.max(previous.bestPerfect, values.perfect),
    bestScore: Math.max(previous.bestScore, values.score),
    bestShards: Math.max(previous.bestShards, values.shards),
    runs: previous.runs + 1,
  };

  return {
    didImprove: Object.values(improved).some(Boolean),
    improved,
    previous,
    record: next,
  };
}

export function getEndlessPerformanceText(record) {
  const normalized = normalizeEndlessPerformance(record);

  return '连击 ' +
    normalized.bestCombo +
    ' · Perfect ' +
    normalized.bestPerfect +
    ' · 星尘 ' +
    normalized.bestShards;
}

export function getEndlessPerformanceResultText(result) {
  const labels = [
    result?.improved?.score ? '分数' : '',
    result?.improved?.combo ? '连击' : '',
    result?.improved?.perfect ? 'Perfect' : '',
    result?.improved?.shards ? '星尘' : '',
  ].filter(Boolean);

  if (labels.length === 0) {
    return '保持无尽纪录 · ' +
      getEndlessPerformanceText(result?.record);
  }

  return labels.join('/') +
    '纪录刷新 · ' +
    getEndlessPerformanceText(result?.record);
}