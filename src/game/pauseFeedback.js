export function getPauseCopy(reason = 'manual') {
  if (reason === 'background') {
    return {
      kicker: '自动暂停',
      title: '已保护进度',
      detail: '检测到页面离开，已帮你停在当前跳点。',
    };
  }

  return {
    kicker: '暂停中',
    title: '喘口气',
    detail: '继续时会从当前跳点接着跑。',
  };
}

export function shouldAutoPause({
  hidden,
  isGameRunning,
  isPaused,
  isGameOver,
  isLevelComplete,
}) {
  return Boolean(
    hidden &&
    isGameRunning &&
    !isPaused &&
    !isGameOver &&
    !isLevelComplete
  );
}