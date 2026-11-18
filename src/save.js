export const SAVE_KEY = 'accounting-adventure:save:v1'
const LEGACY_KEY = 'accounting-adventure:learning:v1'
const SCHEMA_VERSION = 1

function newSave() {
  return {
    schemaVersion: SCHEMA_VERSION,
    progress: { started: false, visited: [] },
    settings: { theme: 'light' },
    learning: { wrong: {}, favorites: {}, notes: {}, history: [] },
  }
}

const isObject = value => value !== null && typeof value === 'object' && !Array.isArray(value)
const isText = value => typeof value === 'string'
const isTextList = value => Array.isArray(value) && value.every(isText)
const validId = id => isText(id) && /^[a-z0-9][a-z0-9_-]*$/i.test(id) && !Object.hasOwn(Object.prototype, id)

function validEntry(entry) {
  return isObject(entry) && validId(entry.questionId)
    && [entry.prompt, entry.chapter, entry.explanation].every(isText)
    && isTextList(entry.selected) && isTextList(entry.answers)
    && typeof entry.correct === 'boolean'
    && (entry.mode === undefined || isText(entry.mode))
}

function validGroup(group, check = () => true) {
  return isObject(group) && Object.entries(group).every(([id, entry]) =>
    validEntry(entry) && id === entry.questionId && check(entry))
}

function validLearning(learning) {
  return isObject(learning) && validGroup(learning.wrong, entry => !entry.correct)
    && validGroup(learning.favorites)
    && validGroup(learning.notes, entry => isText(entry.text) && entry.text.trim().length > 0 && entry.text.length <= 2000)
    && Array.isArray(learning.history) && learning.history.every(entry =>
      validEntry(entry) && isText(entry.time) && Number.isFinite(Date.parse(entry.time)))
}

export function parseSave(text, hotspotIds) {
  let data
  try { data = JSON.parse(text) } catch { throw new Error('文件不是有效的 JSON。') }
  if (data?.schemaVersion !== SCHEMA_VERSION) throw new Error('这个存档版本不受支持。')
  if (!isObject(data.progress) || typeof data.progress.started !== 'boolean'
    || !Array.isArray(data.progress.visited) || !data.progress.visited.every(validId)
    || new Set(data.progress.visited).size !== data.progress.visited.length
    || (!data.progress.started && data.progress.visited.length > 0)
    || !['light', 'dark'].includes(data.settings?.theme)
    || !validLearning(data.learning)) {
    throw new Error('存档里的进度、设置或学习记录不完整。')
  }
  return {
    schemaVersion: SCHEMA_VERSION,
    progress: {
      started: data.progress.started,
      visited: data.progress.visited.filter(id => hotspotIds.includes(id)),
    },
    settings: { theme: data.settings.theme },
    learning: data.learning,
  }
}

export function createSave(hotspotIds, getStorage = () => window.localStorage) {
  let state = newSave()
  let storageError = false
  let protectStoredData = false
  try {
    const storage = getStorage()
    const saved = storage.getItem(SAVE_KEY)
    if (saved !== null) {
      state = parseSave(saved, hotspotIds)
    } else {
      const legacy = storage.getItem(LEGACY_KEY)
      if (legacy !== null) {
        const learning = JSON.parse(legacy)
        if (!validLearning(learning)) throw new Error('旧学习记录格式不完整。')
        state.learning = learning
        storage.setItem(SAVE_KEY, JSON.stringify(state))
      }
    }
  } catch {
    storageError = true
    protectStoredData = true
  }

  function write(next) {
    getStorage().setItem(SAVE_KEY, JSON.stringify(next))
  }

  function persist() {
    if (protectStoredData) return
    try {
      write(state)
      storageError = false
    } catch {
      storageError = true
    }
  }

  function replace(next) {
    try { write(next) } catch { throw new Error('浏览器无法写入存档，请检查存储权限和剩余空间。') }
    state = next
    storageError = false
    protectStoredData = false
  }

  return {
    get state() { return state },
    get storageError() { return storageError },
    persist,
    enterRoom() {
      if (state.progress.started) return
      state.progress.started = true
      persist()
    },
    visit(id) {
      if (!hotspotIds.includes(id) || state.progress.visited.includes(id)) return
      state.progress.started = true
      state.progress.visited.push(id)
      persist()
    },
    setTheme(theme) {
      state.settings.theme = theme
      persist()
    },
    exportText() { return JSON.stringify(state, null, 2) },
    importText(text) { replace(parseSave(text, hotspotIds)) },
    reset() { replace(newSave()) },
  }
}
