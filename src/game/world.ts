import {
  BIRD_HEIGHT,
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  MOVING_GAP_SCORE_THRESHOLD,
  PIPE_SPEED,
  PIPE_SPACING,
} from './constants'
import { hitsBounds, hitsPipes } from './collision'
import { createBird, flap, stepBird } from './physics'
import {
  recyclePipes,
  shouldSpawn,
  spawnPipe,
  stepPipes,
} from './pipes'
import {
  applyPassScore,
  readHighScore,
  updateHighScore,
  type StorageLike,
} from './score'
import { toGameOver, transition } from './state'
import type { Bird, GamePhase, PipePair } from './types'

export type GameWorld = {
  phase: GamePhase
  bird: Bird
  pipes: PipePair[]
  score: number
  highScore: number
  beatHighScore: boolean
  /** Seconds; drives parallax foliage even when not playing. */
  bgTime: number
}

export function createWorld(storage: StorageLike): GameWorld {
  return {
    phase: 'ready',
    bird: createBird(CANVAS_HEIGHT / 2 - BIRD_HEIGHT / 2),
    pipes: [],
    score: 0,
    highScore: readHighScore(storage),
    beatHighScore: false,
    bgTime: 0,
  }
}

export function resetRun(world: GameWorld): void {
  world.bird = createBird(CANVAS_HEIGHT / 2 - BIRD_HEIGHT / 2)
  world.pipes = []
  world.score = 0
  world.beatHighScore = false
}

export function handleSpace(world: GameWorld, storage: StorageLike): void {
  const next = transition(world.phase, 'space')
  if (world.phase === 'ready' || world.phase === 'gameover') {
    resetRun(world)
    world.highScore = readHighScore(storage)
    world.phase = next
    return
  }
  if (world.phase === 'playing') {
    flap(world.bird)
  }
}

export function updateWorld(
  world: GameWorld,
  dt: number,
  storage: StorageLike,
  rng: () => number = Math.random,
): void {
  world.bgTime += dt
  if (world.phase !== 'playing') return

  stepBird(world.bird, dt)
  stepPipes(world.pipes, dt, PIPE_SPEED)
  world.pipes = recyclePipes(world.pipes, CANVAS_WIDTH)
  if (shouldSpawn(world.pipes, CANVAS_WIDTH, PIPE_SPACING)) {
    const movingGap = world.score > MOVING_GAP_SCORE_THRESHOLD
    world.pipes = spawnPipe(
      world.pipes,
      CANVAS_WIDTH,
      CANVAS_HEIGHT,
      rng,
      movingGap,
      world.score,
    )
  }
  world.score = applyPassScore(world.bird, world.pipes, world.score)

  if (
    hitsBounds(world.bird, CANVAS_HEIGHT) ||
    hitsPipes(world.bird, world.pipes, CANVAS_HEIGHT)
  ) {
    const previousHigh = world.highScore
    world.phase = toGameOver(world.phase)
    world.highScore = updateHighScore(storage, world.score, world.highScore)
    world.beatHighScore = world.score > previousHigh
  }
}
