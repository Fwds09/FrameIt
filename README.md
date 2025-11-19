# FrameIt - Image Collection & Screensaver Platform

A full-stack web application for managing image collections and creating customizable slideshows.

## Features

- User authentication with JWT tokens
- Real-time username availability checking
- Secure password hashing with bcrypt
- Protected routes for authenticated users
- Modern, responsive UI with Tailwind CSS

## Tech Stack

**Frontend:**
- React.js with TypeScript
- React Router for navigation
- Axios for API calls
- Tailwind CSS for styling
- Vite as build tool

**Backend:**
- Node.js with Express.js
- MongoDB Atlas for database
- Mongoose ODM
- JWT for authentication
- bcrypt for password hashing

## Prerequisites

Before you begin, ensure you have installed:
- Node.js (v18 or higher)
- npm or yarn
- A MongoDB Atlas account (free tier works perfectly)

## MongoDB Atlas Setup

### Step 1: Create MongoDB Atlas Account

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Sign up for a free account
3. Verify your email address

### Step 2: Create a Cluster

1. After logging in, click "Build a Database"
2. Choose the FREE "Shared" tier (M0)
3. Select your preferred cloud provider and region
4. Name your cluster (or keep the default name)
5. Click "Create Cluster" (this takes 3-5 minutes)

### Step 3: Create Database User

1. In the Security section, click "Database Access"
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Create a username and strong password (save these!)
5. For "Database User Privileges", select "Read and write to any database"
6. Click "Add User"

### Step 4: Whitelist IP Address

1. In the Security section, click "Network Access"
2. Click "Add IP Address"
3. For development, click "Allow Access from Anywhere" (0.0.0.0/0)
4. For production, add your specific IP address
5. Click "Confirm"

### Step 5: Get Connection String

1. Go to your cluster overview (Database > Clusters)
2. Click the "Connect" button on your cluster
3. Choose "Connect your application"
4. Copy the connection string (looks like: `mongodb+srv://<username>:<password>@cluster...`)
5. Replace `<username>` with your database username
6. Replace `<password>` with your database password
7. Replace `<dbname>` with `frameit` (or your preferred database name)

## Installation & Setup

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd frameit
```

### 2. Install Frontend Dependencies

```bash
npm install
```

### 3. Install Backend Dependencies

```bash
cd server
npm install
cd ..
```

### 4. Configure Environment Variables

#### Frontend Environment (.env in root directory)

The `.env` file in the root directory should contain:

```env
VITE_API_URL=http://localhost:5000/api
```

#### Backend Environment (server/.env)

Update the `server/.env` file with your MongoDB connection string:

```env
MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/frameit?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
PORT=5000
NODE_ENV=development
```

**Important:**
- Replace `your-username`, `your-password`, and `your-cluster` with your actual MongoDB Atlas credentials
- Generate a strong JWT_SECRET (you can use: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)

## Running the Application

You need to run both the frontend and backend servers.

### Option 1: Run in Separate Terminals

**Terminal 1 - Backend Server:**
```bash
npm run server
```
The backend will start on http://localhost:5000

**Terminal 2 - Frontend Server:**
```bash
npm run dev
```
The frontend will start on http://localhost:5173

### Option 2: Install and Use Concurrently (Recommended)

1. Install concurrently in the root directory:
```bash
npm install --save-dev concurrently
```

2. Add this script to your root `package.json`:
```json
"scripts": {
  "dev:all": "concurrently \"npm run dev\" \"npm run server\""
}
```

3. Run both servers with one command:
```bash
npm run dev:all
```

## Using the Application

### Sign Up
1. Navigate to http://localhost:5173
2. Click "Sign up" link
3. Enter a username and click "Check" to verify availability
4. Wait for the green checkmark confirmation
5. Enter your email and password (min. 6 characters)
6. Click "Register" (only enabled after username verification)
7. You'll be automatically redirected to the Collections page

### Login
1. Navigate to http://localhost:5173/login
2. Enter your username or email
3. Enter your password
4. Click "Login"
5. You'll be redirected to the Collections page

### Collections Page
After logging in, you'll see the main dashboard with placeholder sections for:
- Explore Images (coming soon)
- My Collections (coming soon)
- Upload Images (coming soon)

Click "Logout" in the top-right to log out.

## Security Features

- Passwords are hashed using bcrypt with 10 salt rounds
- JWT tokens expire after 7 days
- Protected routes require valid authentication
- Rate limiting on authentication endpoints (5 attempts per 15 minutes)
- Input validation on both frontend and backend
- CORS configured for security
- Helmet.js for secure HTTP headers

## API Endpoints

### Authentication

**POST** `/api/auth/signup`
- Body: `{ username, email, password }`
- Returns: `{ success, message, token, user }`

**POST** `/api/auth/login`
- Body: `{ usernameOrEmail, password }`
- Returns: `{ success, message, token, user }`

**GET** `/api/auth/check-username/:username`
- Returns: `{ success, available, message }`

**GET** `/api/health`
- Health check endpoint
- Returns: `{ success, message }`

## Project Structure

```
frameit/
├── server/                 # Backend Node.js application
│   ├── src/
│   │   ├── config/        # Database configuration
│   │   ├── models/        # Mongoose models
│   │   ├── routes/        # Express routes
│   │   ├── middleware/    # Custom middleware
│   │   ├── utils/         # Utility functions
│   │   └── server.js      # Express server entry point
│   ├── package.json
│   └── .env
├── src/                   # Frontend React application
│   ├── components/        # React components
│   ├── contexts/          # React contexts
│   ├── pages/            # Page components
│   ├── utils/            # Utility functions
│   ├── App.tsx           # Main app component
│   └── main.tsx          # Entry point
├── package.json
└── .env
```

## Troubleshooting

### Cannot connect to MongoDB
- Verify your connection string is correct
- Ensure your IP address is whitelisted in MongoDB Atlas
- Check that your database user credentials are correct
- Make sure your cluster is running (not paused)

### Username check not working
- Ensure the backend server is running
- Check the browser console for errors
- Verify the API URL in `.env` is correct

### Login/Signup fails
- Check the browser console for detailed error messages
- Verify the backend server is running
- Check MongoDB connection in the server logs
- Ensure all environment variables are set correctly

### Port already in use
- Change the PORT in `server/.env` to a different port
- Update VITE_API_URL in the frontend `.env` to match

## Future Features

- Image upload functionality
- Public image gallery
- Personal collections management
- Slideshow creation and customization
- Privacy controls for images
- Image search and filtering

## Development

### Build for Production

**Frontend:**
```bash
npm run build
```

**Backend:**
```bash
cd server
npm start
```

### Type Checking

```bash
npm run typecheck
```

### Linting

```bash
npm run lint
```

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.
