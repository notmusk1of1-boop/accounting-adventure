import { homeScreen } from './screens/home.js'
import { archiveRoomScreen } from './screens/archive-room.js'
import { setupDialogue } from './dialogue.js'
import { setupTrial, trialScreen } from './screens/trial.js'
import { handbookScreen, setupHandbook } from './screens/handbook.js'
import { createLearningRecords } from './learning.js'
import { createSave } from './save.js'
import { applyTheme } from './theme.js'
import { settingsScreen, setupSettings } from './screens/settings.js'
import gameContent from './data/game-content.json'
import trialQuestions from './data/trial-questions.json'

const screens = {
  home: homeScreen,
  room: archiveRoomScreen,
  trial: trialScreen,
  handbook: handbookScreen,
  settings: settingsScreen,
}

function currentScreen() {
  const route = window.location.hash.replace('#', '')
  return Object.hasOwn(screens, route) ? route : 'home'
}

function navigate(screen) {
  window.location.hash = screen === 'home' ? '' : screen
}

export function renderApp(root) {
  const save = createSave(gameContent.hotspots.map(hotspot => hotspot.id))
  const records = createLearningRecords(save)
  applyTheme(save.state.settings.theme)
  function render() {
    const screen = currentScreen()
    if (screen === 'room') save.enterRoom()
    root.innerHTML = screens[screen](save.state.progress, gameContent)
    root.dataset.screen = screen
    const roomSaveStatus = root.querySelector('[data-room-save-status]')
    if (roomSaveStatus) roomSaveStatus.hidden = !save.storageError

    root.querySelectorAll('[data-navigate]').forEach((button) => {
      button.addEventListener('click', () => navigate(button.dataset.navigate))
    })

    if (screen === 'room') setupDialogue(root, gameContent.dialogues, source => {
      if (!source.dataset.hotspotId) return
      save.visit(source.dataset.hotspotId)
      source.dataset.visited = 'true'
      source.querySelector('.scene-hotspot__marker').textContent = '✓'
      root.querySelector('[data-visited-count]').textContent = save.state.progress.visited.length
      roomSaveStatus.hidden = !save.storageError
    })
    if (screen === 'trial') setupTrial(root, trialQuestions, records)
    if (screen === 'handbook') setupHandbook(root, records)
    if (screen === 'settings') setupSettings(root, save, applyTheme)
  }

  window.addEventListener('hashchange', render)
  render()
}
