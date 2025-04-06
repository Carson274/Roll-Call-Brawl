import React from 'react';
import './NotificationModal.css';

interface NotificationModalProps {
  notifications: Notification[];
  onClose: () => void;
}

const NotificationModal: React.FC<NotificationModalProps> = ({ 
  notifications, 
  onClose
}) => {
  return (
    <div className="notification-modal">
      <div className="modal-overlay" onClick={onClose}></div>
      <div className="modal-content">
        <h3>Notifications</h3>
        <ul className="notification-list">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <li 
                key={notification.classId} 
              >
                <div className="notification-content">
                  <span className="notification-amount">${notification.amount}</span>
                  <span className="notification-message">{" | "}</span>
                  <span className="notification-message">
                    {notification.classId ? 
                      `New class invite: ${notification.className}` : 
                      'System notification'}
                  </span>
                </div>
              </li>
            ))
          ) : (
            <li className="no-notifications">No notifications</li>
          )}
        </ul>
        <button className="close-btn" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

export default NotificationModal;