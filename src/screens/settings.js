export function settingsScreen() {
  return `
    <main class="game-shell" aria-labelledby="settings-title">
      <header class="room-header">
        <button class="header-button" type="button" data-navigate="home">← 首页</button>
        <div class="room-heading"><h1 id="settings-title">设置</h1></div>
        <button class="header-button" type="button" data-navigate="room">档案室</button>
      </header>
      <div class="trial-card settings-card">
        <fieldset class="settings-section">
          <legend>界面主题</legend>
          <label class="trial-option"><input type="radio" name="theme" value="light"> 浅色</label>
          <label class="trial-option"><input type="radio" name="theme" value="dark"> 深色</label>
        </fieldset>
        <section class="settings-section">
          <h2>存档</h2>
          <p>调查进度、学习记录和主题保存在此浏览器。导出文件可以用来备份或转移存档。</p>
          <button class="trial-button" type="button" data-save-export>导出存档</button>
          <form class="settings-actions" data-save-import>
            <label for="save-file">选择 JSON 存档</label>
            <input id="save-file" type="file" accept=".json,application/json" required>
            <button class="trial-button" type="submit">导入并替换当前存档</button>
          </form>
        </section>
        <section class="settings-section">
          <button class="header-button" type="button" data-reset-open>重新开始</button>
          <div data-reset-confirm hidden>
            <p>这会清空本机的调查进度和学习记录，并恢复浅色主题。</p>
            <div class="record-actions">
              <button class="trial-button" type="button" data-reset-run>确认清空</button>
              <button class="header-button" type="button" data-reset-cancel>取消</button>
            </div>
          </div>
        </section>
        <p role="status" data-save-status></p>
      </div>
    </main>
  `
}

export function setupSettings(root, save, applyTheme) {
  const status = root.querySelector('[data-save-status]')
  const radios = root.querySelectorAll('input[name="theme"]')
  const form = root.querySelector('[data-save-import]')
  const file = form.querySelector('input[type="file"]')
  const askReset = root.querySelector('[data-reset-open]')
  const confirmReset = root.querySelector('[data-reset-confirm]')
  const reset = root.querySelector('[data-reset-run]')

  function refreshTheme() {
    const theme = save.state.settings.theme
    applyTheme(theme)
    for (const radio of radios) radio.checked = radio.value === theme
  }

  function showStatus(message) { status.textContent = message }
  if (save.storageError) showStatus('无法读写本机存档。你可以用有效备份恢复。')
  refreshTheme()

  for (const radio of radios) radio.addEventListener('change', () => {
    if (!radio.checked) return
    save.setTheme(radio.value)
    refreshTheme()
    showStatus(save.storageError ? '主题已切换，浏览器未能保存。' : '主题已保存。')
  })

  root.querySelector('[data-save-export]').addEventListener('click', () => {
    const url = URL.createObjectURL(new Blob([save.exportText()], { type: 'application/json' }))
    const link = document.createElement('a')
    link.href = url
    link.download = `accounting-adventure-${new Date().toISOString().slice(0, 10)}.json`
    link.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  })

  form.addEventListener('submit', async event => {
    event.preventDefault()
    const selected = file.files[0]
    if (!selected) return
    const submit = form.querySelector('button')
    submit.disabled = true
    askReset.disabled = true
    reset.disabled = true
    try {
      if (selected.size > 15 * 1024 * 1024) throw new Error('请选择不超过 15 MB 的存档。')
      const text = await selected.text()
      if (!form.isConnected) return
      save.importText(text)
      refreshTheme()
      showStatus('存档已恢复。')
    } catch (error) {
      showStatus(`导入失败。当前存档保持原样。${error.message}`)
    } finally {
      submit.disabled = false
      askReset.disabled = false
      reset.disabled = false
      file.value = ''
    }
  })

  function closeReset() {
    askReset.hidden = false
    confirmReset.hidden = true
    askReset.focus()
  }

  askReset.addEventListener('click', () => {
    askReset.hidden = true
    confirmReset.hidden = false
    root.querySelector('[data-reset-cancel]').focus()
  })
  root.querySelector('[data-reset-cancel]').addEventListener('click', closeReset)
  reset.addEventListener('click', () => {
    try {
      save.reset()
      refreshTheme()
      closeReset()
      showStatus('已清空存档。')
    } catch (error) {
      showStatus(error.message)
    }
  })
}
