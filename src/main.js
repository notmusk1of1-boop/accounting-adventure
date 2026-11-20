import './styles/base.css'
import './styles/game.css'
import './styles/mentor-placement.css'
import './styles/player-ip.css'
import { renderApp } from './app.js'
import { setupPlayerCharacters } from './player-characters.js'

const root = document.querySelector('#app')
setupPlayerCharacters(root)
renderApp(root)
