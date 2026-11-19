import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { chapterReady, createChapters, knowledgeCards } from '../src/chapters.js'

const first = JSON.parse(readFileSync(new URL('../src/data/game-content.json', import.meta.url), 'utf8'))
const index = JSON.parse(readFileSync(new URL('../src/data/chapter-index.json', import.meta.url), 'utf8'))

test('all published chapters have valid dialogue links and knowledge cards', () => {
  const chapters = createChapters(first, index)
  assert.equal(chapters.length, 25)
  const locker = id => ({ visited: id === chapters[1].scene.id ? ['left-shelf'] : [] })
  const cards = knowledgeCards(chapters, locker)
  assert.equal(cards.length, 52)
  assert.deepEqual(cards.filter(card => card.unlocked).map(card => card.chapter), [chapters[1].scene.title])
  const oldSave = id => ({ visited: id === first.scene.id ? ['left-shelf'] : [] })
  assert.equal(knowledgeCards(chapters, oldSave).filter(card => card.unlocked).length, 1)
})

test('every story chapter requires its own evidence and has two working review branches', () => {
  const chapters = createChapters(first, index)
  for (const chapter of chapters.slice(1)) {
    const visited = chapter.hotspots.map(spot => spot.id)
    assert.equal(visited[0], 'left-shelf')
    assert.equal(chapterReady(chapter, { visited, reviewed: false }), false)
    assert.equal(chapterReady(chapter, { visited: visited.slice(0, -1), reviewed: true }), false)
    assert.equal(chapterReady(chapter, { visited, reviewed: true }), true)
    const choices = chapter.dialogues['mentor-intro'].at(-1).choices
    assert.equal(choices.length, 2)
    for (const choice of choices) assert.equal(chapter.dialogues[choice.next].at(-1).event, 'review')
  }
})

test('config catches broken links and invalid cards before publishing', () => {
  const invalid = structuredClone(first)
  invalid.hotspots[0].card.text = ''
  assert.throws(() => createChapters(invalid, index), /知识卡/)
  invalid.hotspots[0].card = first.hotspots[0].card
  invalid.dialogues['mentor-intro'].at(-1).choices[0].next = 'missing'
  assert.throws(() => createChapters(invalid, index), /对话选项/)
})
