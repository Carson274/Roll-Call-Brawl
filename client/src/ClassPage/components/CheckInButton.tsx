import React, { useState } from 'react';
import axios from 'axios';
import '../ClassPage.css';

type CheckInButtonProps = {
  isCheckedIn: boolean;
  onCheckIn: () => void;
};

function CheckInButton({ isCheckedIn, onCheckIn }: CheckInButtonProps) {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Function to handle Check-In
  const handleCheckIn = () => {
    setLoading(true);
    setErrorMessage("");  // Reset error message on each new check-in attempt

    // Use browser geolocation to get user's position
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        // Send the user's geolocation to the backend
        try {
          const response = await axios.post('/check-in', {
            latitude,
            longitude
          });

          if (response.data.success) {
            // If the check-in is successful, notify the user
            alert("You're successfully checked in!");
            onCheckIn(); // Update the parent component state (if needed)
          } else {
            // Handle error if user is outside the acceptable radius
            setErrorMessage(response.data.message || "Error during check-in.");
          }
        } catch (error) {
          console.error("Error during check-in:", error);
          setErrorMessage("Something went wrong. Please try again.");
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        setLoading(false);
        setErrorMessage("Geolocation is not available. Please try again.");
      }
    );
  };

  return (
    <div className="checkin">
      <button
        className={isCheckedIn ? 'checked-in' : ''}
        onClick={handleCheckIn}
        disabled={isCheckedIn || loading}
      >
        {loading ? "Checking In..." : isCheckedIn ? 'Checked In!' : 'Check In'}
      </button>
      {errorMessage && <div className="error-message">{errorMessage}</div>}
    </div>
  );
}

export default CheckInButton;
