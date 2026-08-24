import { describe, expect, it } from 'vitest'
import { HIGH_SCORE_KEY } from './constants'
import {
  applyPassScore,
  readHighScore,
  updateHighScore,
  writeHighScore,
} from './score'
import type { Bird, PipePair } from './types'

class MemoryStorage {
  private data = new Map<string, string>()
  getItem(key: string) {
    return this.data.has(key) ? this.data.get(key)! : null
  }
  setItem(key: string, value: string) {
    this.data.set(key, value)
  }
}

const bird = (x: number): Bird => ({
  x,
  y: 200,
  vy: 0,
  width: 34,
  height: 24,
})

describe('score', () => {
  it('increments once when bird crosses pipe right edge', () => {
    const pipes: PipePair[] = [
      { x: 40, gapCenterY: 300, gapSize: 150, width: 60, scored: false },
    ]
    const next = applyPassScore(bird(100), pipes, 0)
    expect(next).toBe(1)
    expect(pipes[0].scored).toBe(true)
    expect(applyPassScore(bird(120), pipes, next)).toBe(1)
  })

  it('reads 0 for missing or corrupt high scores', () => {
    const storage = new MemoryStorage()
    expect(readHighScore(storage)).toBe(0)
    storage.setItem(HIGH_SCORE_KEY, 'nope')
    expect(readHighScore(storage)).toBe(0)
  })

  it('writes and only updates on a new record', () => {
    const storage = new MemoryStorage()
    writeHighScore(storage, 3)
    expect(readHighScore(storage)).toBe(3)
    expect(updateHighScore(storage, 2, 3)).toBe(3)
    expect(readHighScore(storage)).toBe(3)
    expect(updateHighScore(storage, 5, 3)).toBe(5)
    expect(readHighScore(storage)).toBe(5)
  })
})
