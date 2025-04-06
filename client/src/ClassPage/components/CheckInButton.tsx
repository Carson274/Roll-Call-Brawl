import React, { useState } from 'react';
import '../ClassPage.css'; // or a separate CheckInButton.css if you prefer

function CheckInButton() {
  const [isCheckedIn, setIsCheckedIn] = useState(false);

  const handleCheckIn = () => {
    if (!isCheckedIn) {
      setIsCheckedIn(true);
    }
  };

  return (
    <div className="checkin">
      <button
        className={isCheckedIn ? 'checked-in' : ''}
        onClick={handleCheckIn}
        disabled={isCheckedIn}
      >
        {isCheckedIn ? 'Checked In!' : 'Check In'}
      </button>
    </div>
  );
}

export default CheckInButton;
