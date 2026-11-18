import { action } from './screens/controls.js'

function showLine(panel, line, index, total) {
  panel.querySelector('[data-dialogue-speaker]').textContent = line.speaker
  panel.querySelector('[data-dialogue-text]').textContent = line.text

  const nextButton = panel.querySelector('[data-dialogue-next]')
  nextButton.textContent = index === total - 1 ? '结束' : '继续'
  nextButton.setAttribute('aria-label', `${nextButton.textContent}，第 ${index + 1} 句，共 ${total} 句`)
}

export function setupDialogue(root, dialogues, { onOpen, onEvent } = {}) {
  const panel = root.querySelector('[data-dialogue-panel]')
  if (!panel) return

  let activeLines = []
  let activeIndex = 0
  let trigger = null
  const next = panel.querySelector('[data-dialogue-next]')
  const choices = panel.querySelector('[data-dialogue-choices]')

  function showCurrent() {
    const line = activeLines[activeIndex]
    showLine(panel, line, activeIndex, activeLines.length)
    choices.replaceChildren()
    next.hidden = Boolean(line.choices?.length)
    for (const choice of line.choices ?? []) {
      choices.append(action(choice.label, () => {
        activeLines = dialogues[choice.next]
        activeIndex = 0
        showCurrent()
      }))
    }
    const target = choices.firstElementChild ?? next
    target.focus()
  }

  function closeDialogue() {
    panel.hidden = true
    activeLines = []
    trigger?.focus()
    trigger = null
  }

  function openDialogue(dialogueId, source) {
    const lines = dialogues[dialogueId]
    if (!Array.isArray(lines) || lines.length === 0) return

    activeLines = lines
    activeIndex = 0
    trigger = source
    panel.hidden = false
    showCurrent()
    onOpen?.(source)
  }

  root.querySelectorAll('[data-dialogue-id]').forEach((element) => {
    element.addEventListener('click', () => openDialogue(element.dataset.dialogueId, element))
  })

  next.addEventListener('click', () => {
    const line = activeLines[activeIndex]
    if (!line || next.hidden) return
    if (line.event) onEvent?.(line.event)
    if (activeIndex >= activeLines.length - 1) {
      closeDialogue()
      return
    }

    activeIndex += 1
    showCurrent()
  })

  panel.querySelector('[data-dialogue-close]').addEventListener('click', closeDialogue)

  panel.closest('main').addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !panel.hidden) closeDialogue()
  })
}
