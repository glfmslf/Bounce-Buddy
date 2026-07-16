import { normalizeLandingCombo } from './comboFeedback.js';

export const endlessRunHistoryLimit = 5;

function normalizeCount(value) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return 0;
  }

  return Math.max(0, Math.floor(numericValue));
}

export function normalizeEndlessRun(run) {
  const perfect = normalizeCount(run?.perfect);
  const score = normalizeCount(run?.score);

  return {
    combo: normalizeLandingCombo(run?.combo),
    perfect,
    runNumber: normalizeCount(run?.runNumber),
    score,
    shards: normalizeCount(run?.shards),
    speed: Math.max(1, normalizeCount(run?.speed)),
  };
}

export function normalizeEndlessRunHistory(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .slice(0, endlessRunHistoryLimit)
    .map(normalizeEndlessRun);
}

export function appendEndlessRun(history, run) {
  return [
    normalizeEndlessRun(run),
    ...normalizeEndlessRunHistory(history),
  ].slice(0, endlessRunHistoryLimit);
}

export function getEndlessRunSummary(run) {
  const normalized = normalizeEndlessRun(run);

  return normalized.score + ' 分 · 连击 ' +
    normalized.combo + ' · Perfect ' +
    normalized.perfect + ' · 星尘 ' +
    normalized.shards;
}

export function getEndlessRunMeta(run) {
  const normalized = normalizeEndlessRun(run);
  const runLabel = normalized.runNumber > 0
    ? '第 ' + normalized.runNumber + ' 局'
    : '无尽挑战';

  return runLabel + ' · 最终 ' + normalized.speed + ' 档';
}