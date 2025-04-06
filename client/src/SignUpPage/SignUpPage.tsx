import React, { useState } from 'react';
import './SignUpPage.css';

function SignUpPage() {
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');

  const handleCreateAccount = () => {
    if (username.trim() && phone.trim()) {
      alert(`Account created for ${username} with phone number ${phone}`);
      //logic to handle account creation here
    } else {
      alert('Please fill out all fields.');
    }
  };

  return (
    <div className="signup-page">
      <h1>Sign Up</h1>
      <div className="signup-form">
        <div className="input-group">
          <label htmlFor="username">Name</label>
          <input
            id="username"
            type="text"
            placeholder="Enter your name"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div className="input-group">
          <label htmlFor="phone">Phone Number</label>
          <input
            id="phone"
            type="text"
            placeholder="Enter your phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        <button className="create-account-btn" onClick={handleCreateAccount}>
          Create Account
        </button>
      </div>
    </div>
  );
}

export default SignUpPage;