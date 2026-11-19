# 会计行者网页游戏

这是会计档案室文字冒险游戏。25 章均可调查、收集知识卡、核对线索并顺序解锁，最后以档案移交结案。试炼可按章练习或随机抽 10 题。手册包含 52 张知识卡，并可查看错题、收藏、笔记与答题历史。冒险进度和学习记录保存在当前浏览器。

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

打开 `src/data/game-content.json` 编辑第一章人物、热点、对白和知识卡。第 2～25 章在三个 `src/data/story-*.json` 文件内编辑剧情、知识卡和题目。章节标题和场景提示在 `src/data/chapter-index.json`。52 道题是游戏内的练习，不是中级会计考试完整题库。具体字段见 `src/data/README.md`。
