export function createChapters(first, index) {
  const chapters = [first, ...index.map((entry, index) => ({
    scene: {
      title: entry.title,
      subtitle: '会计档案室',
      statusTitle: '调查本章资料',
      statusText: '调查文件后，和周会计核对线索。',
      footerLeft: '会计档案室',
      footerRight: `第 ${index + 2} 章`,
      ...entry.scene,
      id: entry.id,
    },
    characters: entry.characters ?? first.characters,
    hotspots: entry.hotspots ?? [{ ...first.hotspots[0], label: '待核对的资料', dialogueId: 'clue' }],
    dialogues: {
      clue: [{ speaker: '旁白', text: entry.clue }],
      'mentor-intro': [{
        speaker: '周会计',
        text: '关于刚看到的情况，你想先核对哪一项？',
        choices: [
          { label: '回看原始资料', next: 'check-source' },
          { label: '了解经手过程', next: 'check-process' },
        ],
      }],
      'check-source': [{ speaker: '周会计', text: '记录你实际看到的信息，再回到原始单据核对。', event: 'review' }],
      'check-process': [{ speaker: '周会计', text: '先把日期和经手人记清楚，才能顺着记录追查。', event: 'review' }],
      ...entry.dialogues,
    },
  }))]

  const ids = new Set()
  for (const chapter of chapters) {
    const { scene, characters, hotspots, dialogues } = chapter
    if (ids.has(scene.id) || hotspots.length === 0 || new Set(hotspots.map(spot => spot.id)).size !== hotspots.length) {
      throw new Error(`章节或调查点编号重复：${scene.id}`)
    }
    ids.add(scene.id)
    const hasDialogue = id => Object.hasOwn(dialogues, id) && dialogues[id].length > 0
    for (const actor of [...characters, ...hotspots]) {
      if (!hasDialogue(actor.dialogueId)) throw new Error(`缺少对白：${scene.id} / ${actor.dialogueId}`)
    }
    for (const lines of Object.values(dialogues)) {
      for (const line of lines) {
        if (line.choices?.some(choice => !hasDialogue(choice.next))) {
          throw new Error(`对话选项的目标不存在：${scene.id}`)
        }
      }
    }
  }
  return chapters
}

export function chapterReady(chapter, progress) {
  return progress.reviewed && chapter.hotspots.every(spot => progress.visited.includes(spot.id))
}
