export function createSpaceInput() {
  let pressed = false
  let edge = false

  const onKeyDown = (event: Event) => {
    const e = event as KeyboardEvent
    if (e.code !== 'Space') return
    e.preventDefault()
    if (!pressed) {
      pressed = true
      edge = true
    }
  }

  const onKeyUp = (event: Event) => {
    const e = event as KeyboardEvent
    if (e.code !== 'Space') return
    pressed = false
  }

  return {
    observe(target: EventTarget): () => void {
      target.addEventListener('keydown', onKeyDown)
      target.addEventListener('keyup', onKeyUp)
      return () => {
        target.removeEventListener('keydown', onKeyDown)
        target.removeEventListener('keyup', onKeyUp)
      }
    },
    consumeSpace(): boolean {
      if (!edge) return false
      edge = false
      return true
    },
  }
}
