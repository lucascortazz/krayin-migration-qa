/**
 * Migration Status Tracker for Real-time Component Updates
 * This module handles real-time status updates for migration components
 */

class MigrationStatusTracker {
    constructor(options = {}) {
        this.websocketUrl = options.websocketUrl || 'ws://localhost:8081';
        this.apiUrl = options.apiUrl || 'http://localhost:8080/api';
        this.updateInterval = options.updateInterval || 30000; // 30 seconds
        
        this.componentStatuses = new Map();
        this.progressHistory = [];
        this.issueAlerts = [];
        this.websocket = null;
        this.updateTimer = null;
        
        this.callbacks = {
            onStatusChange: [],
            onProgressUpdate: [],
            onIssueDetected: [],
            onMilestoneReached: []
        };
        
        this.init();
    }
    
    init() {
        this.connectWebSocket();
        this.startPeriodicUpdates();
        this.setupPageVisibilityHandling();
    }
    
    connectWebSocket() {
        if (this.websocket) {
            this.websocket.close();
        }
        
        try {
            this.websocket = new WebSocket(this.websocketUrl);
            
            this.websocket.onopen = () => {
                console.log('Connected to migration status WebSocket');
                this.requestInitialStatus();
            };
            
            this.websocket.onmessage = (event) => {
                this.handleWebSocketMessage(JSON.parse(event.data));
            };
            
            this.websocket.onclose = () => {
                console.log('Migration status WebSocket disconnected');
                // Attempt reconnection after 5 seconds
                setTimeout(() => this.connectWebSocket(), 5000);
            };
            
            this.websocket.onerror = (error) => {
                console.error('Migration status WebSocket error:', error);
            };
        } catch (error) {
            console.error('Failed to connect to migration status WebSocket:', error);
            // Fall back to polling
            this.startPolling();
        }
    }
    
    handleWebSocketMessage(data) {
        switch (data.type) {
            case 'initial_status':
                this.updateAllComponentStatuses(data.components);
                break;
                
            case 'component_update':
                this.updateComponentStatus(data.component, data.status);
                break;
                
            case 'progress_update':
                this.updateOverallProgress(data.progress);
                break;
                
            case 'issue_alert':
                this.handleIssueAlert(data.component, data.issue);
                break;
                
            case 'milestone_reached':
                this.handleMilestoneReached(data.milestone);
                break;
                
            case 'batch_update':
                this.handleBatchUpdate(data.updates);
                break;
        }
    }
    
    requestInitialStatus() {
        if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
            this.websocket.send(JSON.stringify({
                type: 'request_status',
                timestamp: new Date().toISOString()
            }));
        }
    }
    
    updateAllComponentStatuses(components) {
        Object.keys(components).forEach(componentName => {
            const status = components[componentName];
            this.componentStatuses.set(componentName, {
                ...status,
                lastUpdated: new Date().toISOString()
            });
        });
        
        this.triggerCallbacks('onStatusChange', { type: 'batch', components });
        this.updatePageIndicators();
    }
    
    updateComponentStatus(componentName, status) {
        const previousStatus = this.componentStatuses.get(componentName);
        const newStatus = {
            ...previousStatus,
            ...status,
            lastUpdated: new Date().toISOString()
        };
        
        this.componentStatuses.set(componentName, newStatus);
        
        // Check for status changes
        if (previousStatus && previousStatus.status !== newStatus.status) {
            this.handleStatusChange(componentName, previousStatus.status, newStatus.status);
        }
        
        // Check for progress milestones
        if (previousStatus && this.isProgressMilestone(previousStatus.progress, newStatus.progress)) {
            this.handleProgressMilestone(componentName, newStatus.progress);
        }
        
        this.triggerCallbacks('onStatusChange', {
            type: 'single',
            component: componentName,
            status: newStatus,
            previousStatus
        });
        
        this.updateComponentIndicators(componentName);
    }
    
    updateOverallProgress(progressData) {
        const timestamp = new Date().toISOString();
        
        this.progressHistory.push({
            ...progressData,
            timestamp
        });
        
        // Keep only last 100 progress updates
        if (this.progressHistory.length > 100) {
            this.progressHistory = this.progressHistory.slice(-100);
        }
        
        this.triggerCallbacks('onProgressUpdate', progressData);
        this.updateOverallProgressIndicator(progressData);
    }
    
    handleIssueAlert(componentName, issue) {
        const alertData = {
            id: this.generateId(),
            component: componentName,
            issue: issue,
            timestamp: new Date().toISOString(),
            acknowledged: false
        };
        
        this.issueAlerts.unshift(alertData);
        
        // Keep only last 50 alerts
        if (this.issueAlerts.length > 50) {
            this.issueAlerts = this.issueAlerts.slice(0, 50);
        }
        
        this.triggerCallbacks('onIssueDetected', alertData);
        this.showIssueNotification(alertData);
    }
    
    handleMilestoneReached(milestone) {
        this.triggerCallbacks('onMilestoneReached', milestone);
        this.showMilestoneNotification(milestone);
    }
    
    handleBatchUpdate(updates) {
        updates.forEach(update => {
            if (update.type === 'component_status') {
                this.updateComponentStatus(update.component, update.status);
            } else if (update.type === 'progress') {
                this.updateOverallProgress(update.data);
            }
        });
    }
    
    handleStatusChange(componentName, oldStatus, newStatus) {
        const statusChangeData = {
            component: componentName,
            oldStatus,
            newStatus,
            timestamp: new Date().toISOString()
        };
        
        // Log status change
        console.log(`Component ${componentName} status changed: ${oldStatus} → ${newStatus}`);
        
        // Show notification for significant status changes
        if (this.isSignificantStatusChange(oldStatus, newStatus)) {
            this.showStatusChangeNotification(statusChangeData);
        }
    }
    
    handleProgressMilestone(componentName, progress) {
        const milestoneData = {
            component: componentName,
            progress,
            timestamp: new Date().toISOString()
        };
        
        this.triggerCallbacks('onMilestoneReached', milestoneData);
        this.showProgressMilestoneNotification(milestoneData);
    }
    
    // UI Update Methods
    updatePageIndicators() {
        // Update all component indicators on the page
        document.querySelectorAll('[data-migration-component]').forEach(element => {
            const componentName = element.getAttribute('data-migration-component');
            this.updateElementIndicator(element, componentName);
        });
    }
    
    updateComponentIndicators(componentName) {
        document.querySelectorAll(`[data-migration-component="${componentName}"]`).forEach(element => {
            this.updateElementIndicator(element, componentName);
        });
    }
    
    updateElementIndicator(element, componentName) {
        const status = this.componentStatuses.get(componentName);
        if (!status) return;
        
        // Update or create status indicator
        let indicator = element.querySelector('.migration-status-indicator');
        if (!indicator) {
            indicator = this.createStatusIndicator();
            element.appendChild(indicator);
        }
        
        // Update indicator appearance
        indicator.className = `migration-status-indicator migration-status-${status.status}`;
        indicator.setAttribute('data-progress', status.progress || 0);
        indicator.setAttribute('title', `${this.formatComponentName(componentName)}: ${status.status} (${status.progress || 0}%)`);
        
        // Update progress ring if present
        const progressRing = indicator.querySelector('.migration-progress-ring');
        if (progressRing && status.progress !== undefined) {
            this.updateProgressRing(progressRing, status.progress);
        }
    }
    
    createStatusIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'migration-status-indicator';
        indicator.innerHTML = `
            <div class="migration-progress-ring">
                <svg width="20" height="20" viewBox="0 0 20 20">
                    <circle cx="10" cy="10" r="8" fill="none" stroke="#e0e0e0" stroke-width="2"/>
                    <circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" stroke-width="2" 
                            stroke-dasharray="50.26" stroke-dashoffset="50.26" 
                            transform="rotate(-90 10 10)" class="progress-circle"/>
                </svg>
            </div>
            <div class="migration-status-pulse"></div>
        `;
        return indicator;
    }
    
    updateProgressRing(progressRing, progress) {
        const circle = progressRing.querySelector('.progress-circle');
        const circumference = 50.26; // 2 * π * 8
        const offset = circumference - (progress / 100) * circumference;
        circle.style.strokeDashoffset = offset;
    }
    
    updateOverallProgressIndicator(progressData) {
        const indicator = document.getElementById('migration-overall-progress');
        if (indicator) {
            const progressBar = indicator.querySelector('.migration-overall-progress-bar');
            const progressText = indicator.querySelector('.migration-overall-progress-text');
            
            if (progressBar) {
                progressBar.style.width = `${progressData.overall_progress}%`;
            }
            
            if (progressText) {
                progressText.textContent = `${Math.round(progressData.overall_progress)}% Complete`;
            }
        }
    }
    
    // Notification Methods
    showStatusChangeNotification(statusChangeData) {
        const notification = this.createNotification('status-change', {
            title: 'Component Status Updated',
            message: `${this.formatComponentName(statusChangeData.component)} is now ${statusChangeData.newStatus}`,
            type: this.getNotificationTypeForStatus(statusChangeData.newStatus),
            duration: 5000
        });
        
        this.displayNotification(notification);
    }
    
    showProgressMilestoneNotification(milestoneData) {
        const notification = this.createNotification('milestone', {
            title: 'Milestone Reached',
            message: `${this.formatComponentName(milestoneData.component)} reached ${milestoneData.progress}% completion`,
            type: 'success',
            duration: 3000
        });
        
        this.displayNotification(notification);
    }
    
    showIssueNotification(alertData) {
        const notification = this.createNotification('issue', {
            title: 'Migration Issue Detected',
            message: `${this.formatComponentName(alertData.component)}: ${alertData.issue.description}`,
            type: this.getNotificationTypeForSeverity(alertData.issue.severity),
            duration: alertData.issue.severity === 'high' ? 0 : 8000, // High severity stays until dismissed
            actions: [
                {
                    text: 'View Details',
                    action: () => this.viewIssueDetails(alertData.id)
                },
                {
                    text: 'Acknowledge',
                    action: () => this.acknowledgeIssue(alertData.id)
                }
            ]
        });
        
        this.displayNotification(notification);
    }
    
    showMilestoneNotification(milestone) {
        const notification = this.createNotification('milestone', {
            title: 'Migration Milestone',
            message: milestone.message,
            type: 'info',
            duration: 5000
        });
        
        this.displayNotification(notification);
    }
    
    createNotification(type, options) {
        const notification = document.createElement('div');
        notification.className = `migration-notification migration-notification-${type} migration-notification-${options.type}`;
        
        const actionsHtml = options.actions ? options.actions.map(action => 
            `<button class="migration-notification-action" data-action="${action.text}">${action.text}</button>`
        ).join('') : '';
        
        notification.innerHTML = `
            <div class="migration-notification-content">
                <div class="migration-notification-title">${options.title}</div>
                <div class="migration-notification-message">${options.message}</div>
                ${actionsHtml ? `<div class="migration-notification-actions">${actionsHtml}</div>` : ''}
            </div>
            <button class="migration-notification-close">&times;</button>
        `;
        
        // Add event listeners for actions
        if (options.actions) {
            options.actions.forEach(action => {
                const button = notification.querySelector(`[data-action="${action.text}"]`);
                if (button) {
                    button.addEventListener('click', () => {
                        action.action();
                        this.removeNotification(notification);
                    });
                }
            });
        }
        
        // Close button
        notification.querySelector('.migration-notification-close').addEventListener('click', () => {
            this.removeNotification(notification);
        });
        
        // Auto-hide timer
        if (options.duration > 0) {
            setTimeout(() => {
                this.removeNotification(notification);
            }, options.duration);
        }
        
        return notification;
    }
    
    displayNotification(notification) {
        const container = this.getNotificationContainer();
        container.appendChild(notification);
        
        // Animate in
        requestAnimationFrame(() => {
            notification.classList.add('migration-notification-visible');
        });
    }
    
    removeNotification(notification) {
        notification.classList.add('migration-notification-hiding');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }
    
    getNotificationContainer() {
        let container = document.getElementById('migration-notifications');
        if (!container) {
            container = document.createElement('div');
            container.id = 'migration-notifications';
            container.className = 'migration-notifications-container';
            document.body.appendChild(container);
        }
        return container;
    }
    
    // Utility Methods
    startPeriodicUpdates() {
        this.updateTimer = setInterval(() => {
            if (!this.websocket || this.websocket.readyState !== WebSocket.OPEN) {
                this.fetchStatusUpdate();
            }
        }, this.updateInterval);
    }
    
    startPolling() {
        this.updateTimer = setInterval(() => {
            this.fetchStatusUpdate();
        }, this.updateInterval);
    }
    
    async fetchStatusUpdate() {
        try {
            const response = await fetch(`${this.apiUrl}/status`);
            const data = await response.json();
            this.updateOverallProgress(data);
        } catch (error) {
            console.error('Failed to fetch status update:', error);
        }
    }
    
    setupPageVisibilityHandling() {
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && this.websocket && this.websocket.readyState !== WebSocket.OPEN) {
                this.connectWebSocket();
            }
        });
    }
    
    isProgressMilestone(oldProgress, newProgress) {
        const milestones = [25, 50, 75, 100];
        return milestones.some(milestone => 
            oldProgress < milestone && newProgress >= milestone
        );
    }
    
    isSignificantStatusChange(oldStatus, newStatus) {
        const significantChanges = [
            ['pending', 'in_progress'],
            ['in_progress', 'completed'],
            ['in_progress', 'testing'],
            ['testing', 'completed']
        ];
        
        return significantChanges.some(([from, to]) => 
            oldStatus === from && newStatus === to
        );
    }
    
    getNotificationTypeForStatus(status) {
        const typeMap = {
            'completed': 'success',
            'in_progress': 'info',
            'testing': 'info',
            'pending': 'warning',
            'failed': 'error'
        };
        return typeMap[status] || 'info';
    }
    
    getNotificationTypeForSeverity(severity) {
        const typeMap = {
            'low': 'info',
            'medium': 'warning',
            'high': 'error'
        };
        return typeMap[severity] || 'info';
    }
    
    formatComponentName(name) {
        return name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
    
    generateId() {
        return Math.random().toString(36).substr(2, 9);
    }
    
    // Public API Methods
    addCallback(event, callback) {
        if (this.callbacks[event]) {
            this.callbacks[event].push(callback);
        }
    }
    
    removeCallback(event, callback) {
        if (this.callbacks[event]) {
            const index = this.callbacks[event].indexOf(callback);
            if (index > -1) {
                this.callbacks[event].splice(index, 1);
            }
        }
    }
    
    triggerCallbacks(event, data) {
        if (this.callbacks[event]) {
            this.callbacks[event].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in ${event} callback:`, error);
                }
            });
        }
    }
    
    getComponentStatus(componentName) {
        return this.componentStatuses.get(componentName);
    }
    
    getAllComponentStatuses() {
        return Object.fromEntries(this.componentStatuses);
    }
    
    getProgressHistory() {
        return [...this.progressHistory];
    }
    
    getIssueAlerts() {
        return [...this.issueAlerts];
    }
    
    acknowledgeIssue(alertId) {
        const alert = this.issueAlerts.find(a => a.id === alertId);
        if (alert) {
            alert.acknowledged = true;
        }
    }
    
    viewIssueDetails(alertId) {
        const alert = this.issueAlerts.find(a => a.id === alertId);
        if (alert) {
            window.open(`${this.apiUrl.replace('/api', '')}/issues/${alertId}`, '_blank');
        }
    }
    
    destroy() {
        if (this.websocket) {
            this.websocket.close();
        }
        
        if (this.updateTimer) {
            clearInterval(this.updateTimer);
        }
        
        // Clear callbacks
        Object.keys(this.callbacks).forEach(key => {
            this.callbacks[key] = [];
        });
    }
}

// Initialize global instance
let migrationStatusTracker;

document.addEventListener('DOMContentLoaded', () => {
    migrationStatusTracker = new MigrationStatusTracker();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MigrationStatusTracker;
}
