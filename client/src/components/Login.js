import React, { useState } from 'react';

const Login = ({ userType, onLogin, compact = false }) => {
  const [formData, setFormData] = useState({
    name: '',
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
      const response = await fetch('http://localhost:5000/login', {
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
        setMessage('Login successful!');
        onLogin(data.user);
      } else {
        setMessage(data.message || 'Login failed');
      }
    } catch (error) {
      setMessage('Network error. Please try again.');
    }
  };

  return (
    <div className={compact ? "auth-form-compact" : "auth-container"}>
      {!compact && <h2>Login as {userType.charAt(0).toUpperCase() + userType.slice(1)}</h2>}
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label>Name:</label>
          <input
            type="text"
            name="name"
            value={formData.name}
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
        <button type="submit">Login</button>
      </form>
      {message && <p className="message">{message}</p>}
    </div>
  );
};

export default Login;
