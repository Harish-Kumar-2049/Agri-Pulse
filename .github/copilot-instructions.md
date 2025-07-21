<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

This is a full-stack e-commerce application with React frontend and Node.js backend.

## Project Context
- **Frontend**: React app in `/client` directory with components for login, register, and dashboard
- **Backend**: Express.js server in `/server` directory with MySQL database
- **Database**: MySQL with users table storing farmer and customer accounts
- **Authentication**: Simple name/password authentication with user type distinction

## Code Style Guidelines
- Use functional React components with hooks
- Use async/await for API calls
- Follow RESTful API conventions
- Use descriptive variable and function names
- Keep components modular and reusable

## Database Schema
- Users table with: id, name (unique), location, password, userType (farmer/customer)

## API Endpoints
- POST /register - User registration
- POST /login - User authentication

When suggesting new features or modifications, consider the agricultural e-commerce context and the dual user system (farmers vs customers).
