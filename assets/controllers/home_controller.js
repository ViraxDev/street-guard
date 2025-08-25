import { Controller } from '@hotwired/stimulus'
import { createIcons, icons } from 'lucide'

export default class extends Controller {
  connect() {
    // Bind handlers so we can remove them on disconnect
    this.onDocumentClick = this.onDocumentClick.bind(this)
    this.onAnchorClick = this.onAnchorClick.bind(this)

    try {
      createIcons({ icons })
    } catch (e) {}

    // 2) Year placeholder
    const yearEl = document.getElementById('year')
    if (yearEl) yearEl.textContent = String(new Date().getFullYear())

    // 3) Mobile menu interactions
    this.mobileMenuButton = document.getElementById('mobile-menu-button')
    this.mobileMenu = document.getElementById('mobile-menu')

    if (this.mobileMenuButton && this.mobileMenu) {
      this.mobileButtonHandler = (e) => {
        e.stopPropagation()

        this.mobileMenu.classList.toggle('open')
        const menuIcon = this.mobileMenuButton.querySelector('svg')

        if (menuIcon) {
          if (this.mobileMenu.classList.contains('open')) {
            menuIcon.innerHTML = '<line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>'
          } else {
            menuIcon.innerHTML = '<line x1="4" x2="20" y1="12" y2="12"></line><line x1="4" x2="20" y1="6" y2="6"></line><line x1="4" x2="20" y1="18" y2="18"></line>'
          }
          try { createIcons({ icons }) } catch (e) {}
        }
      }
      this.mobileMenuButton.addEventListener('click', this.mobileButtonHandler)

      this.mobileMenuClickStop = (e) => e.stopPropagation()
      this.mobileMenu.addEventListener('click', this.mobileMenuClickStop)

      document.addEventListener('click', this.onDocumentClick)
    }

    // 4) Particles background generation (run once)
    const particlesContainer = document.getElementById('particles')
    if (particlesContainer && !particlesContainer.__sgParticlesInited) {
      particlesContainer.__sgParticlesInited = true
      const particleCount = 50
      for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div')
        particle.classList.add('particle')
        const size = Math.random() * 4 + 1
        const posX = Math.random() * 100
        const posY = Math.random() * 100
        const delay = Math.random() * 20
        const duration = Math.random() * 10 + 20
        particle.style.width = `${size}px`
        particle.style.height = `${size}px`
        particle.style.left = `${posX}%`
        particle.style.top = `${posY}%`
        particle.style.animationDelay = `${delay}s`
        particle.style.animationDuration = `${duration}s`
        particlesContainer.appendChild(particle)
      }
    }

    // 5) Smooth anchor scrolling
    this.headerOffset = 100
    this.anchorLinks = Array.from(document.querySelectorAll('a[href^="#"]:not([href="#"])'))
    this.anchorLinks.forEach(link => link.addEventListener('click', this.onAnchorClick))
  }

  disconnect() {
    // Cleanup listeners
    if (this.mobileMenuButton && this.mobileButtonHandler) {
      this.mobileMenuButton.removeEventListener('click', this.mobileButtonHandler)
    }
    if (this.mobileMenu && this.mobileMenuClickStop) {
      this.mobileMenu.removeEventListener('click', this.mobileMenuClickStop)
    }
    document.removeEventListener('click', this.onDocumentClick)
    if (this.anchorLinks) {
      this.anchorLinks.forEach(link => link.removeEventListener('click', this.onAnchorClick))
    }
  }

  // Helpers
  easeOutCubic(t) { return 1 - Math.pow(1 - t, 3) }

  smoothScrollTo(targetY, duration = 400) {
    return new Promise((resolve) => {
      const startY = window.pageYOffset
      const distance = targetY - startY
      const startTime = performance.now()
      const step = (currentTime) => {
        const elapsed = currentTime - startTime
        const progress = Math.min(elapsed / duration, 1)
        const eased = this.easeOutCubic(progress)
        window.scrollTo(0, startY + distance * eased)
        if (progress < 1) requestAnimationFrame(step)
        else resolve()
      }
      requestAnimationFrame(step)
    })
  }

  closeMobileMenuIfOpen() {
    if (this.mobileMenu && this.mobileMenu.classList.contains('open')) {
      this.mobileMenu.classList.remove('open')
      const menuIcon = this.mobileMenuButton ? this.mobileMenuButton.querySelector('svg') : null
      if (menuIcon) {
        menuIcon.innerHTML = '<line x1="4" x2="20" y1="12" y2="12"></line><line x1="4" x2="20" y1="6" y2="6"></line><line x1="4" x2="20" y1="18" y2="18"></line>'
        try { createIcons({ icons }) } catch (e) {}
      }
    }
  }

  onDocumentClick(e) {
    if (!this.mobileMenuButton || !this.mobileMenu) return
    const path = typeof e.composedPath === 'function' ? e.composedPath() : null
    const clickedInside = path
      ? (path.includes(this.mobileMenuButton) || path.includes(this.mobileMenu))
      : (this.mobileMenu.contains(e.target) || this.mobileMenuButton.contains(e.target))
    if (clickedInside) return
    this.closeMobileMenuIfOpen()
  }

  onAnchorClick(e) {
    const href = e.currentTarget.getAttribute('href')
    if (!href || href === '#') return
    const id = decodeURIComponent(href.substring(1))
    const target = document.getElementById(id)
    if (!target) return
    e.preventDefault()
    const targetRectTop = target.getBoundingClientRect().top
    const targetY = window.pageYOffset + targetRectTop - this.headerOffset
    this.closeMobileMenuIfOpen()
    this.smoothScrollTo(targetY, 50).then(() => {
      try {
        if (history.replaceState) { history.replaceState(null, '', '#' + id) }
        else { window.location.hash = id }
      } catch (e) {}
      target.classList.add('anchor-highlight')
      target.setAttribute('tabindex', '-1')
      try { target.focus({ preventScroll: true }) } catch (e) {}
      setTimeout(() => target.classList.remove('anchor-highlight'), 600)
    })
  }
}
