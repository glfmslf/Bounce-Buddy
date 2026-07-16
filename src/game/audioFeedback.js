const colorFrequencies = {
  red: 330,
  blue: 392,
  yellow: 494,
};

function tone(frequency, {
  delay = 0,
  duration = 0.1,
  endFrequency = frequency,
  gain = 0.028,
  type = 'sine',
} = {}) {
  return {
    delay,
    duration,
    endFrequency,
    frequency,
    gain,
    type,
  };
}

export function getFeedbackSequence(event, color = 'red') {
  const baseFrequency = colorFrequencies[color] ?? colorFrequencies.red;

  switch (event) {
    case 'perfect':
      return [
        tone(baseFrequency * 1.25, { duration: 0.08, gain: 0.025 }),
        tone(baseFrequency * 1.65, { delay: 0.055, duration: 0.12, gain: 0.03 }),
      ];
    case 'rainbow':
      return [
        tone(440, { duration: 0.09, gain: 0.025 }),
        tone(554, { delay: 0.05, duration: 0.09, gain: 0.025 }),
        tone(659, { delay: 0.1, duration: 0.13, gain: 0.028 }),
      ];
    case 'countdown':
      return [tone(440, { duration: 0.065, gain: 0.018, type: 'triangle' })];
    case 'countdownGo':
      return [
        tone(659, { duration: 0.075, gain: 0.022, type: 'triangle' }),
        tone(988, { delay: 0.055, duration: 0.13, gain: 0.026 }),
      ];
    case 'mission':
      return [
        tone(523, { duration: 0.08, gain: 0.026, type: 'triangle' }),
        tone(784, { delay: 0.055, duration: 0.12, gain: 0.03 }),
        tone(1047, { delay: 0.12, duration: 0.18, gain: 0.028 }),
      ];
    case 'achievement':
      return [
        tone(523, { duration: 0.08, gain: 0.024, type: 'triangle' }),
        tone(784, { delay: 0.06, duration: 0.12, gain: 0.028 }),
        tone(1175, { delay: 0.14, duration: 0.2, gain: 0.026 }),
      ];
    case 'shard':
      return [
        tone(659, { duration: 0.07, gain: 0.024, type: 'triangle' }),
        tone(988, { delay: 0.045, duration: 0.1, gain: 0.028 }),
        tone(1318, { delay: 0.1, duration: 0.16, gain: 0.025 }),
      ];
    case 'focusReady':
      return [
        tone(392, { duration: 0.07, gain: 0.022, type: 'triangle' }),
        tone(659, { delay: 0.05, duration: 0.1, gain: 0.026, type: 'triangle' }),
        tone(988, { delay: 0.11, duration: 0.16, gain: 0.028 }),
      ];
    case 'focusActivate':
      return [
        tone(784, { duration: 0.1, gain: 0.024, type: 'triangle' }),
        tone(523, { delay: 0.055, duration: 0.16, gain: 0.026, type: 'triangle' }),
        tone(392, { delay: 0.12, duration: 0.24, gain: 0.022 }),
      ];
    case 'speedUp':
      return [
        tone(392, { duration: 0.08, gain: 0.024 }),
        tone(523, { delay: 0.06, duration: 0.1, gain: 0.027 }),
        tone(784, { delay: 0.12, duration: 0.16, gain: 0.03 }),
      ];
    case 'comboBreak':
      return [
        tone(294, {
          duration: 0.14,
          endFrequency: 196,
          gain: 0.02,
          type: 'triangle',
        }),
      ];
    case 'death':
      return [
        tone(180, {
          duration: 0.34,
          endFrequency: 72,
          gain: 0.032,
          type: 'triangle',
        }),
      ];
    case 'complete':
      return [
        tone(392, { duration: 0.12, gain: 0.026 }),
        tone(494, { delay: 0.08, duration: 0.13, gain: 0.028 }),
        tone(659, { delay: 0.16, duration: 0.22, gain: 0.032 }),
      ];
    case 'toggle':
      return [tone(659, { duration: 0.08, gain: 0.02 })];
    case 'landing':
    default:
      return [tone(baseFrequency, { duration: 0.09, gain: 0.022 })];
  }
}

function defaultContextFactory() {
  const AudioContextClass =
    globalThis.AudioContext ?? globalThis.webkitAudioContext;

  return AudioContextClass ? new AudioContextClass() : null;
}

export function createAudioFeedback({
  contextFactory = defaultContextFactory,
} = {}) {
  let context = null;

  function getContext() {
    if (!context) {
      context = contextFactory();
    }

    if (context?.state === 'suspended') {
      context.resume().catch(() => {});
    }

    return context;
  }

  function playTone(contextValue, definition) {
    const oscillator = contextValue.createOscillator();
    const gainNode = contextValue.createGain();
    const startTime = contextValue.currentTime + definition.delay;
    const endTime = startTime + definition.duration;

    oscillator.type = definition.type;
    oscillator.frequency.setValueAtTime(definition.frequency, startTime);

    if (definition.endFrequency !== definition.frequency) {
      oscillator.frequency.exponentialRampToValueAtTime(
        Math.max(1, definition.endFrequency),
        endTime
      );
    }

    gainNode.gain.setValueAtTime(0.0001, startTime);
    gainNode.gain.exponentialRampToValueAtTime(
      definition.gain,
      startTime + Math.min(0.012, definition.duration * 0.25)
    );
    gainNode.gain.exponentialRampToValueAtTime(0.0001, endTime);

    oscillator.connect(gainNode);
    gainNode.connect(contextValue.destination);
    oscillator.start(startTime);
    oscillator.stop(endTime + 0.02);
  }

  return {
    play(event, color) {
      try {
        const contextValue = getContext();

        if (!contextValue) {
          return false;
        }

        getFeedbackSequence(event, color).forEach((definition) => {
          playTone(contextValue, definition);
        });

        return true;
      } catch {
        return false;
      }
    },
    resume() {
      try {
        return Boolean(getContext());
      } catch {
        return false;
      }
    },
  };
}