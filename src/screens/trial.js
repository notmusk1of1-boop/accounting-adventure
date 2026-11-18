import { isCorrect, selectQuestions } from '../trial.js'

export function trialScreen() {
  return `
    <main class="game-shell trial-screen" aria-labelledby="trial-title">
      <header class="room-header">
        <button class="header-button" type="button" data-navigate="room">← 档案室</button>
        <div class="room-heading"><h1 id="trial-title">会计试炼</h1></div>
      </header>
      <section class="trial-card" data-trial-content></section>
    </main>
  `
}

function element(tag, label, attributes = {}) {
  const node = document.createElement(tag)
  for (const [key, value] of Object.entries(attributes)) node.setAttribute(key, value)
  node.textContent = label
  return node
}

function action(label, handler) {
  const button = element('button', label, { type: 'button', class: 'trial-button' })
  button.addEventListener('click', handler)
  return button
}

export function setupTrial(root, bank) {
  const card = root.querySelector('[data-trial-content]')
  let questions = []
  let index = 0
  let score = 0

  function showModes(focus = false) {
    const title = element('h2', '选择练习方式', { tabindex: '-1' })
    const choices = element('div', '', { class: 'trial-actions' })
    for (const chapter of bank.chapters) {
      const button = action(chapter.title, () => start(chapter.id))
      button.disabled = !bank.questions.some(question => question.chapterId === chapter.id)
      choices.append(button)
    }
    const mixed = action('随机混题', () => start('mixed'))
    mixed.disabled = bank.questions.length === 0
    choices.append(mixed)
    card.replaceChildren(title, choices)
    if (mixed.disabled) card.append(element('p', '题库暂无可用题目。'))
    if (focus) title.focus()
  }

  function start(chapterId) {
    questions = selectQuestions(bank.questions, chapterId)
    index = 0
    score = 0
    showQuestion()
  }

  function showQuestion() {
    const question = questions[index]
    const title = element('h2', `第 ${index + 1} / ${questions.length} 题`, { tabindex: '-1' })
    const form = element('form', '', { class: 'trial-form' })
    const fieldset = element('fieldset', '')
    fieldset.append(element('legend', question.prompt))
    fieldset.append(element('p', question.type === 'multiple' ? '多选 · 请选择所有正确选项' : '单选 · 请选择一个选项'))
    const inputs = question.options.map((option, optionIndex) => {
      const input = element('input', '', {
        type: question.type === 'multiple' ? 'checkbox' : 'radio',
        name: 'answer',
        value: optionIndex,
      })
      const label = element('label', '', { class: 'trial-option' })
      label.append(input, element('span', option))
      fieldset.append(label)
      return input
    })
    const submit = element('button', '提交答案', { type: 'submit', class: 'trial-button' })
    submit.disabled = true
    form.append(fieldset, submit)
    form.addEventListener('change', () => { submit.disabled = !inputs.some(input => input.checked) })
    form.addEventListener('submit', event => {
      event.preventDefault()
      const selected = inputs.filter(input => input.checked).map(input => Number(input.value))
      if (fieldset.disabled || selected.length === 0) return
      fieldset.disabled = true
      const correct = isCorrect(question, selected)
      score += Number(correct)
      submit.remove()
      const feedback = element('div', '', { class: 'trial-feedback', tabindex: '-1' })
      feedback.append(
        element('h3', correct ? '回答正确' : '回答错误'),
        element('p', `正确答案：${question.correct.map(answer => question.options[answer]).join('、')}`),
        element('p', `解析：${question.explanation}`),
      )
      const lastQuestion = index === questions.length - 1
      form.append(feedback, action(lastQuestion ? '查看成绩' : '下一题', () => {
        index += 1
        if (lastQuestion) showResult()
        else showQuestion()
      }))
      feedback.focus()
    })
    card.replaceChildren(title, form)
    title.focus()
  }

  function showResult() {
    const title = element('h2', '试炼完成', { tabindex: '-1' })
    card.replaceChildren(
      title,
      element('p', `得分 ${score} / ${questions.length}（每题 1 分）`),
      element('p', `答对 ${score} 题 · 答错 ${questions.length - score} 题 · 正确率 ${Math.round(score / questions.length * 100)}%`),
      action('再练一轮', () => showModes(true)),
    )
    title.focus()
  }

  showModes()
}
