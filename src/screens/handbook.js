import { action, element, noteEditor, storageStatus } from './controls.js'

const sections = {
  wrong: '错题本',
  favorites: '题目收藏',
  notes: '试炼笔记',
  history: '答题历史',
}

export function handbookScreen() {
  return `
    <main class="game-shell" aria-labelledby="handbook-title">
      <header class="room-header">
        <button class="header-button" type="button" data-navigate="room">← 档案室</button>
        <div class="room-heading"><h1 id="handbook-title">随身手册</h1></div>
      </header>
      <div class="trial-card">
        <nav class="record-actions" aria-label="记录类型" data-record-tabs></nav>
        <p role="status" data-record-status></p>
        <section data-record-list></section>
      </div>
    </main>
  `
}

export function setupHandbook(root, records) {
  const tabs = root.querySelector('[data-record-tabs]')
  const list = root.querySelector('[data-record-list]')
  const status = root.querySelector('[data-record-status]')
  let active = 'wrong'

  function render(message = '', focus = false) {
    const heading = element('h2', sections[active], { tabindex: '-1' })
    status.textContent = storageStatus(records) || message
    list.replaceChildren(heading)
    const entries = Object.values(records.state[active])
    if (entries.length === 0) list.append(element('p', '还没有这类记录。'))
    for (const entry of entries) {
      const item = element('article', '', { class: 'trial-feedback record-item' })
      item.append(element('h3', entry.prompt), element('p', entry.chapter))
      if (active === 'history') {
        const time = new Date(entry.time).toLocaleString('zh-CN')
        item.append(element('p', [time, entry.mode, entry.correct ? '答对' : '答错'].filter(Boolean).join(' · ')))
      }
      if (active === 'wrong' || active === 'history') {
        item.append(element('p', `你的答案：${entry.selected.join('、')}`))
      }
      if (active === 'wrong' || active === 'favorites') {
        item.append(element('p', `正确答案：${entry.answers.join('、')}`), element('p', entry.explanation))
        const wrong = active === 'wrong'
        item.append(action(wrong ? '移出错题本' : '取消收藏', () => {
          if (wrong) records.removeWrong(entry.questionId)
          else records.toggleFavorite(entry)
          render(wrong ? '已移出错题本' : '已取消收藏', true)
        }))
      }
      if (active === 'notes') {
        item.append(noteEditor(records, entry, message => {
          status.textContent = storageStatus(records) || message
        }), action('删除笔记', () => {
          records.deleteNote(entry.questionId)
          render('已删除笔记', true)
        }))
      }
      list.append(item)
    }
    for (const button of tabs.children) button.setAttribute('aria-pressed', String(button.dataset.recordTab === active))
    if (focus) heading.focus()
  }

  for (const [key, label] of Object.entries(sections)) {
    const button = action(label, () => {
      active = key
      render()
    })
    button.dataset.recordTab = key
    tabs.append(button)
  }
  render()
}
