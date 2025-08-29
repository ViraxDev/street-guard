import { Controller } from '@hotwired/stimulus'

export default class extends Controller {
  open(e) {
    if (e) e.preventDefault()
    const hrefId = (this.element.getAttribute('href') || '').replace('#','')
    const id = this.element.dataset.modalTriggerTargetId || hrefId
    if (!id) return
    document.dispatchEvent(new CustomEvent('modal:open', { detail: { id } }))
  }

  close(e) {
    if (e) e.preventDefault()
    const id = this.element.dataset.modalTriggerTargetId || ''
    document.dispatchEvent(new CustomEvent('modal:close', { detail: { id } }))
  }
}
