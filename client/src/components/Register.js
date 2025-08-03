import React, { useState } from 'react';

const Register = ({ userType, onRegister, compact = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    password: ''
  });
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          userType
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setMessage('Registration successful! You can now login.');
        setTimeout(() => {
          onRegister();
        }, 2000);
      } else {
        setMessage(data.message || 'Registration failed');
      }
    } catch (error) {
      setMessage('Network error. Please try again.');
    }
  };

  return (
    <div className={compact ? "auth-form-compact" : "auth-container"}>
      {!compact && <h2>Register as {userType.charAt(0).toUpperCase() + userType.slice(1)}</h2>}
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label>Name (must be unique):</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Location:</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Password:</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit">Register</button>
      </form>
      {message && <p className="message">{message}</p>}
    </div>
  );
};

export default Register;
