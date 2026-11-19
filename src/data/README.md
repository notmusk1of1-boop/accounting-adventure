# 内容数据目录

`game-content.json` 是第一章的编辑入口。在本地开发模式下保存并刷新即可看到变化。

- `scene`：场景标题、提示语和底部文字。
- `characters`：人物姓名、身份、对话编号和位置。
- `hotspots`：可调查物品的名称、对话编号和点击区域。
- `anchor` 将调查框贴合现有物件，可选 `left-shelf`、`middle-shelf`、`notice-board`、`desk`；自定义点位可以改用 `position`。
- 热点可加 `card`，填写 `title` 和 `text`。角色抵达并打开调查后会在随身手册中解锁该卡。已调查的旧存档也会正确显示知识卡。
- `dialogues`：对话正文；每一项包含说话者 `speaker` 和文字 `text`。

第 2～25 章的标题与场景提示在 `chapter-index.json`。具体内容按章节号码分在 `story-02-09.json`、`story-10-17.json` 和 `story-18-25.json`。

- `intro`：周会计开始复核时说的话。
- `evidence`：调查点，依次使用场景里的书架、台账、告示与高书架。每项用 `label`、`line`、`cardTitle`、`cardText` 编辑名称、对白和知识卡。
- `review`：两条复核选项，每条用 `label` 和 `answer` 编辑。
- `questions`：两道本章练习题，填写 `type`、`prompt`、`options`、`correct` 与 `explanation`。

章节编号和调查点顺序请保持稳定，存档靠它们识别进度。第一章对白中的 `choices` 用 `label` 显示选项，并用 `next` 指向另一段对白；`event: "review"` 表示读完该句后完成核对。

想扩写某一章，可在该章的条目中添加 `scene`、`characters`、`hotspots` 或 `dialogues`，格式参考第一章。自定义对白按编号覆盖通用对白。每章至少需要一个调查点和一条可到达的核对白，玩家才能完成该章。

位置使用百分比，适合不同屏幕尺寸。例如 `"left": "7%"` 表示距离场景左侧 7%。编辑时请保留英文双引号、逗号和大括号。

`trial-questions.json` 保留原有总论与存货题。修改所有题目时，`type` 使用 `single`（单选）或 `multiple`（多选）。`correct` 从 0 开始编号，例如 `[0, 2]` 表示第一个和第三个选项正确。`explanation` 是提交后显示的解析。发布前请重新测试和构建。

`theme.json` 的 `light` 和 `dark` 控制两种主题的配色。素材放在 `public` 下，`assets` 中填写相对 `public` 的路径。可将 `roomBackground` 留为 `null` 使用现有场景背景。
