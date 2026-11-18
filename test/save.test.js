import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createLearningRecords } from '../src/learning.js'
import { createSave, SAVE_KEY } from '../src/save.js'

const ids = ['shelf', 'desk']
const chapters = [
  { scene: { id: 'first' }, hotspots: ids.map(id => ({ id })) },
  { scene: { id: 'second' }, hotspots: [{ id: 'shelf' }] },
]
const entry = {
  questionId: 'b1', prompt: '题干', chapter: '第一章', explanation: '解析',
  selected: ['A'], answers: ['B'], correct: false,
}

function memoryStorage(initial = []) {
  const values = new Map(initial)
  return {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  }
}

test('migrates existing learning records once and keeps the old backup', () => {
  const legacy = JSON.stringify({ wrong: { b1: entry }, favorites: {}, notes: {}, history: [] })
  const key = 'accounting-adventure:learning:v1'
  const storage = memoryStorage([[key, legacy]])
  assert.deepEqual(createSave(chapters, () => storage).state.learning.wrong.b1, entry)
  assert.equal(storage.getItem(key), legacy)
  assert.ok(storage.getItem(SAVE_KEY))
  const save = createSave(chapters, () => storage)
  save.reset()
  assert.deepEqual(createSave(chapters, () => storage).state.learning.wrong, {})
})

test('saves and reimports progress, learning records and theme together', () => {
  const storage = memoryStorage()
  const save = createSave(chapters, () => storage)
  const records = createLearningRecords(save)
  save.enterRoom('first')
  save.visit('first', 'shelf')
  save.visit('first', 'shelf')
  save.setTheme('dark')
  records.recordAnswer(entry)
  records.saveNote(entry, '我的笔记')
  const backup = save.exportText()
  assert.deepEqual(createSave(chapters, () => storage).state, JSON.parse(backup))
  save.reset()
  assert.equal(records.state.history.length, 0)
  save.importText(backup)
  assert.deepEqual(save.getChapterProgress('first').visited, ['shelf'])
  assert.equal(save.state.settings.theme, 'dark')
  assert.equal(records.state.notes.b1.text, '我的笔记')
})

test('invalid imports and write failures preserve the existing save', () => {
  const storage = memoryStorage()
  const save = createSave(chapters, () => storage)
  save.enterRoom('first')
  save.visit('first', 'desk')
  const before = storage.getItem(SAVE_KEY)
  const invalid = JSON.parse(before)
  invalid.learning.wrong.b1 = { questionId: 'b1' }
  for (const text of ['{', '{"schemaVersion":99}', JSON.stringify(invalid)]) {
    assert.throws(() => save.importText(text))
    assert.deepEqual(save.getChapterProgress('first').visited, ['desk'])
    assert.equal(storage.getItem(SAVE_KEY), before)
  }
  storage.setItem = () => { throw new Error('storage denied') }
  assert.throws(() => save.reset())
  assert.equal(storage.getItem(SAVE_KEY), before)
  assert.deepEqual(save.getChapterProgress('first').visited, ['desk'])
})

test('migrates version 1 progress and preserves the old file', () => {
  const key = 'accounting-adventure:save:v1'
  const old = JSON.stringify({
    schemaVersion: 1, progress: { started: true, visited: ['desk'] }, settings: { theme: 'dark' },
    learning: { wrong: { b1: entry }, favorites: {}, notes: {}, history: [] },
  })
  const storage = memoryStorage([[key, old]])
  const save = createSave(chapters, () => storage)
  assert.equal(save.state.schemaVersion, 2)
  assert.equal(save.state.settings.theme, 'dark')
  assert.deepEqual(save.getChapterProgress('first').visited, ['desk'])
  assert.deepEqual(save.state.learning.wrong.b1, entry)
  assert.equal(storage.getItem(key), old)
  save.reset()
  save.importText(old)
  assert.deepEqual(save.getChapterProgress('first').visited, ['desk'])
})

test('chapters unlock in sequence, keep separate visits and resume correctly', () => {
  const storage = memoryStorage()
  const save = createSave(chapters, () => storage)
  assert.equal(save.enterRoom('second'), false)
  assert.equal(save.enterRoom('first'), true)
  save.visit('first', 'shelf')
  save.review('first')
  assert.equal(save.finish('first'), false)
  save.visit('first', 'desk')
  assert.equal(save.finish('first'), true)
  assert.equal(save.resumeId, 'second')
  assert.equal(save.finish('first'), false)
  assert.equal(save.enterRoom('second'), true)
  assert.deepEqual(save.getChapterProgress('second').visited, [])
  save.visit('second', 'shelf')
  save.review('second')
  assert.equal(save.finish('second'), true)
  assert.equal(save.resumeId, 'second')
  assert.equal(createSave(chapters, () => storage).state.progress.completed.length, 2)
})
