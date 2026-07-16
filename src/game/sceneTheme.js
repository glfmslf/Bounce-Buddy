const sceneThemes = [
  {
    id: 'frost',
    background: 0x07111f,
    floor: 0x89d8ff,
    gridCenter: 0x5bd7ff,
    gridLine: 0x244567,
    hemisphereGround: 0x86a9c9,
    hemisphereSky: 0xffffff,
    keyLight: 0xffffff,
    starTint: 0xd9fbff,
  },
  {
    id: 'citrus',
    background: 0x061817,
    floor: 0x6fe0bd,
    gridCenter: 0xd6ff75,
    gridLine: 0x285d58,
    hemisphereGround: 0x739b91,
    hemisphereSky: 0xd8fff2,
    keyLight: 0xffef9a,
    starTint: 0xc5fff0,
  },
  {
    id: 'neon',
    background: 0x160b20,
    floor: 0xa867ff,
    gridCenter: 0xff6fb5,
    gridLine: 0x4f365f,
    hemisphereGround: 0x6f6185,
    hemisphereSky: 0xffd0ef,
    keyLight: 0xff78b9,
    starTint: 0xe4d3ff,
  },
  {
    id: 'aurora',
    background: 0x04161b,
    floor: 0x4ce0c4,
    gridCenter: 0xa4ffd2,
    gridLine: 0x2a5263,
    hemisphereGround: 0x456c83,
    hemisphereSky: 0xb9fff2,
    keyLight: 0x74ffd6,
    starTint: 0xd7fff4,
  },
  {
    id: 'nova',
    background: 0x12070e,
    floor: 0xff718f,
    gridCenter: 0xffd46a,
    gridLine: 0x4d2d5b,
    hemisphereGround: 0x6a526e,
    hemisphereSky: 0xfff0c2,
    keyLight: 0xffc85c,
    starTint: 0xffe2ad,
  },
];

function normalizeIndex(value) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return 0;
  }

  return Math.min(sceneThemes.length - 1, Math.max(0, Math.floor(numericValue)));
}

export function getSceneTheme({
  intensity = 1,
  mode = 'level',
  score = 0,
  scoreInterval = 10,
} = {}) {
  if (mode === 'endless') {
    const safeInterval = Math.max(1, Math.floor(Number(scoreInterval) || 10));
    const themeIndex = Math.floor(Math.max(0, Number(score) || 0) / safeInterval) % sceneThemes.length;
    return sceneThemes[themeIndex];
  }

  return sceneThemes[normalizeIndex(Number(intensity) - 1)];
}

export function getSceneThemeIds() {
  return sceneThemes.map((theme) => theme.id);
}