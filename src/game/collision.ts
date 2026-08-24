import type { Bird, PipePair, Rect } from './types'

export function rectsOverlap(a: Rect, b: Rect): boolean {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  )
}

export function birdRect(bird: Bird): Rect {
  return { x: bird.x, y: bird.y, width: bird.width, height: bird.height }
}

export function pipeSolids(
  pipe: PipePair,
  canvasHeight: number,
): { top: Rect; bottom: Rect } {
  const gapTop = pipe.gapCenterY - pipe.gapSize / 2
  const gapBottom = pipe.gapCenterY + pipe.gapSize / 2
  return {
    top: { x: pipe.x, y: 0, width: pipe.width, height: gapTop },
    bottom: {
      x: pipe.x,
      y: gapBottom,
      width: pipe.width,
      height: canvasHeight - gapBottom,
    },
  }
}

export function hitsBounds(bird: Bird, canvasHeight: number): boolean {
  return bird.y < 0 || bird.y + bird.height > canvasHeight
}

export function hitsPipes(
  bird: Bird,
  pipes: PipePair[],
  canvasHeight: number,
): boolean {
  const birdR = birdRect(bird)
  for (const pipe of pipes) {
    const { top, bottom } = pipeSolids(pipe, canvasHeight)
    if (rectsOverlap(birdR, top) || rectsOverlap(birdR, bottom)) return true
  }
  return false
}
