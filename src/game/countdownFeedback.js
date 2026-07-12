export const runCountdownSteps = ['3', '2', '1', 'GO!'];

export function getRunCountdownCopy({
  levelName = '',
  missionText = '',
  mode = 'level',
  routeText = '',
} = {}) {
  if (mode === 'endless') {
    return {
      detail: '每 10 分提速，速度无上限',
      kicker: '无尽模式',
    };
  }

  const detail = [
    missionText ? '任务：' + missionText : '',
    routeText,
  ].filter(Boolean).join(' · ');

  return {
    detail: detail || '准备起跳',
    kicker: levelName || '普通关卡',
  };
}

export function getCountdownDelay(step) {
  return step === 'GO!' ? 360 : 480;
}