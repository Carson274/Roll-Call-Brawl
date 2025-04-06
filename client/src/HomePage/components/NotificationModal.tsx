import React, { useState } from 'react';
import './NotificationModal.css';

interface NotificationModalProps {
  notifications: Notification[];
  onClose: () => void;
  username: string;
  onAcceptInvite: (classId: string) => Promise<void>;
}

const NotificationModal: React.FC<NotificationModalProps> = ({ 
  notifications, 
  onClose,
  username,
  onAcceptInvite
}) => {
  const [loadingClassId, setLoadingClassId] = useState<string | null>(null);

  const handleAcceptInvite = async (classId: string) => {
    setLoadingClassId(classId);
    try {
      await onAcceptInvite(classId);
    } catch (error) {
      console.error('Error accepting invite:', error);
    } finally {
      setLoadingClassId(null);
    }
  };

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
                className={`notification-item ${notification.read ? 'read' : 'unread'}`}
              >
                <div className="notification-header">
                  <span className="notification-message">
                    {notification.classId ? 
                      `New class invite: ${notification.className}` : 
                      'System notification'}
                  </span>
                  <span className="notification-amount">${notification.amount}</span>
                </div>
                
                {notification.classId && (
                  <div className="notification-footer">
                    <button
                      className="accept-invite-btn"
                      onClick={() => handleAcceptInvite(notification.classId)}
                      disabled={loadingClassId === notification.classId}
                    >
                      {loadingClassId === notification.classId ? 'Joining...' : 'Join Class'}
                    </button>
                  </div>
                )}
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