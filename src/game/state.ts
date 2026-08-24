import type { GamePhase } from './types'

export function transition(phase: GamePhase, event: 'space'): GamePhase {
  if (event !== 'space') return phase
  if (phase === 'ready') return 'playing'
  if (phase === 'gameover') return 'playing'
  return phase
}

export function toGameOver(phase: GamePhase): GamePhase {
  return phase === 'playing' ? 'gameover' : phase
}
