/**
 * Password Toggle Component
 * Location: src/ui/passwordToggle.js
 * 
 * Provides show/hide password functionality with accessibility support
 */

export class PasswordToggle {
    /**
     * Create a password toggle
     * @param {string} inputId - ID of the password input element
     * @param {string} toggleId - ID of the toggle button element (optional)
     */
    constructor(inputId, toggleId = null) {
        this.input = document.getElementById(inputId);
        this.toggleBtn = toggleId ? document.getElementById(toggleId) : null;
        this.isVisible = false;
        
        if (this.input) {
            this.init();
        }
    }

    init() {
        // Create toggle button if not provided
        if (!this.toggleBtn) {
            this.toggleBtn = this.createToggleButton();
            this.input.parentNode.style.position = 'relative';
            this.input.parentNode.appendChild(this.toggleBtn);
        }

        // Bind click event
        this.toggleBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.toggle();
        });

        // Initial state
        this.updateUI();
    }

    createToggleButton() {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'password-toggle-btn';
        btn.setAttribute('aria-label', 'Toggle password visibility');
        btn.innerHTML = this.getEyeIcon();
        
        // Inline styles for immediate functionality
        btn.style.cssText = `
            position: absolute;
            right: 12px;
            top: 50%;
            transform: translateY(-50%);
            background: none;
            border: none;
            cursor: pointer;
            padding: 8px;
            color: #666;
            font-size: 18px;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        
        return btn;
    }

    getEyeIcon() {
        return this.isVisible ? this.getEyeSlashIcon() : this.getEyeOpenIcon();
    }

    getEyeOpenIcon() {
        return `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
    }

    getEyeSlashIcon() {
        return `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>`;
    }

    toggle() {
        this.isVisible = !this.isVisible;
        this.input.type = this.isVisible ? 'text' : 'password';
        this.updateUI();
    }

    updateUI() {
        this.toggleBtn.innerHTML = this.getEyeIcon();
        this.toggleBtn.setAttribute('aria-pressed', this.isVisible);
        this.toggleBtn.setAttribute('aria-label', 
            this.isVisible ? 'Hide password' : 'Show password'
        );
    }

    destroy() {
        if (this.toggleBtn && this.toggleBtn.parentNode) {
            this.toggleBtn.parentNode.removeChild(this.toggleBtn);
        }
    }
}

/**
 * Initialize password toggles for all elements with data-password-toggle attribute
 */
export function initPasswordToggles() {
    const inputs = document.querySelectorAll('[data-password-toggle]');
    inputs.forEach(input => {
        new PasswordToggle(input.id);
    });
}

export default PasswordToggle;
