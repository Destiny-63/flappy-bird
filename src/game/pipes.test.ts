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
  randomGapCenter,
  randomGapSize,
  recyclePipes,
  shouldSpawn,
  spawnPipe,
  stepPipes,
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

  it('randomGapSize stays between two bird models and max', () => {
    expect(MIN_PIPE_GAP).toBe(2 * BIRD_MODEL_SIZE)
    expect(randomGapSize(() => 0)).toBe(MIN_PIPE_GAP)
    expect(randomGapSize(() => 1)).toBe(MAX_PIPE_GAP)
    const mid = randomGapSize(() => 0.5)
    expect(mid).toBeGreaterThan(MIN_PIPE_GAP)
    expect(mid).toBeLessThan(MAX_PIPE_GAP)
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

  it('spawnPipe appends a full on-screen gap pair with random size', () => {
    const pipes = spawnPipe([], CANVAS_WIDTH, CANVAS_HEIGHT, () => 0.25)
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

  it('oscillates gapCenterY for moving pipes while staying in bounds', () => {
    const pipes = spawnPipe([], CANVAS_WIDTH, CANVAS_HEIGHT, () => 0.5, true)
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
