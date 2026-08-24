import { describe, expect, it } from 'vitest'
import { createSpaceInput } from './keyboard'

class FakeTarget {
  private listeners = new Map<string, Set<EventListener>>()
  addEventListener(type: string, listener: EventListener) {
    if (!this.listeners.has(type)) this.listeners.set(type, new Set())
    this.listeners.get(type)!.add(listener)
  }
  removeEventListener(type: string, listener: EventListener) {
    this.listeners.get(type)?.delete(listener)
  }
  dispatch(type: string, event: { code: string; preventDefault(): void }) {
    for (const listener of this.listeners.get(type) ?? []) {
      listener(event as unknown as Event)
    }
  }
}

describe('keyboard', () => {
  it('consumes one space edge per keydown', () => {
    const input = createSpaceInput()
    const target = new FakeTarget()
    const stop = input.observe(target as unknown as EventTarget)
    const preventDefault = () => {}

    expect(input.consumeSpace()).toBe(false)
    target.dispatch('keydown', { code: 'Space', preventDefault })
    expect(input.consumeSpace()).toBe(true)
    expect(input.consumeSpace()).toBe(false)
    target.dispatch('keyup', { code: 'Space', preventDefault })
    target.dispatch('keydown', { code: 'Space', preventDefault })
    expect(input.consumeSpace()).toBe(true)
    stop()
  })
})
