import { storyScene } from './story-content.js'

export function createChapters(first, index) {
  const chapters = [first, ...index.map((entry, index) => {
    const story = storyScene(entry)
    return {
      scene: {
        title: entry.title,
        subtitle: '会计档案室',
        statusTitle: '调查本章资料',
        statusText: entry.clue,
        footerLeft: '会计档案室',
        footerRight: `第 ${index + 2} 章`,
        ...entry.scene,
        id: entry.id,
      },
      characters: entry.characters ?? first.characters,
      hotspots: entry.hotspots ?? story.hotspots,
      dialogues: {
        ...story.dialogues,
        ...entry.dialogues,
      },
    }
  })]

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
    for (const { card, id } of hotspots) {
      if (card !== undefined && ![card?.title, card?.text].every(value => typeof value === 'string' && value.trim())) {
        throw new Error(`知识卡缺少标题或正文：${scene.id} / ${id}`)
      }
    }
    for (const { anchor, position, id } of hotspots) {
      if (anchor ? !['left-shelf', 'middle-shelf', 'notice-board', 'desk'].includes(anchor) : !position) {
        throw new Error(`调查点缺少有效位置：${scene.id} / ${id}`)
      }
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

export function knowledgeCards(chapters, progressFor) {
  return chapters.flatMap(chapter => {
    const { visited } = progressFor(chapter.scene.id)
    return chapter.hotspots.filter(spot => spot.card).map(spot => ({
      ...spot.card,
      chapter: chapter.scene.title,
      unlocked: visited.includes(spot.id),
    }))
  })
}
