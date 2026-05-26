'use client'

import { useEffect } from 'react'

const INTERACTIVE = 'a, button, [role="button"], label, select'

export function Cursor() {
  useEffect(() => {
    const dot  = document.getElementById('cursor-dot')
    const ring = document.getElementById('cursor-ring')
    if (!dot || !ring) return

    let ringX = 0, ringY = 0
    let mouseX = 0, mouseY = 0
    let rafId: number

    /* ── Coordinate tracking (mousemove) ── */
    function onMouseMove(e: MouseEvent) {
      mouseX = e.clientX
      mouseY = e.clientY
      dot!.style.transform = `translate(calc(${mouseX}px - 50%), calc(${mouseY}px - 50%))`
    }

    function lerp(a: number, b: number, t: number) { return a + (b - a) * t }

    function tick() {
      ringX = lerp(ringX, mouseX, 0.12)
      ringY = lerp(ringY, mouseY, 0.12)
      ring!.style.transform = `translate(calc(${ringX}px - 50%), calc(${ringY}px - 50%))`
      rafId = requestAnimationFrame(tick)
    }

    /* ── Hover detection (mouseover/mouseout) ──────────────────────────
       Using over/out instead of move+elementFromPoint because:
       - elementFromPoint returns #cursor-dot (z-index 9999) not the page element
       - pointer-events:none skips cursor elements for real mouse events,
         so e.target here is always the actual underlying element            */
    function onMouseOver(e: MouseEvent) {
      if ((e.target as HTMLElement)?.closest(INTERACTIVE)) {
        document.body.classList.add('cursor-hover')
      }
    }

    function onMouseOut(e: MouseEvent) {
      const to = e.relatedTarget as HTMLElement | null
      if (!to?.closest(INTERACTIVE)) {
        document.body.classList.remove('cursor-hover')
      }
    }

    /* ── Visibility when leaving/entering window ── */
    function onMouseLeave() {
      document.body.classList.remove('cursor-hover')
      dot!.style.opacity  = '0'
      ring!.style.opacity = '0'
    }
    function onMouseEnter() {
      dot!.style.opacity  = '1'
      ring!.style.opacity = '1'
    }

    window.addEventListener('mousemove',   onMouseMove,  { passive: true })
    document.addEventListener('mouseover', onMouseOver,  { passive: true })
    document.addEventListener('mouseout',  onMouseOut,   { passive: true })
    document.documentElement.addEventListener('mouseleave', onMouseLeave)
    document.documentElement.addEventListener('mouseenter', onMouseEnter)
    rafId = requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('mousemove',   onMouseMove)
      document.removeEventListener('mouseover', onMouseOver)
      document.removeEventListener('mouseout',  onMouseOut)
      document.documentElement.removeEventListener('mouseleave', onMouseLeave)
      document.documentElement.removeEventListener('mouseenter', onMouseEnter)
      cancelAnimationFrame(rafId)
      document.body.classList.remove('cursor-hover')
    }
  }, [])

  return (
    <>
      <div id="cursor-dot"  aria-hidden="true" />
      <div id="cursor-ring" aria-hidden="true" />
    </>
  )
}
