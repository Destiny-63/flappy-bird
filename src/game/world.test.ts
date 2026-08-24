import { describe, expect, it } from 'vitest'
import { CANVAS_HEIGHT, CANVAS_WIDTH, PIPE_SPACING } from './constants'
import { createWorld, handleSpace, updateWorld } from './world'

class MemoryStorage {
  private data = new Map<string, string>()
  getItem(key: string) {
    return this.data.has(key) ? this.data.get(key)! : null
  }
  setItem(key: string, value: string) {
    this.data.set(key, value)
  }
}

describe('world', () => {
  it('starts in ready and begins playing on space', () => {
    const world = createWorld(new MemoryStorage())
    expect(world.phase).toBe('ready')
    handleSpace(world, new MemoryStorage())
    expect(world.phase).toBe('playing')
    expect(world.pipes.length).toBeGreaterThanOrEqual(0)
  })

  it('does not update simulation while ready', () => {
    const world = createWorld(new MemoryStorage())
    const y = world.bird.y
    updateWorld(world, 1, new MemoryStorage())
    expect(world.bird.y).toBe(y)
  })

  it('ends the run when the bird hits the ground', () => {
    const storage = new MemoryStorage()
    const world = createWorld(storage)
    handleSpace(world, storage)
    world.bird.y = CANVAS_HEIGHT
    updateWorld(world, 0.016, storage)
    expect(world.phase).toBe('gameover')
  })

  it('spawns pipes while playing over time', () => {
    const storage = new MemoryStorage()
    const world = createWorld(storage)
    handleSpace(world, storage)
    for (let i = 0; i < 90; i++) {
      world.bird.y = 288
      world.bird.vy = 0
      updateWorld(world, 1 / 60, storage, () => 0.5)
    }
    expect(world.pipes.length).toBeGreaterThan(0)
    expect(world.pipes[0].x).toBeLessThan(CANVAS_WIDTH)
  })

  it('restarts from gameover on space', () => {
    const storage = new MemoryStorage()
    const world = createWorld(storage)
    handleSpace(world, storage)
    world.phase = 'gameover'
    world.score = 4
    handleSpace(world, storage)
    expect(world.phase).toBe('playing')
    expect(world.score).toBe(0)
  })

  it('keeps PIPE_SPACING available for spawn cadence', () => {
    expect(PIPE_SPACING).toBeGreaterThan(0)
  })
})
