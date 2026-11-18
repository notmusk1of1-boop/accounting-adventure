export function selectQuestions(questions, chapterId, random = Math.random) {
  if (chapterId !== 'mixed') {
    return questions.filter(question => question.chapterId === chapterId)
  }

  const shuffled = [...questions]
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const other = Math.floor(random() * (index + 1))
    const question = shuffled[index]
    shuffled[index] = shuffled[other]
    shuffled[other] = question
  }
  return shuffled
}

export function isCorrect(question, selected) {
  const choices = new Set(selected)
  return choices.size === question.correct.length
    && question.correct.every(answer => choices.has(answer))
}
