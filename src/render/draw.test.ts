import { describe, expect, it } from 'vitest'
import { overlayTitle } from './draw'

describe('draw helpers', () => {
  it('returns Chinese titles for overlays', () => {
    expect(overlayTitle('ready')).toBe('按空格开始')
    expect(overlayTitle('gameover')).toBe('游戏结束')
    expect(overlayTitle('playing')).toBeNull()
  })
})
