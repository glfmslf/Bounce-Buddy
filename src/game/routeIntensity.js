export const maxRouteIntensity = 5;

export function normalizeRouteIntensity(value) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return 1;
  }

  return Math.min(maxRouteIntensity, Math.max(1, Math.floor(numericValue)));
}

export function getRouteDifficulty(intensity) {
  return (normalizeRouteIntensity(intensity) - 1) / (maxRouteIntensity - 1);
}

export function getRouteIntensityText(intensity) {
  return '路线强度 ' +
    normalizeRouteIntensity(intensity) +
    '/' +
    maxRouteIntensity;
}

export function getRouteIntensityStates(intensity) {
  const normalizedIntensity = normalizeRouteIntensity(intensity);

  return Array.from(
    { length: maxRouteIntensity },
    (_, index) => index < normalizedIntensity
  );
}