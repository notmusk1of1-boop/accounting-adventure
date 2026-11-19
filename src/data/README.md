# 内容数据目录

`game-content.json` 是当前游戏内容的编辑入口。修改后保存并刷新网页，就能看到新内容。

- `scene`：场景标题、提示语和底部文字。
- `characters`：人物姓名、身份、对话编号和位置。
- `hotspots`：可调查物品的名称、对话编号和点击区域。
- `anchor` 将调查框贴合现有物件，可选 `left-shelf`、`middle-shelf`、`notice-board`、`desk`；自定义点位可以改用 `position`。
- 热点可加 `card`，填写 `title` 和 `text`。角色抵达并打开调查后会在随身手册中解锁该卡。已调查的旧存档也会正确显示知识卡。
- `dialogues`：对话正文；每一项包含说话者 `speaker` 和文字 `text`。

第一章由 `game-content.json` 单独配置。第 2～25 章的标题和线索在 `chapter-index.json`，沿用通用档案室与核对流程。章节和调查点的 `id` 请保持稳定，存档靠它们识别进度。对白中的 `choices` 用 `label` 显示选项，并用 `next` 指向另一段对白；`event: "review"` 表示读完该句后完成核对。

想扩写某一章，可在该章的条目中添加 `scene`、`characters`、`hotspots` 或 `dialogues`，格式参考第一章。自定义对白按编号覆盖通用对白。每章至少需要一个调查点和一条可到达的核对白，玩家才能完成该章。

位置使用百分比，适合不同屏幕尺寸。例如 `"left": "7%"` 表示距离场景左侧 7%。编辑时请保留英文双引号、逗号和大括号。

`trial-questions.json` 是试炼题库。题目的 `chapterId` 对应章节的 `id`，`type` 使用 `single`（单选）或 `multiple`（多选）。`correct` 从 0 开始编号，例如 `[0, 2]` 表示第一个和第三个选项正确。`explanation` 是提交后显示的解析。发布前请重新构建。

`theme.json` 的 `light` 和 `dark` 控制两种主题的配色。素材放在 `public` 下，`assets` 中填写相对 `public` 的路径。可将 `roomBackground` 留为 `null` 使用现有场景背景。
