/**
 * DashboardStats Component - Admin Dashboard Statistics Cards
 * Location: src/components/admin/DashboardStats.js
 * 
 * Displays key metrics in card format:
 * - Total revenue
 * - Orders count
 * - Products count
 * - Customers count
 * 
 * Includes trend indicators and loading states
 */

import { getDashboardStats } from '../../services/analyticsService.js';
import { getLowStockAlerts } from '../../services/analyticsService.js';

export class DashboardStats {
    constructor() {
        this.stats = null;
        this.loading = true;
        this.error = null;
        this.refreshInterval = null;
    }

    /**
     * Format currency
     */
    formatCurrency(amount) {
        return new Intl.NumberFormat('en-ZA', {
            style: 'currency',
            currency: 'ZAR',
            minimumFractionDigits: 0
        }).format(amount || 0);
    }

    /**
     * Format number
     */
    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }

    /**
     * Render stat card
     */
    renderCard(options) {
        const { title, value, icon, color, trend, trendValue, link, linkText } = options;
        
        const trendHtml = trend !== undefined ? `
            <div class="stat-trend ${trend >= 0 ? 'positive' : 'negative'}">
                <i class="fas fa-${trend >= 0 ? 'arrow-up' : 'arrow-down'}"></i>
                <span>${Math.abs(trendValue || trend)}%</span>
            </div>
        ` : '';

        return `
            <div class="stat-card" style="--card-color: ${color}">
                <div class="stat-icon" style="background: ${color}20; color: ${color}">
                    <i class="fas ${icon}"></i>
                </div>
                <div class="stat-content">
                    <h3 class="stat-title">${title}</h3>
                    <div class="stat-value">${value}</div>
                    ${trendHtml}
                </div>
                ${link ? `<a href="${link}" class="stat-link">${linkText || 'View all'} <i class="fas fa-arrow-right"></i></a>` : ''}
            </div>
        `;
    }

    /**
     * Render loading skeleton
     */
    renderSkeleton() {
        return `
            <div class="stats-grid">
                ${[1, 2, 3, 4].map(() => `
                    <div class="stat-card skeleton">
                        <div class="stat-icon skeleton-icon"></div>
                        <div class="stat-content">
                            <div class="skeleton-text skeleton-title"></div>
                            <div class="skeleton-text skeleton-value"></div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    /**
     * Render the stats component
     */
    async render(container) {
        // Show loading state initially
        container.innerHTML = this.renderSkeleton();

        // Fetch stats
        await this.fetchStats();

        if (this.error) {
            container.innerHTML = `
                <div class="stats-error">
                    <i class="fas fa-exclamation-circle"></i>
                    <p>Failed to load statistics</p>
                    <button onclick="this.closest('.stats-error').remove(); window.dashboardStats?.render(this.closest('.dashboard-stats'))" class="btn btn-sm">
                        <i class="fas fa-refresh"></i> Retry
                    </button>
                </div>
            `;
            return;
        }

        const { stats } = this;

        const cards = [
            {
                title: 'Total Revenue',
                value: this.formatCurrency(stats.revenue.total),
                icon: 'fa-rand-sign',  // or fa-money-bill-wave
                color: '#10b981',
                trend: 12,
                link: 'admin/analytics.html',
                linkText: 'View analytics'
            },
            {
                title: 'Total Orders',
                value: this.formatNumber(stats.orders.total),
                icon: 'fa-shopping-bag',
                color: '#3b82f6',
                trend: 8,
                link: 'admin/orders.html',
                linkText: 'View orders'
            },
            {
                title: 'Products',
                value: this.formatNumber(stats.products.total),
                icon: 'fa-box',
                color: '#8b5cf6',
                link: '../admin.html',
                linkText: 'Manage products'
            },
            {
                title: 'Customers',
                value: this.formatNumber(stats.customers.total),
                icon: 'fa-users',
                color: '#f59e0b',
                trend: 15,
                link: 'admin/customers.html',
                linkText: 'View customers'
            }
        ];

        container.innerHTML = `
            <div class="stats-grid">
                ${cards.map(card => this.renderCard(card)).join('')}
            </div>
            ${this.renderQuickStats()}
        `;

        // Store reference for retry functionality
        window.dashboardStats = this;
    }

    /**
     * Render quick stats row
     */
    renderQuickStats() {
        const { stats } = this;
        
        return `
            <div class="quick-stats">
                <div class="quick-stat-item">
                    <span class="quick-stat-label">Today's Revenue</span>
                    <span class="quick-stat-value">${this.formatCurrency(stats.revenue.today)}</span>
                </div>
                <div class="quick-stat-divider"></div>
                <div class="quick-stat-item">
                    <span class="quick-stat-label">Today's Orders</span>
                    <span class="quick-stat-value">${stats.orders.today}</span>
                </div>
                <div class="quick-stat-divider"></div>
                <div class="quick-stat-item">
                    <span class="quick-stat-label">Pending Orders</span>
                    <span class="quick-stat-value ${stats.orders.pending > 0 ? 'warning' : ''}">${stats.orders.pending}</span>
                </div>
                <div class="quick-stat-divider"></div>
                <div class="quick-stat-item">
                    <span class="quick-stat-label">Low Stock Items</span>
                    <span class="quick-stat-value ${stats.products.lowStock > 0 ? 'alert' : ''}">${stats.products.lowStock}</span>
                </div>
            </div>
        `;
    }

    /**
     * Fetch statistics
     */
    async fetchStats() {
        try {
            this.loading = true;
            const result = await getDashboardStats();
            
            if (result.success) {
                this.stats = result.stats;
                this.error = null;
            } else {
                this.error = result.error;
            }
        } catch (error) {
            console.error('[DashboardStats] Fetch error:', error);
            this.error = error.message;
        } finally {
            this.loading = false;
        }
    }

    /**
     * Start auto-refresh
     */
    startAutoRefresh(intervalMs = 60000) {
        this.stopAutoRefresh();
        this.refreshInterval = setInterval(() => {
            this.fetchStats();
        }, intervalMs);
    }

    /**
     * Stop auto-refresh
     */
    stopAutoRefresh() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
    }

    /**
     * Cleanup
     */
    destroy() {
        this.stopAutoRefresh();
    }
}

export default DashboardStats;
