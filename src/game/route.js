import {
  colorOrder,
  lanePositions,
  maxPlatformsPerLanding,
  maxWildcardGap,
  minWildcardGap,
  platformHalfWidth,
} from './config.js';
import { isShardLanding } from './shardProgress.js';

const startingRoutePlan = { color: 'red', laneIndex: 1, shouldCreateWildcard: false };
let routeSeed = createRouteSeed();
let routeDifficulty = 0;
const platformLayout = new Map([
  [0, createLandingPlatforms(0, startingRoutePlan)],
]);
const routePlans = new Map([[0, startingRoutePlan]]);
const retainedRouteHistory = maxWildcardGap + 6;


function normalizeRouteDifficulty(value) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return 0;
  }

  return Math.min(1, Math.max(0, numericValue));
}

function normalizeRouteSeed(value) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return createRouteSeed();
  }

  return Math.floor(numericValue) >>> 0;
}
function createRouteSeed() {
  return Math.floor(Math.random() * 0xffffffff);
}

function seededValue(index, salt = 0) {
  let state = (
    routeSeed +
    Math.imul(index + 1, 0x85ebca6b) +
    Math.imul(salt + 1, 0xc2b2ae35)
  ) >>> 0;

  state ^= state >>> 16;
  state = Math.imul(state, 0x7feb352d);
  state ^= state >>> 15;
  state = Math.imul(state, 0x846ca68b);
  state ^= state >>> 16;

  return (state >>> 0) / 0x100000000;
}

function pickSeeded(items, index, salt = 0) {
  return items[Math.floor(seededValue(index, salt) * items.length)];
}

function getWeightedSeededCandidate(candidates, index, salt = 0) {
  const totalWeight = candidates.reduce((sum, candidate) => sum + candidate.weight, 0);
  let cursor = seededValue(index, salt) * totalWeight;

  for (const candidate of candidates) {
    cursor -= candidate.weight;

    if (cursor <= 0) {
      return candidate.value;
    }
  }

  return candidates[candidates.length - 1].value;
}

function getNextColor(colorKey, index = 0) {
  const recentColors = [];

  for (let offset = 1; offset <= 4; offset += 1) {
    const recentPlan = routePlans.get(index - offset);

    if (recentPlan) {
      recentColors.push(recentPlan.color);
    }
  }

  const candidates = colorOrder
    .filter((color) => color !== colorKey)
    .map((color) => ({
      value: color,
      weight: recentColors.includes(color) ? 1 : 3,
    }));

  return getWeightedSeededCandidate(candidates, index, 41);
}

function getLastWildcardIndex(beforeIndex) {
  for (let index = beforeIndex - 1; index >= 0; index -= 1) {
    if (routePlans.get(index)?.shouldCreateWildcard) {
      return index;
    }
  }

  return 0;
}

function shouldCreateWildcardLanding(index) {
  if (index <= 2) {
    return false;
  }

  const gap = index - getLastWildcardIndex(index);

  if (gap < minWildcardGap) {
    return false;
  }

  if (gap >= maxWildcardGap) {
    return true;
  }

  const wildcardChance = 0.22 + routeDifficulty * 0.24;

  return seededValue(index, 29) < wildcardChance;
}

function getPlatformCount(index) {
  const distractorChance = 0.34 + routeDifficulty * 0.34;
  let platformCount = 1 + Number(seededValue(index, 3) < distractorChance);
  const previousPlatforms = platformLayout.get(index - 1);
  const earlierPlatforms = platformLayout.get(index - 2);

  if (
    previousPlatforms &&
    earlierPlatforms &&
    previousPlatforms.length === earlierPlatforms.length &&
    earlierPlatforms.length === platformCount
  ) {
    platformCount = platformCount === 1 ? 2 : 1;
  }

  return Math.min(maxPlatformsPerLanding, platformCount);
}

function createLandingPlatforms(index, routePlan) {
  if (index === 0) {
    return [{ x: 0, type: 'normal', color: 'red', nextColor: null }];
  }

  const requiredColor = routePlan.color;
  const platformCount = getPlatformCount(index);
  const shouldCreateWildcard = routePlan.shouldCreateWildcard;
  const routeLaneIndex = routePlan.laneIndex;
  const lanes = [routeLaneIndex];

  if (platformCount > 1) {
    const distractorCandidates = lanePositions
      .map((_, laneIndex) => laneIndex)
      .filter((laneIndex) => laneIndex !== routeLaneIndex);
    const distractorLane = pickSeeded(
      distractorCandidates,
      index,
      routeLaneIndex + 11
    );

    lanes.push(distractorLane);
  }

  const nextColor = shouldCreateWildcard ? getNextColor(requiredColor, index) : null;

  return lanes.map((laneIndex, platformIndex) => {
    const x = lanePositions[laneIndex];

    if (shouldCreateWildcard && platformIndex === 0) {
      return {
        x,
        hasShard: isShardLanding(index),
        type: 'wildcard',
        color: requiredColor,
        nextColor,
      };
    }

    const color = laneIndex === routeLaneIndex
      ? requiredColor
      : getNextColor(requiredColor, index + laneIndex);

    return {
      x,
      hasShard: platformIndex === 0 && isShardLanding(index),
      type: 'normal',
      color,
      nextColor: null,
    };
  });
}

function getNextRouteLane(index, previousLaneIndex) {
  const candidates = lanePositions
    .map((_, laneIndex) => laneIndex)
    .filter((laneIndex) => Math.abs(laneIndex - previousLaneIndex) <= 1)
    .map((laneIndex) => {
      const recentLanes = [1, 2, 3, 4]
        .map((offset) => routePlans.get(index - offset)?.laneIndex)
        .filter((recentLaneIndex) => recentLaneIndex !== undefined);
      const previousPreviousLaneIndex = routePlans.get(index - 2)?.laneIndex;
      const previousMove = previousPreviousLaneIndex === undefined
        ? null
        : previousLaneIndex - previousPreviousLaneIndex;
      const nextMove = laneIndex - previousLaneIndex;
      let weight = 4;

      if (laneIndex === previousLaneIndex) {
        weight -= 0.7 + routeDifficulty * 1.2;
      }

      if (recentLanes.slice(0, 2).every((recentLaneIndex) => recentLaneIndex === laneIndex)) {
        weight -= 0.7 + routeDifficulty * 1.2;
      }

      if (previousMove !== null && nextMove === previousMove) {
        weight -= 1;
      }

      if (recentLanes[2] === laneIndex && recentLanes[1] === previousLaneIndex) {
        weight -= 1.25;
      }

      return {
        value: laneIndex,
        weight: Math.max(0.4, weight),
      };
    });

  return getWeightedSeededCandidate(candidates, index, 17);
}

function getRoutePlan(index) {
  if (index <= 0) {
    routePlans.set(0, startingRoutePlan);
    return startingRoutePlan;
  }

  if (!routePlans.has(index)) {
    const previousPlan = getRoutePlan(index - 1);
    const previousPlatforms = getLandingPlatforms(index - 1);
    const wildcardPlatform = previousPlatforms.find((platform) => platform.type === 'wildcard');

    routePlans.set(index, {
      color: wildcardPlatform?.nextColor ?? previousPlan.color,
      laneIndex: getNextRouteLane(index, previousPlan.laneIndex),
      shouldCreateWildcard: shouldCreateWildcardLanding(index),
    });
  }

  return routePlans.get(index);
}


export function setRouteProfile({
  difficulty = routeDifficulty,
  seed = routeSeed,
} = {}, fromLandingIndex = 0) {
  routeDifficulty = normalizeRouteDifficulty(difficulty);
  routeSeed = normalizeRouteSeed(seed);
  const boundary = Math.max(0, Math.floor(Number(fromLandingIndex) || 0));

  for (const index of platformLayout.keys()) {
    if (index > boundary) {
      platformLayout.delete(index);
    }
  }

  for (const index of routePlans.keys()) {
    if (index > boundary) {
      routePlans.delete(index);
    }
  }

  return {
    difficulty: routeDifficulty,
    seed: routeSeed,
  };
}

export function setRouteDifficulty(difficulty, fromLandingIndex = 0) {
  return setRouteProfile({ difficulty }, fromLandingIndex).difficulty;
}
export function resetRoute(difficulty = 0, seed) {
  routeDifficulty = normalizeRouteDifficulty(difficulty);
  routeSeed = normalizeRouteSeed(seed);
  platformLayout.clear();
  routePlans.clear();
  routePlans.set(0, startingRoutePlan);
  platformLayout.set(0, createLandingPlatforms(0, startingRoutePlan));
}

export function getLandingPlatforms(index) {
  if (index <= 0) {
    if (!platformLayout.has(0)) {
      platformLayout.set(0, createLandingPlatforms(0, startingRoutePlan));
    }

    return platformLayout.get(0);
  }

  if (!platformLayout.has(index)) {
    platformLayout.set(index, createLandingPlatforms(index, getRoutePlan(index)));
  }

  return platformLayout.get(index);
}

export function pruneRouteBefore(currentLandingIndex) {
  const firstRetainedIndex = Math.max(0, currentLandingIndex - retainedRouteHistory);

  for (const index of platformLayout.keys()) {
    if (index > 0 && index < firstRetainedIndex) {
      platformLayout.delete(index);
    }
  }

  for (const index of routePlans.keys()) {
    if (index > 0 && index < firstRetainedIndex) {
      routePlans.delete(index);
    }
  }
}

export function getRouteCacheStats() {
  return {
    difficulty: routeDifficulty,
    platformLayouts: platformLayout.size,
    routePlans: routePlans.size,
  };
}

export function findPlatformAt(index, x) {
  return getLandingPlatforms(index).find(
    (platform) => Math.abs(x - platform.x) <= platformHalfWidth
  );
}

export function findValidPlatformForColor(index, colorKey) {
  return getLandingPlatforms(index).find(
    (platform) => platformMatchesColor(platform, colorKey)
  );
}

export function platformMatchesColor(platform, colorKey) {
  return platform.type === 'wildcard' || platform.color === colorKey;
}

export function simulateReachableRoute(stepCount = 500) {
  let simulatedColor = 'red';
  let simulatedLaneIndex = 1;

  for (let landingIndex = 1; landingIndex <= stepCount; landingIndex += 1) {
    const platforms = getLandingPlatforms(landingIndex);
    const reachablePlatform = platforms.find((platform) => {
      const laneIndex = lanePositions.indexOf(platform.x);
      const colorMatches = platformMatchesColor(platform, simulatedColor);

      return colorMatches && Math.abs(laneIndex - simulatedLaneIndex) <= 1;
    });

    if (!reachablePlatform) {
      return {
        ok: false,
        reached: landingIndex - 1,
        failedAt: landingIndex,
        color: simulatedColor,
        laneIndex: simulatedLaneIndex,
        platforms,
      };
    }

    simulatedLaneIndex = lanePositions.indexOf(reachablePlatform.x);

    if (reachablePlatform.type === 'wildcard') {
      simulatedColor = reachablePlatform.nextColor;
    }
  }

  return { ok: true, reached: stepCount };
}

export function getRouteSample(stepCount = 16) {
  let simulatedColor = 'red';
  let simulatedLaneIndex = 1;
  const steps = [];

  for (let landingIndex = 1; landingIndex <= stepCount; landingIndex += 1) {
    const platforms = getLandingPlatforms(landingIndex);
    const reachablePlatform = platforms.find((platform) => {
      const laneIndex = lanePositions.indexOf(platform.x);
      const colorMatches = platformMatchesColor(platform, simulatedColor);

      return colorMatches && Math.abs(laneIndex - simulatedLaneIndex) <= 1;
    });

    if (!reachablePlatform) {
      break;
    }

    simulatedLaneIndex = lanePositions.indexOf(reachablePlatform.x);
    steps.push({
      landingIndex,
      laneIndex: simulatedLaneIndex,
      color: reachablePlatform.color,
      type: reachablePlatform.type,
      nextColor: reachablePlatform.nextColor,
      platformCount: platforms.length,
    });

    if (reachablePlatform.type === 'wildcard') {
      simulatedColor = reachablePlatform.nextColor;
    }
  }

  return {
    routeSeed,
    steps,
  };
}

export function getRouteSeed() {
  return routeSeed;
}
