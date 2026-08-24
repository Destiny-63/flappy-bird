import {
  CANVAS_HEIGHT,
  MAX_PIPE_GAP,
  MIN_PIPE_GAP,
  MOVING_GAP_AMPLITUDE,
  MOVING_GAP_OMEGA,
  PIPE_GAP,
  PIPE_MIN_MARGIN,
  PIPE_WIDTH,
} from './constants'
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
  movingGap = false,
): PipePair {
  return {
    x,
    gapCenterY,
    gapSize,
    width,
    scored: false,
    movingGap,
    gapBaseY: gapCenterY,
    gapPhase: 0,
  }
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

/** Random gap height in [MIN_PIPE_GAP, MAX_PIPE_GAP]. */
export function randomGapSize(rng: () => number): number {
  return MIN_PIPE_GAP + rng() * (MAX_PIPE_GAP - MIN_PIPE_GAP)
}

export function stepPipes(pipes: PipePair[], dt: number, speed: number): void {
  for (const pipe of pipes) {
    pipe.x -= speed * dt
    if (pipe.movingGap) {
      pipe.gapPhase += MOVING_GAP_OMEGA * dt
      pipe.gapCenterY = clampGapCenter(
        pipe.gapBaseY + Math.sin(pipe.gapPhase) * MOVING_GAP_AMPLITUDE,
        pipe.gapSize,
        CANVAS_HEIGHT,
        PIPE_MIN_MARGIN,
      )
    }
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
  movingGap = false,
): PipePair[] {
  const gapSize = randomGapSize(rng)
  // Keep oscillation within safe margins by shrinking the base range.
  const baseMargin = movingGap
    ? PIPE_MIN_MARGIN + MOVING_GAP_AMPLITUDE
    : PIPE_MIN_MARGIN
  const gapCenterY = randomGapCenter(rng, canvasHeight, gapSize, baseMargin)
  return [...pipes, createPipePair(canvasWidth, gapCenterY, gapSize, PIPE_WIDTH, movingGap)]
}
