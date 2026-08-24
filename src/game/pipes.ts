import {
  BIRD_HEIGHT,
  CANVAS_HEIGHT,
  DIFFICULTY_SCORE_SCALE,
  FLAP_VELOCITY,
  GRAVITY,
  MAX_PIPE_GAP,
  MIN_FLAP_INTERVAL,
  MIN_PIPE_GAP,
  MOVING_GAP_AMPLITUDE,
  MOVING_GAP_OMEGA,
  PIPE_GAP,
  PIPE_MIN_MARGIN,
  PIPE_SPEED,
  PIPE_SPACING,
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

/** 0 (easy) → 1 (hard) based on score. */
export function difficulty01(score: number): number {
  return Math.max(0, Math.min(1, score / DIFFICULTY_SCORE_SCALE))
}

/**
 * Gap size: large & forgiving early; shrinks toward MIN as score rises.
 * Still always ≥ MIN_PIPE_GAP (two bird models).
 */
export function gapSizeForScore(score: number, rng: () => number): number {
  const d = difficulty01(score)
  const easy = MAX_PIPE_GAP
  const hard = MIN_PIPE_GAP
  const base = easy + (hard - easy) * d
  // Jitter shrinks with difficulty so late game is more consistent/tight
  const jitterAmp = (1 - d) * 20 + 8
  const jitter = (rng() * 2 - 1) * jitterAmp
  return Math.max(MIN_PIPE_GAP, Math.min(MAX_PIPE_GAP, base + jitter))
}

/** Time between facing consecutive pipe gaps. */
export function travelTimeBetweenPipes(): number {
  return PIPE_SPACING / PIPE_SPEED
}

/**
 * Simulate bird-center Y after `duration` seconds.
 * `flapEvery`: seconds between flaps; `null` = never flap.
 */
export function simulateBirdCenterY(
  startCenterY: number,
  duration: number,
  flapEvery: number | null,
): number {
  let y = startCenterY - BIRD_HEIGHT / 2
  let vy = 0
  const step = 1 / 60
  let t = 0
  let sinceFlap = flapEvery == null ? 0 : flapEvery // flap immediately if climbing
  while (t < duration) {
    const dt = Math.min(step, duration - t)
    if (flapEvery != null && sinceFlap >= flapEvery) {
      vy = FLAP_VELOCITY
      sinceFlap = 0
    }
    vy += GRAVITY * dt
    y += vy * dt
    sinceFlap += dt
    t += dt
  }
  return y + BIRD_HEIGHT / 2
}

/** Bird-center Y range reachable between pipes from a previous gap. */
export function reachableCenterRangeFromPipe(prev: PipePair): {
  minY: number
  maxY: number
} {
  const dt = travelTimeBetweenPipes()
  const openLo = prev.gapCenterY - prev.gapSize / 2 + BIRD_HEIGHT / 2
  const openHi = prev.gapCenterY + prev.gapSize / 2 - BIRD_HEIGHT / 2
  const climbFromTop = simulateBirdCenterY(openLo, dt, MIN_FLAP_INTERVAL)
  const climbFromBottom = simulateBirdCenterY(openHi, dt, MIN_FLAP_INTERVAL)
  const fallFromTop = simulateBirdCenterY(openLo, dt, null)
  const fallFromBottom = simulateBirdCenterY(openHi, dt, null)
  return {
    minY: Math.min(climbFromTop, climbFromBottom),
    maxY: Math.max(fallFromTop, fallFromBottom),
  }
}

/** Vertical open interval (bird center) for a gap. */
export function gapOpenCenterInterval(
  gapCenterY: number,
  gapSize: number,
): { lo: number; hi: number } {
  return {
    lo: gapCenterY - gapSize / 2 + BIRD_HEIGHT / 2,
    hi: gapCenterY + gapSize / 2 - BIRD_HEIGHT / 2,
  }
}

export function intervalsOverlap(
  a: { lo: number; hi: number },
  b: { lo: number; hi: number },
): boolean {
  return a.lo <= b.hi && b.lo <= a.hi
}

/**
 * Pick a gap center that stays reachable from `prev` (if any),
 * with vertical offset demand rising with score (more flaps needed).
 */
export function pickReachableGapCenter(
  prev: PipePair | null,
  gapSize: number,
  score: number,
  rng: () => number,
  movingGap: boolean,
): number {
  const ampPad = movingGap
    ? MOVING_GAP_AMPLITUDE * (0.35 + 0.65 * difficulty01(score))
    : 0
  const margin = PIPE_MIN_MARGIN + ampPad
  const screenLo = margin + gapSize / 2
  const screenHi = CANVAS_HEIGHT - margin - gapSize / 2

  if (!prev) {
    // First pipe: stay near middle, easy
    const mid = (screenLo + screenHi) / 2
    return mid + (rng() - 0.5) * 80
  }

  const d = difficulty01(score)
  const reach = reachableCenterRangeFromPipe(prev)
  // Soften extremes slightly so we don't require perfect play
  const pad = 12
  let rLo = reach.minY + pad
  let rHi = reach.maxY - pad
  if (rHi - rLo < 40) {
    const mid = (reach.minY + reach.maxY) / 2
    rLo = mid - 20
    rHi = mid + 20
  }

  // Easy: stay close to previous center; hard: allow larger deltas (more flaps)
  const maxStep = (40 + d * 160) * (0.55 + 0.45 * rng())
  const dir = rng() < 0.5 ? -1 : 1
  // Bias toward needing correction as difficulty rises
  const target =
    prev.gapCenterY + dir * maxStep * (0.35 + 0.65 * d) * (0.5 + rng())

  let center = Math.max(rLo, Math.min(rHi, target))
  center = Math.max(screenLo, Math.min(screenHi, center))

  // Final guarantee: gap open interval overlaps reachable bird-center band
  const open = gapOpenCenterInterval(center, gapSize)
  const reachBand = { lo: reach.minY, hi: reach.maxY }
  if (!intervalsOverlap(open, reachBand)) {
    center = clampGapCenter(prev.gapCenterY, gapSize, CANVAS_HEIGHT, margin)
  }
  return clampGapCenter(center, gapSize, CANVAS_HEIGHT, margin)
}

export function stepPipes(pipes: PipePair[], dt: number, speed: number): void {
  for (const pipe of pipes) {
    pipe.x -= speed * dt
    if (pipe.movingGap) {
      pipe.gapPhase += MOVING_GAP_OMEGA * dt
      const amp =
        MOVING_GAP_AMPLITUDE *
        Math.min(1, 0.4 + pipe.gapSize / MAX_PIPE_GAP)
      pipe.gapCenterY = clampGapCenter(
        pipe.gapBaseY + Math.sin(pipe.gapPhase) * amp,
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

export function rightmostPipe(pipes: PipePair[]): PipePair | null {
  if (pipes.length === 0) return null
  return pipes.reduce((a, b) => (a.x >= b.x ? a : b))
}

export function spawnPipe(
  pipes: PipePair[],
  canvasWidth: number,
  canvasHeight: number,
  rng: () => number,
  movingGap = false,
  score = 0,
): PipePair[] {
  const gapSize = gapSizeForScore(score, rng)
  const prev = rightmostPipe(pipes)
  const gapCenterY = pickReachableGapCenter(
    prev,
    gapSize,
    score,
    rng,
    movingGap,
  )
  return [
    ...pipes,
    createPipePair(canvasWidth, gapCenterY, gapSize, PIPE_WIDTH, movingGap),
  ]
}
