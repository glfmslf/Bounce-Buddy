import * as THREE from 'three';
import './styles.css';

const app = document.querySelector('#app');
const startButton = document.querySelector('.start-button');
const speedSelect = document.querySelector('.speed-select');
const speedValue = document.querySelector('.speed-value');
const scoreValue = document.querySelector('.score-value');
const gameMessage = document.querySelector('.game-message');
let isGameRunning = false;
let isGameOver = false;
let selectedSpeedLevel = Number(speedSelect.value);
const keys = new Set();

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x07111f);
scene.fog = new THREE.Fog(0x07111f, 18, 58);

const starPalette = [
  new THREE.Color(0x8ff4ff),
  new THREE.Color(0xd9fbff),
  new THREE.Color(0x78a7ff),
];

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

const impactEffects = [];
const impactMaterial = new THREE.MeshBasicMaterial({
  color: 0x66ddff,
  transparent: true,
  opacity: 0,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
  side: THREE.DoubleSide,
});

const landingPads = [];
const landingPadGeometry = new THREE.BoxGeometry(2.4, 0.16, 1.45);
const landingPadMaterial = new THREE.MeshStandardMaterial({
  color: 0x123b6d,
  emissive: 0x29d7ff,
  emissiveIntensity: 0.75,
  roughness: 0.25,
  metalness: 0.25,
  transparent: true,
  opacity: 0.82,
});
const landingPadEdgeMaterial = new THREE.LineBasicMaterial({
  color: 0xa6f6ff,
  transparent: true,
  opacity: 0.8,
});

for (let i = 0; i < 12; i += 1) {
  const pad = new THREE.Group();
  const body = new THREE.Mesh(landingPadGeometry, landingPadMaterial.clone());
  const edges = new THREE.LineSegments(
    new THREE.EdgesGeometry(landingPadGeometry),
    landingPadEdgeMaterial
  );

  body.receiveShadow = true;
  pad.add(body);
  pad.add(edges);
  pad.userData.body = body;
  scene.add(pad);
  landingPads.push(pad);
}

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
const bounceHeight = 3.05;
const baseY = 0.62;
const nearZ = 3.2;
const landingGap = 2.88;
let hopRate = speedLevelToHopRate(selectedSpeedLevel);
let hopProgress = 0;
let previousHop = 0;
let ballX = 0;
let targetBallX = 0;
let score = 0;
const lanePositions = [-2.4, 0, 2.4];
const platformHalfWidth = 1.2;
const lateralLimit = 3.1;
const lateralSpeed = 6.2;
const platformLayout = new Map([[0, 0]]);

function speedLevelToHopRate(level) {
  return 0.62 + (level - 1) * 0.11;
}

function setSpeedLevel(level) {
  selectedSpeedLevel = level;
  hopRate = speedLevelToHopRate(level);
  speedValue.textContent = String(level);
  speedSelect.value = String(level);
}

function getPlatformX(index) {
  if (!platformLayout.has(index)) {
    const previousX = getPlatformX(index - 1);
    const candidates = lanePositions.filter((x) => Math.abs(x - previousX) <= 2.4);
    platformLayout.set(index, candidates[Math.floor(Math.random() * candidates.length)]);
  }

  return platformLayout.get(index);
}

function setScore(value) {
  score = value;
  scoreValue.textContent = String(score);
}

function resetGame() {
  isGameRunning = true;
  isGameOver = false;
  hopProgress = 0;
  previousHop = 0;
  ballX = 0;
  targetBallX = 0;
  platformLayout.clear();
  platformLayout.set(0, 0);
  setScore(0);
  gameMessage.textContent = '用 A/D 或方向键调整位置，落在发光平台上';
  document.body.classList.add('is-playing');
  document.body.classList.remove('is-game-over');
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

function endGame() {
  isGameRunning = false;
  isGameOver = true;
  document.body.classList.add('is-game-over');
  startButton.textContent = '再来一次';
  gameMessage.textContent = `游戏结束，最终得分 ${score}`;
}

setSpeedLevel(selectedSpeedLevel);

speedSelect.addEventListener('change', () => {
  setSpeedLevel(Number(speedSelect.value));
});

startButton.addEventListener('click', () => {
  resetGame();
});

window.addEventListener('keydown', (event) => {
  if (['ArrowLeft', 'ArrowRight', 'KeyA', 'KeyD'].includes(event.code)) {
    keys.add(event.code);
  }
});

window.addEventListener('keyup', (event) => {
  keys.delete(event.code);
});

function animate() {
  timer.update();
  const delta = timer.getDelta();

  if (isGameRunning) {
    hopProgress += hopRate * delta;

    const moveLeft = keys.has('ArrowLeft') || keys.has('KeyA');
    const moveRight = keys.has('ArrowRight') || keys.has('KeyD');
    const horizontalInput = Number(moveRight) - Number(moveLeft);

    targetBallX = THREE.MathUtils.clamp(
      targetBallX + horizontalInput * lateralSpeed * delta,
      -lateralLimit,
      lateralLimit
    );
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
  window.__bounceBuddyDebug = { ballY: ball.position.y, ballZ: ball.position.z };

  const groundCenterZ = z - 18;
  floor.position.z = groundCenterZ;
  grid.position.z = groundCenterZ;
  starGround.position.z = groundCenterZ;

  const currentLanding = Math.floor(hopProgress);
  for (let i = 0; i < landingPads.length; i += 1) {
    const landingIndex = currentLanding + i;
    const padZ = nearZ - landingIndex * landingGap;
    const padX = getPlatformX(landingIndex);
    const distanceFromBall = Math.abs(padZ - z);
    const pad = landingPads[i];
    const isCurrentTarget = landingIndex === currentLanding + 1;

    pad.position.set(padX, 0.08, padZ);
    pad.scale.setScalar(distanceFromBall < 1.2 ? 1.08 : 1);
    pad.userData.body.material.emissiveIntensity = isCurrentTarget ? 1.2 : 0.75;
  }

  const cameraTarget = new THREE.Vector3(ballX * 0.38, 1.75, z - 4.5);
  camera.position.lerp(new THREE.Vector3(ballX * 0.25, 7.4, z + 10.5), 0.08);
  camera.lookAt(cameraTarget);

  keyLight.position.set(4, 8.5, z + 5);
  keyLight.target.position.set(0, 1, z - 2);

  if (isGameRunning && hop < previousHop) {
    const landingIndex = Math.floor(hopProgress);
    const platformX = getPlatformX(landingIndex);
    const landed = Math.abs(ballX - platformX) <= platformHalfWidth;

    createImpact(ballX, z);

    if (landed) {
      setScore(score + 1);
      gameMessage.textContent = Math.abs(ballX - platformX) < 0.36 ? 'Perfect!' : '命中平台';
    } else {
      endGame();
    }
  }

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
