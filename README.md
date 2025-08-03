# AgriPulse E-Commerce Platform

A full-stack e-commerce web application connecting farmers and customers built with React frontend and Node.js backend.

## Features

- **Dual User System**: Separate registration and login for farmers and customers
- **User Authentication**: Secure login with unique usernames
- **MySQL Database**: User data stored in SQL database
- **Responsive Design**: Mobile-friendly interface
- **Role-based Dashboards**: Different interfaces for farmers and customers

## Project Structure

```
agriPulse/
├── client/          # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   └── Dashboard.js
│   │   ├── App.js
│   │   └── App.css
│   └── package.json
├── server/          # Node.js backend
│   ├── index.js     # Express server
│   ├── schema.sql   # Database schema
│   ├── .env         # Environment variables
│   └── package.json
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js installed
- MySQL server running
- Git (optional)

### Database Setup
1. Start your MySQL server
2. Run the SQL commands in `server/schema.sql` to create the database and table:
   ```sql
   mysql -u root -p < server/schema.sql
   ```

### Backend Setup
1. Navigate to server directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables in `.env` file
4. Start the server:
   ```bash
   npm start
   ```
   Server will run on http://localhost:5000

### Frontend Setup
1. Navigate to client directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the React app:
   ```bash
   npm start
   ```
   App will run on http://localhost:3000

## API Endpoints

- `POST /register` - Register new user (farmer/customer)
- `POST /login` - Login user

## User Types

### Farmers
- Can register and login as farmers
- Access to farmer-specific dashboard
- Future features: Product management, order processing

### Customers
- Can register and login as customers
- Access to customer-specific dashboard
- Future features: Browse products, place orders

## Technologies Used

- **Frontend**: React, CSS3, Axios
- **Backend**: Node.js, Express.js
- **Database**: MySQL
- **Other**: CORS, dotenv
