export function createStarCursor() {
  const finePointer = window.matchMedia('(pointer: fine)').matches
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!finePointer || reducedMotion) return () => {}

  document.documentElement.classList.add('has-star-cursor')

  const el = document.createElement('div')
  el.className = 'star-cursor'
  el.setAttribute('aria-hidden', 'true')
  el.innerHTML = `
    <svg class="star-cursor__svg" viewBox="0 0 32 32" fill="none">
      <path
        class="star-cursor__spike"
        d="M16 2 L18.2 13.8 L30 16 L18.2 18.2 L16 30 L13.8 18.2 L2 16 L13.8 13.8 Z"
      />
      <circle class="star-cursor__core" cx="16" cy="16" r="2.2" />
    </svg>
  `
  document.body.appendChild(el)

  let x = window.innerWidth / 2
  let y = window.innerHeight / 2
  let tx = x
  let ty = y
  let raf = 0
  let hovering = false

  const interactiveSelector =
    'a, button, [role="button"], input, textarea, select, label, .project'

  const onMove = (event: PointerEvent) => {
    tx = event.clientX
    ty = event.clientY
  }

  const onOver = (event: PointerEvent) => {
    const target = event.target
    if (!(target instanceof Element)) return
    hovering = Boolean(target.closest(interactiveSelector))
    el.classList.toggle('is-hot', hovering)
  }

  const onLeave = () => {
    el.classList.add('is-gone')
  }

  const onEnter = () => {
    el.classList.remove('is-gone')
  }

  const tick = () => {
    x += (tx - x) * 0.28
    y += (ty - y) * 0.28
    el.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`
    raf = requestAnimationFrame(tick)
  }

  window.addEventListener('pointermove', onMove, { passive: true })
  window.addEventListener('pointerover', onOver, { passive: true })
  document.addEventListener('mouseleave', onLeave)
  document.addEventListener('mouseenter', onEnter)
  raf = requestAnimationFrame(tick)

  return () => {
    cancelAnimationFrame(raf)
    window.removeEventListener('pointermove', onMove)
    window.removeEventListener('pointerover', onOver)
    document.removeEventListener('mouseleave', onLeave)
    document.removeEventListener('mouseenter', onEnter)
    document.documentElement.classList.remove('has-star-cursor')
    el.remove()
  }
}
