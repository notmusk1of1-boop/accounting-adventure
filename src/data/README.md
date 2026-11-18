# 内容数据目录

`game-content.json` 是当前游戏内容的编辑入口。修改后保存并刷新网页，就能看到新内容。

- `scene`：场景标题、提示语和底部文字。
- `characters`：人物姓名、身份、对话编号和位置。
- `hotspots`：可调查物品的名称、对话编号和点击区域。
- `dialogues`：对话正文；每一项包含说话者 `speaker` 和文字 `text`。

位置使用百分比，适合不同屏幕尺寸。例如 `"left": "7%"` 表示距离场景左侧 7%。编辑时请保留英文双引号、逗号和大括号。

`trial-questions.json` 是试炼题库。题目的 `chapterId` 对应章节的 `id`，`type` 使用 `single`（单选）或 `multiple`（多选）。`correct` 从 0 开始编号，例如 `[0, 2]` 表示第一个和第三个选项正确。`explanation` 是提交后显示的解析。发布前请重新构建。

`theme.json` 的 `light` 和 `dark` 控制两种主题的配色。素材放在 `public` 下，`assets` 中填写相对 `public` 的路径。可将 `roomBackground` 留为 `null` 使用现有场景背景。
