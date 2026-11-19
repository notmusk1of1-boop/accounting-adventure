import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { isCorrect, selectQuestions } from '../src/trial.js'
import { campaignTrials } from '../src/story-content.js'

const { questions, chapters } = JSON.parse(
  readFileSync(new URL('../src/data/trial-questions.json', import.meta.url), 'utf8'),
)

test('chapter selection uses only the matching chapter', () => {
  assert.deepEqual(selectQuestions(questions, 'basics').map(question => question.id), ['b1', 'b2'])
  assert.deepEqual(selectQuestions(questions, 'unknown'), [])
})

test('mixed selection changes order without duplicates or mutations', () => {
  const initialIds = questions.map(question => question.id)
  const mixedIds = selectQuestions(questions, 'mixed', () => 0).map(question => question.id)
  assert.notDeepEqual(mixedIds, initialIds)
  assert.deepEqual([...mixedIds].sort(), [...initialIds].sort())
  assert.deepEqual(questions.map(question => question.id), initialIds)
})

test('grading checks the exact answer set regardless of order', () => {
  assert.equal(isCorrect(questions[0], [0]), true)
  assert.equal(isCorrect(questions[0], [1]), false)
  assert.equal(isCorrect(questions[1], [1, 0]), true)
  assert.equal(isCorrect(questions[1], [0]), false)
  assert.equal(isCorrect(questions[1], [0, 1, 2]), false)
})

test('sample questions have valid chapter and answer references', () => {
  assert.equal(new Set(questions.map(question => question.id)).size, questions.length)
  for (const question of questions) {
    assert.ok(chapters.some(chapter => chapter.id === question.chapterId))
    assert.ok(question.correct.length > 0)
    assert.equal(new Set(question.correct).size, question.correct.length)
    assert.ok(question.correct.every(index => Number.isInteger(index) && index >= 0 && index < question.options.length))
    if (question.type === 'single') assert.equal(question.correct.length, 1)
  }
})

test('campaign puts single and multiple choice questions in all 25 actual chapters', () => {
  const index = JSON.parse(readFileSync(new URL('../src/data/chapter-index.json', import.meta.url), 'utf8'))
  const bank = campaignTrials({ chapters, questions }, 'archive-room-01', index)
  assert.equal(bank.chapters.length, 25)
  assert.equal(bank.questions.length, 52)
  assert.equal(new Set(bank.questions.map(({ id }) => id)).size, 52)
  assert.deepEqual(selectQuestions(bank.questions, 'archive-room-01').map(({ id }) => id), ['b1', 'b2'])
  assert.ok(selectQuestions(bank.questions, 'archive-room-05').some(({ id }) => id === 'i1'))
  for (const chapter of bank.chapters) {
    const chapterQuestions = selectQuestions(bank.questions, chapter.id)
    assert.deepEqual(new Set(chapterQuestions.map(({ type }) => type)), new Set(['single', 'multiple']))
    for (const question of chapterQuestions) {
      assert.ok(question.prompt.trim() && question.explanation.trim())
      assert.ok(question.options.length >= 3 && question.options.every(option => option.trim()))
      assert.equal(new Set(question.correct).size, question.correct.length)
      assert.ok(question.correct.every(i => Number.isInteger(i) && i >= 0 && i < question.options.length))
      if (question.type === 'single') assert.equal(question.correct.length, 1)
      if (question.type === 'multiple') assert.ok(question.correct.length > 1)
    }
  }
})
