const storageKey = 'accounting-adventure:learning:v1'

export function createLearningRecords(getStorage = () => window.localStorage) {
  let state = { wrong: {}, favorites: {}, notes: {}, history: [] }
  let storageError = false
  try {
    const saved = getStorage().getItem(storageKey)
    if (saved) {
      const data = JSON.parse(saved)
      for (const group of ['wrong', 'favorites', 'notes']) {
        if (data?.[group] && typeof data[group] === 'object' && !Array.isArray(data[group])) {
          state[group] = data[group]
        }
      }
      if (Array.isArray(data?.history)) state.history = data.history
    }
  } catch {
    storageError = true
  }

  function save() {
    try {
      getStorage().setItem(storageKey, JSON.stringify(state))
      storageError = false
    } catch {
      storageError = true
    }
  }

  return {
    get state() { return state },
    get storageError() { return storageError },
    recordAnswer(entry) {
      state.history.unshift({ ...entry, time: new Date().toISOString() })
      if (!entry.correct) state.wrong[entry.questionId] = entry
      save()
    },
    removeWrong(id) {
      delete state.wrong[id]
      save()
    },
    toggleFavorite(entry) {
      const id = entry.questionId
      if (Object.hasOwn(state.favorites, id)) delete state.favorites[id]
      else state.favorites[id] = entry
      save()
    },
    saveNote(entry, text) {
      if (!text.trim()) return
      state.notes[entry.questionId] = { ...entry, text: text.trim() }
      save()
    },
    deleteNote(id) {
      delete state.notes[id]
      save()
    },
  }
}
