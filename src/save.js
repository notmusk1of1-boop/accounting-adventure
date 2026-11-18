import { chapterReady } from './chapters.js'

export const SAVE_KEY = 'accounting-adventure:save:v2'
const OLD_SAVE_KEY = 'accounting-adventure:save:v1'
const LEGACY_KEY = 'accounting-adventure:learning:v1'
const SCHEMA_VERSION = 2

function newSave(firstId) {
  return {
    schemaVersion: SCHEMA_VERSION,
    progress: { started: false, currentId: firstId, completed: [], chapters: {} },
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

function validVisits(visited) {
  return Array.isArray(visited) && visited.every(validId) && new Set(visited).size === visited.length
}

export function parseSave(text, chapters) {
  let data
  try { data = JSON.parse(text) } catch { throw new Error('文件不是有效的 JSON。') }
  if (![1, SCHEMA_VERSION].includes(data?.schemaVersion)) throw new Error('这个存档版本不受支持。')
  const invalid = () => { throw new Error('存档里的进度、设置或学习记录不完整。') }
  const firstId = chapters[0].scene.id
  let progress = data.progress
  if (!isObject(progress) || typeof progress.started !== 'boolean'
    || !['light', 'dark'].includes(data.settings?.theme) || !validLearning(data.learning)) invalid()

  if (data.schemaVersion === 1) {
    if (!validVisits(progress.visited) || (!progress.started && progress.visited.length)) invalid()
    progress = {
      ...newSave(firstId).progress,
      started: progress.started,
      chapters: progress.started ? { [firstId]: { visited: progress.visited, reviewed: false } } : {},
    }
  }
  const ids = chapters.map(chapter => chapter.scene.id)
  const { started, currentId, completed, chapters: savedChapters } = progress
  if (!Array.isArray(completed) || !completed.every((id, index) => id === ids[index])
    || completed.length > ids.length || !isObject(savedChapters)) invalid()
  const unlocked = ids.slice(0, completed.length + 1)
  if (!unlocked.includes(currentId) || (!started && (completed.length || Object.keys(savedChapters).length || currentId !== firstId))) invalid()
  const chapterProgress = {}
  for (const [id, value] of Object.entries(savedChapters)) {
    if (!unlocked.includes(id) || !isObject(value) || !validVisits(value.visited) || typeof value.reviewed !== 'boolean') invalid()
    const hotspots = chapters[ids.indexOf(id)].hotspots
    chapterProgress[id] = { visited: value.visited.filter(spotId => hotspots.some(spot => spot.id === spotId)), reviewed: value.reviewed }
  }
  if (completed.some(id => !chapterProgress[id]?.reviewed)) invalid()
  return {
    schemaVersion: SCHEMA_VERSION,
    progress: { started, currentId, completed, chapters: chapterProgress },
    settings: { theme: data.settings.theme },
    learning: data.learning,
  }
}

export function createSave(chapters, getStorage = () => window.localStorage) {
  const ids = chapters.map(chapter => chapter.scene.id)
  let state = newSave(ids[0])
  let storageError = false
  let protectStoredData = false
  try {
    const storage = getStorage()
    const saved = storage.getItem(SAVE_KEY)
    if (saved !== null) {
      state = parseSave(saved, chapters)
    } else {
      const earlierSave = storage.getItem(OLD_SAVE_KEY)
      const legacy = earlierSave === null ? storage.getItem(LEGACY_KEY) : null
      if (earlierSave !== null) {
        state = parseSave(earlierSave, chapters)
        storage.setItem(SAVE_KEY, JSON.stringify(state))
      } else if (legacy !== null) {
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

  function canEnter(id) {
    const index = ids.indexOf(id)
    return index >= 0 && index <= state.progress.completed.length
  }

  function getChapterProgress(id) {
    return state.progress.chapters[id] ?? { visited: [], reviewed: false }
  }

  function updateChapter(id, update) {
    state.progress.chapters[id] = { ...getChapterProgress(id), ...update }
    persist()
  }

  return {
    get state() { return state },
    get storageError() { return storageError },
    persist,
    canEnter,
    getChapterProgress,
    get resumeId() {
      const { currentId, completed } = state.progress
      return completed.includes(currentId) ? ids[completed.length] ?? currentId : currentId
    },
    enterRoom(id) {
      if (!canEnter(id)) return false
      if (state.progress.started && state.progress.currentId === id) return true
      state.progress.started = true
      state.progress.currentId = id
      persist()
      return true
    },
    visit(id, spotId) {
      const chapter = chapters[ids.indexOf(id)]
      if (state.progress.currentId !== id || !state.progress.started
        || !canEnter(id) || !chapter.hotspots.some(spot => spot.id === spotId)) return
      const { visited } = getChapterProgress(id)
      if (!visited.includes(spotId)) updateChapter(id, { visited: [...visited, spotId] })
    },
    review(id) {
      if (state.progress.started && state.progress.currentId === id
        && canEnter(id) && !getChapterProgress(id).reviewed) updateChapter(id, { reviewed: true })
    },
    finish(id) {
      const completed = state.progress.completed
      if (!canEnter(id) || ids[completed.length] !== id || !chapterReady(chapters[completed.length], getChapterProgress(id))) return false
      completed.push(id)
      persist()
      return true
    },
    setTheme(theme) {
      state.settings.theme = theme
      persist()
    },
    exportText() { return JSON.stringify(state, null, 2) },
    importText(text) { replace(parseSave(text, chapters)) },
    reset() { replace(newSave(ids[0])) },
  }
}
