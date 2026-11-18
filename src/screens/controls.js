export function element(tag, label, attributes = {}) {
  const node = document.createElement(tag)
  for (const [key, value] of Object.entries(attributes)) node.setAttribute(key, value)
  node.textContent = label
  return node
}

export function action(label, handler) {
  const button = element('button', label, { type: 'button', class: 'trial-button' })
  button.addEventListener('click', handler)
  return button
}

export function storageStatus(records) {
  return records.storageError ? '浏览器未能保存学习记录，请检查存储权限或可用空间。' : ''
}

export function noteEditor(records, entry, onChange) {
  const form = element('form', '', { class: 'trial-form note-editor' })
  const label = element('label', '本题笔记')
  const input = element('textarea', '', { rows: '3', maxlength: '2000', required: '' })
  input.value = records.state.notes[entry.questionId]?.text ?? ''
  label.append(input)
  const submit = element('button', '保存笔记', { type: 'submit', class: 'trial-button' })
  form.append(label, submit)
  form.addEventListener('submit', event => {
    event.preventDefault()
    if (!input.value.trim()) {
      input.setCustomValidity('请输入笔记内容')
      input.reportValidity()
      return
    }
    records.saveNote(entry, input.value)
    input.value = records.state.notes[entry.questionId].text
    onChange('笔记已保存')
  })
  input.addEventListener('input', () => input.setCustomValidity(''))
  return form
}
