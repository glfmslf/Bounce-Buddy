# AGENTS.md

## 项目概览

- 这是一个使用 Vite 和 Three.js 构建的小型 3D 动画项目。
- 页面入口是 `index.html`。
- Three.js 场景、动画和交互逻辑集中在 `src/main.js`。
- 全局样式在 `src/styles.css`。

## 常用命令

- 安装依赖：`npm install`
- 启动开发服务：`npm run dev -- --port 5173`
- 构建生产包：`npm run build`

## 开发注意事项

- 优先保持实现简单直接，避免引入不必要的框架或复杂抽象。
- 修改动画时，优先在 `src/main.js` 中调整场景对象、运动参数、材质和渲染循环。
- 视觉修改完成后，只刷新当前浏览器页面；除非服务未运行，否则不要重新启动 Vite。
- 不要主动运行测试或构建，除非用户明确要求。
