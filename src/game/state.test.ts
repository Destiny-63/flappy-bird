import { describe, expect, it } from 'vitest'
import { toGameOver, transition } from './state'

describe('state', () => {
  it('starts a run from ready on space', () => {
    expect(transition('ready', 'space')).toBe('playing')
  })

  it('keeps playing on space (flap is not a phase change)', () => {
    expect(transition('playing', 'space')).toBe('playing')
  })

  it('restarts from gameover on space', () => {
    expect(transition('gameover', 'space')).toBe('playing')
  })

  it('enters gameover only from playing', () => {
    expect(toGameOver('playing')).toBe('gameover')
    expect(toGameOver('ready')).toBe('ready')
    expect(toGameOver('gameover')).toBe('gameover')
  })
})
