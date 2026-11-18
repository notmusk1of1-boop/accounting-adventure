import themes from './data/theme.json'

export function applyTheme(theme) {
  const root = document.documentElement
  root.dataset.theme = theme
  root.style.colorScheme = theme
  for (const [name, value] of Object.entries(themes[theme])) {
    root.style.setProperty(`--${name}`, value)
  }
  const icon = document.querySelector('link[rel="icon"]')
  if (icon) icon.href = import.meta.env.BASE_URL + themes.assets.favicon
  const image = themes.assets.roomBackground
  if (image) root.style.setProperty('--room-image', `url("${import.meta.env.BASE_URL + image}")`)
}
