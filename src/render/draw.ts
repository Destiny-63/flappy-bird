import {
  BIRD_DRAW_SCALE,
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  MOVING_GAP_SCORE_THRESHOLD,
} from '../game/constants'
import { pipeSolids } from '../game/collision'
import type { GameWorld } from '../game/world'
import type { GamePhase } from '../game/types'
import birdUrl from '../assets/red-bird.png'

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
  sky.addColorStop(0.55, '#b8dfe8')
  sky.addColorStop(1, '#dcefc0')
  ctx.fillStyle = sky
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

  drawParallaxFoliage(ctx, world.bgTime)

  for (const pipe of world.pipes) {
    const { top, bottom } = pipeSolids(pipe, CANVAS_HEIGHT)
    drawPipeSegment(ctx, top, pipe.movingGap)
    drawPipeSegment(ctx, bottom, pipe.movingGap)
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
    if (world.score > MOVING_GAP_SCORE_THRESHOLD) {
      ctx.font = '13px sans-serif'
      ctx.fillStyle = 'rgba(180, 60, 40, 0.85)'
      ctx.fillText('缺口移动中', CANVAS_WIDTH / 2, 78)
    }
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

function drawParallaxFoliage(ctx: CanvasRenderingContext2D, t: number): void {
  const far = ((t * 12) % (CANVAS_WIDTH + 80)) - 40
  const mid = ((t * 28) % (CANVAS_WIDTH + 120)) - 60
  const near = ((t * 48) % (CANVAS_WIDTH + 160)) - 80

  // Far soft hills
  ctx.fillStyle = 'rgba(120, 160, 110, 0.18)'
  drawHillRow(ctx, far, CANVAS_HEIGHT * 0.62, 90, 38)
  drawHillRow(ctx, far + CANVAS_WIDTH * 0.55, CANVAS_HEIGHT * 0.64, 110, 42)

  // Mid bush silhouettes
  ctx.fillStyle = 'rgba(90, 140, 85, 0.22)'
  for (let i = -1; i < 4; i++) {
    const bx = mid + i * 140
    drawBush(ctx, bx, CANVAS_HEIGHT * 0.72, 36 + (i % 3) * 6)
    drawBush(ctx, bx + 55, CANVAS_HEIGHT * 0.74, 28)
  }

  // Near grass blades / tufts (subtle sway via offset)
  ctx.fillStyle = 'rgba(70, 120, 70, 0.28)'
  for (let i = -1; i < 8; i++) {
    const gx = near + i * 70
    const sway = Math.sin(t * 2.2 + i) * 3
    drawGrassTuft(ctx, gx + sway, CANVAS_HEIGHT - 28, 18 + (i % 4) * 3)
  }

  // Ground band
  const ground = ctx.createLinearGradient(0, CANVAS_HEIGHT - 36, 0, CANVAS_HEIGHT)
  ground.addColorStop(0, 'rgba(160, 190, 100, 0.35)')
  ground.addColorStop(1, 'rgba(120, 150, 80, 0.55)')
  ctx.fillStyle = ground
  ctx.fillRect(0, CANVAS_HEIGHT - 36, CANVAS_WIDTH, 36)
}

function drawHillRow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
): void {
  ctx.beginPath()
  ctx.moveTo(x - w * 0.2, CANVAS_HEIGHT)
  ctx.lineTo(x, y + h)
  ctx.quadraticCurveTo(x + w * 0.5, y - h * 0.2, x + w, y + h * 0.4)
  ctx.lineTo(x + w * 1.2, CANVAS_HEIGHT)
  ctx.closePath()
  ctx.fill()
}

function drawBush(ctx: CanvasRenderingContext2D, x: number, y: number, s: number): void {
  ctx.beginPath()
  ctx.arc(x, y, s * 0.55, 0, Math.PI * 2)
  ctx.arc(x + s * 0.45, y + 2, s * 0.48, 0, Math.PI * 2)
  ctx.arc(x - s * 0.4, y + 4, s * 0.42, 0, Math.PI * 2)
  ctx.arc(x + s * 0.1, y - s * 0.25, s * 0.4, 0, Math.PI * 2)
  ctx.fill()
}

function drawGrassTuft(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  h: number,
): void {
  ctx.beginPath()
  ctx.moveTo(x, y)
  ctx.quadraticCurveTo(x - 4, y - h * 0.5, x - 2, y - h)
  ctx.quadraticCurveTo(x, y - h * 0.45, x, y)
  ctx.moveTo(x, y)
  ctx.quadraticCurveTo(x + 2, y - h * 0.55, x + 5, y - h * 0.85)
  ctx.quadraticCurveTo(x + 1, y - h * 0.4, x, y)
  ctx.moveTo(x, y)
  ctx.quadraticCurveTo(x - 1, y - h * 0.6, x + 1, y - h * 1.05)
  ctx.quadraticCurveTo(x + 2, y - h * 0.5, x, y)
  ctx.fill()
}

function drawPipeSegment(
  ctx: CanvasRenderingContext2D,
  rect: { x: number; y: number; width: number; height: number },
  movingGap = false,
): void {
  if (rect.height <= 0) return
  ctx.fillStyle = movingGap ? '#2f9e5b' : '#3aa35a'
  roundRect(ctx, rect.x, rect.y, rect.width, rect.height, 6)
  ctx.fill()
  const capH = Math.min(18, rect.height)
  const capY = rect.y === 0 ? rect.height - capH : rect.y
  ctx.fillStyle = movingGap ? '#1f6f40' : '#2d7a44'
  roundRect(ctx, rect.x - 4, capY, rect.width + 8, capH, 6)
  ctx.fill()
  if (movingGap) {
    ctx.strokeStyle = 'rgba(255, 220, 80, 0.55)'
    ctx.lineWidth = 2
    roundRect(ctx, rect.x - 4, capY, rect.width + 8, capH, 6)
    ctx.stroke()
  }
}

let birdSprite: HTMLImageElement | null = null

/** Load the cute plush-style red bird sprite (call once at boot). */
export function loadBirdSprite(): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      birdSprite = img
      resolve()
    }
    img.onerror = () => reject(new Error(`Failed to load bird sprite: ${birdUrl}`))
    // Bundled by Vite — works for both local and GitHub Pages base paths
    img.src = birdUrl
  })
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
  // Modest on-screen size — cute but not oversized
  const size = Math.max(w, h) * BIRD_DRAW_SCALE

  ctx.save()
  ctx.fillStyle = 'rgba(0, 0, 0, 0.12)'
  ctx.beginPath()
  ctx.ellipse(cx, cy + size * 0.38, size * 0.32, size * 0.08, 0, 0, Math.PI * 2)
  ctx.fill()

  if (birdSprite?.complete && birdSprite.naturalWidth > 0) {
    ctx.drawImage(birdSprite, cx - size / 2, cy - size / 2 - 2, size, size)
  } else {
    // Tiny fallback while loading
    ctx.fillStyle = '#e82e2e'
    ctx.beginPath()
    ctx.arc(cx, cy, size * 0.28, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.restore()
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

