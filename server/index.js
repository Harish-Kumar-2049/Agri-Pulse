require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const axios = require('axios');

const app = express();

// CORS configuration
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  optionsSuccessStatus: 200
}));

app.use(express.json());

// Add request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Create SQLite database
const dbPath = path.join(__dirname, 'agripulse.db');
const db = new sqlite3.Database(dbPath);

// Create tables if they don't exist
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    location TEXT NOT NULL,
    password TEXT NOT NULL,
    userType TEXT NOT NULL CHECK(userType IN ('farmer', 'customer'))
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    unit TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    image TEXT,
    farmer_id INTEGER NOT NULL,
    farmer_name TEXT NOT NULL,
    farmer_location TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (farmer_id) REFERENCES users(id)
  )`);
});

console.log('Connected to SQLite database');

// Test endpoint
app.get('/test', (req, res) => {
  res.json({ message: 'Server is working!' });
});

// Registration endpoint
app.post('/register', (req, res) => {
  const { name, location, password, userType } = req.body;
  if (!name || !location || !password || !userType) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  
  // Check if user already exists
  db.get('SELECT * FROM users WHERE name = ?', [name], (err, row) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    if (row) {
      return res.status(409).json({ message: 'Name already exists' });
    }
    
    // Insert new user
    db.run('INSERT INTO users (name, location, password, userType) VALUES (?, ?, ?, ?)', 
      [name, location, password, userType], function(err) {
      if (err) return res.status(500).json({ message: 'Database error' });
      res.status(201).json({ message: 'User registered successfully' });
    });
  });
});

// Login endpoint
app.post('/login', (req, res) => {
  const { name, password, userType } = req.body;
  if (!name || !password || !userType) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  
  db.get('SELECT * FROM users WHERE name = ? AND password = ? AND userType = ?', 
    [name, password, userType], (err, row) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    if (!row) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    res.status(200).json({ message: 'Login successful', user: row });
  });
});

// Add product endpoint (farmers only)
app.post('/products', (req, res) => {
  console.log('Received product data:', req.body);
  
  const { name, price, unit, description, category, image, farmer_id } = req.body;
  
  if (!name || !price || !unit || !category || !farmer_id) {
    console.log('Missing required fields:', { name, price, unit, category, farmer_id });
    return res.status(400).json({ message: 'Required fields: name, price, unit, category, farmer_id' });
  }

  // Get farmer info
  console.log('Looking up farmer with ID:', farmer_id);
  db.get('SELECT name, location FROM users WHERE id = ? AND userType = "farmer"', [farmer_id], (err, farmer) => {
    if (err) {
      console.error('Database error getting farmer:', err);
      return res.status(500).json({ message: 'Database error: ' + err.message });
    }
    if (!farmer) {
      console.log('Farmer not found with ID:', farmer_id);
      return res.status(404).json({ message: 'Farmer not found' });
    }

    console.log('Found farmer:', farmer);

    // Insert product
    console.log('Inserting product into database...');
    db.run(`INSERT INTO products (name, price, unit, description, category, image, farmer_id, farmer_name, farmer_location) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
      [name, price, unit, description || '', category, image || '', farmer_id, farmer.name, farmer.location], 
      function(err) {
        if (err) {
          console.error('Database error inserting product:', err);
          return res.status(500).json({ message: 'Database error: ' + err.message });
        }
        console.log('Product inserted successfully with ID:', this.lastID);
        res.status(201).json({ 
          message: 'Product added successfully', 
          productId: this.lastID 
        });
      });
  });
});

// Get all products endpoint
app.get('/products', (req, res) => {
  db.all('SELECT * FROM products ORDER BY created_at DESC', (err, rows) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    res.status(200).json(rows);
  });
});

// Get products by farmer endpoint
app.get('/products/farmer/:farmerId', (req, res) => {
  const { farmerId } = req.params;
  db.all('SELECT * FROM products WHERE farmer_id = ? ORDER BY created_at DESC', [farmerId], (err, rows) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    res.status(200).json(rows);
  });
});

// Delete product endpoint (farmers only)
app.delete('/products/:productId', (req, res) => {
  const { productId } = req.params;
  const { farmer_id } = req.body;

  if (!farmer_id) {
    return res.status(400).json({ message: 'Farmer ID required' });
  }

  db.run('DELETE FROM products WHERE id = ? AND farmer_id = ?', [productId, farmer_id], function(err) {
    if (err) return res.status(500).json({ message: 'Database error' });
    if (this.changes === 0) {
      return res.status(404).json({ message: 'Product not found or unauthorized' });
    }
    res.status(200).json({ message: 'Product deleted successfully' });
  });
});

// Crop disease prediction endpoint
app.post('/predict-disease', async (req, res) => {
  console.log('🔍 Disease prediction request received');
  
  try {
    const { image } = req.body;
    
    if (!image) {
      console.log('❌ No image data provided');
      return res.status(400).json({ message: 'Image data is required' });
    }

    console.log('📡 Forwarding request to ML service...');
    
    // Forward the request to ML service
    const mlResponse = await axios.post('http://localhost:5001/predict', {
      image: image
    }, {
      timeout: 30000, // 30 second timeout
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ ML service responded successfully');
    res.status(200).json(mlResponse.data);
    
  } catch (error) {
    console.error('❌ ML Service error:', error.message);
    console.error('Error details:', {
      code: error.code,
      response: error.response?.data,
      status: error.response?.status
    });
    
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({ 
        message: 'ML service is not available. Please ensure the ML service is running on port 5001.' 
      });
    }
    
    if (error.response) {
      return res.status(error.response.status).json({ 
        message: error.response.data.error || 'ML service error' 
      });
    }
    
    res.status(500).json({ 
      message: 'Error processing disease prediction: ' + error.message 
    });
  }
});

// ML service health check endpoint
app.get('/ml-health', async (req, res) => {
  try {
    const mlResponse = await axios.get('http://localhost:5001/health', {
      timeout: 5000
    });
    res.status(200).json({
      status: 'ML service is healthy',
      mlServiceData: mlResponse.data
    });
  } catch (error) {
    res.status(503).json({
      status: 'ML service is not available',
      error: error.message
    });
  }
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Server accessible at:`);
  console.log(`  - http://localhost:${PORT}`);
  console.log(`  - http://127.0.0.1:${PORT}`);
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use`);
    process.exit(1);
  } else {
    console.error('Server error:', error);
  }
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});