export function createLearningRecords(save) {
  return {
    get state() { return save.state.learning },
    get storageError() { return save.storageError },
    recordAnswer(entry) {
      this.state.history.unshift({ ...entry, time: new Date().toISOString() })
      if (!entry.correct) this.state.wrong[entry.questionId] = entry
      save.persist()
    },
    removeWrong(id) {
      delete this.state.wrong[id]
      save.persist()
    },
    toggleFavorite(entry) {
      const id = entry.questionId
      if (Object.hasOwn(this.state.favorites, id)) delete this.state.favorites[id]
      else this.state.favorites[id] = entry
      save.persist()
    },
    saveNote(entry, text) {
      if (!text.trim()) return
      this.state.notes[entry.questionId] = { ...entry, text: text.trim() }
      save.persist()
    },
    deleteNote(id) {
      delete this.state.notes[id]
      save.persist()
    },
  }
}
