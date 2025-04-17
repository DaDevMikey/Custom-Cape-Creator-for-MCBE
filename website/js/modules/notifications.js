// Notification functionality
function showError(message) {
    showNotification(message, 'error');
}

function showSuccess(message) {
    showNotification(message, 'success');
}

/* @tweakable notification position (top-right, top-left, bottom-right, bottom-left) */
const notificationPosition = 'top-right';

function showNotification(message, type) {
    // Create and show notification
    const notification = document.createElement('div');
    notification.className = `notification ${type} ${notificationPosition}`;
    notification.innerHTML = `
        <div class="notification-icon">
            <i class="fas fa-${type === 'error' ? 'exclamation' : 'check'}-circle"></i>
        </div>
        <div class="notification-message">${message}</div>
        <div class="notification-close">×</div>
    `;
    
    document.body.appendChild(notification);
    
    // Remove after duration or on click
    setTimeout(() => {
        notification.remove();
    }, window.notificationDuration || 5000);
    
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.remove();
    });
}

// Add notification styles if not already added
function addNotificationStyles(duration = 5000) {
    window.notificationDuration = duration;
    
    if (!document.getElementById('notification-styles')) {
        const styles = document.createElement('style');
        styles.id = 'notification-styles';
        styles.textContent = `
            .notification {
                position: fixed;
                display: flex;
                align-items: center;
                padding: 15px;
                border-radius: 4px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                z-index: 1000;
                min-width: 300px;
                max-width: 500px;
                animation: slideIn 0.3s ease-out forwards;
            }
            
            .notification.top-right {
                top: 20px;
                right: 20px;
            }
            
            .notification.top-left {
                top: 20px;
                left: 20px;
            }
            
            .notification.bottom-right {
                bottom: 20px;
                right: 20px;
            }
            
            .notification.bottom-left {
                bottom: 20px;
                left: 20px;
            }
            
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            
            .notification.error {
                background-color: #fee2e2;
                border-left: 4px solid #ef4444;
                color: #991b1b;
            }
            
            .notification.success {
                background-color: #d1fae5;
                border-left: 4px solid #10b981;
                color: #065f46;
            }
            
            .notification-icon {
                margin-right: 15px;
                font-size: 1.5rem;
            }
            
            .notification-message {
                flex: 1;
            }
            
            .notification-close {
                font-size: 1.2rem;
                cursor: pointer;
                padding: 0 5px;
            }
        `;
        document.head.appendChild(styles);
    }
}

export { showError, showSuccess, addNotificationStyles };