// globalAlert.js

// 3. Dynamic Logic: Configuration Object
const AppConfig = {
    developmentMode: true,
    alertMessage: "Site is currently in development. You may experience minor interruptions."
};

function injectDevAlert() {
    // Only show if the config says developmentMode is true
    if (!AppConfig.developmentMode) return;

    // 1. CSS: Fixed-position, floating style (sleek dark theme with warning yellow)
    const style = document.createElement('style');
    style.textContent = `
        .global-dev-alert {
            position: fixed;
            bottom: 24px;
            left: 50%;
            transform: translateX(-50%);
            background: #1e1e2a; /* Sleek dark theme */
            color: #ffcc00; /* Warning yellow */
            padding: 12px 24px;
            border-radius: 999px;
            font-size: 0.9rem;
            font-weight: 600;
            box-shadow: 0 10px 25px rgba(0,0,0,0.3);
            z-index: 10000;
            display: flex;
            align-items: center;
            gap: 12px;
            border: 1px solid rgba(255, 204, 0, 0.3);
            animation: slideUpAlert 0.4s ease-out;
            white-space: nowrap;
        }

        .global-dev-alert i.warning-icon {
            font-size: 1.1rem;
        }

        .global-dev-alert .close-alert {
            background: transparent;
            border: none;
            color: #a0aabf;
            margin-left: 10px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: color 0.2s ease;
            font-size: 1rem;
        }

        .global-dev-alert .close-alert:hover {
            color: #fff;
        }

        @keyframes slideUpAlert {
            from { opacity: 0; transform: translate(-50%, 20px); }
            to { opacity: 1; transform: translate(-50%, 0); }
        }

        @media (max-width: 768px) {
            .global-dev-alert {
                bottom: 80px; /* Kept higher on mobile to avoid overlapping quick-bars */
                width: 90%;
                white-space: normal;
                text-align: center;
                justify-content: space-between;
            }
        }
    `;
    document.head.appendChild(style);

    // 2. JavaScript/HTML: Inject into the DOM
    const alertDiv = document.createElement('div');
    alertDiv.className = 'global-dev-alert';
    
    // Inject the message from the AppConfig object
    alertDiv.innerHTML = `
        <i class="fas fa-exclamation-triangle warning-icon"></i>
        <span>${AppConfig.alertMessage}</span>
        <button class="close-alert" aria-label="Close alert"><i class="fas fa-times"></i></button>
    `;

    document.body.appendChild(alertDiv);

    // Close functionality
    const closeBtn = alertDiv.querySelector('.close-alert');
    closeBtn.addEventListener('click', () => {
        alertDiv.style.opacity = '0';
        alertDiv.style.transform = 'translate(-50%, 20px)';
        alertDiv.style.transition = 'all 0.3s ease';
        setTimeout(() => alertDiv.remove(), 300);
    });
}

// Inject as soon as the DOM is fully loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectDevAlert);
} else {
    injectDevAlert();
}
