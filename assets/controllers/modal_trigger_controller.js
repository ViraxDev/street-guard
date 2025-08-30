import { Controller } from '@hotwired/stimulus'

export default class extends Controller {
    static values = { targetId: String }

    connect() {
        this.element.classList.add('modal-trigger')
    }

    open(e) {
        if (e) e.preventDefault()

        this.element.classList.add('clicking')
        setTimeout(() => this.element.classList.remove('clicking'), 150)

        const hrefId = (this.element.getAttribute('href') || '').replace('#','')
        const id = this.targetIdValue || hrefId

        if (!id) {
            console.warn('No modal ID found for trigger:', this.element)
            return
        }

        document.dispatchEvent(new CustomEvent('modal:open', { detail: { id } }))
    }

    close(e) {
        if (e) e.preventDefault()

        const id = this.targetIdValue || ''
        document.dispatchEvent(new CustomEvent('modal:close', { detail: { id } }))
    }
}
