import React, { useState } from 'react';
import './App.css';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';

function App() {
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('home');
  const [selectedUserType, setSelectedUserType] = useState(null);

  const handleLogin = (userData) => {
    setUser(userData);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentView('home');
    setSelectedUserType(null);
  };

  const handleUserTypeSelection = (userType) => {
    setSelectedUserType(userType);
    setCurrentView('register');
  };

  const handleRegistrationComplete = () => {
    setCurrentView('home');
    setSelectedUserType(null);
  };

  // Dashboard View
  if (user) {
    return <Dashboard user={user} onLogout={handleLogout} />;
  }

  // Registration View
  if (currentView === 'register' && selectedUserType) {
    return (
      <div className="App">
        <nav className="navbar">
          <div className="nav-container">
            <div className="nav-left">
              <div className="logo">
                <span className="logo-icon">🌱</span>
                <span className="logo-text">AgriPulse</span>
              </div>
            </div>
            <div className="nav-right">
              <button
                className="nav-btn"
                onClick={() => setCurrentView('home')}
              >
                ← Back to Home
              </button>
            </div>
          </div>
        </nav>

        <div className="auth-page">
          <div className="auth-container">
            <Register
              userType={selectedUserType}
              onRegister={handleRegistrationComplete}
              compact={false}
            />
          </div>
        </div>
      </div>
    );
  }

  // Login View
  if (currentView === 'login') {
    return (
      <div className="App">
        <nav className="navbar">
          <div className="nav-container">
            <div className="nav-left">
              <div className="logo">
                <span className="logo-icon">🌱</span>
                <span className="logo-text">AgriPulse</span>
              </div>
            </div>
            <div className="nav-right">
              <button
                className="nav-btn"
                onClick={() => setCurrentView('home')}
              >
                ← Back to Home
              </button>
            </div>
          </div>
        </nav>

        <div className="login-page">
          <div className="login-container">
            <div className="login-header">
              <h2 className="login-title">Welcome Back to AgriPulse</h2>
              <p className="login-subtitle">Please select your account type to continue</p>
            </div>

            <div className="login-type-cards">
              {/* Farmer Login Card */}
              <div className="login-card farmer-login-card">
                <div className="login-card-header">
                  <div className="icon-circle farmer-icon">🚜</div>
                  <h3 className="login-card-title farmer-title">Login as Farmer</h3>
                </div>
                <div className="login-form-container">
                  <Login
                    userType="farmer"
                    onLogin={handleLogin}
                    compact={true}
                  />
                </div>
              </div>

              {/* Consumer Login Card */}
              <div className="login-card consumer-login-card">
                <div className="login-card-header">
                  <div className="icon-circle consumer-icon">🛒</div>
                  <h3 className="login-card-title consumer-title">Login as Consumer</h3>
                </div>
                <div className="login-form-container">
                  <Login
                    userType="customer"
                    onLogin={handleLogin}
                    compact={true}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Home View
  return (
    <div className="App">
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-left">
            <div className="logo">
              <span className="logo-icon">🌱</span>
              <span className="logo-text">AgriPulse</span>
            </div>
          </div>
          <div className="nav-right">
            <button
              className="nav-btn login-btn"
              onClick={() => setCurrentView('login')}
            >
              🔐 Login
            </button>
            <button className="nav-btn">🌐 English ▼</button>
          </div>
        </div>
      </nav>

      <div className="hero-section">
        <div className="hero-content">
          <div className="hero-left">
            <h1 className="hero-title">
              Connecting <span className="highlight-orange">Farmers</span><br />
              and <span className="highlight-orange">Consumers</span><br />
              Directly
            </h1>
            <p className="hero-subtitle">
              AgriPulse revolutionizes agriculture by eliminating intermediaries,
              providing data-driven insights, and fostering a sustainable
              ecosystem for both producers and consumers.
            </p>
            <div className="hero-buttons">
              <button 
                className="btn-primary get-started"
                onClick={() => {
                  document.getElementById('user-selection-section').scrollIntoView({ 
                    behavior: 'smooth' 
                  });
                }}
              >
                Get Started →
              </button>
              <button className="btn-secondary learn-more">
                Learn More
              </button>
            </div>
          </div>
          
          <div className="hero-right">
            <div className="relative z-10 rounded-xl overflow-hidden shadow-2xl transform transition-transform hover:scale-[1.02]">
              <img 
                src="https://images.pexels.com/photos/1595104/pexels-photo-1595104.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
                alt="Modern tractor working in agricultural field" 
                className="w-full h-auto rounded-xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                <div className="p-6">
                  <p className="text-white font-medium text-lg">Using technology to transform agriculture</p>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-10 -right-10 bg-white text-gray-800 p-4 rounded-lg shadow-xl z-20 w-48 hidden md:block">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">Platform Stats</span>
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              </div>
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-gray-500">Farmers Onboarded</p>
                  <p className="text-lg font-bold">10,000+</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Daily Transactions</p>
                  <p className="text-lg font-bold">2,500+</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Statistics Section */}
      <div className="stats-section">
        <div className="stats-container">
          <div className="stat-box">
            <div className="stat-number">10K+</div>
            <div className="stat-label">Farmers</div>
          </div>
          <div className="stat-box">
            <div className="stat-number">50K+</div>
            <div className="stat-label">Consumers</div>
          </div>
          <div className="stat-box">
            <div className="stat-number">15+</div>
            <div className="stat-label">Markets</div>
          </div>
          <div className="stat-box">
            <div className="stat-number">95%</div>
            <div className="stat-label">Satisfaction</div>
          </div>
        </div>
      </div>

      {/* User Selection Section */}
      <div className="user-selection-section" id="user-selection-section">
        <div className="selection-container">
          <div className="welcome-header">
            <h2 className="welcome-title">Welcome to AgriPulse</h2>
            <p className="welcome-subtitle">Please select how you would like to use our platform</p>
          </div>
          
          <div className="user-type-cards">
            {/* Farmer Card */}
            <div 
              className="user-card farmer-card"
              onClick={() => {
                setSelectedUserType('farmer');
                setCurrentView('register');
              }}
            >
              <div className="card-header">
                <div className="icon-circle farmer-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="tractor-icon">
                    <path d="m10 11 11 .9c.6 0 .9.5.8 1.1l-.8 5h-1"></path>
                    <path d="M16 18h-5"></path>
                    <path d="M18 5a1 1 0 0 0-1 1v5.573"></path>
                    <path d="M3 4h9l1 7.246"></path>
                    <path d="M4 11V4"></path>
                    <path d="M7 15h.01"></path>
                    <path d="M8 10.1V4"></path>
                    <circle cx="18" cy="18" r="2"></circle>
                    <circle cx="7" cy="15" r="5"></circle>
                  </svg>
                </div>
                <h3 className="card-title farmer-title">I'm a Farmer</h3>
              </div>
              <div className="card-content">
                <ul className="feature-list">
                  <li className="feature-item">
                    <div className="check-icon farmer-check">✓</div>
                    <span>Access crop prediction tools</span>
                  </li>
                  <li className="feature-item">
                    <div className="check-icon farmer-check">✓</div>
                    <span>Monitor crop health data</span>
                  </li>
                  <li className="feature-item">
                    <div className="check-icon farmer-check">✓</div>
                    <span>Register crops for sale</span>
                  </li>
                  <li className="feature-item">
                    <div className="check-icon farmer-check">✓</div>
                    <span>Join farmer community</span>
                  </li>
                </ul>
                <button 
                  className="card-button farmer-button"
                  onClick={() => {
                    setSelectedUserType('farmer');
                    setCurrentView('register');
                  }}
                >
                  Continue as Farmer <span className="arrow">→</span>
                </button>
              </div>
            </div>

            {/* Consumer Card */}
            <div 
              className="user-card consumer-card"
              onClick={() => {
                setSelectedUserType('customer');
                setCurrentView('register');
              }}
            >
              <div className="card-header">
                <div className="icon-circle consumer-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shopping-icon">
                    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path>
                    <path d="M3 6h18"></path>
                    <path d="M16 10a4 4 0 0 1-8 0"></path>
                  </svg>
                </div>
                <h3 className="card-title consumer-title">I'm a Consumer</h3>
              </div>
              <div className="card-content">
                <ul className="feature-list">
                  <li className="feature-item">
                    <div className="check-icon consumer-check">✓</div>
                    <span>View market price predictions</span>
                  </li>
                  <li className="feature-item">
                    <div className="check-icon consumer-check">✓</div>
                    <span>Compare prices across markets</span>
                  </li>
                  <li className="feature-item">
                    <div className="check-icon consumer-check">✓</div>
                    <span>Track deliveries in real-time</span>
                  </li>
                  <li className="feature-item">
                    <div className="check-icon consumer-check">✓</div>
                    <span>Provide feedback on purchases</span>
                  </li>
                </ul>
                <button 
                  className="card-button consumer-button"
                  onClick={() => {
                    setSelectedUserType('customer');
                    setCurrentView('register');
                  }}
                >
                  Continue as Consumer <span className="arrow">→</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-column">
            <div className="footer-logo">
              <span className="logo-icon">🌱</span>
              <span className="logo-text">AgriPulse</span>
            </div>
            <p className="footer-description">
              Connecting farmers and consumers directly for a sustainable agricultural ecosystem.
            </p>
            <div className="social-icons">
              <span>📘</span>
              <span>🐦</span>
              <span>📷</span>
              <span>💼</span>
            </div>
          </div>
          
          <div className="footer-column">
            <h4>Quick Links</h4>
            <ul>
              <li><a href="#login-section">Login as Farmer</a></li>
              <li><a href="#register-section">Login as Customer</a></li>
              <li><a href="#">Our Services</a></li>
              <li><a href="#">Blog</a></li>
              <li><a href="#">FAQs</a></li>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms of Service</a></li>
            </ul>
          </div>
          
          <div className="footer-column">
            <h4>Platform</h4>
            <ul>
              <li><a href="#auth-sections">For Farmers</a></li>
              <li><a href="#auth-sections">For Consumers</a></li>
              <li><a href="#">Marketplace</a></li>
              <li><a href="#">Community</a></li>
              <li><a href="#">Resources</a></li>
            </ul>
          </div>
          
          <div className="footer-column">
            <h4>Contact Us</h4>
            <div className="contact-info">
              <p>📍 123 Agri Lane, Farmington, Green State, 54321</p>
              <p>📞 +1 (555) 123-4567</p>
              <p>✉️ contact@agripulse.com</p>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <p>© 2025 AgriPulse. All rights reserved.</p>
            <div className="footer-bottom-links">
              <a href="#">Help Center</a>
              <a href="#">Contact</a>
              <a href="#">Report an Issue</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
