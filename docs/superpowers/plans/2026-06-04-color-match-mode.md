# 颜色匹配模式实现计划

> **给 agentic workers：** 推荐使用 `superpowers:executing-plans` 按任务逐项执行本计划。步骤使用 checkbox（`- [ ]`）语法用于跟踪。

**目标：** 在现有三轨跳跃游戏中加入“同色可落、彩虹换色”的颜色匹配玩法。

**架构：** 保持现有单文件 Three.js 结构，不拆分框架层。将平台数据从单个横向坐标扩展为结构化对象，颜色规则集中在少量 helper 中，动画循环继续负责渲染和落点判定。

**技术栈：** Vite、Three.js、原生 DOM、CSS。

---

## 文件结构

- 修改 `src/main.js`：新增颜色配置、平台数据结构、颜色判定、彩虹换色、材质更新和失败原因提示。
- 修改 `index.html`：更新初始提示文案，让玩家知道新规则。
- 修改 `src/styles.css`：补充当前颜色提示的轻量 HUD 样式。
- 不新增测试文件：项目没有测试框架，且 AGENTS 明确要求不要主动运行测试或构建。

---

### 任务 1：更新 HUD 文案与当前颜色展示

**文件：**
- 修改：`index.html`
- 修改：`src/styles.css`
- 修改：`src/main.js`

- [ ] **步骤 1：在 `index.html` 增加当前颜色显示**

将 `.best-score-board` 后面的消息区域改为：

```html
<div class="color-status" aria-label="当前小球颜色">
  <span>当前颜色</span>
  <strong class="current-color-value">红色</strong>
</div>
<p class="game-message">只能落到同色平台；彩虹平台会换色</p>
```

- [ ] **步骤 2：在 `src/styles.css` 增加颜色状态样式**

在 `.best-score-board strong` 后加入：

```css
.color-status {
  display: grid;
  justify-items: center;
  gap: 3px;
  color: rgba(223, 248, 255, 0.78);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.color-status span {
  font-size: 11px;
}

.color-status strong {
  color: #ff6b6b;
  font-size: 18px;
  line-height: 1;
  text-shadow: 0 0 18px rgba(255, 107, 107, 0.45);
}
```

在 `body.is-playing .best-score-board strong` 后加入：

```css
body.is-playing .color-status {
  opacity: 0.9;
}

body.is-playing .color-status strong {
  font-size: 16px;
}
```

- [ ] **步骤 3：在 `src/main.js` 读取颜色状态 DOM**

在现有 DOM 查询附近加入：

```js
const currentColorValue = document.querySelector('.current-color-value');
```

- [ ] **步骤 4：手动验证 HUD 初始状态**

刷新 `http://127.0.0.1:5173/`。
预期：HUD 显示“当前颜色 / 红色”，提示文案为“只能落到同色平台；彩虹平台会换色”。

---

### 任务 2：增加颜色配置与球体换色函数

**文件：**
- 修改：`src/main.js`

- [ ] **步骤 1：在 `starPalette` 后加入玩法颜色配置**

```js
const gameColors = {
  red: {
    label: '红色',
    ball: 0x5d1824,
    emissive: 0xff3f5f,
    pad: 0x6d1228,
    edge: 0xff9aac,
  },
  blue: {
    label: '蓝色',
    ball: 0x183c6d,
    emissive: 0x29d7ff,
    pad: 0x123b6d,
    edge: 0xa6f6ff,
  },
  yellow: {
    label: '黄色',
    ball: 0x625018,
    emissive: 0xffd257,
    pad: 0x6d5212,
    edge: 0xffef9a,
  },
};

const colorOrder = ['red', 'blue', 'yellow'];
const wildcardPad = {
  label: '彩虹',
  pad: 0xf4fbff,
  emissive: 0xffffff,
  edge: 0xffffff,
};
```

- [ ] **步骤 2：增加当前球颜色状态**

在 `let score = 0;` 附近加入：

```js
let currentBallColor = 'red';
```

- [ ] **步骤 3：增加小球颜色更新函数**

在 `setScore` 后加入：

```js
function setBallColor(colorKey) {
  currentBallColor = colorKey;
  const color = gameColors[colorKey];

  ballMaterial.color.setHex(color.ball);
  ballMaterial.emissive.setHex(color.emissive);
  currentColorValue.textContent = color.label;
  currentColorValue.style.color = `#${color.emissive.toString(16).padStart(6, '0')}`;
  currentColorValue.style.textShadow = `0 0 18px #${color.emissive
    .toString(16)
    .padStart(6, '0')}`;
}
```

- [ ] **步骤 4：在重开时恢复红色**

在 `resetGame()` 的 `setScore(0);` 后加入：

```js
setBallColor('red');
```

在 `setSpeedLevel(selectedSpeedLevel);` 前加入：

```js
setBallColor(currentBallColor);
```

- [ ] **步骤 5：手动验证球体颜色**

刷新页面后点击开始。
预期：小球和 HUD 当前颜色都是红色；重新开始后仍恢复红色。

---

### 任务 3：把平台布局扩展为带颜色的平台数据

**文件：**
- 修改：`src/main.js`

- [ ] **步骤 1：替换平台布局初始值**

将：

```js
const platformLayout = new Map([[0, 0]]);
```

替换为：

```js
const platformLayout = new Map([
  [0, { x: 0, type: 'normal', color: 'red', nextColor: null }],
]);
```

- [ ] **步骤 2：新增平台生成 helper**

将 `getPlatformX(index)` 替换为：

```js
function getNextColor(colorKey) {
  const currentIndex = colorOrder.indexOf(colorKey);
  return colorOrder[(currentIndex + 1 + Math.floor(Math.random() * 2)) % colorOrder.length];
}

function createPlatformData(index) {
  const previousPlatform = getPlatformData(index - 1);
  const candidates = lanePositions.filter((x) => Math.abs(x - previousPlatform.x) <= 2.4);
  const x = candidates[Math.floor(Math.random() * candidates.length)];
  const shouldCreateWildcard = index > 1 && index % 4 === 0;

  if (shouldCreateWildcard) {
    return {
      x,
      type: 'wildcard',
      color: previousPlatform.color,
      nextColor: getNextColor(previousPlatform.color),
    };
  }

  return {
    x,
    type: 'normal',
    color: previousPlatform.nextColor ?? previousPlatform.color,
    nextColor: null,
  };
}

function getPlatformData(index) {
  if (!platformLayout.has(index)) {
    platformLayout.set(index, createPlatformData(index));
  }

  return platformLayout.get(index);
}

function getPlatformX(index) {
  return getPlatformData(index).x;
}
```

- [ ] **步骤 3：更新重开时的平台初始数据**

将 `resetGame()` 里的：

```js
platformLayout.set(0, 0);
```

替换为：

```js
platformLayout.set(0, { x: 0, type: 'normal', color: 'red', nextColor: null });
```

- [ ] **步骤 4：手动验证平台仍然生成**

刷新页面后点击开始。
预期：平台继续沿三条轨道向远处生成，小球仍能跳跃，控制无报错。

---

### 任务 4：按平台类型渲染颜色和彩虹落点

**文件：**
- 修改：`src/main.js`

- [ ] **步骤 1：给每个平台保存 edge 引用**

在创建 landing pad 的循环里，将：

```js
pad.userData.body = body;
```

替换为：

```js
pad.userData.body = body;
pad.userData.edges = edges;
```

- [ ] **步骤 2：增加平台材质更新函数**

在 `createImpact` 前加入：

```js
function applyPlatformVisual(pad, platform, isCurrentTarget) {
  const bodyMaterial = pad.userData.body.material;
  const edgeMaterial = pad.userData.edges.material;

  if (platform.type === 'wildcard') {
    bodyMaterial.color.setHex(wildcardPad.pad);
    bodyMaterial.emissive.setHex(wildcardPad.emissive);
    bodyMaterial.emissiveIntensity = isCurrentTarget ? 1.55 : 1.05;
    bodyMaterial.opacity = 0.9;
    edgeMaterial.color.setHex(gameColors[platform.nextColor].edge);
    edgeMaterial.opacity = isCurrentTarget ? 1 : 0.86;
    return;
  }

  const color = gameColors[platform.color];
  bodyMaterial.color.setHex(color.pad);
  bodyMaterial.emissive.setHex(color.emissive);
  bodyMaterial.emissiveIntensity = isCurrentTarget ? 1.2 : 0.75;
  bodyMaterial.opacity = 0.82;
  edgeMaterial.color.setHex(color.edge);
  edgeMaterial.opacity = isCurrentTarget ? 0.92 : 0.72;
}
```

- [ ] **步骤 3：在动画循环中应用平台颜色**

在 landing pad 循环里，将：

```js
const padX = getPlatformX(landingIndex);
```

替换为：

```js
const platform = getPlatformData(landingIndex);
const padX = platform.x;
```

将：

```js
pad.userData.body.material.emissiveIntensity = isCurrentTarget ? 1.2 : 0.75;
```

替换为：

```js
applyPlatformVisual(pad, platform, isCurrentTarget);
```

- [ ] **步骤 4：手动验证平台颜色**

刷新页面观察前方平台。
预期：普通平台显示红/蓝/黄之一；第 4、8、12 等落点附近会出现更亮的彩虹平台。

---

### 任务 5：加入颜色命中判定和换色

**文件：**
- 修改：`src/main.js`

- [ ] **步骤 1：增加平台有效性判断 helper**

在 `shiftTargetLane` 后加入：

```js
function isColorValid(platform) {
  return platform.type === 'wildcard' || platform.color === currentBallColor;
}

function isLandingValid(platform, x) {
  return Math.abs(x - platform.x) <= platformHalfWidth && isColorValid(platform);
}
```

- [ ] **步骤 2：更新目标提示环判定**

将：

```js
const nextPlatformX = getPlatformX(nextLandingIndex);
const targetWillLand = Math.abs(targetBallX - nextPlatformX) <= platformHalfWidth;
```

替换为：

```js
const nextPlatform = getPlatformData(nextLandingIndex);
const targetWillLand = isLandingValid(nextPlatform, targetBallX);
```

- [ ] **步骤 3：更新落地判定**

将落地判定块里的：

```js
const platformX = getPlatformX(landingIndex);
const landed = Math.abs(ballX - platformX) <= platformHalfWidth;
```

替换为：

```js
const platform = getPlatformData(landingIndex);
const onPlatform = Math.abs(ballX - platform.x) <= platformHalfWidth;
const landed = onPlatform && isColorValid(platform);
```

- [ ] **步骤 4：有效落地后处理彩虹换色**

将：

```js
gameMessage.textContent = Math.abs(ballX - platformX) < 0.36 ? 'Perfect!' : '命中平台';
```

替换为：

```js
if (platform.type === 'wildcard') {
  setBallColor(platform.nextColor);
  gameMessage.textContent = `彩虹换色：${gameColors[platform.nextColor].label}`;
} else {
  gameMessage.textContent = Math.abs(ballX - platform.x) < 0.36 ? 'Perfect!' : '命中平台';
}
```

- [ ] **步骤 5：失败时显示原因**

将：

```js
} else {
  endGame();
}
```

替换为：

```js
} else {
  endGame(onPlatform ? '颜色不匹配' : '没有落到平台');
}
```

将 `endGame()` 定义改为：

```js
function endGame(reason = '') {
  isGameRunning = false;
  isGameOver = true;
  document.body.classList.add('is-game-over');
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
```

- [ ] **步骤 6：手动验证颜色规则**

刷新 `http://127.0.0.1:5173/`，点击开始。
预期：

- 红球落红色普通平台有效。
- 红球落蓝色或黄色普通平台时失败，提示“颜色不匹配”。
- 落到彩虹平台时加分，并把当前颜色改成彩虹平台指定的新颜色。
- 目标提示环在颜色不匹配时变粉色。

---

### 任务 6：收尾检查

**文件：**
- 检查：`index.html`
- 检查：`src/styles.css`
- 检查：`src/main.js`
- 检查：`docs/superpowers/specs/2026-06-04-color-match-mode-design.md`

- [ ] **步骤 1：检查工作区改动**

运行：

```bash
git diff -- index.html src/styles.css src/main.js
git status --short
```

预期：只包含颜色匹配模式相关改动。

- [ ] **步骤 2：浏览器完整冒烟验证**

如果 `http://127.0.0.1:5173/` 已运行，刷新页面并完成至少一次开始、切轨、有效落地、失败或重开流程。

预期：页面无明显渲染空白；HUD、分数、最佳分数、速度选择、方向键切轨和颜色规则都正常。

- [ ] **步骤 3：按项目约束避免主动构建**

不要运行：

```bash
npm run build
```

除非用户明确要求。

- [ ] **步骤 4：提交实现改动**

运行：

```bash
git add index.html src/styles.css src/main.js
git commit -m "实现颜色匹配跳点模式"
```
