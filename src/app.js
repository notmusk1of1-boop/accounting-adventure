import { homeScreen } from './screens/home.js'
import { archiveRoomScreen } from './screens/archive-room.js'

const screens = {
  home: homeScreen,
  room: archiveRoomScreen,
}

function currentScreen() {
  const route = window.location.hash.replace('#', '')
  return screens[route] ? route : 'home'
}

function navigate(screen) {
  window.location.hash = screen === 'home' ? '' : screen
}

export function renderApp(root) {
  function render() {
    const screen = currentScreen()
    root.innerHTML = screens[screen]()
    root.dataset.screen = screen

    root.querySelectorAll('[data-navigate]').forEach((button) => {
      button.addEventListener('click', () => navigate(button.dataset.navigate))
    })
  }

  window.addEventListener('hashchange', render)
  render()
}
