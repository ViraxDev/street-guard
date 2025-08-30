import { Controller } from '@hotwired/stimulus';

export default class extends Controller {
    static values = { id: String };
    static targets = ['overlay', 'panel'];

    stopPropagation(event) {
        event.stopPropagation()
    }

    connect() {
        this.opening = false;
        this.closing = false;
        this.onExternalOpen = (e) => {
            if (e.detail && e.detail.id === this.idValue) this.open();
        }
        this.onExternalClose = (e) => {
            if (!e.detail || !e.detail.id || e.detail.id === this.idValue) this.close();
        }
        document.addEventListener('modal:open', this.onExternalOpen);
        document.addEventListener('modal:close', this.onExternalClose);
    }

    disconnect() {
        document.removeEventListener('modal:open', this.onExternalOpen);
        document.removeEventListener('modal:close', this.onExternalClose);
        document.removeEventListener('keydown', this.boundOnKeydown);
    }

    open(e) {
        if (e) e.preventDefault();
        if (this.opening) return;
        this.opening = true;

        this.element.classList.remove('hidden');

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                this.overlayTarget.classList.remove('opacity-0');
                this.overlayTarget.classList.add('opacity-100');
                this.panelTarget.classList.remove('opacity-0', 'translate-y-4', 'scale-95');
                this.panelTarget.classList.add('opacity-100', 'translate-y-0', 'scale-100');
            });
        });

        this.boundOnKeydown = this.onKeydown.bind(this);
        document.addEventListener('keydown', this.boundOnKeydown);
        this.storeFocusable();
        this.focusFirst();
        document.body.classList.add('overflow-hidden');

        // Durée augmentée pour correspondre au CSS
        setTimeout(() => {
            this.opening = false;
        }, 400);
    }

    close(e) {
        if (e) e.preventDefault();
        if (this.closing) return;
        this.closing = true;

        this.overlayTarget.classList.remove('opacity-100');
        this.overlayTarget.classList.add('opacity-0');
        this.panelTarget.classList.remove('opacity-100', 'translate-y-0', 'scale-100');
        this.panelTarget.classList.add('opacity-0', 'translate-y-4', 'scale-95');

        // Durée augmentée pour correspondre au CSS
        setTimeout(() => {
            this.element.classList.add('hidden');
            document.removeEventListener('keydown', this.boundOnKeydown);
            document.body.classList.remove('overflow-hidden');
            this.closing = false;
        }, 400);
    }

    backdrop(e) {
        if (e.target === this.overlayTarget) this.close(e);
    }

    submit(e) {
        e.preventDefault();

        const form = e.target;
        const formData = new FormData(form);

        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = 'Sending...';
        submitBtn.disabled = true;

        fetch(form.action, {
            method: 'POST',
            body: formData,
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        })
            .then(response => response.json())
            .then(data => {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;

                if (data.success) {
                    this.showFlashMessage(data.message, 'success');
                    form.reset();
                    this.close();
                } else {
                    this.showFormErrors(form, data);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                this.showFlashMessage('An error occurred. Please try again.', 'error');
            });
    }

    onKeydown(e) {
        if (e.key === 'Escape') {
            e.preventDefault();
            this.close();
        } else if (e.key === 'Tab') {
            this.trapTab(e);
        }
    }

    storeFocusable() {
        this.focusables = Array.from(this.panelTarget.querySelectorAll('a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])')).filter(el => !el.hasAttribute('disabled') && !el.getAttribute('aria-hidden'));
    }

    focusFirst() {
        if (this.focusables && this.focusables.length) this.focusables[0].focus();
        else this.panelTarget.focus({preventScroll: true});
    }

    trapTab(e) {
        if (!this.focusables || this.focusables.length === 0) return;
        const first = this.focusables[0];
        const last = this.focusables[this.focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
        }
    }

    showFlashMessage(message, type) {
        // Remove any existing flash messages
        const existingMessages = document.querySelectorAll('.flash-message');
        existingMessages.forEach(msg => {
            msg.classList.add('removing');
            setTimeout(() => msg.remove(), 400);
        });

        const flashMessage = document.createElement('div');
        const baseClasses = 'flash-message fixed top-4 right-4 px-6 py-4 rounded-lg shadow-lg z-50 flex items-center space-x-3 max-w-md';
        const typeClasses = type === 'success'
            ? 'bg-emerald-500 text-white border border-emerald-400'
            : 'bg-red-500 text-white border border-red-400';

        flashMessage.className = `${baseClasses} ${typeClasses}`;

        // Ajouter une icône
        const icon = document.createElement('div');
        icon.className = 'flex-shrink-0';
        icon.innerHTML = type === 'success'
            ? '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>'
            : '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>';

        const messageText = document.createElement('span');
        messageText.textContent = message;

        flashMessage.appendChild(icon);
        flashMessage.appendChild(messageText);

        document.body.appendChild(flashMessage);

        setTimeout(() => {
            if (flashMessage.parentElement) {
                flashMessage.classList.add('removing');
                setTimeout(() => flashMessage.remove(), 400);
            }
        }, 5000);
    }

    showFormErrors(form, errors) {
        const existingErrors = form.querySelectorAll('.form-error');
        existingErrors.forEach(error => error.remove());

        const nbErrors = errors.length;
        const errorsDiv = form.querySelector('#form-errors');
        errorsDiv.querySelector('#nb-errors').textContent = `There were ${nbErrors} error${nbErrors > 1 ? 's' : ''} with your submission:`;

        const ul = document.createElement('ul');
        ul.className = 'ml-8 space-y-1';
        ul.id = 'error-messages';

        errors.forEach(error => {
            const li = document.createElement('li');
            li.className = 'text-red-700';
            const [key, value] = Object.entries(error)[0];
            li.textContent = `• ${value}`;
            ul.appendChild(li);
        });

        errorsDiv.querySelector('#error-messages')?.remove();
        errorsDiv.appendChild(ul);
        errorsDiv.classList.remove('hidden');
        errorsDiv.classList.add('form-errors-appear');

        errorsDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}
