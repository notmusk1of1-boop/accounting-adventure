const preferenceKey = 'accounting-adventure:player-character'
const characters = { 'zhou-yuan': '周予安', 'lin-lan': '林澜' }
const defaultCharacter = 'zhou-yuan'
let selected = defaultCharacter

const alternate = id => id === defaultCharacter ? 'lin-lan' : defaultCharacter
const avatarLabel = id => `出纳${characters[id]}`
const buttonText = id => `角色：${characters[id]}`
const switchLabel = id => `切换角色（当前：${characters[id]}，切换到：${characters[alternate(id)]}）`

export function playerCharacter() {
  return `<div class="player-ip" role="img" data-player-character="${selected}" aria-label="${avatarLabel(selected)}"></div>`
}

export function characterSwitch() {
  return `<button class="header-button character-switch" type="button" data-character-switch aria-label="${switchLabel(selected)}">${buttonText(selected)}</button>`
}

export function setupPlayerCharacters(root) {
  try {
    const stored = window.localStorage.getItem(preferenceKey)
    if (Object.hasOwn(characters, stored)) selected = stored
  } catch {
    // The switch still works for this visit when browser storage is unavailable.
  }

  root.addEventListener('click', event => {
    const button = event.target.closest('[data-character-switch]')
    if (!button) return

    selected = alternate(selected)
    for (const sprite of root.querySelectorAll('[data-player-character]')) {
      sprite.dataset.playerCharacter = selected
      sprite.setAttribute('aria-label', avatarLabel(selected))
    }
    button.setAttribute('aria-label', switchLabel(selected))
    button.textContent = buttonText(selected)
    try {
      window.localStorage.setItem(preferenceKey, selected)
    } catch {
      // No game progress depends on saving the appearance preference.
    }
  })
}
