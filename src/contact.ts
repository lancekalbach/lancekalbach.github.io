const RECIPIENT = 'lancekalbach@gmail.com'

export function setupContactModal() {
  const openBtn = document.querySelector<HTMLButtonElement>('#open-contact')
  const modal = document.querySelector<HTMLElement>('#contact-modal')
  const form = document.querySelector<HTMLFormElement>('#contact-form')
  if (!openBtn || !modal || !form) return

  const panel = modal.querySelector<HTMLElement>('.contact-modal__panel')
  const backdrop = modal.querySelector<HTMLElement>('.contact-modal__backdrop')
  const closeButtons = modal.querySelectorAll<HTMLElement>('[data-close-contact]')
  const firstField = form.querySelector<HTMLElement>('input, textarea')
  let lastFocus: HTMLElement | null = null

  const open = () => {
    lastFocus = document.activeElement instanceof HTMLElement ? document.activeElement : openBtn
    modal.hidden = false
    // Force reflow so enter transition runs
    void modal.offsetWidth
    modal.classList.add('is-open')
    document.body.classList.add('modal-open')
    modal.setAttribute('aria-hidden', 'false')
    window.setTimeout(() => firstField?.focus(), 280)
  }

  const close = () => {
    if (!modal.classList.contains('is-open')) return
    modal.classList.remove('is-open')
    modal.setAttribute('aria-hidden', 'true')
    document.body.classList.remove('modal-open')

    let finished = false
    const finish = () => {
      if (finished) return
      finished = true
      modal.hidden = true
      lastFocus?.focus()
    }

    panel?.addEventListener('transitionend', finish, { once: true })
    window.setTimeout(finish, 520)
  }

  openBtn.addEventListener('click', open)
  backdrop?.addEventListener('click', close)
  for (const btn of closeButtons) btn.addEventListener('click', close)

  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modal.classList.contains('is-open')) {
      event.preventDefault()
      close()
    }
  })

  form.addEventListener('submit', (event) => {
    event.preventDefault()
    const data = new FormData(form)
    const name = String(data.get('name') ?? '').trim()
    const email = String(data.get('email') ?? '').trim()
    const message = String(data.get('message') ?? '').trim()

    if (!name || !email || !message) return

    const subject = encodeURIComponent(`Portfolio message from ${name}`)
    const body = encodeURIComponent(
      `${message}\n\n—\n${name}\n${email}`,
    )
    window.location.href = `mailto:${RECIPIENT}?subject=${subject}&body=${body}`
    close()
  })
}
