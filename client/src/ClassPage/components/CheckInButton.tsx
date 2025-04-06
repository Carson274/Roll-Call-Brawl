import { useState } from 'react';
import '../ClassPage.css';

type CheckInButtonProps = {
  isCheckedIn: boolean;
  onCheckIn: () => void;
  location: [number, number];
  buttonColor: 'green' | 'yellow' | 'gray';
};

function isWithinCampusRange(
  userLat: number, 
  userLong: number, 
  buildingLat: number, 
  buildingLong: number
): boolean {
  const dx = userLat - buildingLat;
  const dy = userLong - buildingLong;
  const distanceSquared = dx*dx + dy*dy;
  
  // Threshold of 0.000001 (≈0.001° or ~100m)
  return distanceSquared < 0.000001; 
}

function CheckInButton({ isCheckedIn, onCheckIn, location }: CheckInButtonProps) {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Function to handle Check-In
  const handleCheckIn = () => {
    setLoading(true);
    setErrorMessage(""); // Reset error message on each new check-in attempt
  
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        console.log("User's location:", latitude, longitude);
  
        const isInRange = isWithinCampusRange(
          latitude,
          longitude,
          location[0],
          location[1]
        );
  
        if (!isInRange) {
          setErrorMessage("You are not within the acceptable range for check-in.");
          setLoading(false);
          return;
        }
  
        try {
          alert("You're successfully checked in!");
          onCheckIn(); // Call the callback to update parent state
        } catch (error) {
          console.error("Error during check-in:", error);
          setErrorMessage("Something went wrong. Please try again.");
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        setLoading(false);
        setErrorMessage("Geolocation is not available or permission denied.");
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
