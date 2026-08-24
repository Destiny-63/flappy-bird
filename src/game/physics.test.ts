import { describe, expect, it } from 'vitest'
import { BIRD_HEIGHT, BIRD_WIDTH, BIRD_X, FLAP_VELOCITY, GRAVITY } from './constants'
import { createBird, flap, stepBird } from './physics'

describe('physics', () => {
  it('createBird places bird at fixed x with zero velocity', () => {
    const bird = createBird(200)
    expect(bird).toEqual({
      x: BIRD_X,
      y: 200,
      vy: 0,
      width: BIRD_WIDTH,
      height: BIRD_HEIGHT,
    })
  })

  it('gravity increases downward velocity and moves bird down', () => {
    const bird = createBird(100)
    stepBird(bird, 0.1)
    expect(bird.vy).toBeCloseTo(GRAVITY * 0.1)
    expect(bird.y).toBeCloseTo(100 + GRAVITY * 0.1 * 0.1)
  })

  it('flap sets a fixed upward velocity (does not stack)', () => {
    const bird = createBird(100)
    bird.vy = 50
    flap(bird)
    expect(bird.vy).toBe(FLAP_VELOCITY)
    flap(bird)
    expect(bird.vy).toBe(FLAP_VELOCITY)
  })
})
