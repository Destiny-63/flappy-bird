import {
  BIRD_HEIGHT,
  BIRD_WIDTH,
  BIRD_X,
  FLAP_VELOCITY,
  GRAVITY,
} from './constants'
import type { Bird } from './types'

export function createBird(y: number): Bird {
  return {
    x: BIRD_X,
    y,
    vy: 0,
    width: BIRD_WIDTH,
    height: BIRD_HEIGHT,
  }
}

export function flap(bird: Bird): void {
  bird.vy = FLAP_VELOCITY
}

export function stepBird(bird: Bird, dt: number): void {
  bird.vy += GRAVITY * dt
  bird.y += bird.vy * dt
}
