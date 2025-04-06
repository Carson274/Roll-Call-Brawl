import React, { useState } from "react";
import "./NotificationBell.css";

const NotificationBell = ({ notifications = [] }: { notifications?: any[] }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleNotifications = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <div className="notification-bell-container">
      <div className="bell-icon" onClick={toggleNotifications}>
        <span className="bell">&#x1F514;</span>
        {notifications.length > 0 && (
          <span className="notification-count">{notifications.length}</span>
        )}
      </div>

      {isOpen && (
        <div className="notification-popup">
          {notifications.length > 0 ? (
            notifications.map((notification, index) => (
              <div key={index} className="notification-item">
                <p>{notification.className} - ${notification.amount}</p>
                <button onClick={() => notification.onJoin()}>Join</button>
              </div>
            ))
          ) : (
            <div className="no-notifications">No pending invites</div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
