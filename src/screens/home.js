import { characterSwitch, playerCharacter } from '../player-characters.js'

function pixelCharacter(className, label) {
  return `
    <div class="pixel-character ${className}" role="img" aria-label="${label}">
      <span class="pixel-character__hair"></span>
      <span class="pixel-character__face"></span>
      <span class="pixel-character__body"></span>
      <span class="pixel-character__paper"></span>
      <span class="pixel-character__legs"></span>
    </div>
  `
}

export function homeScreen(progress) {
  return `
    <main class="game-shell home-screen" aria-labelledby="game-title">
      <div class="room-illustration room-illustration--home" aria-hidden="true">
        <div class="wall-sign">会计档案室</div>
        <div class="tall-cabinet"></div>
        <div class="filing-cabinet"></div>
        <div class="window window--home"><span></span><span></span></div>
        <div class="ledger-desk">资料台账</div>
        <div class="plant"></div>
      </div>

      <section class="home-card">
        <p class="eyebrow">中级会计实务 · 文字冒险</p>
        <h1 id="game-title">会计行者</h1>
        <p class="home-card__subtitle">档案室冒险 · 轻量 RPG</p>
        <p class="chapter-label">中级会计 · 实务篇</p>

        <div class="character-pair" aria-label="出纳与老会计">
          ${playerCharacter()}
          ${pixelCharacter('pixel-character--mentor', '老会计')}
        </div>

        <p class="home-card__intro">
          你是一名出纳。推开档案室的门，调查资料，和老会计聊一聊。
        </p>

        <div class="home-card__launch">
          <button class="primary-button" type="button" data-navigate="room">
            ${progress.started ? '继续旅程' : '开始新的旅程'}
          </button>
          ${characterSwitch()}
        </div>
        <button class="text-button" type="button" data-navigate="handbook">
          先翻翻随身手册
        </button>
        <button class="text-button" type="button" data-navigate="chapters">查看章节</button>
        <button class="text-button" type="button" data-navigate="settings">设置与存档</button>
      </section>
    </main>
  `
}
