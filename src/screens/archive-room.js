export function archiveRoomScreen() {
  return `
    <main class="game-shell room-screen" aria-labelledby="room-title">
      <header class="room-header">
        <button class="header-button" type="button" data-navigate="home">← 大厅</button>
        <div class="room-heading">
          <h1 id="room-title">总论</h1>
          <p>会计档案室 · 场景骨架</p>
        </div>
        <div class="room-actions" aria-label="后续功能入口">
          <button class="header-button" type="button" disabled>手册</button>
          <button class="header-button" type="button" disabled>设置</button>
        </div>
      </header>

      <section class="archive-room" aria-label="空档案室场景">
        <div class="archive-room__wall">
          <div class="wall-sign wall-sign--room">会计档案室</div>
          <div class="window window--room"><span></span><span></span></div>
          <div class="shelf shelf--left">
            <span></span><span></span><span></span><span></span>
          </div>
          <div class="shelf shelf--middle">
            <span></span><span></span><span></span>
          </div>
          <div class="notice-board">待开放<br>章节资料</div>
          <div class="desk desk--room"><span>资料台账</span></div>
          <div class="plant plant--room"></div>
        </div>

        <div class="scene-status" role="status">
          <span class="scene-status__badge">第 1 天</span>
          <div>
            <strong>档案室场景已经搭好</strong>
            <p>人物、热点和对话将在第 2 天加入。</p>
          </div>
        </div>
      </section>

      <footer class="room-footer">
        <span>已进入空档案室</span>
        <span>场景 01 / 25</span>
      </footer>
    </main>
  `
}
