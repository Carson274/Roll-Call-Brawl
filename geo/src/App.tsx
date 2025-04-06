import React from 'react';
import './App.css';
import GeoLocation from './GeoLocation'; // Import the GeoLocation component

function App() {
  return (
    <div className="App">
      {/* You can keep your existing logos and other content */}
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src="/vite.svg" className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src="/assets/react.svg" className="logo react" alt="React logo" />
        </a>
      </div>

      {/* Display the title */}
      <h1>Geolocation Integration with Vite + React</h1>

      {/* Add GeoLocation component to display user's location */}
      <GeoLocation />

      {/* You can keep your count functionality if you'd like */}
      <div className="card">
        <button onClick={() => {}}>
          Count is {/* You can maintain your count logic here if you want */}
        </button>
        <p>Edit <code>src/App.tsx</code> and save to test HMR</p>
      </div>

      <p className="read-the-docs">
        Click on the Vite and React logos to learn more.
      </p>
    </div>
  );
}

export default App;
