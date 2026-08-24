const canvas = document.getElementById('game')
if (!(canvas instanceof HTMLCanvasElement)) {
  throw new Error('Missing #game canvas')
}
const ctx = canvas.getContext('2d')
if (!ctx) {
  throw new Error('2D context unavailable')
}
ctx.fillStyle = '#87ceeb'
ctx.fillRect(0, 0, canvas.width, canvas.height)
