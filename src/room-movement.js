const clamp = (value, min, max) => Math.max(min, Math.min(max, value))

export function setupRoomMovement(room) {
  const player = room.querySelector('[data-room-player]')
  let animation

  async function move(x, y) {
    const bounds = room.getBoundingClientRect()
    const current = player.getBoundingClientRect()
    const left = current.left + current.width / 2 - bounds.left
    const top = current.bottom - bounds.top
    animation?.cancel()
    delete player.dataset.walking
    const targetX = clamp(x, 28, bounds.width - 28)
    const targetY = clamp(y, bounds.height * .84, bounds.height - 18)
    player.style.left = `${targetX / bounds.width * 100}%`
    player.style.top = `${targetY / bounds.height * 100}%`
    animation = null
    const distance = Math.hypot(targetX - left, targetY - top)
    if (distance < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return true
    const walking = player.animate([
      { left: `${left}px`, top: `${top}px` },
      { left: `${targetX}px`, top: `${targetY}px` },
    ], { duration: clamp(distance * 1.65, 140, 650), easing: 'ease-out' })
    animation = walking
    player.dataset.walking = 'true'
    try {
      await walking.finished
      return player.isConnected && animation === walking
    } catch {
      return false
    } finally {
      if (animation === walking) {
        animation = null
        delete player.dataset.walking
      }
    }
  }

  const dialogue = room.querySelector('[data-dialogue-panel]')
  room.addEventListener('click', event => {
    if (!dialogue.hidden || event.target.closest('button, [data-dialogue-panel]')) return
    const bounds = room.getBoundingClientRect()
    if (event.clientY - bounds.top < bounds.height * .82) return
    void move(event.clientX - bounds.left, event.clientY - bounds.top)
  })

  room.addEventListener('keydown', event => {
    if (event.target !== room || !dialogue.hidden) return
    const step = { ArrowLeft: [-30, 0], ArrowRight: [30, 0], ArrowUp: [0, -24], ArrowDown: [0, 24] }[event.key]
    if (!Array.isArray(step)) return
    event.preventDefault()
    const bounds = room.getBoundingClientRect()
    const current = player.getBoundingClientRect()
    void move(current.left + current.width / 2 - bounds.left + step[0], current.bottom - bounds.top + step[1])
  })

  return source => {
    const bounds = room.getBoundingClientRect()
    const target = source.getBoundingClientRect()
    return move(target.left + target.width / 2 - bounds.left, bounds.height * .85)
  }
}
