import * as THREE from 'three';
import './styles.css';
import {
  baseY,
  bestScoreStorageKey,
  bounceHeight,
  gameColors,
  landingGap,
  lanePositions,
  maxRuntimeSpeedLevel,
  nearZ,
  platformHalfWidth,
  speedUpScoreInterval,
  starPaletteHex,
  visibleLandingCount,
} from './game/config.js';
import {
  findPlatformAt,
  findValidPlatformForColor,
  getLandingPlatforms,
  getRouteSample,
  getRouteSeed,
  platformMatchesColor,
  resetRoute,
  simulateReachableRoute,
} from './game/route.js';
import {
  applyPlatformVisual,
  createLandingPads,
} from './scene/platforms.js';

const app = document.querySelector('#app');
const startButton = document.querySelector('.start-button');
const speedSelect = document.querySelector('.speed-select');
const speedValue = document.querySelector('.speed-value');
const scoreValue = document.querySelector('.score-value');
const bestScoreValue = document.querySelector('.best-score-value');
const currentColorValue = document.querySelector('.current-color-value');
const gameMessage = document.querySelector('.game-message');
let isGameRunning = false;
let isGameOver = false;
let selectedSpeedLevel = Number(speedSelect.value);
let currentSpeedLevel = selectedSpeedLevel;

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
camera.position.set(0, 7.2, 11);
camera.lookAt(0, 1.8, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
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

function createImpact(x, z) {
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(0.92, 1.05, 96),
    impactMaterial.clone()
  );
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
      color: 0x9ff5ff,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
  );
  scene.add(sparks);

  impactLight.position.z = z;
  impactLight.position.x = x;
  impactLight.intensity = 6;
  impactEffects.push({ ring, sparks, age: 0, duration: 0.42 });
}

const timer = new THREE.Timer();
timer.connect(document);
let hopRate = speedLevelToHopRate(selectedSpeedLevel);
let hopProgress = 0;
let previousHop = 0;
let ballX = 0;
let targetBallX = 0;
let score = 0;
let currentBallColor = 'red';
let bestScore = readBestScore();

function speedLevelToHopRate(level) {
  return 0.62 + (level - 1) * 0.11;
}

function updateSpeedDisplay(level) {
  speedValue.textContent = String(level);
}

function setCurrentSpeedLevel(level) {
  currentSpeedLevel = THREE.MathUtils.clamp(level, 1, maxRuntimeSpeedLevel);
  hopRate = speedLevelToHopRate(currentSpeedLevel);
  updateSpeedDisplay(currentSpeedLevel);
}

function setSpeedLevel(level) {
  selectedSpeedLevel = THREE.MathUtils.clamp(level, 1, 10);
  speedSelect.value = String(selectedSpeedLevel);
  setCurrentSpeedLevel(selectedSpeedLevel);
}

function setScore(value) {
  score = value;
  scoreValue.textContent = String(score);
}

function updateSpeedForScore(value) {
  const speedBonus = Math.floor(value / speedUpScoreInterval);
  setCurrentSpeedLevel(selectedSpeedLevel + speedBonus);
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

function readBestScore() {
  try {
    const storedScore = Number(localStorage.getItem(bestScoreStorageKey));
    return Number.isFinite(storedScore) ? Math.max(0, storedScore) : 0;
  } catch {
    return 0;
  }
}

function setBestScore(value) {
  bestScore = value;
  bestScoreValue.textContent = String(bestScore);

  try {
    localStorage.setItem(bestScoreStorageKey, String(bestScore));
  } catch {
    // Local storage may be unavailable in restricted browser contexts.
  }
}

function getCurrentLaneIndex() {
  return lanePositions.reduce((closestIndex, laneX, index) => {
    const closestDistance = Math.abs(lanePositions[closestIndex] - targetBallX);
    const laneDistance = Math.abs(laneX - targetBallX);

    return laneDistance < closestDistance ? index : closestIndex;
  }, 1);
}

function shiftTargetLane(direction) {
  if (!isGameRunning || isGameOver) {
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

function resetGame() {
  isGameRunning = true;
  isGameOver = false;
  hopProgress = 0;
  previousHop = 0;
  ballX = 0;
  resetRoute();
  setScore(0);
  setCurrentSpeedLevel(selectedSpeedLevel);
  setBallColor('red');
  targetBallX = findValidPlatformForColor(1, currentBallColor)?.x ?? 0;
  gameMessage.textContent = '只能落到同色平台；彩虹平台会换色';
  document.body.classList.add('is-playing');
  document.body.classList.remove('is-game-over');
  speedSelect.disabled = true;
  impactEffects.splice(0).forEach((effect) => {
    scene.remove(effect.ring);
    scene.remove(effect.sparks);
    effect.ring.geometry.dispose();
    effect.ring.material.dispose();
    effect.sparks.geometry.dispose();
    effect.sparks.material.dispose();
  });
  startButton.textContent = '重新开始';
  startButton.classList.add('is-running');
}

function endGame(reason = '') {
  isGameRunning = false;
  isGameOver = true;
  document.body.classList.add('is-game-over');
  speedSelect.disabled = false;
  startButton.textContent = '再来一次';

  if (score > bestScore) {
    setBestScore(score);
    gameMessage.textContent = `新纪录！最终得分 ${score}`;
    return;
  }

  gameMessage.textContent = reason
    ? `${reason}，最终得分 ${score}`
    : `游戏结束，最终得分 ${score}`;
}

bestScoreValue.textContent = String(bestScore);
setBallColor(currentBallColor);
setSpeedLevel(selectedSpeedLevel);

speedSelect.addEventListener('change', () => {
  setSpeedLevel(Number(speedSelect.value));
});

startButton.addEventListener('click', () => {
  resetGame();
});

window.addEventListener('keydown', (event) => {
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

function animate() {
  timer.update();
  const delta = timer.getDelta();

  if (isGameRunning) {
    hopProgress += hopRate * delta;
  }

  ballX = THREE.MathUtils.lerp(ballX, targetBallX, 0.2);

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

  if (isGameRunning && hop < previousHop) {
    const landingIndex = Math.floor(hopProgress);
    const platform = findPlatformAt(landingIndex, ballX);
    const onPlatform = Boolean(platform);
    const landed = onPlatform && platformMatchesColor(platform, currentBallColor);

    createImpact(ballX, z);

    if (landed) {
      setScore(score + 1);
      updateSpeedForScore(score);
      if (platform.type === 'wildcard') {
        setBallColor(platform.nextColor);
        gameMessage.textContent = `彩虹换色：${gameColors[platform.nextColor].label}`;
      } else {
        gameMessage.textContent = Math.abs(ballX - platform.x) < 0.36 ? 'Perfect!' : '命中平台';
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
    routeSeed: getRouteSeed(),
  };

  targetMarker.visible = isGameRunning;
  targetMarker.position.set(targetBallX, 0.13, nextPadZ);
  targetMarker.material.opacity = isGameRunning ? 0.68 + bounce * 0.22 : 0;
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
      const targetScale = isCurrentTarget ? 1.12 : 1;
      const landingScale = distanceFromBall < 1.2 ? 1.05 : 1;

      pad.visible = true;
      pad.position.set(platform.x, 0.08, padZ);
      pad.scale.setScalar(targetScale * landingScale);
      applyPlatformVisual(pad, platform, isCurrentTarget);
    }
  }

  const cameraTarget = new THREE.Vector3(ballX * 0.38, 1.75, z - 4.5);
  camera.position.lerp(new THREE.Vector3(ballX * 0.25, 7.4, z + 10.5), 0.08);
  camera.lookAt(cameraTarget);

  keyLight.position.set(4, 8.5, z + 5);
  keyLight.target.position.set(0, 1, z - 2);

  previousHop = hop;

  for (let i = impactEffects.length - 1; i >= 0; i -= 1) {
    const effect = impactEffects[i];
    effect.age += delta;
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
  renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener('resize', handleResize);
renderer.setAnimationLoop(animate);
