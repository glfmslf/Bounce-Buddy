function normalizeDevicePixelRatio(value) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue) || numericValue <= 0) {
    return 1;
  }

  return numericValue;
}

export function getRenderQualitySettings({
  devicePixelRatio = 1,
  lowPower = false,
} = {}) {
  const pixelRatioLimit = lowPower ? 1.25 : 2;

  return {
    impacts: !lowPower,
    pixelRatio: Math.min(
      normalizeDevicePixelRatio(devicePixelRatio),
      pixelRatioLimit
    ),
    shadows: !lowPower,
  };
}