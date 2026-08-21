/**
 * Global Alert Module
 * Fixed development alert - positioned at top, non-dismissible, full width
 */

// Configuration Object
const AppConfig = {
    developmentMode: true,
    alertMessage: "Site is currently in development. You may experience minor interruptions."
};

/**
 * Inject development alert into the DOM
 * @param {Object} options - Optional configuration override
 */
function injectDevAlert(options = {}) {
    const config = { ...AppConfig, ...options };
    
    // Only show if the config says developmentMode is true
    if (!config.developmentMode) return;

    // Check if alert already exists
    if (document.querySelector('.global-dev-alert')) return;

    // CSS: Fixed at top, full width, non-dismissible
    const style = document.createElement('style');
    style.id = 'global-alert-styles';
    style.textContent = `
        .global-dev-alert {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: auto;
            background: #1e1e2a; /* Sleek dark theme */
            color: #ffcc00; /* Warning yellow */
            padding: 12px 24px;
            font-size: 0.9rem;
            font-weight: 600;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            border-bottom: 2px solid rgba(255, 204, 0, 0.5);
            animation: slideDownAlert 0.4s ease-out;
            text-align: center;
            width: 100vw;
        }

        .global-dev-alert i.warning-icon {
            font-size: 1.1rem;
            flex-shrink: 0;
        }

        .global-dev-alert span {
            line-height: 1.4;
        }

        @keyframes slideDownAlert {
            from { 
                opacity: 0; 
                transform: translateY(-100%); 
            }
            to { 
                opacity: 1; 
                transform: translateY(0); 
            }
        }

        /* Add padding to body to prevent content from being hidden under the alert */
        body {
            padding-top: 48px !important;
        }

        @media (max-width: 768px) {
            .global-dev-alert {
                padding: 10px 16px;
                font-size: 0.85rem;
            }
            body {
                padding-top: 60px !important;
            }
        }
    `;
    document.head.appendChild(style);

    // Inject the alert into the DOM (no close button)
    const alertDiv = document.createElement('div');
    alertDiv.className = 'global-dev-alert';
    alertDiv.innerHTML = `
        <i class="fas fa-exclamation-triangle warning-icon"></i>
        <span>${config.alertMessage}</span>
    `;

    document.body.appendChild(alertDiv);
}

/**
 * Initialize the global alert
 * Auto-injects when DOM is ready
 */
function initGlobalAlert(options = {}) {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => injectDevAlert(options));
    } else {
        injectDevAlert(options);
    }
}

export { AppConfig, injectDevAlert, initGlobalAlert };
export default initGlobalAlert;
