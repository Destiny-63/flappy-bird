import { describe, expect, it } from 'vitest'
import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  HIGH_SCORE_KEY,
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
  })

  it('uses the agreed high-score storage key', () => {
    expect(HIGH_SCORE_KEY).toBe('flappy-bird-high-score')
  })
})
