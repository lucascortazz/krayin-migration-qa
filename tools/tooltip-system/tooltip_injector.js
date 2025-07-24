/**
 * Migration Status Tooltip System
 * Shows real-time migration status as users navigate the CRM
 */

class MigrationTooltipSystem {
    constructor(options = {}) {
        this.options = {
            websocketUrl: options.websocketUrl || 'ws://localhost:8081',
            apiUrl: options.apiUrl || 'http://localhost:8080/api',
            showOnHover: options.showOnHover !== false,
            showOnClick: options.showOnClick !== false,
            autoHide: options.autoHide !== false,
            hideDelay: options.hideDelay || 5000,
            position: options.position || 'top',
            theme: options.theme || 'default'
        };
        
        this.componentStatus = new Map();
        this.activeTooltips = new Map();
        this.websocket = null;
        this.isConnected = false;
        
        this.init();
    }
    
    init() {
        this.loadComponentMappings();
        this.connectWebSocket();
        this.setupEventListeners();
        this.injectCSS();
        this.scanPageForComponents();
    }
    
    async loadComponentMappings() {
        try {
            const response = await fetch(`${this.options.apiUrl}/components`);
            const data = await response.json();
            
            data.components.forEach(component => {
                this.componentStatus.set(component.name, {
                    status: component.status,
                    priority: component.priority,
                    progress: component.progress || 0,
                    lastUpdated: component.last_updated,
                    estimatedEffort: component.estimated_effort,
                    issues: component.issues || []
                });
            });
            
            this.updateTooltips();
        } catch (error) {
            console.error('Failed to load component mappings:', error);
        }
    }
    
    connectWebSocket() {
        try {
            this.websocket = new WebSocket(this.options.websocketUrl);
            
            this.websocket.onopen = () => {
                this.isConnected = true;
                console.log('Connected to migration tracker WebSocket');
                this.showConnectionStatus('connected');
            };
            
            this.websocket.onmessage = (event) => {
                const data = JSON.parse(event.data);
                this.handleWebSocketMessage(data);
            };
            
            this.websocket.onclose = () => {
                this.isConnected = false;
                console.log('Disconnected from migration tracker WebSocket');
                this.showConnectionStatus('disconnected');
                
                // Attempt to reconnect after 5 seconds
                setTimeout(() => this.connectWebSocket(), 5000);
            };
            
            this.websocket.onerror = (error) => {
                console.error('WebSocket error:', error);
                this.showConnectionStatus('error');
            };
        } catch (error) {
            console.error('Failed to connect to WebSocket:', error);
        }
    }
    
    handleWebSocketMessage(data) {
        switch (data.type) {
            case 'component_update':
                this.updateComponentStatus(data.component, data.data);
                break;
            case 'migration_progress':
                this.updateOverallProgress(data.progress);
                break;
            case 'issue_alert':
                this.showIssueAlert(data.component, data.issue);
                break;
            default:
                console.log('Unknown WebSocket message type:', data.type);
        }
    }
    
    updateComponentStatus(componentName, statusData) {
        const currentStatus = this.componentStatus.get(componentName) || {};
        const updatedStatus = { ...currentStatus, ...statusData };
        
        this.componentStatus.set(componentName, updatedStatus);
        this.updateTooltipsForComponent(componentName);
        
        // Show notification for status changes
        if (currentStatus.status !== updatedStatus.status) {
            this.showStatusChangeNotification(componentName, updatedStatus.status);
        }
    }
    
    setupEventListeners() {
        document.addEventListener('DOMContentLoaded', () => {
            this.scanPageForComponents();
        });
        
        // Listen for page navigation (for SPAs)
        window.addEventListener('popstate', () => {
            setTimeout(() => this.scanPageForComponents(), 100);
        });
        
        // Monitor for new elements added to DOM
        if (window.MutationObserver) {
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'childList') {
                        mutation.addedNodes.forEach((node) => {
                            if (node.nodeType === Node.ELEMENT_NODE) {
                                this.scanElementForComponents(node);
                            }
                        });
                    }
                });
            });
            
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        }
    }
    
    scanPageForComponents() {
        this.scanElementForComponents(document.body);
    }
    
    scanElementForComponents(element) {
        // Component mapping selectors
        const componentSelectors = {
            'authentication': ['[data-component="auth"]', '.login-form', '.auth-container', '#login', '#register'],
            'leads': ['[data-component="leads"]', '.leads-list', '.lead-form', '.leads-container', '[href*="leads"]'],
            'contacts': ['[data-component="contacts"]', '.contacts-list', '.contact-form', '.contacts-container', '[href*="contacts"]'],
            'deals': ['[data-component="deals"]', '.deals-list', '.deal-form', '.deals-container', '[href*="deals"]'],
            'activities': ['[data-component="activities"]', '.activities-list', '.activity-form', '.activities-container', '[href*="activities"]'],
            'api_endpoints': ['[data-api-endpoint]', '.api-section', '.api-container']
        };
        
        Object.keys(componentSelectors).forEach(componentName => {
            const selectors = componentSelectors[componentName];
            
            selectors.forEach(selector => {
                const elements = element.querySelectorAll(selector);
                elements.forEach(el => {
                    if (!el.hasAttribute('data-migration-tooltip')) {
                        this.attachTooltip(el, componentName);
                    }
                });
            });
        });
    }
    
    attachTooltip(element, componentName) {
        element.setAttribute('data-migration-tooltip', componentName);
        element.setAttribute('data-component-name', componentName);
        
        if (this.options.showOnHover) {
            element.addEventListener('mouseenter', (e) => this.showTooltip(e, componentName));
            element.addEventListener('mouseleave', () => this.hideTooltip(componentName));
        }
        
        if (this.options.showOnClick) {
            element.addEventListener('click', (e) => {
                this.showTooltip(e, componentName, true);
            });
        }
        
        // Add visual indicator
        this.addVisualIndicator(element, componentName);
    }
    
    addVisualIndicator(element, componentName) {
        const status = this.componentStatus.get(componentName);
        if (!status) return;
        
        // Remove existing indicator
        const existing = element.querySelector('.migration-indicator');
        if (existing) existing.remove();
        
        const indicator = document.createElement('div');
        indicator.className = `migration-indicator migration-status-${status.status}`;
        indicator.setAttribute('data-status', status.status);
        
        // Position indicator
        element.style.position = element.style.position || 'relative';
        element.appendChild(indicator);
    }
    
    showTooltip(event, componentName, persistent = false) {
        const status = this.componentStatus.get(componentName);
        if (!status) return;
        
        // Remove existing tooltip for this component
        this.hideTooltip(componentName);
        
        const tooltip = this.createTooltipElement(componentName, status);
        document.body.appendChild(tooltip);
        
        // Position tooltip
        this.positionTooltip(tooltip, event.target);
        
        // Store reference
        this.activeTooltips.set(componentName, {
            element: tooltip,
            persistent: persistent,
            timer: null
        });
        
        // Auto-hide if not persistent
        if (!persistent && this.options.autoHide) {
            const tooltipData = this.activeTooltips.get(componentName);
            tooltipData.timer = setTimeout(() => {
                this.hideTooltip(componentName);
            }, this.options.hideDelay);
        }
        
        // Animate in
        requestAnimationFrame(() => {
            tooltip.classList.add('migration-tooltip-visible');
        });
    }
    
    createTooltipElement(componentName, status) {
        const tooltip = document.createElement('div');
        tooltip.className = `migration-tooltip migration-tooltip-${this.options.theme}`;
        
        const statusColor = this.getStatusColor(status.status);
        const progressWidth = Math.max(status.progress || 0, 5);
        
        tooltip.innerHTML = `
            <div class="migration-tooltip-header">
                <div class="migration-tooltip-title">
                    <span class="migration-component-name">${this.formatComponentName(componentName)}</span>
                    <span class="migration-status-badge migration-status-${status.status}">${status.status}</span>
                </div>
                <button class="migration-tooltip-close" onclick="migrationTooltips.hideTooltip('${componentName}')">&times;</button>
            </div>
            <div class="migration-tooltip-body">
                <div class="migration-progress-container">
                    <div class="migration-progress-bar">
                        <div class="migration-progress-fill" style="width: ${progressWidth}%; background-color: ${statusColor}"></div>
                    </div>
                    <span class="migration-progress-text">${status.progress || 0}%</span>
                </div>
                <div class="migration-details">
                    <div class="migration-detail-item">
                        <strong>Priority:</strong> 
                        <span class="migration-priority migration-priority-${status.priority}">${status.priority}</span>
                    </div>
                    ${status.estimatedEffort ? `
                        <div class="migration-detail-item">
                            <strong>Effort:</strong> ${status.estimatedEffort}
                        </div>
                    ` : ''}
                    ${status.lastUpdated ? `
                        <div class="migration-detail-item">
                            <strong>Last Updated:</strong> ${this.formatDate(status.lastUpdated)}
                        </div>
                    ` : ''}
                    ${status.issues && status.issues.length > 0 ? `
                        <div class="migration-detail-item">
                            <strong>Issues:</strong>
                            <ul class="migration-issues-list">
                                ${status.issues.map(issue => `
                                    <li class="migration-issue migration-issue-${issue.severity}">
                                        ${issue.description}
                                    </li>
                                `).join('')}
                            </ul>
                        </div>
                    ` : ''}
                </div>
                <div class="migration-actions">
                    <button class="migration-btn migration-btn-sm" onclick="migrationTooltips.viewComponentDetails('${componentName}')">
                        View Details
                    </button>
                    <button class="migration-btn migration-btn-sm migration-btn-secondary" onclick="migrationTooltips.openMigrationDashboard()">
                        Dashboard
                    </button>
                </div>
            </div>
        `;
        
        return tooltip;
    }
    
    positionTooltip(tooltip, targetElement) {
        const rect = targetElement.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();
        const viewport = {
            width: window.innerWidth,
            height: window.innerHeight
        };
        
        let top, left;
        
        switch (this.options.position) {
            case 'top':
                top = rect.top - tooltipRect.height - 10;
                left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
                break;
            case 'bottom':
                top = rect.bottom + 10;
                left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
                break;
            case 'left':
                top = rect.top + (rect.height / 2) - (tooltipRect.height / 2);
                left = rect.left - tooltipRect.width - 10;
                break;
            case 'right':
                top = rect.top + (rect.height / 2) - (tooltipRect.height / 2);
                left = rect.right + 10;
                break;
            default:
                // Auto-position based on available space
                if (rect.top > tooltipRect.height + 20) {
                    // Position above
                    top = rect.top - tooltipRect.height - 10;
                    left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
                } else {
                    // Position below
                    top = rect.bottom + 10;
                    left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
                }
        }
        
        // Ensure tooltip stays within viewport
        left = Math.max(10, Math.min(left, viewport.width - tooltipRect.width - 10));
        top = Math.max(10, Math.min(top, viewport.height - tooltipRect.height - 10));
        
        tooltip.style.position = 'fixed';
        tooltip.style.top = `${top + window.scrollY}px`;
        tooltip.style.left = `${left + window.scrollX}px`;
        tooltip.style.zIndex = '10000';
    }
    
    hideTooltip(componentName) {
        const tooltipData = this.activeTooltips.get(componentName);
        if (!tooltipData) return;
        
        if (tooltipData.timer) {
            clearTimeout(tooltipData.timer);
        }
        
        tooltipData.element.classList.add('migration-tooltip-hiding');
        
        setTimeout(() => {
            if (tooltipData.element.parentNode) {
                tooltipData.element.parentNode.removeChild(tooltipData.element);
            }
            this.activeTooltips.delete(componentName);
        }, 300);
    }
    
    updateTooltips() {
        // Update visual indicators for all components
        document.querySelectorAll('[data-migration-tooltip]').forEach(element => {
            const componentName = element.getAttribute('data-component-name');
            this.addVisualIndicator(element, componentName);
        });
        
        // Update active tooltips
        this.activeTooltips.forEach((tooltipData, componentName) => {
            const status = this.componentStatus.get(componentName);
            if (status) {
                const newTooltip = this.createTooltipElement(componentName, status);
                const oldTooltip = tooltipData.element;
                
                // Replace content
                oldTooltip.innerHTML = newTooltip.innerHTML;
            }
        });
    }
    
    updateTooltipsForComponent(componentName) {
        // Update visual indicators
        document.querySelectorAll(`[data-component-name="${componentName}"]`).forEach(element => {
            this.addVisualIndicator(element, componentName);
        });
        
        // Update active tooltip if exists
        const tooltipData = this.activeTooltips.get(componentName);
        if (tooltipData) {
            const status = this.componentStatus.get(componentName);
            if (status) {
                const newTooltip = this.createTooltipElement(componentName, status);
                tooltipData.element.innerHTML = newTooltip.innerHTML;
            }
        }
    }
    
    showStatusChangeNotification(componentName, newStatus) {
        const notification = document.createElement('div');
        notification.className = 'migration-notification migration-notification-status-change';
        notification.innerHTML = `
            <div class="migration-notification-content">
                <strong>${this.formatComponentName(componentName)}</strong> status changed to 
                <span class="migration-status-badge migration-status-${newStatus}">${newStatus}</span>
            </div>
            <button class="migration-notification-close">&times;</button>
        `;
        
        document.body.appendChild(notification);
        
        // Position notification
        notification.style.position = 'fixed';
        notification.style.top = '20px';
        notification.style.right = '20px';
        notification.style.zIndex = '10001';
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            notification.classList.add('migration-notification-hiding');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 5000);
        
        // Close button
        notification.querySelector('.migration-notification-close').addEventListener('click', () => {
            notification.classList.add('migration-notification-hiding');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        });
    }
    
    showIssueAlert(componentName, issue) {
        const alert = document.createElement('div');
        alert.className = `migration-alert migration-alert-${issue.severity}`;
        alert.innerHTML = `
            <div class="migration-alert-content">
                <strong>Migration Issue: ${this.formatComponentName(componentName)}</strong>
                <p>${issue.description}</p>
            </div>
            <button class="migration-alert-close">&times;</button>
        `;
        
        document.body.appendChild(alert);
        
        // Position alert
        alert.style.position = 'fixed';
        alert.style.top = '20px';
        alert.style.left = '50%';
        alert.style.transform = 'translateX(-50%)';
        alert.style.zIndex = '10002';
        
        // Close functionality
        alert.querySelector('.migration-alert-close').addEventListener('click', () => {
            alert.remove();
        });
        
        // Auto-hide for low severity issues
        if (issue.severity === 'low') {
            setTimeout(() => alert.remove(), 10000);
        }
    }
    
    showConnectionStatus(status) {
        const indicator = document.getElementById('migration-connection-indicator') || 
                         this.createConnectionIndicator();
        
        indicator.className = `migration-connection-indicator migration-connection-${status}`;
        indicator.textContent = status === 'connected' ? 'Live' : 
                               status === 'disconnected' ? 'Offline' : 'Error';
    }
    
    createConnectionIndicator() {
        const indicator = document.createElement('div');
        indicator.id = 'migration-connection-indicator';
        indicator.className = 'migration-connection-indicator';
        
        document.body.appendChild(indicator);
        return indicator;
    }
    
    // Utility methods
    getStatusColor(status) {
        const colors = {
            'completed': '#27ae60',
            'in_progress': '#f39c12',
            'pending': '#e74c3c',
            'testing': '#3498db'
        };
        return colors[status] || '#95a5a6';
    }
    
    formatComponentName(name) {
        return name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
    
    formatDate(dateString) {
        return new Date(dateString).toLocaleString();
    }
    
    viewComponentDetails(componentName) {
        window.open(`${this.options.apiUrl.replace('/api', '')}/component/${componentName}`, '_blank');
    }
    
    openMigrationDashboard() {
        window.open(this.options.apiUrl.replace('/api', ''), '_blank');
    }
    
    injectCSS() {
        if (document.getElementById('migration-tooltip-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'migration-tooltip-styles';
        style.textContent = `
            .migration-indicator {
                position: absolute;
                top: -5px;
                right: -5px;
                width: 12px;
                height: 12px;
                border-radius: 50%;
                border: 2px solid white;
                z-index: 1000;
                animation: migration-pulse 2s infinite;
            }
            
            .migration-status-completed { background-color: #27ae60; }
            .migration-status-in_progress { background-color: #f39c12; }
            .migration-status-pending { background-color: #e74c3c; }
            .migration-status-testing { background-color: #3498db; }
            
            @keyframes migration-pulse {
                0% { box-shadow: 0 0 0 0 rgba(52, 152, 219, 0.7); }
                70% { box-shadow: 0 0 0 10px rgba(52, 152, 219, 0); }
                100% { box-shadow: 0 0 0 0 rgba(52, 152, 219, 0); }
            }
            
            .migration-tooltip {
                position: absolute;
                background: white;
                border: 1px solid #ddd;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                padding: 0;
                max-width: 320px;
                opacity: 0;
                transform: translateY(-10px);
                transition: all 0.3s ease;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                font-size: 14px;
                z-index: 10000;
            }
            
            .migration-tooltip-visible {
                opacity: 1;
                transform: translateY(0);
            }
            
            .migration-tooltip-hiding {
                opacity: 0;
                transform: translateY(-10px);
            }
            
            .migration-tooltip-header {
                padding: 12px;
                border-bottom: 1px solid #eee;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .migration-tooltip-title {
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .migration-component-name {
                font-weight: 600;
                color: #333;
            }
            
            .migration-status-badge {
                padding: 2px 8px;
                border-radius: 12px;
                font-size: 11px;
                font-weight: 500;
                text-transform: uppercase;
                color: white;
            }
            
            .migration-tooltip-close {
                border: none;
                background: none;
                font-size: 18px;
                cursor: pointer;
                color: #999;
                padding: 0;
                width: 20px;
                height: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .migration-tooltip-body {
                padding: 12px;
            }
            
            .migration-progress-container {
                display: flex;
                align-items: center;
                gap: 8px;
                margin-bottom: 12px;
            }
            
            .migration-progress-bar {
                flex: 1;
                height: 6px;
                background: #eee;
                border-radius: 3px;
                overflow: hidden;
            }
            
            .migration-progress-fill {
                height: 100%;
                transition: width 0.3s ease;
                border-radius: 3px;
            }
            
            .migration-progress-text {
                font-size: 12px;
                font-weight: 500;
                color: #666;
                min-width: 35px;
            }
            
            .migration-details {
                margin-bottom: 12px;
            }
            
            .migration-detail-item {
                margin-bottom: 6px;
                font-size: 13px;
                color: #666;
            }
            
            .migration-priority-high { color: #e74c3c; font-weight: 600; }
            .migration-priority-medium { color: #f39c12; font-weight: 500; }
            .migration-priority-low { color: #27ae60; font-weight: 500; }
            
            .migration-issues-list {
                margin: 4px 0 0 0;
                padding-left: 16px;
                font-size: 12px;
            }
            
            .migration-issue {
                margin-bottom: 2px;
            }
            
            .migration-issue-high { color: #e74c3c; }
            .migration-issue-medium { color: #f39c12; }
            .migration-issue-low { color: #7f8c8d; }
            
            .migration-actions {
                display: flex;
                gap: 8px;
            }
            
            .migration-btn {
                padding: 6px 12px;
                border: 1px solid #3498db;
                background: #3498db;
                color: white;
                border-radius: 4px;
                font-size: 12px;
                cursor: pointer;
                text-decoration: none;
                display: inline-block;
            }
            
            .migration-btn-secondary {
                background: white;
                color: #3498db;
            }
            
            .migration-btn:hover {
                opacity: 0.9;
            }
            
            .migration-connection-indicator {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 4px 8px;
                border-radius: 12px;
                font-size: 11px;
                font-weight: 500;
                z-index: 9999;
            }
            
            .migration-connection-connected {
                background: #27ae60;
                color: white;
            }
            
            .migration-connection-disconnected {
                background: #e74c3c;
                color: white;
            }
            
            .migration-connection-error {
                background: #f39c12;
                color: white;
            }
            
            .migration-notification {
                position: fixed;
                background: white;
                border: 1px solid #ddd;
                border-radius: 6px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                padding: 12px;
                max-width: 300px;
                z-index: 10001;
                animation: slideInRight 0.3s ease;
            }
            
            .migration-notification-hiding {
                animation: slideOutRight 0.3s ease;
            }
            
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            
            @keyframes slideOutRight {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
            
            .migration-alert {
                position: fixed;
                background: white;
                border: 1px solid #ddd;
                border-left: 4px solid #e74c3c;
                border-radius: 6px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                padding: 16px;
                max-width: 400px;
                z-index: 10002;
            }
            
            .migration-alert-high { border-left-color: #e74c3c; }
            .migration-alert-medium { border-left-color: #f39c12; }
            .migration-alert-low { border-left-color: #3498db; }
        `;
        
        document.head.appendChild(style);
    }
}

// Initialize the tooltip system when DOM is ready
let migrationTooltips;

document.addEventListener('DOMContentLoaded', () => {
    migrationTooltips = new MigrationTooltipSystem({
        websocketUrl: window.location.protocol === 'https:' ? 'wss://localhost:8081' : 'ws://localhost:8081',
        apiUrl: 'http://localhost:8080/api'
    });
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MigrationTooltipSystem;
}
