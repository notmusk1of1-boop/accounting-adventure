# 会计行者网页游戏

这是会计档案室文字冒险游戏的第一天项目骨架。目前包含首页、空档案室场景和响应式布局。

## 本地运行

```powershell
npm.cmd install
npm.cmd run dev
```

终端显示本地地址后，用 Chrome 或 Edge 打开。点击“开始新的旅程”进入档案室，点击“大厅”返回首页。

## 生产构建

```powershell
npm.cmd run build
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

## 第一天范围

- 已完成：首页、空档案室、返回首页、手机优先响应式布局。
- 暂未实现：对话、热点、章节、题库、存档和设置。
