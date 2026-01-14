# GigFlow - Freelance Marketplace Platform

A full-stack freelance marketplace platform where clients can post jobs (gigs) and freelancers can bid on them. Built with React.js, Node.js, Express, MongoDB, and Socket.io for real-time notifications.

## Features

### Core Features
- **User Authentication**: Secure JWT-based authentication with HttpOnly cookies
- **Gig Management**: Create, browse, search, and manage job postings
- **Bidding System**: Freelancers can submit bids on gigs with custom messages and pricing
- **Hiring Logic**: Atomic hiring process with automatic rejection of other bids
- **Real-time Notifications**: Instant notifications when freelancers are hired

### Bonus Features
- **Transactional Integrity**: MongoDB transactions prevent race conditions during hiring
- **Real-time Updates**: Socket.io integration for live notifications

## Tech Stack

### Frontend
- **React.js** with Vite
- **Tailwind CSS** for styling
- **Redux Toolkit** for state management
- **React Router** for navigation
- **Axios** for API calls
- **Socket.io-client** for real-time features

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcryptjs** for password hashing
- **Socket.io** for real-time features
- **CORS** and cookie-parser middleware

## Project Structure

```
gigflow/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── gigController.js
│   │   └── bidController.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Gig.js
│   │   └── Bid.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── gigs.js
│   │   └── bids.js
│   ├── .env.example
│   └── server.js
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   ├── services/
    │   ├── store/
    │   └── utils/
    ├── package.json
    └── vite.config.js
```

## Installation

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

4. Update the `.env` file with your configuration:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/gigflow
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development
```

5. Start the backend server:
```bash
npm start
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Gigs
- `GET /api/gigs` - Get all open gigs (with search)
- `POST /api/gigs` - Create new gig (authenticated)
- `GET /api/gigs/:id` - Get gig by ID
- `PUT /api/gigs/:id` - Update gig (owner only)
- `DELETE /api/gigs/:id` - Delete gig (owner only)

### Bids
- `POST /api/bids` - Submit bid for gig (authenticated)
- `GET /api/bids/:gigId` - Get all bids for gig (owner only)
- `PATCH /api/bids/:bidId/hire` - Hire freelancer (atomic transaction)
- `GET /api/bids/my-bids` - Get current user's bids

## Database Schema

### User
```javascript
{
  name: String,
  email: String,
  password: String
}
```

### Gig
```javascript
{
  title: String,
  description: String,
  budget: Number,
  ownerId: ObjectId,
  status: String // 'open' or 'assigned'
}
```

### Bid
```javascript
{
  gigId: ObjectId,
  freelancerId: ObjectId,
  message: String,
  price: Number,
  status: String // 'pending', 'hired', 'rejected'
}
```

## Key Features Implementation

### Hiring Logic with Atomic Updates
The hiring process uses MongoDB transactions to ensure data integrity:
1. Gig status changes from 'open' to 'assigned'
2. Selected bid status changes to 'hired'
3. All other pending bids for the same gig are automatically rejected
4. Real-time notification is sent to the hired freelancer

### Real-time Notifications
- Socket.io integration for instant notifications
- Freelancers receive real-time alerts when hired
- Join user-specific rooms for targeted notifications

### Security Features
- JWT tokens stored in HttpOnly cookies
- Password hashing with bcryptjs
- CORS configuration for cross-origin requests
- Input validation and sanitization

## Usage

1. **Register/Login**: Create an account or login to access the platform
2. **Browse Gigs**: View available job postings with search functionality
3. **Post a Gig**: Create a new job posting as a client
4. **Submit Bids**: Apply for gigs as a freelancer with custom proposals
5. **Hire Freelancers**: Review bids and hire the best candidate
6. **Real-time Updates**: Receive instant notifications for hiring decisions

## Development Notes

- The backend runs on port 5000 by default
- The frontend development server runs on port 5173
- MongoDB connection string should be updated in the `.env` file
- JWT secret should be changed in production environments

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is for educational purposes as part of a full-stack development internship assignment.
