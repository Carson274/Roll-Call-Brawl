import React from 'react';
import '../ClassPage.css';

type CheckInButtonProps = {
  isCheckedIn: boolean;
  onCheckIn: () => void;
};

function CheckInButton({ isCheckedIn, onCheckIn }: CheckInButtonProps) {
  return (
    <div className="checkin">
      <button
        className={isCheckedIn ? 'checked-in' : ''}
        onClick={onCheckIn}
        disabled={isCheckedIn}
      >
        {isCheckedIn ? 'Checked In!' : 'Check In'}
      </button>
    </div>
  );
}

export default CheckInButton;
