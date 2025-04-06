import React from 'react';
import './NotificationBell.css';

interface NotificationModalProps {
  notifications: Array<object>; // Replace `object` with the actual type of your notifications
  onClose: () => void;
}

const NotificationModal: React.FC<NotificationModalProps> = ({ notifications, onClose }) => {
  return (
    <div className="notification-modal">
      <div className="modal-overlay" onClick={onClose}></div> {/* Close modal when clicking outside */}
      <div className="modal-content">
        <h3>Notifications</h3>
        <ul>
          {notifications.length > 0 ? (
            notifications.map((notification, index) => (
              <li key={index}>Notification {index + 1}</li> // Replace with actual notification content
            ))
          ) : (
            <li>No new notifications</li>
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