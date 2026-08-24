import { describe, expect, it } from 'vitest'
import { CANVAS_HEIGHT } from './constants'
import {
  birdRect,
  hitsBounds,
  hitsPipes,
  pipeSolids,
  rectsOverlap,
} from './collision'
import type { Bird, PipePair } from './types'

const birdAt = (x: number, y: number): Bird => ({
  x,
  y,
  vy: 0,
  width: 34,
  height: 24,
})

describe('collision', () => {
  it('detects overlapping rects', () => {
    expect(
      rectsOverlap(
        { x: 0, y: 0, width: 10, height: 10 },
        { x: 5, y: 5, width: 10, height: 10 },
      ),
    ).toBe(true)
    expect(
      rectsOverlap(
        { x: 0, y: 0, width: 10, height: 10 },
        { x: 11, y: 0, width: 10, height: 10 },
      ),
    ).toBe(false)
  })

  it('builds top/bottom solids around the gap', () => {
    const pipe: PipePair = {
      x: 100,
      gapCenterY: 300,
      gapSize: 150,
      width: 60,
      scored: false,
    }
    const { top, bottom } = pipeSolids(pipe, CANVAS_HEIGHT)
    expect(top).toEqual({ x: 100, y: 0, width: 60, height: 225 })
    expect(bottom).toEqual({ x: 100, y: 375, width: 60, height: 225 })
  })

  it('hits bounds at top or bottom', () => {
    expect(hitsBounds(birdAt(80, -1), CANVAS_HEIGHT)).toBe(true)
    expect(hitsBounds(birdAt(80, CANVAS_HEIGHT - 23), CANVAS_HEIGHT)).toBe(true)
    expect(hitsBounds(birdAt(80, 200), CANVAS_HEIGHT)).toBe(false)
  })

  it('hits pipe solid but not the gap corridor', () => {
    const pipe: PipePair = {
      x: 80,
      gapCenterY: 300,
      gapSize: 150,
      width: 60,
      scored: false,
    }
    expect(hitsPipes(birdAt(80, 50), [pipe], CANVAS_HEIGHT)).toBe(true)
    expect(hitsPipes(birdAt(80, 288), [pipe], CANVAS_HEIGHT)).toBe(false)
  })

  it('exposes birdRect from bird fields', () => {
    expect(birdRect(birdAt(80, 100))).toEqual({
      x: 80,
      y: 100,
      width: 34,
      height: 24,
    })
  })
})
