import { PIPE_GAP, PIPE_MIN_MARGIN, PIPE_WIDTH } from './constants'
import type { PipePair } from './types'

export function clampGapCenter(
  gapCenterY: number,
  gapSize: number,
  canvasHeight: number,
  minMargin: number,
): number {
  const min = minMargin + gapSize / 2
  const max = canvasHeight - minMargin - gapSize / 2
  return Math.min(max, Math.max(min, gapCenterY))
}

export function createPipePair(
  x: number,
  gapCenterY: number,
  gapSize: number = PIPE_GAP,
  width: number = PIPE_WIDTH,
): PipePair {
  return { x, gapCenterY, gapSize, width, scored: false }
}

export function randomGapCenter(
  rng: () => number,
  canvasHeight: number,
  gapSize: number,
  minMargin: number,
): number {
  const min = minMargin + gapSize / 2
  const max = canvasHeight - minMargin - gapSize / 2
  return min + rng() * (max - min)
}

export function stepPipes(pipes: PipePair[], dt: number, speed: number): void {
  for (const pipe of pipes) {
    pipe.x -= speed * dt
  }
}

export function recyclePipes(pipes: PipePair[], _canvasWidth: number): PipePair[] {
  return pipes.filter((pipe) => pipe.x + pipe.width >= 0)
}

export function shouldSpawn(
  pipes: PipePair[],
  canvasWidth: number,
  spacing: number,
): boolean {
  if (pipes.length === 0) return true
  const rightmost = Math.max(...pipes.map((p) => p.x))
  return rightmost <= canvasWidth - spacing
}

export function spawnPipe(
  pipes: PipePair[],
  canvasWidth: number,
  canvasHeight: number,
  rng: () => number,
): PipePair[] {
  const gapCenterY = randomGapCenter(
    rng,
    canvasHeight,
    PIPE_GAP,
    PIPE_MIN_MARGIN,
  )
  return [...pipes, createPipePair(canvasWidth, gapCenterY)]
}
