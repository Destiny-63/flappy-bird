import { describe, expect, it } from 'vitest'
import {
  BIRD_MODEL_SIZE,
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  HIGH_SCORE_KEY,
  MAX_PIPE_GAP,
  MIN_PIPE_GAP,
  PIPE_GAP,
  PIPE_MIN_MARGIN,
} from './constants'

describe('constants', () => {
  it('locks logical canvas to 400x600', () => {
    expect(CANVAS_WIDTH).toBe(400)
    expect(CANVAS_HEIGHT).toBe(600)
  })

  it('keeps pipe gap passable with margins', () => {
    expect(PIPE_GAP + 2 * PIPE_MIN_MARGIN).toBeLessThanOrEqual(CANVAS_HEIGHT)
    expect(MAX_PIPE_GAP + 2 * PIPE_MIN_MARGIN).toBeLessThanOrEqual(CANVAS_HEIGHT)
    expect(MIN_PIPE_GAP).toBeGreaterThanOrEqual(2 * BIRD_MODEL_SIZE)
  })

  it('uses the agreed high-score storage key', () => {
    expect(HIGH_SCORE_KEY).toBe('flappy-bird-high-score')
  })
})
