import { describe, expect, it } from 'vitest'
import {
  BIRD_MODEL_SIZE,
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  MAX_PIPE_GAP,
  MIN_PIPE_GAP,
  PIPE_GAP,
  PIPE_MIN_MARGIN,
  PIPE_SPACING,
  PIPE_WIDTH,
} from './constants'
import {
  clampGapCenter,
  createPipePair,
  difficulty01,
  gapOpenCenterInterval,
  gapSizeForScore,
  intervalsOverlap,
  pickReachableGapCenter,
  randomGapCenter,
  reachableCenterRangeFromPipe,
  recyclePipes,
  shouldSpawn,
  simulateBirdCenterY,
  spawnPipe,
  stepPipes,
  travelTimeBetweenPipes,
} from './pipes'

describe('pipes', () => {
  it('clamps gap so solids stay at least minMargin', () => {
    const min = PIPE_MIN_MARGIN + PIPE_GAP / 2
    const max = CANVAS_HEIGHT - PIPE_MIN_MARGIN - PIPE_GAP / 2
    expect(clampGapCenter(0, PIPE_GAP, CANVAS_HEIGHT, PIPE_MIN_MARGIN)).toBe(min)
    expect(clampGapCenter(9999, PIPE_GAP, CANVAS_HEIGHT, PIPE_MIN_MARGIN)).toBe(max)
  })

  it('randomGapCenter stays within safe range', () => {
    const y = randomGapCenter(() => 0.5, CANVAS_HEIGHT, PIPE_GAP, PIPE_MIN_MARGIN)
    const min = PIPE_MIN_MARGIN + PIPE_GAP / 2
    const max = CANVAS_HEIGHT - PIPE_MIN_MARGIN - PIPE_GAP / 2
    expect(y).toBeGreaterThanOrEqual(min)
    expect(y).toBeLessThanOrEqual(max)
  })

  it('gap size stays between two bird models and max, tighter at high score', () => {
    expect(MIN_PIPE_GAP).toBe(2 * BIRD_MODEL_SIZE)
    const easy = gapSizeForScore(0, () => 0.5)
    const hard = gapSizeForScore(30, () => 0.5)
    expect(easy).toBeGreaterThanOrEqual(MIN_PIPE_GAP)
    expect(easy).toBeLessThanOrEqual(MAX_PIPE_GAP)
    expect(hard).toBeGreaterThanOrEqual(MIN_PIPE_GAP)
    expect(hard).toBeLessThan(easy)
    expect(difficulty01(0)).toBe(0)
    expect(difficulty01(100)).toBe(1)
  })

  it('climbing lowers Y and falling raises Y over travel time', () => {
    const dt = travelTimeBetweenPipes()
    const start = 300
    expect(simulateBirdCenterY(start, dt, 0.14)).toBeLessThan(start)
    expect(simulateBirdCenterY(start, dt, null)).toBeGreaterThan(start)
  })

  it('next pipe gap overlaps reachable band from previous', () => {
    const prev = createPipePair(200, 300, 160)
    const reach = reachableCenterRangeFromPipe(prev)
    expect(reach.maxY).toBeGreaterThan(reach.minY)

    for (let i = 0; i < 20; i++) {
      const rng = () => (i * 17 + 3) % 100 / 100
      const size = gapSizeForScore(i, rng)
      const center = pickReachableGapCenter(prev, size, i, rng, false)
      const open = gapOpenCenterInterval(center, size)
      expect(
        intervalsOverlap(open, { lo: reach.minY, hi: reach.maxY }),
      ).toBe(true)
    }
  })

  it('scrolls left and recycles off-screen pipes', () => {
    const pipes = [createPipePair(-70, 300)]
    stepPipes(pipes, 1, 10)
    expect(pipes[0].x).toBe(-80)
    expect(recyclePipes(pipes, CANVAS_WIDTH)).toEqual([])
  })

  it('spawns when rightmost pipe is far enough left', () => {
    expect(shouldSpawn([], CANVAS_WIDTH, PIPE_SPACING)).toBe(true)
    const one = [createPipePair(CANVAS_WIDTH - PIPE_SPACING, 300)]
    expect(shouldSpawn(one, CANVAS_WIDTH, PIPE_SPACING)).toBe(true)
    const close = [createPipePair(CANVAS_WIDTH - 10, 300)]
    expect(shouldSpawn(close, CANVAS_WIDTH, PIPE_SPACING)).toBe(false)
  })

  it('spawnPipe appends a full on-screen gap pair with score-aware size', () => {
    const pipes = spawnPipe([], CANVAS_WIDTH, CANVAS_HEIGHT, () => 0.25, false, 0)
    expect(pipes).toHaveLength(1)
    expect(pipes[0].x).toBe(CANVAS_WIDTH)
    expect(pipes[0].width).toBe(PIPE_WIDTH)
    expect(pipes[0].gapSize).toBeGreaterThanOrEqual(MIN_PIPE_GAP)
    expect(pipes[0].gapSize).toBeLessThanOrEqual(MAX_PIPE_GAP)
    expect(pipes[0].scored).toBe(false)
    expect(pipes[0].movingGap).toBe(false)
    const gapTop = pipes[0].gapCenterY - pipes[0].gapSize / 2
    const gapBottom = pipes[0].gapCenterY + pipes[0].gapSize / 2
    expect(gapTop).toBeGreaterThanOrEqual(PIPE_MIN_MARGIN)
    expect(gapBottom).toBeLessThanOrEqual(CANVAS_HEIGHT - PIPE_MIN_MARGIN)
  })

  it('spawned sequence stays mutually reachable', () => {
    let pipes = spawnPipe([], CANVAS_WIDTH, CANVAS_HEIGHT, () => 0.4, false, 0)
    for (let score = 1; score <= 12; score++) {
      pipes = spawnPipe(pipes, CANVAS_WIDTH, CANVAS_HEIGHT, () => 0.3, false, score)
      const prev = pipes[pipes.length - 2]
      const next = pipes[pipes.length - 1]
      const reach = reachableCenterRangeFromPipe(prev)
      const open = gapOpenCenterInterval(next.gapCenterY, next.gapSize)
      expect(intervalsOverlap(open, { lo: reach.minY, hi: reach.maxY })).toBe(true)
    }
  })

  it('oscillates gapCenterY for moving pipes while staying in bounds', () => {
    const pipes = spawnPipe([], CANVAS_WIDTH, CANVAS_HEIGHT, () => 0.5, true, 8)
    expect(pipes[0].movingGap).toBe(true)
    const base = pipes[0].gapBaseY
    stepPipes(pipes, 0.4, 0)
    expect(pipes[0].gapCenterY).not.toBe(base)
    const gapTop = pipes[0].gapCenterY - pipes[0].gapSize / 2
    const gapBottom = pipes[0].gapCenterY + pipes[0].gapSize / 2
    expect(gapTop).toBeGreaterThanOrEqual(PIPE_MIN_MARGIN)
    expect(gapBottom).toBeLessThanOrEqual(CANVAS_HEIGHT - PIPE_MIN_MARGIN)
  })
})
