import * as THREE from 'three';
import './styles.css';
import {
  achievementStorageKey,
  baseY,
  bestScoreStorageKey,
  endlessBestScoreStorageKey,
  endlessPerformanceStorageKey,
  endlessRunHistoryStorageKey,
  bounceHeight,
  gameColors,
  landingGap,
  lanePositions,
  levelCatalog,
  levelPerformanceStorageKey,
  levelStarsStorageKey,
  nearZ,
  platformHalfWidth,
  speedUpScoreInterval,
  soundEnabledStorageKey,
  lowPowerStorageKey,
  starPaletteHex,
  tutorialSeenStorageKey,
  unlockedLevelStorageKey,
  visibleLandingCount,
} from './game/config.js';
import {
  getAchievementProgressText,
  getAchievementStates,
  normalizeAchievementIds,
  resolveAchievements,
} from './game/achievements.js';
import {
  getCareerStatItems,
  getCareerSummary,
} from './game/careerSummary.js';
import {
  findPlatformAt,
  findValidPlatformForColor,
  getLandingPlatforms,
  getRouteCacheStats,
  getRouteSample,
  getRouteSeed,
  platformMatchesColor,
  pruneRouteBefore,
  resetRoute,
  setRouteProfile,
  simulateReachableRoute,
} from './game/route.js';
import {
  applyPlatformVisual,
  createLandingPads,
} from './scene/platforms.js';
import { createAudioFeedback } from './game/audioFeedback.js';
import {
  getEndlessPerformanceResultText,
  getEndlessPerformanceText,
  normalizeEndlessPerformance,
  updateEndlessPerformance,
} from './game/endlessPerformance.js';
import {
  appendEndlessRun,
  getEndlessRunMeta,
  getEndlessRunSummary,
  normalizeEndlessRunHistory,
} from './game/endlessRunHistory.js';
import { getComboMilestone, withComboFeedback } from './game/comboFeedback.js';
import {
  getCountdownDelay,
  getRunCountdownCopy,
  runCountdownSteps,
} from './game/countdownFeedback.js';
import {
  calculateLevelStars as calculateRewardStars,
  getLevelGoalPreview,
  getNextLevelGoalText,
} from './game/levelGoals.js';
import { getLiveStarProgress } from './game/liveStarProgress.js';
import { getLevelBriefing } from './game/levelBriefing.js';
import { getLevelRouteSeed } from './game/levelRouteSeed.js';
import {
  getLevelPerformance,
  getLevelPerformanceText,
  getPerformanceResultText,
  normalizeLevelPerformanceMap,
  updateLevelPerformance,
} from './game/levelPerformance.js';
import {
  getLevelCardStatus,
  getRecommendedLevel,
  getRecommendedLevelReason,
  getStarCollectionSummary,
  getStarProgressPercent,
  getStarProgressRank,
  getStarProgressText,
  getStarRecordText,
  isStarCollectionComplete,
} from './game/starProgress.js';
import {
  getBestScoreLabel,
  normalizeScore,
  shouldUpdateBestScore,
} from './game/scoreRecords.js';
import { getPauseCopy, shouldAutoPause } from './game/pauseFeedback.js';
import { getRenderQualitySettings } from './game/renderQuality.js';
import { getDeathProgressSummary } from './game/runSummary.js';
import {
  getRouteDifficulty,
  getRouteIntensityStates,
  getRouteIntensityText,
  normalizeRouteIntensity,
} from './game/routeIntensity.js';
import {
  canCollectShard,
  getMissionProgressValue,
  getMissionTypeLabel,
} from './game/shardProgress.js';
import {
  didSpeedIncrease,
  getScoreSpeedBonus,
  withSpeedUpFeedback,
} from './game/speedFeedback.js';

const app = document.querySelector('#app');
const levelSelectScreen = document.querySelector('.level-select-screen');
const gameHud = document.querySelector('.game-hud');
const levelGrid = document.querySelector('.level-grid');
const continueLevelButton = document.querySelector('.continue-level-button');
const continueLevelName = document.querySelector('.continue-level-name');
const continueLevelReason = document.querySelector('.continue-level-reason');
const levelStarProgress = document.querySelector('.level-star-progress');
const levelStarProgressFill = document.querySelector('.level-star-progress-fill');
const levelStarRank = document.querySelector('.level-star-rank');
const modeTabs = document.querySelectorAll('.mode-tab');
const modePanels = document.querySelectorAll('.level-mode-panel');
const endlessEntryCard = document.querySelector('.endless-entry-card');
const endlessBestValue = document.querySelector('.endless-best-value');
const endlessPerformanceValue = document.querySelector('.endless-performance-value');
const endlessHistoryEmpty = document.querySelector('.endless-history-empty');
const endlessHistoryList = document.querySelector('.endless-history-list');
const careerStatsGrid = document.querySelector('.career-stats-grid');
const careerSummaryDetail = document.querySelector('.career-summary-detail');
const achievementCount = document.querySelector('.achievement-count');
const achievementGrid = document.querySelector('.achievement-grid');
const achievementToast = document.querySelector('.achievement-toast');
const achievementToastTitle = document.querySelector('.achievement-toast-title');
const achievementToastDetail = document.querySelector('.achievement-toast-detail');
const levelBriefing = document.querySelector('.level-briefing');
const levelBriefingKicker = document.querySelector('.level-briefing-kicker');
const levelBriefingTitle = document.querySelector('.level-briefing-title');
const levelBriefingSummary = document.querySelector('.level-briefing-summary');
const levelBriefingRoute = document.querySelector('.level-briefing-route');
const levelBriefingRouteText = document.querySelector('.level-briefing-route-text');
const levelBriefingRouteBars = document.querySelector('.level-briefing-route-bars');
const levelBriefingMission = document.querySelector('.level-briefing-mission');
const levelBriefingTwoStar = document.querySelector('.level-briefing-two-star');
const levelBriefingThreeStar = document.querySelector('.level-briefing-three-star');
const levelBriefingStars = document.querySelector('.level-briefing-stars');
const levelBriefingPerformance = document.querySelector('.level-briefing-performance');
const levelBriefingCancel = document.querySelector('.level-briefing-cancel');
const levelBriefingStart = document.querySelector('.level-briefing-start');
const touchControlButtons = document.querySelectorAll('.touch-control-button');
const coachTip = document.querySelector('.coach-tip');
const coachDismissButton = document.querySelector('.coach-dismiss-button');
const startButton = document.querySelector('.start-button');
const speedSelect = document.querySelector('.speed-select');
const speedControl = document.querySelector('.speed-control');
const soundToggle = document.querySelector('.sound-toggle-input');
const lowPowerToggle = document.querySelector('.power-toggle-input');
levelSelectScreen.append(speedControl);
const speedValue = document.querySelector('.speed-value');
const scoreValue = document.querySelector('.score-value');
const bestScoreLabel = document.querySelector('.best-score-label');
const bestScoreValue = document.querySelector('.best-score-value');
const levelValue = document.querySelector('.level-value');
const remainingValue = document.querySelector('.remaining-value');
const comboBoard = document.querySelector('.combo-board');
const comboValue = document.querySelector('.combo-value');
const comboMilestone = document.querySelector('.combo-milestone');
const comboMilestoneKicker = document.querySelector('.combo-milestone-kicker');
const comboMilestoneTitle = document.querySelector('.combo-milestone-title');
const comboMilestoneDetail = document.querySelector('.combo-milestone-detail');
const comboMilestoneFlash = document.querySelector('.combo-milestone-flash');
const runCountdown = document.querySelector('.run-countdown');
const runCountdownKicker = document.querySelector('.run-countdown-kicker');
const runCountdownValue = document.querySelector('.run-countdown-value');
const runCountdownDetail = document.querySelector('.run-countdown-detail');
const perfectValue = document.querySelector('.perfect-value');
const shardValue = document.querySelector('.shard-value');
const missionBoard = document.querySelector('.mission-board');
const missionValue = document.querySelector('.mission-value');
const liveStarBoard = document.querySelector('.live-star-board');
const liveStarValue = document.querySelector('.live-star-value');
const liveStarDetail = document.querySelector('.live-star-detail');
const currentColorValue = document.querySelector('.current-color-value');
const progressLabel = document.querySelector('.progress-label');
const progressText = document.querySelector('.progress-text');
const progressFill = document.querySelector('.progress-fill');
const pauseButton = document.querySelector('.pause-button');
const pausePanel = document.querySelector('.pause-panel');
const pauseKicker = document.querySelector('.pause-kicker');
const pauseTitle = document.querySelector('.pause-title');
const pauseDetail = document.querySelector('.pause-detail');
const resumeButton = document.querySelector('.resume-button');
const pauseRetryButton = document.querySelector('.pause-retry-button');
const pauseLevelsButton = document.querySelector('.pause-levels-button');
const levelCompletePanel = document.querySelector('.level-complete-panel');
const levelCompleteTitle = document.querySelector('.level-complete-title');
const levelCompleteDetail = document.querySelector('.level-complete-detail');
const levelCompleteStars = document.querySelector('.level-complete-stars');
const levelCompleteRecord = document.querySelector('.level-complete-record');
const levelCompleteCollection = document.querySelector('.level-complete-collection');
const levelCompleteMission = document.querySelector('.level-complete-mission');
const levelCompletePerformance = document.querySelector('.level-complete-performance');
const levelCompleteNextGoal = document.querySelector('.level-complete-next-goal');
const levelCompleteScore = document.querySelector('.level-complete-score');
const nextLevelButton = document.querySelector('.next-level-button');
const backToLevelsButton = document.querySelector('.back-to-levels-button');
const deathLevelsButton = document.querySelector('.death-levels-button');
const deathRetryButton = document.querySelector('.death-retry-button');
const deathScore = document.querySelector('.death-score');
const deathReason = document.querySelector('.death-reason');
const deathPanel = document.querySelector('.death-panel');
const deathBest = document.querySelector('.death-best');
const deathRecordDetail = document.querySelector('.death-record-detail');
const deathProgressSummary = document.querySelector('.death-progress-summary');
const deathProgressLabel = document.querySelector('.death-progress-label');
const deathProgressText = document.querySelector('.death-progress-text');
const deathProgressFill = document.querySelector('.death-progress-fill');
const deathCombo = document.querySelector('.death-combo');
const deathPerfect = document.querySelector('.death-perfect');
const deathMission = document.querySelector('.death-mission');
const gameMessage = document.querySelector('.game-message');
let isGameRunning = false;
let isPaused = false;
let isGameOver = false;
let isLevelComplete = false;
let currentMode = 'level';
let selectedSpeedLevel = Number(speedSelect.value);
let currentSpeedLevel = selectedSpeedLevel;
let speedPulseTimeoutId = null;
let comboMilestoneTimeoutId = null;
let achievementToastTimeoutId = null;
let hasSeenTutorial = readTutorialSeen();
let soundEnabled = readSoundEnabled();
let lowPowerEnabled = readLowPowerEnabled();
const audioFeedback = createAudioFeedback();
let isCoachBlocking = false;
let isCountdownActive = false;
let runCountdownTimeoutId = null;
let runCountdownSequenceId = 0;
let pointerStartX = null;
let pointerStartY = null;
let briefingLevel = 1;
let briefingReturnFocus = null;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x07111f);
scene.fog = new THREE.Fog(0x07111f, 18, 58);

const starPalette = starPaletteHex.map((hex) => new THREE.Color(hex));

const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
camera.position.set(0, 7.8, 12.4);
camera.lookAt(0, 1.8, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
const initialRenderQuality = getRenderQualitySettings({
  devicePixelRatio: window.devicePixelRatio,
  lowPower: lowPowerEnabled,
});
renderer.setPixelRatio(initialRenderQuality.pixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = initialRenderQuality.shadows;
renderer.shadowMap.type = THREE.PCFShadowMap;
app.appendChild(renderer.domElement);

const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x86a9c9, 2.3);
scene.add(hemisphereLight);

const keyLight = new THREE.DirectionalLight(0xffffff, 3.4);
keyLight.position.set(4, 8, 5);
keyLight.castShadow = true;
keyLight.shadow.mapSize.set(2048, 2048);
keyLight.shadow.camera.near = 0.5;
keyLight.shadow.camera.far = 20;
keyLight.shadow.camera.left = -7;
keyLight.shadow.camera.right = 7;
keyLight.shadow.camera.top = 7;
keyLight.shadow.camera.bottom = -7;
scene.add(keyLight);
scene.add(keyLight.target);

const floorGeometry = new THREE.PlaneGeometry(28, 90);
const floorMaterial = new THREE.MeshStandardMaterial({
  color: 0x89d8ff,
  roughness: 0.7,
  metalness: 0.02,
  transparent: true,
  opacity: 0.035,
  depthWrite: false,
});
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

const ballGeometry = new THREE.SphereGeometry(0.48, 64, 64);
const ballMaterial = new THREE.MeshStandardMaterial({
  color: 0x18255d,
  emissive: 0x1b74ff,
  emissiveIntensity: 0.45,
  roughness: 0.28,
  metalness: 0.18,
});
const ball = new THREE.Mesh(ballGeometry, ballMaterial);
ball.castShadow = true;
scene.add(ball);

const ballStarCount = 90;
const ballStarPositions = [];
const ballStarColors = [];

for (let i = 0; i < ballStarCount; i += 1) {
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos(2 * Math.random() - 1);
  const radius = 0.492;
  const color = starPalette[Math.floor(Math.random() * starPalette.length)];

  ballStarPositions.push(
    Math.sin(phi) * Math.cos(theta) * radius,
    Math.cos(phi) * radius,
    Math.sin(phi) * Math.sin(theta) * radius
  );
  ballStarColors.push(color.r, color.g, color.b);
}

const ballStarGeometry = new THREE.BufferGeometry();
ballStarGeometry.setAttribute(
  'position',
  new THREE.Float32BufferAttribute(ballStarPositions, 3)
);
ballStarGeometry.setAttribute(
  'color',
  new THREE.Float32BufferAttribute(ballStarColors, 3)
);

const ballStars = new THREE.Points(
  ballStarGeometry,
  new THREE.PointsMaterial({
    size: 0.035,
    transparent: true,
    opacity: 0.95,
    vertexColors: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })
);
ball.add(ballStars);

const shadowBlob = new THREE.Mesh(
  new THREE.CircleGeometry(1, 64),
  new THREE.MeshBasicMaterial({
    color: 0x4aa8ff,
    transparent: true,
    opacity: 0.12,
    depthWrite: false,
  })
);
shadowBlob.rotation.x = -Math.PI / 2;
shadowBlob.position.y = 0.012;
scene.add(shadowBlob);

const grid = new THREE.GridHelper(28, 28, 0x5bd7ff, 0x244567);
grid.position.y = 0.015;
grid.material.transparent = true;
grid.material.opacity = 0.22;
scene.add(grid);

const starCount = 520;
const starPositions = [];
const starColors = [];

for (let i = 0; i < starCount; i += 1) {
  const x = (Math.random() - 0.5) * 26;
  const z = (Math.random() - 0.5) * 88;
  const color = starPalette[Math.floor(Math.random() * starPalette.length)];

  starPositions.push(x, 0.035 + Math.random() * 0.025, z);
  starColors.push(color.r, color.g, color.b);
}

const starGeometry = new THREE.BufferGeometry();
starGeometry.setAttribute(
  'position',
  new THREE.Float32BufferAttribute(starPositions, 3)
);
starGeometry.setAttribute(
  'color',
  new THREE.Float32BufferAttribute(starColors, 3)
);

const starGround = new THREE.Points(
  starGeometry,
  new THREE.PointsMaterial({
    size: 0.07,
    transparent: true,
    opacity: 0.85,
    vertexColors: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })
);
scene.add(starGround);

const impactLight = new THREE.PointLight(0x75d7ff, 0, 6);
impactLight.position.set(0, 0.2, 0);
scene.add(impactLight);

const targetMarker = new THREE.Mesh(
  new THREE.RingGeometry(0.72, 0.86, 96),
  new THREE.MeshBasicMaterial({
    color: 0x91f7ff,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
  })
);
targetMarker.rotation.x = -Math.PI / 2;
targetMarker.visible = false;
scene.add(targetMarker);

const impactEffects = [];
const impactMaterial = new THREE.MeshBasicMaterial({
  color: 0x66ddff,
  transparent: true,
  opacity: 0,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
  side: THREE.DoubleSide,
});

const landingPads = createLandingPads(scene);

function clearImpactEffects() {
  impactEffects.splice(0).forEach((effect) => {
    scene.remove(effect.ring);
    scene.remove(effect.sparks);
    effect.ring.geometry.dispose();
    effect.ring.material.dispose();
    effect.sparks.geometry.dispose();
    effect.sparks.material.dispose();
  });
  impactLight.intensity = 0;
}
function createImpact(x, z, colorKey = currentBallColor) {
  if (lowPowerEnabled) {
    return;
  }

  const impactColor = gameColors[colorKey] ?? gameColors.blue;
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(0.92, 1.05, 96),
    impactMaterial.clone()
  );
  ring.material.color.setHex(impactColor.emissive);
  ring.rotation.x = -Math.PI / 2;
  ring.position.set(x, 0.04, z);
  scene.add(ring);

  const sparkGeometry = new THREE.BufferGeometry();
  const sparkPoints = [];
  const sparkCount = 18;

  for (let i = 0; i < sparkCount; i += 1) {
    const angle = (i / sparkCount) * Math.PI * 2;
    const inner = 0.72;
    const outer = 1.35 + Math.random() * 0.45;

    sparkPoints.push(
      x + Math.cos(angle) * inner,
      0.07,
      z + Math.sin(angle) * inner,
      x + Math.cos(angle + (Math.random() - 0.5) * 0.25) * outer,
      0.07 + Math.random() * 0.12,
      z + Math.sin(angle + (Math.random() - 0.5) * 0.25) * outer
    );
  }

  sparkGeometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(sparkPoints, 3)
  );

  const sparks = new THREE.LineSegments(
    sparkGeometry,
    new THREE.LineBasicMaterial({
      color: impactColor.edge,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
  );
  scene.add(sparks);

  impactLight.position.z = z;
  impactLight.position.x = x;
  impactLight.color.setHex(impactColor.emissive);
  impactLight.intensity = 6;
  impactEffects.push({ ring, sparks, age: 0, duration: 0.42 });
}

const timer = new THREE.Timer();
timer.connect(document);
let hopRate = speedLevelToHopRate(selectedSpeedLevel);
let hopProgress = 0;
let previousHop = 0;
let lastProcessedLanding = 0;
let ballX = 0;
let targetBallX = 0;
let score = 0;
let currentBallColor = 'red';
let bestScore = readBestScore();
let endlessBestScore = readEndlessBestScore();
let endlessPerformance = readEndlessPerformance();
let endlessRunHistory = readEndlessRunHistory();
let currentLevel = 1;
let levelStartLanding = 0;
let levelEndLanding = levelCatalog[0].length;
let combo = 0;
let maxCombo = 0;
let perfectCount = 0;
let rainbowCount = 0;
let shardCount = 0;
const collectedShardLandings = new Set();
let completedLanding = 0;
let unlockedLevel = readUnlockedLevel();
let levelStars = readLevelStars();
let levelPerformance = readLevelPerformance();
let unlockedAchievementIds = readAchievements();

function getAchievementContext() {
  return {
    endlessPerformance,
    levelCatalog,
    levelPerformance,
    levelStars,
    runBestCombo: maxCombo,
    runScore: score,
  };
}

function readAchievements() {
  try {
    return normalizeAchievementIds(
      JSON.parse(localStorage.getItem(achievementStorageKey) ?? '[]')
    );
  } catch {
    return [];
  }
}

function writeAchievements() {
  try {
    localStorage.setItem(
      achievementStorageKey,
      JSON.stringify(unlockedAchievementIds)
    );
  } catch {
    // Local storage may be unavailable in restricted browser contexts.
  }
}

function showAchievementToast(achievement, extraCount = 0) {
  window.clearTimeout(achievementToastTimeoutId);
  achievementToastTitle.textContent = achievement.name;
  achievementToastDetail.textContent = extraCount > 0
    ? achievement.description + ' · 另解锁 ' + extraCount + ' 项'
    : achievement.description;
  achievementToast.classList.remove('is-visible');
  void achievementToast.offsetWidth;
  achievementToast.classList.add('is-visible');
  playGameFeedback('achievement');

  achievementToastTimeoutId = window.setTimeout(() => {
    achievementToast.classList.remove('is-visible');
    achievementToastTimeoutId = null;
  }, 2600);
}

function renderAchievements(states = getAchievementStates(
  getAchievementContext(),
  unlockedAchievementIds
)) {
  const unlockedCount = states.filter((achievement) => achievement.isUnlocked).length;
  achievementCount.textContent = unlockedCount + '/' + states.length;
  achievementGrid.replaceChildren();

  states.forEach((achievement) => {
    const item = document.createElement('div');
    item.className = 'achievement-item';
    item.classList.toggle('is-unlocked', achievement.isUnlocked);
    item.innerHTML =
      '<span class="achievement-icon" aria-hidden="true">' + achievement.icon + '</span>' +
      '<span class="achievement-copy">' +
        '<strong>' + achievement.name + '</strong>' +
        '<small>' + achievement.description + '</small>' +
      '</span>' +
      '<span class="achievement-state">' +
        getAchievementProgressText(achievement) +
      '</span>';
    achievementGrid.appendChild(item);
  });
}

function syncAchievements({ announce = false } = {}) {
  const result = resolveAchievements(
    unlockedAchievementIds,
    getAchievementContext()
  );
  const didChange = result.unlockedIds.length !== unlockedAchievementIds.length;
  unlockedAchievementIds = result.unlockedIds;

  if (didChange) {
    writeAchievements();
  }

  renderAchievements(result.states);

  if (announce && result.newUnlocks.length > 0) {
    showAchievementToast(result.newUnlocks[0], result.newUnlocks.length - 1);
  }

  return result;
}

function speedLevelToHopRate(level) {
  return 0.62 + (level - 1) * 0.11;
}

function updateSpeedDisplay(level) {
  speedValue.textContent = String(level);
}

function clearSpeedHudPulse() {
  if (speedPulseTimeoutId !== null) {
    window.clearTimeout(speedPulseTimeoutId);
    speedPulseTimeoutId = null;
  }

  speedControl.classList.remove('is-speed-hot');
  speedValue.classList.remove('is-speed-pop');
}

function pulseSpeedHud(didSpeedGoUp) {
  if (!didSpeedGoUp) {
    return;
  }

  clearSpeedHudPulse();
  speedControl.classList.add('is-speed-hot');
  void speedValue.offsetWidth;
  speedValue.classList.add('is-speed-pop');

  speedPulseTimeoutId = window.setTimeout(() => {
    speedControl.classList.remove('is-speed-hot');
    speedPulseTimeoutId = null;
  }, 420);
}

function setCurrentSpeedLevel(level, { pulse = true } = {}) {
  const nextSpeedLevel = Math.max(1, Math.floor(level));
  const didSpeedGoUp = didSpeedIncrease(currentSpeedLevel, nextSpeedLevel);
  currentSpeedLevel = nextSpeedLevel;
  hopRate = speedLevelToHopRate(currentSpeedLevel);
  updateSpeedDisplay(currentSpeedLevel);

  if (pulse) {
    pulseSpeedHud(didSpeedGoUp);
  } else {
    clearSpeedHudPulse();
  }

  return didSpeedGoUp;
}

function setSpeedLevel(level) {
  selectedSpeedLevel = THREE.MathUtils.clamp(level, 1, 10);
  speedSelect.value = String(selectedSpeedLevel);
  setCurrentSpeedLevel(isGameRunning ? getLevelBaseSpeed(currentLevel) : selectedSpeedLevel);
}

function setScore(value) {
  score = value;
  scoreValue.textContent = String(score);
  updateRunProgress();

  if (currentMode === 'endless' && score === 25) {
    syncAchievements({ announce: true });
  }
}

function getLevelBaseSpeed(level) {
  if (currentMode === 'endless') {
    return selectedSpeedLevel;
  }

  const levelSpeedBonus = Math.floor((level - 1) * 0.75);

  return selectedSpeedLevel + levelSpeedBonus;
}

function updateSpeedForScore(value) {
  const speedBonus = getScoreSpeedBonus(currentMode, value, speedUpScoreInterval);
  return setCurrentSpeedLevel(getLevelBaseSpeed(currentLevel) + speedBonus);
}

function getLevelLength(level) {
  return levelCatalog[level - 1]?.length ?? levelCatalog[levelCatalog.length - 1].length;
}


function getLevelRouteIntensity(level) {
  return normalizeRouteIntensity(levelCatalog[level - 1]?.intensity);
}

function getLevelRouteDifficulty(level) {
  return getRouteDifficulty(getLevelRouteIntensity(level));
}
function getLevelName(level) {
  return levelCatalog[level - 1]?.name ?? `未命名关卡 ${level}`;
}

function pulseComboHud(value) {
  comboBoard.classList.toggle('is-combo-hot', value >= 5);
  comboValue.classList.remove('is-combo-pop');
  void comboValue.offsetWidth;

  if (value > 0) {
    comboValue.classList.add('is-combo-pop');
  }
}

function hideComboMilestone() {
  window.clearTimeout(comboMilestoneTimeoutId);
  comboMilestoneTimeoutId = null;
  comboMilestone.classList.remove('is-visible', 'is-major', 'is-perfect');
  comboMilestoneFlash.classList.remove('is-visible', 'is-major', 'is-perfect');
}

function showComboMilestone(value, { perfect = false } = {}) {
  const milestone = getComboMilestone(value);

  if (!milestone) {
    return false;
  }

  window.clearTimeout(comboMilestoneTimeoutId);
  comboMilestoneKicker.textContent = milestone.kicker;
  comboMilestoneTitle.textContent = milestone.title;
  comboMilestoneDetail.textContent = milestone.detail;

  comboMilestone.classList.remove('is-visible');
  comboMilestoneFlash.classList.remove('is-visible');
  void comboMilestone.offsetWidth;
  void comboMilestoneFlash.offsetWidth;

  const isMajor = milestone.level === 'major';
  comboMilestone.classList.toggle('is-major', isMajor);
  comboMilestone.classList.toggle('is-perfect', perfect);
  comboMilestoneFlash.classList.toggle('is-major', isMajor);
  comboMilestoneFlash.classList.toggle('is-perfect', perfect);
  comboMilestone.classList.add('is-visible');
  comboMilestoneFlash.classList.add('is-visible');

  comboMilestoneTimeoutId = window.setTimeout(() => {
    hideComboMilestone();
  }, 980);

  return true;
}

function setCombo(value) {
  combo = value;
  maxCombo = Math.max(maxCombo, combo);
  comboValue.textContent = String(combo);
  pulseComboHud(combo);

  if (combo === 0) {
    hideComboMilestone();
  }

  if (combo === 10) {
    syncAchievements({ announce: true });
  }
}

function setPerfectCount(value) {
  perfectCount = value;
  perfectValue.textContent = String(perfectCount);
  updateMissionHud();
}

function setRainbowCount(value) {
  rainbowCount = value;
  updateMissionHud();
}


function setShardCount(value) {
  shardCount = Math.max(0, Math.floor(Number(value) || 0));
  shardValue.textContent = String(shardCount);
  shardValue.classList.remove('is-shard-pop');
  void shardValue.offsetWidth;
  shardValue.classList.add('is-shard-pop');
  updateMissionHud();
}
function getLevelMission(level) {
  return levelCatalog[level - 1]?.mission ?? { type: 'perfect', target: 1 };
}

function getMissionName(mission = getLevelMission(currentLevel)) {
  return getMissionTypeLabel(mission.type);
}

function getMissionProgress(mission = getLevelMission(currentLevel)) {
  return getMissionProgressValue(mission, {
    perfect: perfectCount,
    rainbow: rainbowCount,
    shard: shardCount,
  });
}

function getMissionTarget(mission = getLevelMission(currentLevel)) {
  return Math.max(1, Math.floor(Number(mission.target) || 1));
}

function isMissionComplete(mission = getLevelMission(currentLevel)) {
  return getMissionProgress(mission) >= getMissionTarget(mission);
}

function getMissionSummary(level = currentLevel) {
  const mission = getLevelMission(level);
  return `${getMissionName(mission)} ${getMissionTarget(mission)}`;
}

function getMissionProgressText(mission = getLevelMission(currentLevel)) {
  const progress = Math.min(getMissionProgress(mission), getMissionTarget(mission));
  return `${getMissionName(mission)} ${progress}/${getMissionTarget(mission)}`;
}


function showMissionCompleteFeedback() {
  missionBoard.classList.remove('is-mission-complete-pop');
  void missionBoard.offsetWidth;
  missionBoard.classList.add('is-mission-complete-pop');
}
function updateLiveStarHud(currentLandingIndex = Math.floor(hopProgress)) {
  if (currentMode === 'endless') {
    liveStarBoard.classList.add('is-endless');
    liveStarBoard.classList.remove('is-full-star');
    liveStarValue.textContent = '---';
    liveStarDetail.textContent = '无尽模式不计星';
    liveStarBoard.setAttribute('aria-label', '无尽模式不计算关卡星级');
    return;
  }

  const completedJumps = THREE.MathUtils.clamp(
    currentLandingIndex - levelStartLanding,
    0,
    getLevelLength(currentLevel)
  );
  const progress = getLiveStarProgress({
    completedJumps,
    levelLength: getLevelLength(currentLevel),
    missionComplete: isMissionComplete(),
    perfectCount,
  });
  liveStarBoard.classList.remove('is-endless');
  liveStarBoard.classList.toggle('is-full-star', progress.stars === 3);
  liveStarValue.textContent = progress.starText;
  liveStarDetail.textContent = progress.detail;
  liveStarBoard.setAttribute(
    'aria-label',
    '本局星级进度 ' + progress.stars + ' 星，' + progress.detail
  );
}
function updateMissionHud() {
  missionValue.textContent = currentMode === 'endless' ? '--' : getMissionProgressText();
  missionValue.classList.toggle('is-complete', currentMode !== 'endless' && isMissionComplete());
  updateLiveStarHud();
}
function updateRunProgress(currentLandingIndex = Math.floor(hopProgress)) {
  if (!progressFill) {
    return;
  }

  if (currentMode === 'endless') {
    const speedStepProgress = score % speedUpScoreInterval;
    const pointsToNextSpeed = speedUpScoreInterval - speedStepProgress;
    const progressPercent = (speedStepProgress / speedUpScoreInterval) * 100;

    progressLabel.textContent = '下次提速';
    progressText.textContent = `还差 ${pointsToNextSpeed} 分`;
    progressFill.style.width = `${progressPercent}%`;
    return;
  }

  const totalJumps = getLevelLength(currentLevel);
  const completedJumps = THREE.MathUtils.clamp(
    currentLandingIndex - levelStartLanding,
    0,
    totalJumps
  );
  const progressPercent = totalJumps > 0 ? (completedJumps / totalJumps) * 100 : 0;

  progressLabel.textContent = '终点进度';
  progressText.textContent = `${completedJumps}/${totalJumps} 跳`;
  progressFill.style.width = `${progressPercent}%`;
}

function updateLevelHud(currentLandingIndex = Math.floor(hopProgress)) {
  if (currentMode === 'endless') {
    levelValue.textContent = '无尽';
    remainingValue.textContent = '∞';
    updateRunProgress(currentLandingIndex);
    updateLiveStarHud(currentLandingIndex);
    return;
  }

  const remainingJumps = Math.max(0, levelEndLanding - currentLandingIndex);

  levelValue.textContent = String(currentLevel);
  remainingValue.textContent = String(remainingJumps);
  updateRunProgress(currentLandingIndex);
  updateLiveStarHud(currentLandingIndex);
}

function startLevel(level, startLandingIndex) {
  currentLevel = level;
  levelStartLanding = startLandingIndex;
  levelEndLanding = levelStartLanding + getLevelLength(currentLevel);
  maxCombo = 0;
  missionBoard.classList.remove('is-mission-complete-pop');
  setPerfectCount(0);
  setRainbowCount(0);
  setShardCount(0);
  updateMissionHud();
  updateLevelHud(startLandingIndex);
}


function readTutorialSeen() {
  try {
    return localStorage.getItem(tutorialSeenStorageKey) === 'true';
  } catch {
    return false;
  }
}

function setTutorialSeen() {
  hasSeenTutorial = true;

  try {
    localStorage.setItem(tutorialSeenStorageKey, 'true');
  } catch {
    // Local storage may be unavailable in restricted browser contexts.
  }
}


function clearRunCountdown() {
  runCountdownSequenceId += 1;

  if (runCountdownTimeoutId !== null) {
    window.clearTimeout(runCountdownTimeoutId);
    runCountdownTimeoutId = null;
  }

  isCountdownActive = false;
  document.body.classList.remove('is-counting-down');
  runCountdown.classList.remove('is-go', 'is-step-pulse');
}

function startRunCountdown() {
  clearRunCountdown();

  if (
    !isGameRunning ||
    isGameOver ||
    isLevelComplete ||
    isCoachBlocking
  ) {
    return false;
  }

  const sequenceId = runCountdownSequenceId;
  const copy = getRunCountdownCopy({
    levelName: getLevelName(currentLevel),
    missionText: currentMode === 'level' ? getMissionSummary() : '',
    mode: currentMode,
    routeText: currentMode === 'level'
      ? getRouteIntensityText(getLevelRouteIntensity(currentLevel))
      : '',
  });
  let stepIndex = 0;

  isCountdownActive = true;
  document.body.classList.add('is-counting-down');
  runCountdownKicker.textContent = copy.kicker;
  runCountdownDetail.textContent = copy.detail;

  const advance = () => {
    if (
      sequenceId !== runCountdownSequenceId ||
      !isCountdownActive ||
      !isGameRunning
    ) {
      return;
    }

    if (isPaused) {
      runCountdownTimeoutId = window.setTimeout(advance, 120);
      return;
    }

    const step = runCountdownSteps[stepIndex];
    const isGoStep = step === 'GO!';

    runCountdownValue.textContent = step;
    runCountdown.classList.toggle('is-go', isGoStep);
    runCountdown.classList.remove('is-step-pulse');
    void runCountdown.offsetWidth;
    runCountdown.classList.add('is-step-pulse');
    playGameFeedback(isGoStep ? 'countdownGo' : 'countdown');

    runCountdownTimeoutId = window.setTimeout(() => {
      if (isGoStep) {
        clearRunCountdown();
        return;
      }

      stepIndex += 1;
      advance();
    }, getCountdownDelay(step));
  };

  advance();
  return true;
}
function showCoachTipIfNeeded() {
  isCoachBlocking = !hasSeenTutorial;
  coachTip.classList.toggle('is-visible', isCoachBlocking);
  document.body.classList.toggle('is-coach-blocking', isCoachBlocking);
}

function hideCoachTip({ persist = false } = {}) {
  isCoachBlocking = false;
  coachTip.classList.remove('is-visible');
  document.body.classList.remove('is-coach-blocking');

  if (persist) {
    setTutorialSeen();
  }
}
function applyPauseCopy(reason = 'manual') {
  const copy = getPauseCopy(reason);
  pauseKicker.textContent = copy.kicker;
  pauseTitle.textContent = copy.title;
  pauseDetail.textContent = copy.detail;
}

function clearPauseState() {
  isPaused = false;
  document.body.classList.remove('is-paused');
  pausePanel.classList.remove('is-auto-paused');
  pauseButton.textContent = '暂停';
  pauseButton.setAttribute('aria-pressed', 'false');
  applyPauseCopy();
}

function setPaused(paused, reason = 'manual') {
  if (!isGameRunning || isGameOver || isLevelComplete) {
    return;
  }

  isPaused = paused;
  document.body.classList.toggle('is-paused', isPaused);
  pausePanel.classList.toggle(
    'is-auto-paused',
    isPaused && reason === 'background'
  );
  pauseButton.textContent = isPaused ? '已暂停' : '暂停';
  pauseButton.setAttribute('aria-pressed', String(isPaused));
  applyPauseCopy(isPaused ? reason : 'manual');

  if (isPaused) {
    hideComboMilestone();
  }
}

function togglePause() {
  setPaused(!isPaused, 'manual');
}

function normalizeStars(stars) {
  const numericStars = Number(stars);

  if (!Number.isFinite(numericStars)) {
    return 0;
  }

  return THREE.MathUtils.clamp(Math.floor(numericStars), 0, 3);
}

function getStarText(stars) {
  const normalizedStars = normalizeStars(stars);
  return '\u2605'.repeat(normalizedStars) + '\u2606'.repeat(3 - normalizedStars);
}

function getLevelStars(level) {
  return levelStars[level] ?? 0;
}


function readLevelPerformance() {
  try {
    const parsedRecords = JSON.parse(
      localStorage.getItem(levelPerformanceStorageKey) ?? '{}'
    );

    return normalizeLevelPerformanceMap(parsedRecords);
  } catch {
    return {};
  }
}

function writeLevelPerformance() {
  try {
    localStorage.setItem(
      levelPerformanceStorageKey,
      JSON.stringify(levelPerformance)
    );
  } catch {
    // Local storage may be unavailable in restricted browser contexts.
  }
}
function readLevelStars() {
  try {
    const parsedStars = JSON.parse(localStorage.getItem(levelStarsStorageKey) ?? '{}');

    if (!parsedStars || typeof parsedStars !== 'object' || Array.isArray(parsedStars)) {
      return {};
    }

    return Object.fromEntries(
      Object.entries(parsedStars).map(([level, stars]) => [
        String(level),
        normalizeStars(stars),
      ])
    );
  } catch {
    return {};
  }
}

function setLevelStars(level, stars) {
  const normalizedStars = normalizeStars(stars);

  if (normalizedStars <= getLevelStars(level)) {
    return false;
  }

  levelStars = {
    ...levelStars,
    [level]: normalizedStars,
  };

  try {
    localStorage.setItem(levelStarsStorageKey, JSON.stringify(levelStars));
  } catch {
    // Local storage may be unavailable in restricted browser contexts.
  }

  renderLevelSelect();
  return true;
}

function calculateLevelStars(level) {
  return calculateRewardStars({
    levelLength: getLevelLength(level),
    missionComplete: isMissionComplete(),
    perfectCount,
  });
}

function readUnlockedLevel() {
  try {
    const storedLevel = Number(localStorage.getItem(unlockedLevelStorageKey));
    return Number.isFinite(storedLevel)
      ? THREE.MathUtils.clamp(Math.floor(storedLevel), 1, levelCatalog.length)
      : 1;
  } catch {
    return 1;
  }
}

function setUnlockedLevel(level) {
  unlockedLevel = THREE.MathUtils.clamp(level, 1, levelCatalog.length);

  try {
    localStorage.setItem(unlockedLevelStorageKey, String(unlockedLevel));
  } catch {
    // Local storage may be unavailable in restricted browser contexts.
  }

  renderLevelSelect();
}

function renderCareerSummary() {
  const summary = getCareerSummary({
    endlessPerformance,
    levelCount: levelCatalog.length,
    levelPerformance,
    levelStars,
  });
  careerSummaryDetail.textContent =
    '完成度 ' + summary.completionPercent +
    '% · 无尽挑战 ' + summary.endlessRuns + ' 局';
  careerStatsGrid.replaceChildren();

  getCareerStatItems(summary).forEach((stat) => {
    const item = document.createElement('div');
    item.className = 'career-stat';
    item.innerHTML =
      '<span>' + stat.label + '</span>' +
      '<strong>' + stat.value + '</strong>';
    careerStatsGrid.appendChild(item);
  });
}
function renderLevelSelect() {
  renderCareerSummary();
  renderAchievements();
  const isStarComplete = isStarCollectionComplete(levelStars, levelCatalog.length);
  levelStarProgress.textContent = getStarProgressText(levelStars, levelCatalog.length);
  levelStarRank.textContent = getStarProgressRank(levelStars, levelCatalog.length);
  levelStarRank.classList.toggle('is-complete', isStarComplete);
  levelStarProgress.classList.toggle('is-complete', isStarComplete);
  levelStarProgressFill.classList.toggle('is-complete', isStarComplete);
  levelStarProgressFill.style.width = `${getStarProgressPercent(levelStars, levelCatalog.length)}%`;
  const recommendedLevel = getRecommendedLevel(
    levelStars,
    unlockedLevel,
    levelCatalog.length
  );
  const recommendedStars = getLevelStars(recommendedLevel);
  continueLevelButton.dataset.level = String(recommendedLevel);
  continueLevelName.textContent =
    '第 ' + recommendedLevel + ' 关 · ' + getLevelName(recommendedLevel);
  continueLevelReason.textContent =
    getRecommendedLevelReason(recommendedStars) + ' →';
  levelGrid.replaceChildren();

  levelCatalog.forEach((level, index) => {
    const levelNumber = index + 1;
    const isUnlocked = levelNumber <= unlockedLevel;
    const earnedStars = getLevelStars(levelNumber);
    const routeIntensity = normalizeRouteIntensity(level.intensity);
    const performanceRecord = getLevelPerformance(levelPerformance, levelNumber);
    const routeIntensityBars = getRouteIntensityStates(routeIntensity)
      .map((isActive) => `<i class="${isActive ? 'is-active' : ''}"></i>`)
      .join('');
    const cardStatus = getLevelCardStatus(earnedStars, isUnlocked);
    const button = document.createElement('button');
    button.className = `level-card is-${cardStatus.key}`;
    button.classList.toggle('is-recommended', levelNumber === recommendedLevel);
    button.type = 'button';
    button.disabled = !isUnlocked;
    button.innerHTML = `
      <span class="level-card-heading">
        <span class="level-card-index">\u7b2c ${levelNumber} \u5173</span>
        <span class="level-card-status">${cardStatus.label}</span>
      </span>
      <strong class="level-card-name">${level.name}</strong>
      <span class="level-card-stars" aria-label="\u6700\u9ad8\u661f\u7ea7 ${earnedStars} \u661f">${getStarText(earnedStars)}</span>
      <span class="level-card-performance">${getLevelPerformanceText(performanceRecord)}</span>
      <span class="level-card-mission">任务：${getMissionSummary(levelNumber)}</span>
      <span class="level-card-intensity" data-intensity="${routeIntensity}" aria-label="${getRouteIntensityText(routeIntensity)}">
        <span>\u8def\u7ebf</span>
        <span class="level-card-intensity-bars" aria-hidden="true">${routeIntensityBars}</span>
      </span>
      <span class="level-card-goals">${getLevelGoalPreview(level)}</span>
      <span class="level-card-meta ${isUnlocked ? '' : 'level-card-lock'}">
        ${isUnlocked ? `${level.length} 跳到终点` : '先通关前一关'}
      </span>
    `;

    button.addEventListener('click', () => {
      openLevelBriefing(levelNumber, button);
    });

    levelGrid.appendChild(button);
  });
}

function openLevelBriefing(level, trigger = null) {
  const safeLevel = THREE.MathUtils.clamp(
    Math.floor(Number(level) || 1),
    1,
    unlockedLevel
  );
  const briefing = getLevelBriefing({
    baseSpeed: selectedSpeedLevel + Math.floor((safeLevel - 1) * 0.75),
    level: levelCatalog[safeLevel - 1],
    levelNumber: safeLevel,
    performance: getLevelPerformance(levelPerformance, safeLevel),
    stars: getLevelStars(safeLevel),
  });

  briefingLevel = safeLevel;
  briefingReturnFocus = trigger instanceof HTMLElement
    ? trigger
    : document.activeElement;
  levelBriefingKicker.textContent = briefing.kicker;
  levelBriefingTitle.textContent = briefing.title;
  levelBriefingSummary.textContent = briefing.summary;
  levelBriefingRoute.dataset.intensity = String(briefing.intensity);
  levelBriefingRouteText.textContent = briefing.routeText;
  levelBriefingRouteBars.innerHTML = getRouteIntensityStates(briefing.intensity)
    .map((isActive) => `<i class="${isActive ? 'is-active' : ''}"></i>`)
    .join('');
  levelBriefingMission.textContent = getMissionSummary(safeLevel);
  levelBriefingTwoStar.textContent = briefing.twoStarText;
  levelBriefingThreeStar.textContent = briefing.threeStarText;
  levelBriefingStars.textContent = briefing.starText;
  levelBriefingPerformance.textContent = briefing.recordText;
  levelBriefingStart.textContent = briefing.actionLabel;
  levelBriefing.setAttribute('aria-hidden', 'false');
  levelSelectScreen.inert = true;
  document.body.classList.add('is-level-briefing');
  levelBriefingStart.focus();
}

function closeLevelBriefing({ restoreFocus = true } = {}) {
  levelBriefing.setAttribute('aria-hidden', 'true');
  levelSelectScreen.inert = false;
  document.body.classList.remove('is-level-briefing');

  if (restoreFocus && briefingReturnFocus instanceof HTMLElement) {
    briefingReturnFocus.focus();
  }

  briefingReturnFocus = null;
}

function setLevelSelectMode(mode) {
  modeTabs.forEach((tab) => {
    tab.classList.toggle('is-active', tab.dataset.modeTab === mode);
  });

  modePanels.forEach((panel) => {
    panel.classList.toggle('is-active', panel.dataset.modePanel === mode);
  });
}

function completeLevel(landingIndex) {
  clearRunCountdown();
  isGameRunning = false;
  isLevelComplete = true;
  clearPauseState();
  hideComboMilestone();
  playGameFeedback('complete');
  completedLanding = landingIndex;
  updateLevelHud(landingIndex);

  const nextLevel = currentLevel + 1;
  const hasNextLevel = nextLevel <= levelCatalog.length;
  const completedLevel = currentLevel;
  const earnedStars = calculateLevelStars(completedLevel);
  const previousStars = getLevelStars(completedLevel);
  const performanceResult = updateLevelPerformance(
    levelPerformance,
    completedLevel,
    {
      combo: maxCombo,
      perfect: perfectCount,
    }
  );
  levelPerformance = performanceResult.records;
  writeLevelPerformance();
  const didImproveStars = setLevelStars(completedLevel, earnedStars);
  levelCompletePanel.classList.toggle('is-star-improved', didImproveStars);
  levelCompletePanel.classList.toggle(
    'is-performance-improved',
    performanceResult.didImprovePerfect || performanceResult.didImproveCombo
  );
  levelCompletePanel.classList.toggle('is-full-star', earnedStars === 3);

  if (hasNextLevel && unlockedLevel < nextLevel) {
    setUnlockedLevel(nextLevel);
  }

  levelCompleteTitle.textContent = `第 ${completedLevel} 关`;
  levelCompleteDetail.textContent = hasNextLevel
    ? `解锁「${getLevelName(nextLevel)}」：${getLevelLength(nextLevel)} 跳到终点`
    : '全部关卡已完成';
  levelCompleteStars.textContent = getStarText(earnedStars);
  levelCompleteStars.setAttribute(
    'aria-label',
    `\u672c\u6b21\u83b7\u5f97 ${earnedStars} \u661f\uff0c\u5386\u53f2\u6700\u9ad8 ${Math.max(previousStars, earnedStars)} \u661f`
  );
  levelCompleteRecord.textContent = getStarRecordText(earnedStars, previousStars);
  levelCompleteCollection.textContent = getStarCollectionSummary(
    levelStars,
    levelCatalog.length
  );
  levelCompletePerformance.textContent = getPerformanceResultText(performanceResult);
  levelCompleteMission.textContent = isMissionComplete()
    ? `\u4efb\u52a1\u5b8c\u6210\uff1a${getMissionProgressText()}`
    : `\u4efb\u52a1\u672a\u5b8c\u6210\uff1a${getMissionProgressText()}`;
  levelCompleteNextGoal.textContent = getNextLevelGoalText(levelCatalog[nextLevel - 1]);
  const perfectSummary = 'Perfect ' + perfectCount + '/' + getLevelLength(completedLevel);
  levelCompleteScore.textContent =
    perfectSummary + ' · 最高连击 ' + maxCombo;
  syncAchievements({ announce: true });
  nextLevelButton.textContent = hasNextLevel ? '进入下一关' : '回到选关';
  gameMessage.textContent = `「${getLevelName(completedLevel)}」完成`;
  hideCoachTip();
  document.body.classList.add('is-level-complete');
}

function continueToNextLevel() {
  if (!isLevelComplete || isGameOver) {
    return;
  }

  if (currentLevel >= levelCatalog.length) {
    showLevelSelect();
    return;
  }

  isLevelComplete = false;
  isGameRunning = true;
  clearPauseState();
  startLevel(currentLevel + 1, completedLanding);
  setRouteProfile({
    difficulty: getLevelRouteDifficulty(currentLevel),
    seed: getLevelRouteSeed(currentLevel),
  }, completedLanding);
  setCombo(0);
  updateSpeedForScore(score);
  targetBallX = findValidPlatformForColor(completedLanding + 1, currentBallColor)?.x ?? ballX;
  gameMessage.textContent = `${getLevelName(currentLevel)}：还剩 ${getLevelLength(currentLevel)} 跳`;
  document.body.classList.remove('is-level-complete');
  startRunCountdown();
}

function setBallColor(colorKey) {
  currentBallColor = colorKey;
  const color = gameColors[colorKey];
  const glowColor = `#${color.emissive.toString(16).padStart(6, '0')}`;

  ballMaterial.color.setHex(color.ball);
  ballMaterial.emissive.setHex(color.emissive);
  currentColorValue.textContent = color.label;
  currentColorValue.style.color = glowColor;
  currentColorValue.style.textShadow = `0 0 18px ${glowColor}`;
}

function readLowPowerEnabled() {
  try {
    return localStorage.getItem(lowPowerStorageKey) === 'true';
  } catch {
    return false;
  }
}

function updateLowPowerToggle() {
  lowPowerToggle.checked = lowPowerEnabled;
  lowPowerToggle.setAttribute(
    'aria-label',
    lowPowerEnabled ? '关闭省电模式' : '开启省电模式'
  );
  lowPowerToggle
    .closest('.power-toggle')
    .classList.toggle('is-enabled', lowPowerEnabled);
}

function applyRenderQuality() {
  const settings = getRenderQualitySettings({
    devicePixelRatio: window.devicePixelRatio,
    lowPower: lowPowerEnabled,
  });
  renderer.setPixelRatio(settings.pixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = settings.shadows;
  renderer.shadowMap.needsUpdate = true;
  keyLight.castShadow = settings.shadows;
  ball.castShadow = settings.shadows;
  floor.receiveShadow = settings.shadows;
  document.body.classList.toggle('is-low-power', lowPowerEnabled);

  if (!settings.impacts) {
    clearImpactEffects();
  }

  updateLowPowerToggle();
}

function setLowPowerEnabled(enabled) {
  lowPowerEnabled = Boolean(enabled);

  try {
    localStorage.setItem(lowPowerStorageKey, String(lowPowerEnabled));
  } catch {
    // Local storage may be unavailable in restricted browser contexts.
  }

  applyRenderQuality();
}
function readSoundEnabled() {
  try {
    return localStorage.getItem(soundEnabledStorageKey) !== 'false';
  } catch {
    return true;
  }
}

function updateSoundToggle() {
  soundToggle.checked = soundEnabled;
  soundToggle.setAttribute(
    'aria-label',
    soundEnabled ? '关闭音效' : '开启音效'
  );
  soundToggle
    .closest('.sound-toggle')
    .classList.toggle('is-enabled', soundEnabled);
}

function playGameFeedback(event, color = currentBallColor) {
  if (soundEnabled) {
    audioFeedback.play(event, color);
  }
}

function setSoundEnabled(enabled) {
  soundEnabled = Boolean(enabled);

  try {
    localStorage.setItem(soundEnabledStorageKey, String(soundEnabled));
  } catch {
    // Local storage may be unavailable in restricted browser contexts.
  }

  updateSoundToggle();

  if (soundEnabled) {
    audioFeedback.resume();
    audioFeedback.play('toggle', 'blue');
  }
}

function readStoredScore(storageKey) {
  try {
    return normalizeScore(localStorage.getItem(storageKey));
  } catch {
    return 0;
  }
}

function writeStoredScore(storageKey, value) {
  try {
    localStorage.setItem(storageKey, String(normalizeScore(value)));
  } catch {
    // Local storage may be unavailable in restricted browser contexts.
  }
}


function readEndlessPerformance() {
  try {
    const parsedRecord = JSON.parse(
      localStorage.getItem(endlessPerformanceStorageKey) ?? '{}'
    );

    return normalizeEndlessPerformance(parsedRecord, endlessBestScore);
  } catch {
    return normalizeEndlessPerformance({}, endlessBestScore);
  }
}

function writeEndlessPerformance() {
  try {
    localStorage.setItem(
      endlessPerformanceStorageKey,
      JSON.stringify(endlessPerformance)
    );
  } catch {
    // Local storage may be unavailable in restricted browser contexts.
  }
}

function readEndlessRunHistory() {
  try {
    return normalizeEndlessRunHistory(
      JSON.parse(localStorage.getItem(endlessRunHistoryStorageKey) ?? '[]')
    );
  } catch {
    return [];
  }
}

function writeEndlessRunHistory() {
  try {
    localStorage.setItem(
      endlessRunHistoryStorageKey,
      JSON.stringify(endlessRunHistory)
    );
  } catch {
    // Local storage may be unavailable in restricted browser contexts.
  }
}

function renderEndlessRunHistory() {
  endlessHistoryEmpty.hidden = endlessRunHistory.length > 0;
  endlessHistoryList.replaceChildren();

  endlessRunHistory.forEach((run, index) => {
    const item = document.createElement('div');
    const isBest = run.score > 0 && run.score === endlessPerformance.bestScore;
    item.className = 'endless-history-item';
    item.classList.toggle('is-best', isBest);
    item.innerHTML =
      '<span class="endless-history-rank">' +
        (index === 0 ? '最新' : '#' + (index + 1)) +
      '</span>' +
      '<span class="endless-history-copy">' +
        '<strong>' + getEndlessRunSummary(run) + '</strong>' +
        '<small>' + getEndlessRunMeta(run) + '</small>' +
      '</span>' +
      (isBest ? '<span class="endless-history-best">最佳</span>' : '');
    endlessHistoryList.appendChild(item);
  });
}

function updateEndlessPerformanceDisplay() {
  endlessPerformanceValue.textContent =
    getEndlessPerformanceText(endlessPerformance);
  renderEndlessRunHistory();
}
function readBestScore() {
  return readStoredScore(bestScoreStorageKey);
}

function readEndlessBestScore() {
  return readStoredScore(endlessBestScoreStorageKey);
}

function getActiveBestScore() {
  return currentMode === 'endless' ? endlessBestScore : bestScore;
}

function updateBestScoreDisplay() {
  bestScoreLabel.textContent = currentMode === 'endless' ? '\u65e0\u5c3d\u6700\u4f73' : '\u6700\u4f73';
  bestScoreValue.textContent = String(getActiveBestScore());

  if (endlessBestValue) {
    endlessBestValue.textContent = getBestScoreLabel('endless', endlessBestScore);
  }

  updateEndlessPerformanceDisplay();
}

function setBestScore(value) {
  bestScore = normalizeScore(value);
  updateBestScoreDisplay();
  writeStoredScore(bestScoreStorageKey, bestScore);
}

function setEndlessBestScore(value) {
  endlessBestScore = normalizeScore(value);
  updateBestScoreDisplay();
  writeStoredScore(endlessBestScoreStorageKey, endlessBestScore);
}
function getCurrentLaneIndex() {
  return lanePositions.reduce((closestIndex, laneX, index) => {
    const closestDistance = Math.abs(lanePositions[closestIndex] - targetBallX);
    const laneDistance = Math.abs(laneX - targetBallX);

    return laneDistance < closestDistance ? index : closestIndex;
  }, 1);
}

function shiftTargetLane(direction) {
  if (
    !isGameRunning ||
    isPaused ||
    isCoachBlocking ||
    isCountdownActive ||
    isGameOver ||
    isLevelComplete
  ) {
    return;
  }

  const currentLane = getCurrentLaneIndex();
  const nextLane = THREE.MathUtils.clamp(
    currentLane + direction,
    0,
    lanePositions.length - 1
  );

  targetBallX = lanePositions[nextLane];
}

function isLandingValid(platform, x) {
  return Boolean(platform) &&
    Math.abs(x - platform.x) <= platformHalfWidth &&
    platformMatchesColor(platform, currentBallColor);
}

window.__bounceBuddySimulateRoute = simulateReachableRoute;
window.__bounceBuddyGetRouteSample = getRouteSample;

function startRun(level = 1, mode = 'level') {
  clearRunCountdown();
  gameHud.append(speedControl);
  if (soundEnabled) {
    audioFeedback.resume();
  }
  isGameRunning = true;
  isGameOver = false;
  isLevelComplete = false;
  currentMode = mode;
  updateBestScoreDisplay();
  clearPauseState();
  hopProgress = 0;
  previousHop = 0;
  lastProcessedLanding = 0;
  completedLanding = 0;
  ballX = 0;
  resetRoute(
    currentMode === 'endless' ? 1 : getLevelRouteDifficulty(level),
    currentMode === 'level' ? getLevelRouteSeed(level) : undefined
  );
  collectedShardLandings.clear();
  setScore(0);
  setCombo(0);
  startLevel(level, 0);
  setCurrentSpeedLevel(getLevelBaseSpeed(currentLevel));
  setBallColor('red');
  targetBallX = findValidPlatformForColor(1, currentBallColor)?.x ?? 0;
  gameMessage.textContent = currentMode === 'endless'
    ? '星河没完没了：没有终点，每 10 分升 1 档'
    : `${getLevelName(currentLevel)}：还剩 ${getLevelLength(currentLevel)} 跳`;
  showCoachTipIfNeeded();
  document.body.classList.add('is-playing');
  document.body.classList.remove('is-game-over');
  document.body.classList.remove('is-level-complete');
  speedSelect.disabled = true;
  if (!isCoachBlocking) {
    startRunCountdown();
  }
  clearImpactEffects();
  startButton.textContent = '重新开始';
  startButton.classList.add('is-running');
}

function showLevelSelect() {
  clearRunCountdown();
  closeLevelBriefing({ restoreFocus: false });
  levelSelectScreen.append(speedControl);
  isGameRunning = false;
  isGameOver = false;
  isLevelComplete = false;
  clearPauseState();
  document.body.classList.remove('is-playing');
  document.body.classList.remove('is-game-over');
  document.body.classList.remove('is-level-complete');
  speedSelect.disabled = false;
  setCurrentSpeedLevel(selectedSpeedLevel, { pulse: false });
  startButton.textContent = '开始游戏';
  startButton.classList.remove('is-running');
  hideCoachTip();
  renderLevelSelect();
}

function endGame(reason = '') {
  clearRunCountdown();
  isGameRunning = false;
  isGameOver = true;
  isLevelComplete = false;
  clearPauseState();
  playGameFeedback('death');
  document.body.classList.add('is-game-over');
  document.body.classList.remove('is-level-complete');
  speedSelect.disabled = false;
  startButton.textContent = '再来一次';
  startButton.classList.remove('is-running');
  hideCoachTip();
  setCombo(0);

  const endlessPerformanceResult = currentMode === 'endless'
    ? updateEndlessPerformance(endlessPerformance, {
      combo: maxCombo,
      perfect: perfectCount,
      score,
      shards: shardCount,
    })
    : null;

  if (endlessPerformanceResult) {
    endlessPerformance = endlessPerformanceResult.record;
    endlessRunHistory = appendEndlessRun(endlessRunHistory, {
      combo: maxCombo,
      perfect: perfectCount,
      runNumber: endlessPerformance.runs,
      score,
      shards: shardCount,
      speed: currentSpeedLevel,
    });
    writeEndlessPerformance();
    writeEndlessRunHistory();
    updateEndlessPerformanceDisplay();
  }

  deathPanel.classList.toggle(
    'is-record-improved',
    Boolean(endlessPerformanceResult?.didImprove)
  );
  const finalMessage = reason || '\u6e38\u620f\u7ed3\u675f';
  const previousBestScore = getActiveBestScore();

  if (shouldUpdateBestScore(score, previousBestScore)) {
    if (currentMode === 'endless') {
      setEndlessBestScore(score);
    } else {
      setBestScore(score);
    }

    gameMessage.textContent = currentMode === 'endless'
      ? `\u65e0\u5c3d\u65b0\u7eaa\u5f55\uff01\u6700\u7ec8\u5f97\u5206 ${score}`
      : `\u65b0\u7eaa\u5f55\uff01\u6700\u7ec8\u5f97\u5206 ${score}`;
    deathReason.textContent = currentMode === 'endless'
      ? `\u65e0\u5c3d\u65b0\u7eaa\u5f55\uff01${finalMessage}`
      : `\u65b0\u7eaa\u5f55\uff01${finalMessage}`;
  } else {
    gameMessage.textContent = reason
      ? `${reason}\uff0c\u6700\u7ec8\u5f97\u5206 ${score}`
      : `\u6e38\u620f\u7ed3\u675f\uff0c\u6700\u7ec8\u5f97\u5206 ${score}`;
    deathReason.textContent = finalMessage;
  }

  const completedJumps = currentMode === 'endless'
    ? score
    : Math.max(0, lastProcessedLanding - levelStartLanding - 1);
  const deathProgress = getDeathProgressSummary({
    completedJumps,
    mode: currentMode,
    totalJumps: getLevelLength(currentLevel),
  });
  deathProgressSummary.classList.toggle('is-endless', deathProgress.isEndless);
  deathProgressSummary.setAttribute('aria-label', deathProgress.label);
  deathProgressLabel.textContent = deathProgress.label;
  deathProgressText.textContent = deathProgress.text;
  deathProgressFill.style.width =
    deathProgress.percent === null ? '0%' : deathProgress.percent + '%';
  deathScore.textContent = String(score);
  deathBest.textContent = getBestScoreLabel(currentMode, getActiveBestScore());
  deathRecordDetail.textContent = currentMode === 'endless'
    ? getEndlessPerformanceResultText(endlessPerformanceResult)
    : getLevelPerformanceText(
      getLevelPerformance(levelPerformance, currentLevel)
    );
  deathCombo.textContent = String(maxCombo);
  deathPerfect.textContent = String(perfectCount);
  deathMission.textContent = currentMode === 'endless' ? '无尽' : getMissionProgressText();
  syncAchievements({ announce: true });
}

updateSoundToggle();
applyRenderQuality();
updateBestScoreDisplay();
setBallColor(currentBallColor);
setSpeedLevel(selectedSpeedLevel);
setCombo(combo);
updateLevelHud(0);
syncAchievements();
renderLevelSelect();
setLevelSelectMode('levels');

lowPowerToggle.addEventListener('change', () => {
  setLowPowerEnabled(lowPowerToggle.checked);
});
soundToggle.addEventListener('change', () => {
  setSoundEnabled(soundToggle.checked);
});

speedSelect.addEventListener('change', () => {
  setSpeedLevel(Number(speedSelect.value));
});

modeTabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    setLevelSelectMode(tab.dataset.modeTab);
  });
});

continueLevelButton.addEventListener('click', () => {
  const level = Number(continueLevelButton.dataset.level);
  openLevelBriefing(Number.isFinite(level) ? level : 1, continueLevelButton);
});

levelBriefingCancel.addEventListener('click', () => {
  closeLevelBriefing();
});

levelBriefingStart.addEventListener('click', () => {
  closeLevelBriefing({ restoreFocus: false });
  startRun(briefingLevel);
});

levelBriefing.addEventListener('click', (event) => {
  if (event.target === levelBriefing) {
    closeLevelBriefing();
  }
});

endlessEntryCard.addEventListener('click', () => {
  startRun(1, 'endless');
});

startButton.addEventListener('click', () => {
  startRun(currentLevel, currentMode);
});

nextLevelButton.addEventListener('click', () => {
  continueToNextLevel();
});

backToLevelsButton.addEventListener('click', () => {
  showLevelSelect();
});

deathRetryButton.addEventListener('click', () => {
  startRun(currentLevel, currentMode);
});

deathLevelsButton.addEventListener('click', () => {
  showLevelSelect();
});

coachDismissButton.addEventListener('click', () => {
  hideCoachTip({ persist: true });
  startRunCountdown();
});

pauseButton.addEventListener('click', () => {
  togglePause();
});

resumeButton.addEventListener('click', () => {
  setPaused(false);
});

pauseRetryButton.addEventListener('click', () => {
  startRun(currentLevel, currentMode);
});

pauseLevelsButton.addEventListener('click', () => {
  showLevelSelect();
});

touchControlButtons.forEach((button) => {
  button.addEventListener('click', () => {
    shiftTargetLane(Number(button.dataset.move));
  });
});

document.addEventListener('visibilitychange', () => {
  if (shouldAutoPause({
    hidden: document.hidden,
    isGameRunning,
    isPaused,
    isGameOver,
    isLevelComplete,
  })) {
    setPaused(true, 'background');
  }
});

window.addEventListener('keydown', (event) => {
  if (document.body.classList.contains('is-level-briefing')) {
    if (event.code === 'Escape') {
      event.preventDefault();
      closeLevelBriefing();
      return;
    }

    if (event.code === 'Tab') {
      const firstButton = levelBriefingCancel;
      const lastButton = levelBriefingStart;
      const isLeavingStart = !event.shiftKey && document.activeElement === lastButton;
      const isLeavingCancel = event.shiftKey && document.activeElement === firstButton;

      if (isLeavingStart || isLeavingCancel) {
        event.preventDefault();
        (isLeavingStart ? firstButton : lastButton).focus();
      }
    }
  }

  if (
    (event.code === 'Escape' || event.code === 'KeyP') &&
    isGameRunning &&
    !isGameOver &&
    !isLevelComplete
  ) {
    event.preventDefault();
    togglePause();
    return;
  }

  if (event.repeat) {
    return;
  }

  if (event.code === 'ArrowLeft' || event.code === 'KeyA') {
    shiftTargetLane(-1);
  }

  if (event.code === 'ArrowRight' || event.code === 'KeyD') {
    shiftTargetLane(1);
  }
});

renderer.domElement.addEventListener('pointerdown', (event) => {
  pointerStartX = event.clientX;
  pointerStartY = event.clientY;
});

renderer.domElement.addEventListener('pointerup', (event) => {
  if (pointerStartX === null || pointerStartY === null) {
    return;
  }

  const deltaX = event.clientX - pointerStartX;
  const deltaY = event.clientY - pointerStartY;
  pointerStartX = null;
  pointerStartY = null;

  if (Math.abs(deltaX) < 38 || Math.abs(deltaX) < Math.abs(deltaY) * 1.2) {
    return;
  }

  shiftTargetLane(deltaX > 0 ? 1 : -1);
});

function animate() {
  timer.update();
  const delta = timer.getDelta();

  if (isGameRunning && !isPaused && !isCoachBlocking && !isCountdownActive) {
    hopProgress += hopRate * delta;
  }

  if (!isPaused && !isCoachBlocking && !isCountdownActive) {
    ballX = THREE.MathUtils.lerp(ballX, targetBallX, 0.2);
  }

  const hop = hopProgress % 1;
  const bounce = Math.sin(hop * Math.PI);
  const z = nearZ - hopProgress * landingGap;
  const height = baseY + bounce * bounceHeight;

  ball.position.x = ballX;
  ball.position.z = z;
  ball.position.y = height;
  ball.rotation.x = hopProgress * 3.4;
  ball.scale.setScalar(1);

  shadowBlob.position.x = ballX;
  shadowBlob.position.z = z;
  const shadowScale = 1.85 - bounce * 0.75;
  shadowBlob.scale.set(shadowScale, shadowScale, 1);
  shadowBlob.material.opacity = 0.18 - bounce * 0.1;
  const groundCenterZ = z - 18;
  floor.position.z = groundCenterZ;
  grid.position.z = groundCenterZ;
  starGround.position.z = groundCenterZ;

  const currentLanding = Math.floor(hopProgress);

  while (
    isGameRunning &&
    !isPaused &&
    !isCoachBlocking &&
    !isCountdownActive &&
    lastProcessedLanding < currentLanding
  ) {
    const landingIndex = lastProcessedLanding + 1;
    const landingZ = nearZ - landingIndex * landingGap;
    const platform = findPlatformAt(landingIndex, ballX);
    const onPlatform = Boolean(platform);
    const landed = onPlatform && platformMatchesColor(platform, currentBallColor);
    const impactColorKey = landed && platform.type === 'wildcard'
      ? platform.nextColor
      : currentBallColor;

    createImpact(ballX, landingZ, impactColorKey);
    lastProcessedLanding = landingIndex;

    if (landed) {
      const missionWasComplete = currentMode === 'level' && isMissionComplete();
      setScore(score + 1);
      setCombo(combo + 1);
      const isPerfectLanding = Math.abs(ballX - platform.x) < 0.36;
      if (isPerfectLanding) {
        setPerfectCount(perfectCount + 1);
      }
      const didCollectShard = canCollectShard(
        platform,
        isPerfectLanding,
        collectedShardLandings.has(landingIndex)
      );
      if (didCollectShard) {
        collectedShardLandings.add(landingIndex);
        setShardCount(shardCount + 1);
      }
      const shardMessage = didCollectShard ? ' · 星尘 +1' : '';
      if (platform.type === 'wildcard') {
        setBallColor(platform.nextColor);
        setRainbowCount(rainbowCount + 1);
      }
      const didCompleteMission =
        currentMode === 'level' &&
        !missionWasComplete &&
        isMissionComplete();
      if (didCompleteMission) {
        showMissionCompleteFeedback();
      }
      const missionMessage = didCompleteMission
        ? ' · 任务完成'
        : '';
      const landingBonusMessage = shardMessage + missionMessage;
      showComboMilestone(combo, { perfect: isPerfectLanding });
      const didSpeedGoUp = updateSpeedForScore(score);
      if (platform.type === 'wildcard') {
        const landingMessage = isPerfectLanding
          ? `Perfect! 彩虹换色：${gameColors[platform.nextColor].label}${landingBonusMessage}`
          : `彩虹换色：${gameColors[platform.nextColor].label}${landingBonusMessage}`;
        gameMessage.textContent = withSpeedUpFeedback(
          withComboFeedback(landingMessage, combo),
          didSpeedGoUp,
          currentSpeedLevel
        );
      } else {
        const landingMessage = isPerfectLanding
          ? `Perfect!${landingBonusMessage}`
          : '命中平台';
        gameMessage.textContent = withSpeedUpFeedback(
          withComboFeedback(landingMessage, combo),
          didSpeedGoUp,
          currentSpeedLevel
        );
      }

      const completesLevel =
        currentMode === 'level' && landingIndex >= levelEndLanding;

      if (!completesLevel) {
        let feedbackEvent = 'landing';

        if (didCompleteMission) {
          feedbackEvent = 'mission';
        } else if (didCollectShard) {
          feedbackEvent = 'shard';
        } else if (didSpeedGoUp) {
          feedbackEvent = 'speedUp';
        } else if (platform.type === 'wildcard') {
          feedbackEvent = 'rainbow';
        } else if (isPerfectLanding) {
          feedbackEvent = 'perfect';
        }

        playGameFeedback(feedbackEvent, impactColorKey);
      }

      if (completesLevel) {
        completeLevel(landingIndex);
      }
    } else {
      endGame(onPlatform ? '颜色不匹配' : '没有落到平台');
    }
  }

  const nextLandingIndex = currentLanding + 1;
  const nextPadZ = nearZ - nextLandingIndex * landingGap;
  const nextPlatforms = getLandingPlatforms(nextLandingIndex);
  const nextPlatform = findPlatformAt(nextLandingIndex, targetBallX);
  const targetWillLand = isLandingValid(nextPlatform, targetBallX);
  window.__bounceBuddyDebug = {
    ballY: ball.position.y,
    ballZ: ball.position.z,
    currentBallColor,
    currentLanding,
    nextLandingIndex,
    nextPlatform,
    nextPlatforms,
    targetBallX,
    targetWillLand,
    currentSpeedLevel,
    currentMode,
    currentLevel,
    isLevelComplete,
    isCountdownActive,
    isPaused,
    levelEndLanding,
    remainingToGoal: Math.max(0, levelEndLanding - currentLanding),
    combo,
    maxCombo,
    perfectCount,
    rainbowCount,
    shardCount,
    mission: getMissionProgressText(),
    missionComplete: currentMode !== 'endless' && isMissionComplete(),
    routeSeed: getRouteSeed(),
    routeCache: getRouteCacheStats(),
    landingPadPoolSize: landingPads.length,
  };

  targetMarker.visible = isGameRunning && !isPaused && !isLevelComplete;
  targetMarker.position.set(targetBallX, 0.13, nextPadZ);
  targetMarker.material.opacity = isGameRunning && !isPaused ? 0.68 + bounce * 0.22 : 0;
  targetMarker.material.color.setHex(targetWillLand ? 0x91f7ff : 0xff6fa3);
  targetMarker.scale.setScalar(1 + bounce * 0.18);

  for (let i = 0; i < visibleLandingCount; i += 1) {
    const landingIndex = currentLanding + i;
    const padZ = nearZ - landingIndex * landingGap;
    const platforms = getLandingPlatforms(landingIndex);
    const distanceFromBall = Math.abs(padZ - z);

    for (let platformIndex = 0; platformIndex < lanePositions.length; platformIndex += 1) {
      const platform = platforms[platformIndex];
      const pad = landingPads[i * lanePositions.length + platformIndex];

      if (!platform) {
        pad.visible = false;
        continue;
      }

      const isCurrentTarget =
        landingIndex === currentLanding + 1 && Math.abs(targetBallX - platform.x) < 0.2;
      const isFinishLanding = currentMode === 'level' && landingIndex === levelEndLanding;
      const targetScale = isCurrentTarget ? 1.12 : 1;
      const landingScale = distanceFromBall < 1.2 ? 1.05 : 1;

      pad.visible = true;
      pad.position.set(platform.x, 0.08, padZ);
      pad.scale.setScalar(targetScale * landingScale);
      applyPlatformVisual(
        pad,
        platform,
        isCurrentTarget,
        isFinishLanding,
        platform.hasShard && !collectedShardLandings.has(landingIndex)
      );
    }
  }
  updateLevelHud(currentLanding);
  pruneRouteBefore(currentLanding);

  const cameraTarget = new THREE.Vector3(ballX * 0.34, 1.65, z - 4.9);
  camera.position.lerp(new THREE.Vector3(ballX * 0.22, 8.1, z + 12.2), 0.08);
  camera.lookAt(cameraTarget);

  keyLight.position.set(4, 8.5, z + 5);
  keyLight.target.position.set(0, 1, z - 2);

  previousHop = hop;

  for (let i = impactEffects.length - 1; i >= 0; i -= 1) {
    const effect = impactEffects[i];
    if (!isPaused && !isCoachBlocking && !isCountdownActive) {
      effect.age += delta;
    }
    const progress = effect.age / effect.duration;
    const opacity = Math.max(0, 1 - progress);

    effect.ring.scale.setScalar(1 + progress * 2.4);
    effect.ring.material.opacity = opacity * 0.75;
    effect.sparks.material.opacity = opacity;
    impactLight.intensity = Math.max(impactLight.intensity, opacity * 6);

    if (progress >= 1) {
      scene.remove(effect.ring);
      scene.remove(effect.sparks);
      effect.ring.geometry.dispose();
      effect.ring.material.dispose();
      effect.sparks.geometry.dispose();
      effect.sparks.material.dispose();
      impactEffects.splice(i, 1);
    }
  }

  impactLight.intensity *= 0.82;

  renderer.render(scene, camera);
}

function handleResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(getRenderQualitySettings({
    devicePixelRatio: window.devicePixelRatio,
    lowPower: lowPowerEnabled,
  }).pixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener('resize', handleResize);
renderer.setAnimationLoop(animate);
