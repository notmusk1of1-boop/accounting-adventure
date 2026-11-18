import { homeScreen } from './screens/home.js'
import { archiveRoomScreen } from './screens/archive-room.js'
import { setupDialogue } from './dialogue.js'
import { setupTrial, trialScreen } from './screens/trial.js'
import { handbookScreen, setupHandbook } from './screens/handbook.js'
import { createLearningRecords } from './learning.js'
import { createSave } from './save.js'
import { applyTheme } from './theme.js'
import { settingsScreen, setupSettings } from './screens/settings.js'
import { createChapters, chapterReady } from './chapters.js'
import { chapterListScreen } from './screens/chapters.js'
import gameContent from './data/game-content.json'
import chapterIndex from './data/chapter-index.json'
import trialQuestions from './data/trial-questions.json'

const screens = {
  home: homeScreen,
  room: archiveRoomScreen,
  trial: trialScreen,
  handbook: handbookScreen,
  settings: settingsScreen,
}

function navigate(screen) {
  window.location.hash = screen === 'home' ? '' : screen
}

export function renderApp(root) {
  const chapters = createChapters(gameContent, chapterIndex)
  const save = createSave(chapters)
  const records = createLearningRecords(save)
  applyTheme(save.state.settings.theme)
  function render() {
    const [route, requestedId] = window.location.hash.slice(1).split('/')
    const chapterId = route === 'room' ? requestedId ?? save.resumeId : null
    let screen = Object.hasOwn(screens, route) || route === 'chapters' ? route : 'home'
    if (chapterId !== null && !save.enterRoom(chapterId)) screen = 'chapters'
    if (screen === 'chapters') chapterListScreen(root, chapters, save, navigate)
    else if (screen === 'room') {
      const chapter = chapters.find(item => item.scene.id === chapterId)
      root.innerHTML = archiveRoomScreen(save.getChapterProgress(chapterId), chapter)
      setupRoom(chapter, chapterId)
    } else root.innerHTML = screens[screen](save.state.progress)
    root.dataset.screen = screen

    root.querySelectorAll('[data-navigate]').forEach((button) => {
      button.addEventListener('click', () => navigate(button.dataset.navigate))
    })

    if (screen === 'trial') setupTrial(root, trialQuestions, records)
    if (screen === 'handbook') setupHandbook(root, records)
    if (screen === 'settings') setupSettings(root, save, applyTheme)
  }

  function setupRoom(chapter, id) {
    const status = root.querySelector('[data-chapter-goal]')
    const advance = root.querySelector('[data-chapter-advance]')
    const count = root.querySelector('[data-visited-count]')
    const saveStatus = root.querySelector('[data-room-save-status]')
    const nextId = chapters[chapters.indexOf(chapter) + 1]?.scene.id
    function update() {
      const progress = save.getChapterProgress(id)
      const completed = save.state.progress.completed.includes(id)
      advance.disabled = !completed && !chapterReady(chapter, progress)
      advance.textContent = completed ? (nextId ? '进入下一章' : '返回章节目录') : '完成本章'
      status.textContent = completed ? (nextId ? '本章已完成' : `${chapters.length} 章全部完成`)
        : !progress.reviewed ? '与周会计核对线索后可完成本章' : '核对完成，请调查剩余地点'
      if (!completed && chapterReady(chapter, progress)) status.textContent = '调查完成，可以完成本章'
      count.textContent = progress.visited.length
      saveStatus.hidden = !save.storageError
    }
    setupDialogue(root, chapter.dialogues, {
      onOpen(source) {
        if (!source.dataset.hotspotId) return
        save.visit(id, source.dataset.hotspotId)
        source.dataset.visited = 'true'
        source.querySelector('.scene-hotspot__marker').textContent = '✓'
        update()
      },
      onEvent(event) {
        if (event === 'review') save.review(id)
        update()
      },
    })
    advance.addEventListener('click', () => {
      if (!save.state.progress.completed.includes(id)) {
        save.finish(id)
        update()
      } else navigate(nextId ? `room/${nextId}` : 'chapters')
    })
    update()
  }

  window.addEventListener('hashchange', render)
  render()
}
