/**
 * AdminLayout - Admin Dashboard Layout Component
 * Location: src/layouts/AdminLayout.js
 * 
 * Provides the main layout structure for admin pages:
 * - Sidebar navigation
 * - Top header with user info
 * - Main content area
 * - Mobile-responsive design
 * 
 * Usage:
 *   import { AdminLayout } from '../layouts/AdminLayout.js';
 *   
 *   const layout = new AdminLayout();
 *   layout.render(document.body, {
 *     activePage: 'dashboard',
 *     pageTitle: 'Dashboard',
 *     content: dashboardHTML
 *   });
 */

import { useAuth, logoutUser } from '../contexts/AuthContext.js';

export class AdminLayout {
    constructor() {
        this.authUnsubscribe = null;
        this.currentUser = null;
        this.isAdmin = false;
        this.sidebarCollapsed = false;
    }

    /**
     * Initialize the layout
     */
    init() {
        // Subscribe to auth changes
        this.authUnsubscribe = useAuth((state) => {
            this.currentUser = state.currentUser;
            this.isAdmin = state.isAdmin;

            if (!state.loading && !state.isAdmin) {
                // Redirect non-admin users
                window.location.href = 'index.html';
            }
        });
    }

    /**
     * Get sidebar navigation items
     */
    getNavItems() {
        return [
            { 
                id: 'dashboard', 
                label: 'Dashboard', 
                icon: 'fa-tachometer-alt', 
                href: 'admin/dashboard.html',
                badge: null
            },
            { 
                id: 'orders', 
                label: 'Orders', 
                icon: 'fa-shopping-bag', 
                href: 'admin/orders.html',
                badge: null // Will be updated dynamically
            },
            { 
                id: 'products', 
                label: 'Products', 
                icon: 'fa-box', 
                href: '../admin.html',
                badge: null
            },
            { 
                id: 'customers', 
                label: 'Customers', 
                icon: 'fa-users', 
                href: 'admin/customers.html',
                badge: null
            },
            { 
                id: 'analytics', 
                label: 'Analytics', 
                icon: 'fa-chart-line', 
                href: 'admin/analytics.html',
                badge: null
            },
            { 
                id: 'inventory', 
                label: 'Inventory', 
                icon: 'fa-warehouse', 
                href: 'admin/inventory.html',
                badge: null
            },
            { 
                id: 'settings', 
                label: 'Settings', 
                icon: 'fa-cog', 
                href: 'admin/settings.html',
                badge: null
            }
        ];
    }

    /**
     * Render sidebar HTML
     */
    renderSidebar(activePage) {
        const navItems = this.getNavItems();
        
        return `
            <aside class="admin-sidebar" id="adminSidebar">
                <div class="sidebar-header">
                    <div class="logo">
                        <i class="fas fa-cube"></i>
                        <span>Boxed Admin</span>
                    </div>
                    <button class="sidebar-toggle" id="sidebarToggle">
                        <i class="fas fa-bars"></i>
                    </button>
                </div>
                
                <nav class="sidebar-nav">
                    ${navItems.map(item => `
                        <a href="${item.href}" 
                           class="nav-item ${item.id === activePage ? 'active' : ''}"
                           data-page="${item.id}">
                            <i class="fas ${item.icon}"></i>
                            <span>${item.label}</span>
                            ${item.badge ? `<span class="badge">${item.badge}</span>` : ''}
                        </a>
                    `).join('')}
                </nav>
                
                <div class="sidebar-footer">
                    <a href="../index.html" class="nav-item view-store">
                        <i class="fas fa-external-link-alt"></i>
                        <span>View Store</span>
                    </a>
                    <button class="nav-item logout" id="adminLogoutBtn">
                        <i class="fas fa-sign-out-alt"></i>
                        <span>Logout</span>
                    </button>
                </div>
            </aside>
        `;
    }

    /**
     * Render header HTML
     */
    renderHeader(pageTitle) {
        const userName = this.currentUser?.displayName || this.currentUser?.email?.split('@')[0] || 'Admin';
        const userEmail = this.currentUser?.email || '';
        
        return `
            <header class="admin-header">
                <div class="header-left">
                    <button class="mobile-menu-toggle" id="mobileMenuToggle">
                        <i class="fas fa-bars"></i>
                    </button>
                    <h1 class="page-title">${pageTitle}</h1>
                </div>
                
                <div class="header-right">
                    <div class="header-search">
                        <i class="fas fa-search"></i>
                        <input type="text" placeholder="Search..." id="headerSearch">
                    </div>
                    
                    <div class="header-notifications">
                        <button class="notification-btn" id="notificationBtn">
                            <i class="fas fa-bell"></i>
                            <span class="notification-badge" id="notificationBadge" style="display: none;">0</span>
                        </button>
                    </div>
                    
                    <div class="header-user">
                        <div class="user-info">
                            <span class="user-name">${userName}</span>
                            <span class="user-role">Administrator</span>
                        </div>
                        <div class="user-avatar">
                            ${this.currentUser?.photoURL 
                                ? `<img src="${this.currentUser.photoURL}" alt="${userName}">`
                                : `<i class="fas fa-user-circle"></i>`
                            }
                        </div>
                        <div class="user-dropdown" id="userDropdown">
                            <a href="admin/settings.html"><i class="fas fa-cog"></i> Settings</a>
                            <button id="headerLogoutBtn"><i class="fas fa-sign-out-alt"></i> Logout</button>
                        </div>
                    </div>
                </div>
            </header>
        `;
    }

    /**
     * Render the complete layout
     */
    render(container, options = {}) {
        const { activePage = 'dashboard', pageTitle = 'Dashboard', content = '' } = options;

        const layoutHTML = `
            <div class="admin-layout">
                ${this.renderSidebar(activePage)}
                <div class="admin-main">
                    ${this.renderHeader(pageTitle)}
                    <main class="admin-content">
                        ${content}
                    </main>
                </div>
            </div>
            <div class="sidebar-overlay" id="sidebarOverlay"></div>
        `;

        container.innerHTML = layoutHTML;
        this.attachEventListeners();
    }

    /**
     * Attach event listeners
     */
    attachEventListeners() {
        // Sidebar toggle
        const sidebarToggle = document.getElementById('sidebarToggle');
        const mobileMenuToggle = document.getElementById('mobileMenuToggle');
        const sidebar = document.getElementById('adminSidebar');
        const overlay = document.getElementById('sidebarOverlay');

        const toggleSidebar = () => {
            this.sidebarCollapsed = !this.sidebarCollapsed;
            sidebar?.classList.toggle('collapsed', this.sidebarCollapsed);
            document.body.classList.toggle('sidebar-collapsed', this.sidebarCollapsed);
        };

        const openMobileSidebar = () => {
            sidebar?.classList.add('mobile-open');
            overlay?.classList.add('active');
        };

        const closeMobileSidebar = () => {
            sidebar?.classList.remove('mobile-open');
            overlay?.classList.remove('active');
        };

        sidebarToggle?.addEventListener('click', toggleSidebar);
        mobileMenuToggle?.addEventListener('click', openMobileSidebar);
        overlay?.addEventListener('click', closeMobileSidebar);

        // User dropdown
        const userDropdown = document.getElementById('userDropdown');
        const headerUser = document.querySelector('.header-user');

        headerUser?.addEventListener('click', (e) => {
            e.stopPropagation();
            userDropdown?.classList.toggle('active');
        });

        document.addEventListener('click', () => {
            userDropdown?.classList.remove('active');
        });

        // Logout buttons
        const adminLogoutBtn = document.getElementById('adminLogoutBtn');
        const headerLogoutBtn = document.getElementById('headerLogoutBtn');

        const handleLogout = async () => {
            const result = await logoutUser();
            if (result.success) {
                window.location.href = '../pages/login.html';
            }
        };

        adminLogoutBtn?.addEventListener('click', handleLogout);
        headerLogoutBtn?.addEventListener('click', handleLogout);

        // Header search
        const headerSearch = document.getElementById('headerSearch');
        headerSearch?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const query = e.target.value.trim();
                if (query) {
                    // Dispatch custom event for search
                    window.dispatchEvent(new CustomEvent('adminSearch', { 
                        detail: { query } 
                    }));
                }
            }
        });

        // Notifications
        const notificationBtn = document.getElementById('notificationBtn');
        notificationBtn?.addEventListener('click', () => {
            window.dispatchEvent(new CustomEvent('adminNotifications'));
        });
    }

    /**
     * Update notification badge
     */
    updateNotificationBadge(count) {
        const badge = document.getElementById('notificationBadge');
        if (badge) {
            badge.textContent = count;
            badge.style.display = count > 0 ? 'flex' : 'none';
        }
    }

    /**
     * Show loading state
     */
    showLoading() {
        const content = document.querySelector('.admin-content');
        if (content) {
            content.innerHTML = `
                <div class="loading-container">
                    <div class="loading-spinner"></div>
                    <p>Loading...</p>
                </div>
            `;
        }
    }

    /**
     * Show error state
     */
    showError(message) {
        const content = document.querySelector('.admin-content');
        if (content) {
            content.innerHTML = `
                <div class="error-container">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h2>Error</h2>
                    <p>${message}</p>
                    <button onclick="location.reload()" class="btn btn-primary">Retry</button>
                </div>
            `;
        }
    }

    /**
     * Cleanup
     */
    destroy() {
        if (this.authUnsubscribe) {
            this.authUnsubscribe();
            this.authUnsubscribe = null;
        }
    }
}

export default AdminLayout;
