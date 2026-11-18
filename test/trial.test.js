import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { isCorrect, selectQuestions } from '../src/trial.js'

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
