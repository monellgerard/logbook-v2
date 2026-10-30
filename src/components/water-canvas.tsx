'use client'
import { useEffect, useRef } from 'react'
// Agua interactiva: simulación de ondas sobre una imagen. El cursor (o el dedo) crea ondas que refractan la imagen.
export default function WaterCanvas({ src }: { src: string }) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = ref.current!, ctx = canvas.getContext('2d')!
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
    let W = 0, H = 0, S = 3, base: Uint8ClampedArray, cur: Float32Array, prev: Float32Array, out: ImageData, raf = 0, last = 0, alive = true, ambient = 0
    const img = new Image()
    const isDark = () => document.documentElement.classList.contains('dark')
    function build() {
      S = innerWidth > 1400 ? 3 : 2.5; W = Math.ceil(innerWidth / S); H = Math.ceil(innerHeight / S); canvas.width = W; canvas.height = H
      const off = document.createElement('canvas'); off.width = W; off.height = H; const o = off.getContext('2d')!
      const k = Math.max(W / img.width, H / img.height), dw = img.width * k, dh = img.height * k; o.drawImage(img, (W - dw) / 2, (H - dh) / 2, dw, dh)
      const data = o.getImageData(0, 0, W, H).data
      if (isDark()) for (let i = 0; i < data.length; i += 4) { data[i] *= 0.42; data[i + 1] *= 0.5; data[i + 2] *= 0.62 }   // versión «noche»
      base = data; cur = new Float32Array(W * H); prev = new Float32Array(W * H); out = ctx.createImageData(W, H); draw()
    }
    function drop(x: number, y: number, s: number) {
      const cx = Math.floor(x / S), cy = Math.floor(y / S), r = 3
      for (let j = -r; j <= r; j++) for (let i = -r; i <= r; i++) { const xx = cx + i, yy = cy + j; if (xx > 1 && yy > 1 && xx < W - 2 && yy < H - 2 && i * i + j * j <= r * r) cur[yy * W + xx] += s }
    }
    function step() {
      for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) { const i = y * W + x; prev[i] = ((cur[i - 1] + cur[i + 1] + cur[i - W] + cur[i + W]) / 2 - prev[i]) * 0.985 }
      const t = cur; cur = prev; prev = t
    }
    function draw() {
      const d = out.data
      for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
        const i = y * W + x, dx = cur[i + 1] - cur[i - 1], dy = cur[i + W] - cur[i - W]
        let sx = (x + dx * 0.55) | 0, sy = (y + dy * 0.55) | 0; sx = sx < 0 ? 0 : sx >= W ? W - 1 : sx; sy = sy < 0 ? 0 : sy >= H ? H - 1 : sy
        const p = (sy * W + sx) * 4, o = i * 4, sh = (dx - dy) * 0.9
        d[o] = base[p] + sh; d[o + 1] = base[p + 1] + sh; d[o + 2] = base[p + 2] + sh * 1.1; d[o + 3] = 255
      }
      ctx.putImageData(out, 0, 0)
    }
    function loop(t: number) {
      if (!alive) return
      raf = requestAnimationFrame(loop)
      if (t - last < 30) return; last = t
      if (t - ambient > 1800) { ambient = t; drop(Math.random() * innerWidth, Math.random() * innerHeight, 40 + Math.random() * 40) }
      step(); draw()
    }
    let px = 0, py = 0
    const move = (e: PointerEvent) => { if (!cur) return; const v = Math.min(Math.hypot(e.clientX - px, e.clientY - py), 60); px = e.clientX; py = e.clientY; if (v > 2) drop(px, py, 25 + v * 1.6) }
    const down = (e: PointerEvent) => cur && drop(e.clientX, e.clientY, 260)
    let rt = 0; const resize = () => { clearTimeout(rt); rt = window.setTimeout(() => img.complete && build(), 200) }
    img.onload = () => { build(); if (!reduce) { cancelAnimationFrame(raf); raf = requestAnimationFrame(loop) } }
    img.src = src
    const mo = new MutationObserver(() => img.complete && build()); mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    addEventListener('pointermove', move); addEventListener('pointerdown', down); addEventListener('resize', resize)
    return () => { alive = false; cancelAnimationFrame(raf); mo.disconnect(); removeEventListener('pointermove', move); removeEventListener('pointerdown', down); removeEventListener('resize', resize) }
  }, [src])
  return <><canvas ref={ref} aria-hidden="true" className="water-canvas" /><div aria-hidden="true" className="water-veil" /></>
}
