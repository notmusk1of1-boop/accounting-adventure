import { isCorrect, selectQuestions } from '../trial.js'
import { action, element, noteEditor, storageStatus } from './controls.js'
import { campaignTrials } from '../story-content.js'
import chapterIndex from '../data/chapter-index.json' with { type: 'json' }

export function trialScreen() {
  return `
    <main class="game-shell trial-screen" aria-labelledby="trial-title">
      <header class="room-header">
        <button class="header-button" type="button" data-navigate="room">← 档案室</button>
        <div class="room-heading"><h1 id="trial-title">会计试炼</h1></div>
        <button class="header-button" type="button" data-navigate="handbook">手册</button>
      </header>
      <section class="trial-card" data-trial-content></section>
    </main>
  `
}

export function setupTrial(root, initialBank, records) {
  const bank = campaignTrials(initialBank, 'archive-room-01', chapterIndex)
  const card = root.querySelector('[data-trial-content]')
  let questions = []
  let index = 0
  let score = 0
  let mode

  function showModes(focus = false) {
    const title = element('h2', '选择练习方式', { tabindex: '-1' })
    const choices = element('div', '', { class: 'trial-actions' })
    const mixed = action('随机混题（10 题）', () => start('mixed'))
    mixed.disabled = bank.questions.length === 0
    choices.append(mixed)
    for (const chapter of bank.chapters) {
      const button = action(chapter.title, () => start(chapter.id))
      button.disabled = !bank.questions.some(question => question.chapterId === chapter.id)
      choices.append(button)
    }
    card.replaceChildren(title, choices)
    if (mixed.disabled) card.append(element('p', '题库暂无可用题目。'))
    if (focus) title.focus()
  }

  function start(chapterId) {
    questions = selectQuestions(bank.questions, chapterId)
    if (chapterId === 'mixed') questions = questions.slice(0, 10)
    index = 0
    score = 0
    mode = chapterId === 'mixed' ? '随机混题' : '按章练习'
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
      const entry = {
        questionId: question.id,
        prompt: question.prompt,
        chapter: bank.chapters.find(chapter => chapter.id === question.chapterId)?.title ?? question.chapterId,
        mode,
        selected: selected.map(answer => question.options[answer]),
        answers: question.correct.map(answer => question.options[answer]),
        explanation: question.explanation,
        correct,
      }
      records.recordAnswer(entry)
      submit.remove()
      const feedback = element('div', '', { class: 'trial-feedback', tabindex: '-1' })
      feedback.append(
        element('h3', correct ? '回答正确' : '回答错误'),
        element('p', `正确答案：${entry.answers.join('、')}`),
        element('p', `解析：${question.explanation}`),
      )
      const lastQuestion = index === questions.length - 1
      form.append(feedback, action(lastQuestion ? '查看成绩' : '下一题', () => {
        index += 1
        if (lastQuestion) showResult()
        else showQuestion()
      }))
      const status = element('p', storageStatus(records) || (correct ? '' : '已加入错题本'), { role: 'status' })
      const favorite = action('收藏本题', () => {
        records.toggleFavorite(entry)
        updateFavorite()
        status.textContent = storageStatus(records) || (isFavorite() ? '已收藏' : '已取消收藏')
      })
      const isFavorite = () => Object.hasOwn(records.state.favorites, entry.questionId)
      function updateFavorite() {
        favorite.textContent = isFavorite() ? '取消收藏' : '收藏本题'
      }
      updateFavorite()
      const note = noteEditor(records, entry, message => {
        status.textContent = storageStatus(records) || message
      })
      // The note has its own submit handler and must sit outside the answer form.
      card.append(favorite, note, status)
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
