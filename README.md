# 会计行者网页游戏

这是会计档案室文字冒险游戏的基础工程，包含 25 章顺序解锁、探索与对话、答题试炼、学习手册、存档和深浅主题。第一章有完整的调查和知识卡收集流程，第 2～25 章使用可扩写的示例线索。

## 本地运行

```powershell
npm.cmd install
npm.cmd run dev
```

终端显示本地地址后，用 Chrome 或 Edge 打开。进入档案室后点地板移动。点击档案或人物会走过去再互动。键盘可直接 Tab 到人物和档案，按 Enter 互动。

## 生产构建

```powershell
npm.cmd run build
npm.cmd test
npm.cmd run preview
```

## GitHub Pages 发布

项目已经配置自动发布。代码推送到 GitHub 的 `main` 分支后，GitHub Actions 会自动构建并发布 `dist` 目录。首次使用时，需要在仓库的 **Settings → Pages → Build and deployment** 中将 Source 设为 **GitHub Actions**。

## 当前目录

- `src/main.js`：网页入口。
- `src/app.js`：页面切换。
- `src/screens`：首页和档案室页面。
- `src/styles`：基础样式与游戏样式。
- `src/data`：后续章节、题目、角色和主题 JSON。

## 修改游戏内容

打开 `src/data/game-content.json` 编辑第一章人物、热点、对白和知识卡。后续章节使用 `src/data/chapter-index.json`。具体字段和示例见 `src/data/README.md`。
