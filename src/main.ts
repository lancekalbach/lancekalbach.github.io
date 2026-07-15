import './style.css'
import { setupContactModal } from './contact'
import { createStarCursor } from './cursor'
import { createStarfield } from './stars'

type ShowcasePiece = {
  title: string
  image: string
  imageAlt: string
  description: string
}

const projects: {
  id: string
  name: string
  role: string
  blurb: string
  details: string[]
  tags: string[]
  showcase?: ShowcasePiece[]
}[] = [
  {
    id: 'northbound',
    name: 'Software Development',
    role: 'Engineering',
    blurb:
      'I build web applications and digital products — from interfaces people use every day to the systems behind them.',
    details: [
      'Experienced and adaptable web developer specializing in the MERN (MongoDB, Express.js, React, Node.js) stack with a proven ability to thrive in high-stress environments.',
      'Proficient in JavaScript, CSS, and HTML, with a focus on creating dynamic and responsive user interfaces.',
      'Expertise in database design and management using MongoDB and Mongoose.',
      'Comfortable building with AI tooling in the workflow — using it to move faster on research, scaffolding, and iteration without sacrificing code quality or polish on the finished product.',
      'Education — V School Coding Bootcamp (Remote, Aug 2022): learned industry best practices and practical software development standards with a focus on HTML5, CSS3, JavaScript, Node.js, React, REST APIs, and MongoDB. Created and deployed mobile-first applications while learning new languages and frameworks by collaborating every week with a senior web developer.',
    ],
    tags: ['MERN', 'JavaScript', 'MongoDB', 'AI Tooling'],
    showcase: [
      {
        title: 'Memora Events Website',
        image: '/work/memora-events.png',
        imageAlt: 'Full-page design of the Memora Events website',
        description:
          'Collaborated closely with a UI/UX Designer and another Developer to construct a website tailored for an event planning service, leveraging the Figma design as a blueprint. Engaged in weekly SCRUM meetings and delivered daily standup progress reports to ensure seamless project coordination. Received task assignments from the project manager within sprint cycles and met deadlines for timely completion. Worked with the fellow developer to resolve code conflicts and maintain codebase integrity throughout the development phase.',
      },
    ],
  },
  {
    id: 'lumen',
    name: 'Trail Building',
    role: 'Design & construction',
    blurb:
      'I design and build mountain bike trails, including excavator work, chainsaw tree felling, cleanup, and more when the job calls for it.',
    details: [
      'Plan, design, and lay out new mountain bike trails by surveying terrain, shooting grade, and flagging trails.',
      'Build and maintain mountain bike trails with hand tools and heavy equipment, with an eye for sustainability and rider safety.',
      'Operate excavators, chainsaws, and other heavy machinery for trail construction, maintenance, and land management.',
      'Handle tree felling, brush clearing, and vegetation management to support trail development and ongoing maintenance.',
    ],
    tags: ['Excavator', 'Chainsaw', 'Trail design'],
  },
  {
    id: 'signal',
    name: 'Bike Park',
    role: 'Operations · management',
    blurb:
      'I helped manage a bike park for two years, running weekend operations, leading staff, and keeping trails and guests safe day to day.',
    details: [
      'Ran all aspects of weekend park operations to keep the day safe, efficient, and customer-focused.',
      'Supervised shuttle drivers, trail crews, and operational staff — coordinating schedules and assigning daily responsibilities.',
      'Monitored trail conditions and prioritized repairs to keep riding experiences high-quality and safe.',
      'Enforced safety procedures for staff, volunteers, and guests across daily operations and construction work.',
      'Supported operational planning, logistics, and ongoing improvements to park infrastructure and trail systems.',
      'Assisted with guest and partner emails, and created Instagram posts to keep riders informed and the parks online presence active.',
      'Supported fabrication work by designing parts such as brackets in CAD software and utilized an arcdroid to cut them out of steel, along with assisting on welding projects.',
    ],
    tags: ['Operations', 'Team lead', 'Fabrication', 'Media'],
  },
]

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div id="webgl" aria-hidden="true"></div>

  <header class="nav">
    <a class="nav__brand" href="#top">LK</a>
    <nav class="nav__links" aria-label="Primary">
      <a href="#about">About</a>
      <a href="#work">Work</a>
      <a href="#contact">Contact</a>
    </nav>
  </header>

  <main class="scroll-space">
    <section class="hero" id="top">
      <div class="hero__content">
        <h1 class="hero__name">
          <span class="visually-hidden">Lance Kalbach</span>
          <svg
            class="hero__name-svg"
            viewBox="0 0 1520 500"
            role="presentation"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="nameGrad" x1="0%" y1="0%" x2="100%" y2="50%">
                <stop offset="0%" stop-color="#7a8a45">
                  <animate
                    attributeName="stop-color"
                    values="#7a8a45;#a05a28;#8f6339;#9a7340;#7a8a45"
                    dur="8s"
                    repeatCount="indefinite"
                  />
                </stop>
                <stop offset="40%" stop-color="#a05a28">
                  <animate
                    attributeName="stop-color"
                    values="#a05a28;#8b4f24;#b06a32;#a05a28;#a05a28"
                    dur="8s"
                    repeatCount="indefinite"
                  />
                </stop>
                <stop offset="70%" stop-color="#8f6339">
                  <animate
                    attributeName="stop-color"
                    values="#8f6339;#a05a28;#b0894f;#8f6339;#8f6339"
                    dur="8s"
                    repeatCount="indefinite"
                  />
                </stop>
                <stop offset="100%" stop-color="#b0894f">
                  <animate
                    attributeName="stop-color"
                    values="#b0894f;#a05a28;#8f6339;#c49a5c;#b0894f"
                    dur="8s"
                    repeatCount="indefinite"
                  />
                </stop>
              </linearGradient>
            </defs>
            <text
              x="760"
              y="195"
              text-anchor="middle"
              fill="url(#nameGrad)"
            >LANCE</text>
            <text
              x="760"
              y="415"
              text-anchor="middle"
              fill="url(#nameGrad)"
            >KALBACH</text>
          </svg>
        </h1>
        <p class="hero__tagline">Software Developer &amp; Trail Builder</p>
      </div>
      <div class="hero__scroll" aria-hidden="true">
        <span>Scroll</span>
        <div class="hero__scroll-line"></div>
      </div>
    </section>

    <section class="panel about" id="about">
      <div class="panel__inner panel__inner--wide reveal">
        <div class="about__layout">
          <header class="about__intro">
            <p class="panel__eyebrow">About</p>
            <h2 class="panel__title">Hi, I'm Lance.</h2>
          </header>
          <div class="about__copy">
            <p>
              I'm a software developer and a trail builder. I care about making things that work well,
              whether that's an application people rely on, or a trail that feels like a roller coaster.
            </p>
            <p>
              For two years I helped manage a bike park, running operations, maintaining and building trails, and leading a team.
              I've also worked as a bike mechanic, so I know the equipment side of riding as well as the dirt.
            </p>
            <p>
              On the build side, I'm an experienced excavator operator and I know my way around a chainsaw —
              useful tools when you're shaping ground and clearing corridor for trail. I am also comfortable with getting a bit more hands on 
              and cutting in some amazing tech trails by hand. After all, my background stems from riding tech trails all over Utah. 
            </p>
            <p>
              When I'm not developing software, I'm usually outside mountain biking, building trail, or somewhere in the outdoors.
            </p>
          </div>
        </div>
      </div>
    </section>

    <section class="panel work" id="work">
      <div class="panel__inner reveal">
        <p class="panel__eyebrow">Work</p>
        <h2 class="panel__title">What I do</h2>
        <ul class="project-list">
          ${projects
            .map(
              (project) => `
            <li>
              <article
                class="project"
                data-constellation="${project.id}"
              >
                <button
                  type="button"
                  class="project__trigger"
                  aria-expanded="false"
                  aria-controls="project-${project.id}"
                >
                  <div class="project__top">
                    <div class="project__meta">
                      <h3 class="project__name">${project.name}</h3>
                      <span class="project__role">${project.role}</span>
                    </div>
                    <span class="project__toggle" aria-hidden="true"></span>
                  </div>
                  <p class="project__blurb">${project.blurb}</p>
                </button>
                <div
                  class="project__drawer"
                  id="project-${project.id}"
                >
                  <div class="project__drawer-inner">
                    <div class="project__details">
                      ${project.details.map((paragraph) => `<p>${paragraph}</p>`).join('')}
                      <ul class="project__tags">
                        ${project.tags.map((tag) => `<li>${tag}</li>`).join('')}
                      </ul>
                      ${
                        /* Re-enable when more software work is ready to show
                        project.showcase?.length
                          ? `<button type="button" class="project__work-btn" data-open-work="${project.id}">View work</button>`
                          : ''
                        */
                        ''
                      }
                    </div>
                  </div>
                </div>
              </article>
            </li>
          `,
            )
            .join('')}
        </ul>
      </div>
    </section>

    <section class="panel contact" id="contact">
      <div class="panel__inner reveal">
        <p class="panel__eyebrow">Contact</p>
        <h2 class="panel__title">Get in touch</h2>
        <p class="contact__copy">
          Interested in working together on software, trail projects, or both? Reach out.
        </p>
        <div class="contact__actions">
          <button type="button" class="contact__button" id="open-contact">
            Send a message
          </button>
          <a class="contact__link" href="https://github.com/lancekalbach" target="_blank" rel="noreferrer">GitHub</a>
          <a class="contact__link" href="https://www.linkedin.com/in/lancekalbach" target="_blank" rel="noreferrer">LinkedIn</a>
        </div>
      </div>
    </section>

    <footer class="footer">
      <p>
        © ${new Date().getFullYear()} Lance Kalbach
        <span class="footer__cross" aria-hidden="true" title="">†</span>
      </p>
    </footer>
  </main>

  <div
    class="contact-modal"
    id="contact-modal"
    hidden
    aria-hidden="true"
  >
    <div class="contact-modal__backdrop" data-close-contact></div>
    <div
      class="contact-modal__panel"
      role="dialog"
      aria-modal="true"
      aria-labelledby="contact-modal-title"
    >
      <svg class="contact-modal__frame" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <rect class="contact-modal__frame-path" x="1" y="1" width="98" height="98" pathLength="100" />
      </svg>
      <button type="button" class="contact-modal__close" data-close-contact aria-label="Close contact form">
        ✕
      </button>
      <p class="panel__eyebrow">Contact</p>
      <h2 class="contact-modal__title" id="contact-modal-title">Send a message</h2>
      <form class="contact-form" id="contact-form">
        <label class="contact-form__field">
          <span>Name</span>
          <input type="text" name="name" autocomplete="name" required />
        </label>
        <label class="contact-form__field">
          <span>Email</span>
          <input type="email" name="email" autocomplete="email" required />
        </label>
        <label class="contact-form__field contact-form__field--full">
          <span>Message</span>
          <textarea name="message" rows="5" required></textarea>
        </label>
        <div class="contact-form__actions">
          <button type="submit" class="contact__button">Send</button>
          <button type="button" class="contact-form__cancel" data-close-contact>Cancel</button>
        </div>
      </form>
    </div>
  </div>

  <div
    class="work-modal"
    id="work-modal"
    hidden
    aria-hidden="true"
  >
    <div class="work-modal__backdrop" data-close-work></div>
    <div
      class="work-modal__panel"
      role="dialog"
      aria-modal="true"
      aria-labelledby="work-modal-title"
    >
      <button type="button" class="work-modal__close" data-close-work aria-label="Close work gallery">
        ✕
      </button>
      <p class="panel__eyebrow">Software</p>
      <h2 class="work-modal__title" id="work-modal-title">Selected work</h2>
      <div class="work-modal__list" id="work-modal-list"></div>
    </div>
  </div>
`

const canvasHost = document.querySelector<HTMLElement>('#webgl')
const starfield = canvasHost ? createStarfield(canvasHost) : null

createStarCursor()
setupContactModal()
// _setupWorkModal() // re-enable with the View work button

const scrollCue = document.querySelector<HTMLElement>('.hero__scroll')
const updateScrollCue = () => {
  if (!scrollCue) return
  const fadeDistance = Math.min(220, window.innerHeight * 0.28)
  const opacity = Math.max(0, 1 - window.scrollY / fadeDistance)
  scrollCue.style.setProperty('--scroll-cue-opacity', String(opacity))
  scrollCue.toggleAttribute('data-hidden', opacity <= 0.02)
}
window.addEventListener('scroll', updateScrollCue, { passive: true })
updateScrollCue()

const projectItems = document.querySelectorAll<HTMLElement>('.project[data-constellation]')

const closeProject = (project: HTMLElement) => {
  project.classList.remove('is-open')
  const trigger = project.querySelector<HTMLButtonElement>('.project__trigger')
  trigger?.setAttribute('aria-expanded', 'false')
}

const openProject = (project: HTMLElement) => {
  for (const item of projectItems) {
    if (item !== project) closeProject(item)
  }
  project.classList.add('is-open')
  const trigger = project.querySelector<HTMLButtonElement>('.project__trigger')
  trigger?.setAttribute('aria-expanded', 'true')
}

for (const project of projectItems) {
  const id = project.dataset.constellation ?? null
  const trigger = project.querySelector<HTMLButtonElement>('.project__trigger')

  const activate = () => {
    starfield?.setHighlight(id)
    document.documentElement.dataset.sky = id ?? ''
  }
  const clear = () => {
    starfield?.setHighlight(null)
    delete document.documentElement.dataset.sky
  }

  project.addEventListener('pointerenter', activate)
  project.addEventListener('pointerleave', clear)
  project.addEventListener('focusin', activate)
  project.addEventListener('focusout', (event) => {
    if (!project.contains(event.relatedTarget as Node | null)) clear()
  })

  trigger?.addEventListener('click', () => {
    if (project.classList.contains('is-open')) closeProject(project)
    else openProject(project)
  })
}

const revealEls = document.querySelectorAll<HTMLElement>('.reveal')
const observer = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible')
        observer.unobserve(entry.target)
      }
    }
  },
  { threshold: 0.2 },
)

for (const el of revealEls) observer.observe(el)

function _setupWorkModal() {
  const modal = document.querySelector<HTMLElement>('#work-modal')
  const list = document.querySelector<HTMLElement>('#work-modal-list')
  if (!modal || !list) return

  const panel = modal.querySelector<HTMLElement>('.work-modal__panel')
  const backdrop = modal.querySelector<HTMLElement>('.work-modal__backdrop')
  const closeButtons = modal.querySelectorAll<HTMLElement>('[data-close-work]')
  const openButtons = document.querySelectorAll<HTMLButtonElement>('[data-open-work]')
  let lastFocus: HTMLElement | null = null

  const fillShowcase = (projectId: string) => {
    const project = projects.find((item) => item.id === projectId)
    const pieces = project?.showcase ?? []
    list.innerHTML = pieces
      .map(
        (piece) => `
      <article class="work-piece">
        <img
          class="work-piece__image"
          src="${piece.image}"
          alt="${piece.imageAlt}"
          loading="lazy"
        />
        <div class="work-piece__copy">
          <h3 class="work-piece__title">${piece.title}</h3>
          <p class="work-piece__description">${piece.description}</p>
        </div>
      </article>
    `,
      )
      .join('')
  }

  const open = (projectId: string, trigger: HTMLElement) => {
    fillShowcase(projectId)
    lastFocus = trigger
    modal.hidden = false
    void modal.offsetWidth
    modal.classList.add('is-open')
    document.body.classList.add('modal-open')
    modal.setAttribute('aria-hidden', 'false')
    window.setTimeout(() => {
      modal.querySelector<HTMLElement>('.work-modal__close')?.focus()
    }, 280)
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

  for (const btn of openButtons) {
    btn.addEventListener('click', (event) => {
      event.stopPropagation()
      const projectId = btn.dataset.openWork
      if (projectId) open(projectId, btn)
    })
  }

  backdrop?.addEventListener('click', close)
  for (const btn of closeButtons) btn.addEventListener('click', close)

  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modal.classList.contains('is-open')) {
      event.preventDefault()
      close()
    }
  })
}

void _setupWorkModal
