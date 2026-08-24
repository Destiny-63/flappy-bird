import { CANVAS_HEIGHT, CANVAS_WIDTH } from '../game/constants'
import { pipeSolids } from '../game/collision'
import type { GameWorld } from '../game/world'
import type { GamePhase } from '../game/types'

export function overlayTitle(phase: GamePhase): string | null {
  if (phase === 'ready') return '按空格开始'
  if (phase === 'gameover') return '游戏结束'
  return null
}

export function drawFrame(
  ctx: CanvasRenderingContext2D,
  world: GameWorld,
): void {
  const sky = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT)
  sky.addColorStop(0, '#7ec8e3')
  sky.addColorStop(1, '#e8f4c8')
  ctx.fillStyle = sky
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

  for (const pipe of world.pipes) {
    const { top, bottom } = pipeSolids(pipe, CANVAS_HEIGHT)
    drawPipeSegment(ctx, top)
    drawPipeSegment(ctx, bottom)
  }

  drawBird(ctx, world.bird.x, world.bird.y, world.bird.width, world.bird.height)

  ctx.fillStyle = 'rgba(20, 30, 40, 0.75)'
  ctx.font = '16px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText(`最高分 ${world.highScore}`, 12, 24)

  if (world.phase === 'playing') {
    ctx.font = 'bold 36px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(String(world.score), CANVAS_WIDTH / 2, 56)
  }

  const title = overlayTitle(world.phase)
  if (title) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)'
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
    ctx.fillStyle = '#fff'
    ctx.textAlign = 'center'
    ctx.font = 'bold 32px sans-serif'
    ctx.fillText(title, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 24)
    if (world.phase === 'gameover') {
      ctx.font = '20px sans-serif'
      ctx.fillText(`得分 ${world.score}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 12)
      ctx.fillText(
        `最高分 ${world.highScore}`,
        CANVAS_WIDTH / 2,
        CANVAS_HEIGHT / 2 + 40,
      )
      if (world.beatHighScore) {
        ctx.fillStyle = '#ffe566'
        ctx.fillText('新纪录', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 68)
      }
      ctx.fillStyle = '#fff'
      ctx.font = '18px sans-serif'
      ctx.fillText('按空格再来', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 100)
    }
  }
}

function drawPipeSegment(
  ctx: CanvasRenderingContext2D,
  rect: { x: number; y: number; width: number; height: number },
): void {
  if (rect.height <= 0) return
  ctx.fillStyle = '#3aa35a'
  roundRect(ctx, rect.x, rect.y, rect.width, rect.height, 6)
  ctx.fill()
  const capH = Math.min(18, rect.height)
  const capY = rect.y === 0 ? rect.height - capH : rect.y
  ctx.fillStyle = '#2d7a44'
  roundRect(ctx, rect.x - 4, capY, rect.width + 8, capH, 6)
  ctx.fill()
}

function drawBird(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
): void {
  const cx = x + w / 2
  const cy = y + h / 2
  ctx.fillStyle = '#f5d76e'
  ctx.beginPath()
  ctx.ellipse(cx, cy, w / 2, h / 2, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#e67e22'
  ctx.beginPath()
  ctx.moveTo(x + w - 2, cy)
  ctx.lineTo(x + w + 10, cy - 4)
  ctx.lineTo(x + w + 10, cy + 4)
  ctx.closePath()
  ctx.fill()
  ctx.fillStyle = '#fff'
  ctx.beginPath()
  ctx.arc(cx + 6, cy - 4, 4, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#222'
  ctx.beginPath()
  ctx.arc(cx + 7, cy - 4, 2, 0, Math.PI * 2)
  ctx.fill()
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  const radius = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.arcTo(x + w, y, x + w, y + h, radius)
  ctx.arcTo(x + w, y + h, x, y + h, radius)
  ctx.arcTo(x, y + h, x, y, radius)
  ctx.arcTo(x, y, x + w, y, radius)
  ctx.closePath()
}
