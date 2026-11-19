import opening from './data/story-02-09.json' with { type: 'json' }
import middle from './data/story-10-17.json' with { type: 'json' }
import ending from './data/story-18-25.json' with { type: 'json' }

const stories = { ...opening, ...middle, ...ending }
const evidenceAnchors = [
  { id: 'left-shelf', anchor: 'left-shelf' },
  { id: 'ledger-desk', anchor: 'desk' },
  { id: 'notice-board', anchor: 'notice-board' },
  { id: 'handover-envelope', anchor: 'middle-shelf' },
]

const chapterNumber = id => id.split('-').at(-1)

export function chapterStory(id) {
  const story = stories[chapterNumber(id)]
  if (!story || story.evidence.length < 2 || story.evidence.length > evidenceAnchors.length
    || story.review.length !== 2 || story.questions.length !== 2) {
    throw new Error(`章节 ${id} 缺少调查、复核或试炼内容`)
  }
  return story
}

export function storyScene(entry) {
  const story = chapterStory(entry.id)
  const hotspots = story.evidence.map(({ label, cardTitle, cardText }, index) => ({
    ...evidenceAnchors[index],
    label,
    dialogueId: `evidence-${index + 1}`,
    card: { title: cardTitle, text: cardText },
  }))
  const evidenceDialogues = Object.fromEntries(story.evidence.map(({ line }, index) => [
    hotspots[index].dialogueId, [{ speaker: '旁白', text: line }],
  ]))
  const reviewDialogues = Object.fromEntries(story.review.map(({ answer }, index) => [
    `review-${index + 1}`, [{ speaker: '周会计', text: answer, event: 'review' }],
  ]))
  return {
    hotspots,
    dialogues: {
      ...evidenceDialogues,
      ...reviewDialogues,
      'mentor-intro': [{
        speaker: '周会计',
        text: story.intro,
        choices: story.review.map(({ label }, index) => ({ label, next: `review-${index + 1}` })),
      }],
    },
  }
}

export function campaignTrials(initialBank, firstId, index) {
  return {
    chapters: [
      { id: firstId, title: '第 1 章 · 总论' },
      ...index.map(({ id, title }, position) => ({ id, title: `第 ${position + 2} 章 · ${title}` })),
    ],
    questions: [
      ...initialBank.questions.map(question => ({
        ...question,
        chapterId: question.chapterId === 'inventory' ? 'archive-room-05' : firstId,
      })),
      ...index.flatMap(({ id }) => chapterStory(id).questions.map((question, position) => ({
        ...question,
        id: `practice-${chapterNumber(id)}-${position + 1}`,
        chapterId: id,
      }))),
    ],
  }
}
