'use client'
import { useRef, useState, useTransition } from 'react'
import { uploadPhoto } from './actions'
// Reduce cualquier foto a un JPG de ≤ 1200 px antes de enviarla; se sube sola al elegirla.
async function shrink(file: File): Promise<Blob> {
  const bmp = await createImageBitmap(file)
  const k = Math.min(1, 1200 / Math.max(bmp.width, bmp.height))
  const c = document.createElement('canvas'); c.width = Math.round(bmp.width * k); c.height = Math.round(bmp.height * k)
  c.getContext('2d')!.drawImage(bmp, 0, 0, c.width, c.height)
  return new Promise((res, rej) => c.toBlob((b) => (b ? res(b) : rej(new Error('No se pudo procesar la imagen'))), 'image/jpeg', 0.86))
}
export default function PhotoUploader({ hasPhoto }: { hasPhoto: boolean }) {
  const ref = useRef<HTMLInputElement>(null)
  const [msg, setMsg] = useState(''), [pending, start] = useTransition()
  async function pick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; e.target.value = ''
    if (!f) return
    setMsg('')
    let blob: Blob
    try { blob = await shrink(f) } catch { return setMsg('No se puede leer esa imagen. Si es HEIC/HEIF, expórtala como JPG o PNG.') }
    const fd = new FormData(); fd.set('photo', new File([blob], 'foto.jpg', { type: 'image/jpeg' }))
    start(async () => { await uploadPhoto(fd) })
  }
  return <div className="text-center"><input ref={ref} type="file" accept="image/*" onChange={pick} className="hidden" />
    <button type="button" onClick={() => ref.current?.click()} disabled={pending} className={hasPhoto ? 'pill !px-3 !py-1 text-xs' : 'btn'}>{pending ? 'Subiendo…' : hasPhoto ? 'Cambiar foto' : 'Subir foto'}</button>
    {msg && <p className="mt-2 text-xs text-red-700">{msg}</p>}</div>
}
