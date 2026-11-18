# 会计行者网页游戏

这是会计档案室文字冒险游戏的基础工程。目前包含首页、可互动档案室、人物、调查热点、基础对话和响应式布局。

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

## 修改游戏内容

打开 `src/data/game-content.json`，可以直接修改人物名称、场景提示、热点名称和对话文字。页面结构和对话功能不需要跟着修改。

## 第一天范围

- 已完成：首页、空档案室、返回首页、手机优先响应式布局。
- 当天暂未实现：对话、热点、章节、题库、存档和设置。

## 第二天范围

- 已完成：JSON 数据驱动、1 名人物、3 个调查热点、4 组基础对话、键盘与触屏操作。
- 暂未实现：人物移动、分支对话、答题、章节推进和存档。
