import React, { useEffect, useState } from 'react';
import axios from 'axios';

const GeoLocation = () => {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getLocation = async () => {
      try {
        if (navigator.geolocation) {
          // Get user's geolocation using the browser's API for higher accuracy
          navigator.geolocation.getCurrentPosition(async (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;

            console.log(`Geolocation - Latitude: ${lat}, Longitude: ${lng}`);

            setLocation({ lat, lng });

            // You can still use Google Geolocation API if needed to improve accuracy
            const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
            const url = `https://www.googleapis.com/geolocation/v1/geolocate?key=${apiKey}`;
            
            const response = await axios.post(url, {
              homeMobileCountryCode: 310,
              homeMobileNetworkCode: 410,
              radioType: 'gsm',
              carrier: 'Vodafone',
              considerIp: true,
            });

            console.log('Google API response:', response.data);
          });
        } else {
          setError('Geolocation is not supported by this browser.');
        }
      } catch (err) {
        setError('Error fetching location.');
        console.error('Error fetching location:', err.response ? err.response.data : err);
      }
    };

    getLocation();
  }, []);

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <h1>Your Current Location</h1>
      {location ? (
        <div>
          <p>Latitude: {location.lat}</p>
          <p>Longitude: {location.lng}</p>
          <Map lat={location.lat} lng={location.lng} />
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

// Map component to show a map with the marker
const Map = ({ lat, lng }: { lat: number, lng: number }) => {
  return (
    <div style={{ width: '100%', height: '400px' }}>
      <iframe
        width="100%"
        height="100%"
        frameBorder="0"
        style={{ border: 0 }}
        src={`https://www.google.com/maps/embed/v1/place?key=${import.meta.env.VITE_GOOGLE_API_KEY}&q=${lat},${lng}`}
        allowFullScreen
      />
    </div>
  );
};

export default GeoLocation;
