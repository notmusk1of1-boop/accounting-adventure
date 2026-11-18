import { action, element } from './controls.js'

export function chapterListScreen(root, chapters, save, navigate) {
  root.innerHTML = `
    <main class="game-shell" aria-labelledby="chapter-list-title">
      <header class="room-header">
        <button class="header-button" type="button" data-navigate="home">← 首页</button>
        <div class="room-heading"><h1 id="chapter-list-title">章节目录</h1></div>
      </header>
      <div class="trial-card">
        <p data-chapters-summary></p>
        <ol class="chapter-list"></ol>
      </div>
    </main>
  `
  root.querySelector('[data-chapters-summary]').textContent =
    `已完成 ${save.state.progress.completed.length} / ${chapters.length} 章`
  const list = root.querySelector('.chapter-list')
  for (const [index, chapter] of chapters.entries()) {
    const { id, title } = chapter.scene
    const completed = save.state.progress.completed.includes(id)
    const unlocked = save.canEnter(id)
    const status = completed ? '已完成' : unlocked ? '可进入' : '未解锁'
    const button = action(`${index + 1}. ${title} · ${status}`, () => navigate(`room/${id}`))
    button.disabled = !unlocked
    const row = element('li', '')
    row.append(button)
    list.append(row)
  }
}
