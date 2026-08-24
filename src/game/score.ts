import { HIGH_SCORE_KEY } from './constants'
import type { Bird, PipePair } from './types'

export type StorageLike = {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
}

export function applyPassScore(
  bird: Bird,
  pipes: PipePair[],
  score: number,
): number {
  let next = score
  for (const pipe of pipes) {
    if (!pipe.scored && bird.x >= pipe.x + pipe.width) {
      pipe.scored = true
      next += 1
    }
  }
  return next
}

export function readHighScore(storage: StorageLike): number {
  try {
    const raw = storage.getItem(HIGH_SCORE_KEY)
    if (raw == null) return 0
    const n = Number(raw)
    return Number.isFinite(n) && n >= 0 ? Math.floor(n) : 0
  } catch {
    return 0
  }
}

export function writeHighScore(storage: StorageLike, value: number): void {
  try {
    storage.setItem(HIGH_SCORE_KEY, String(value))
  } catch {
    // ignore quota / privacy errors
  }
}

export function updateHighScore(
  storage: StorageLike,
  score: number,
  highScore: number,
): number {
  if (score > highScore) {
    writeHighScore(storage, score)
    return score
  }
  return highScore
}
