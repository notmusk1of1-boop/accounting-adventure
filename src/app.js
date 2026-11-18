import { homeScreen } from './screens/home.js'
import { archiveRoomScreen } from './screens/archive-room.js'
import { setupDialogue } from './dialogue.js'
import { setupTrial, trialScreen } from './screens/trial.js'
import { handbookScreen, setupHandbook } from './screens/handbook.js'
import { createLearningRecords } from './learning.js'
import gameContent from './data/game-content.json'
import trialQuestions from './data/trial-questions.json'

const screens = {
  home: homeScreen,
  room: () => archiveRoomScreen(gameContent),
  trial: trialScreen,
  handbook: handbookScreen,
}

function currentScreen() {
  const route = window.location.hash.replace('#', '')
  return Object.hasOwn(screens, route) ? route : 'home'
}

function navigate(screen) {
  window.location.hash = screen === 'home' ? '' : screen
}

export function renderApp(root) {
  const records = createLearningRecords()
  function render() {
    const screen = currentScreen()
    root.innerHTML = screens[screen]()
    root.dataset.screen = screen

    root.querySelectorAll('[data-navigate]').forEach((button) => {
      button.addEventListener('click', () => navigate(button.dataset.navigate))
    })

    if (screen === 'room') setupDialogue(root, gameContent.dialogues)
    if (screen === 'trial') setupTrial(root, trialQuestions, records)
    if (screen === 'handbook') setupHandbook(root, records)
  }

  window.addEventListener('hashchange', render)
  render()
}
