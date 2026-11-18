import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { createChapters, knowledgeCards } from '../src/chapters.js'

const first = JSON.parse(readFileSync(new URL('../src/data/game-content.json', import.meta.url), 'utf8'))
const index = JSON.parse(readFileSync(new URL('../src/data/chapter-index.json', import.meta.url), 'utf8'))

test('all published chapters have valid dialogue links and knowledge cards', () => {
  const chapters = createChapters(first, index)
  assert.equal(chapters.length, 25)
  const locker = id => ({ visited: id === chapters[1].scene.id ? ['left-shelf'] : [] })
  const cards = knowledgeCards(chapters, locker)
  assert.equal(cards.length, 4)
  assert.ok(cards.every(card => !card.unlocked))
  const oldSave = id => ({ visited: id === first.scene.id ? ['left-shelf'] : [] })
  assert.equal(knowledgeCards(chapters, oldSave).filter(card => card.unlocked).length, 1)
})

test('config catches broken links and invalid cards before publishing', () => {
  const invalid = structuredClone(first)
  invalid.hotspots[0].card.text = ''
  assert.throws(() => createChapters(invalid, index), /知识卡/)
  invalid.hotspots[0].card = first.hotspots[0].card
  invalid.dialogues['mentor-intro'].at(-1).choices[0].next = 'missing'
  assert.throws(() => createChapters(invalid, index), /对话选项/)
})
