# Collaborative Task Manager

A full-stack collaborative task management application built with modern technologies.

## Features

- User authentication with JWT and OTP verification
- Task management (CRUD operations)
- Real-time updates with Socket.IO
- Dashboard with task statistics
- Filtering and sorting capabilities
- Responsive UI with Tailwind CSS

## Tech Stack

### Backend
- Node.js + Express with TypeScript
- MongoDB with Mongoose ODM
- JWT for authentication
- Socket.IO for real-time communication
- Zod for validation

### Frontend
- React with TypeScript
- Tailwind CSS for styling
- React Router for navigation
- SWR for data fetching
- React Hook Form for form validation
- Socket.IO Client for real-time updates

## Project Structure

```
├── backend/
│   ├── src/
│   │   ├── config/          # Database configuration
│   │   ├── middlewares/     # Authentication middleware
│   │   ├── modules/         # Feature modules (auth, tasks, users)
│   │   ├── utils/           # Utility functions (email, JWT, OTP)
│   │   ├── app.ts           # Express app configuration
│   │   ├── server.ts        # Server entry point
│   │   └── socket.ts        # Socket.IO configuration
│   └── package.json
│
├── front-end/
│   ├── src/
│   │   ├── api/             # API service functions
│   │   ├── components/      # Reusable UI components
│   │   ├── context/         # React context providers
│   │   ├── pages/           # Page components
│   │   ├── routes/          # Routing configuration
│   │   ├── types/           # TypeScript types
│   │   ├── App.tsx          # Main App component
│   │   └── main.tsx         # Application entry point
│   └── package.json
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

### Tasks
- `GET /api/tasks` - Get all tasks for the current user
- `POST /api/tasks` - Create a new task
- `PUT /api/tasks/:id` - Update a task
- `DELETE /api/tasks/:id` - Delete a task
- `GET /api/tasks/dashboard` - Get dashboard statistics
- `GET /api/tasks/filter` - Get filtered tasks

## Setup Instructions

### Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with the following variables:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

### Frontend

1. Navigate to the frontend directory:
   ```bash
   cd front-end
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with the following variables:
   ```env
   VITE_API_BASE_URL=http://localhost:5000/api
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Real-time Features

The application uses Socket.IO for real-time communication:
- Task assignment notifications
- Live task updates
- Instant status changes

## Deployment

### Backend
Deploy to Railway or Render with the following environment variables:
- `MONGODB_URI`
- `JWT_SECRET`
- `EMAIL_USER`
- `EMAIL_PASS`

### Frontend
Deploy to Vercel with the following environment variables:
- `VITE_API_BASE_URL` (set to your deployed backend URL)

## Development Practices

- TypeScript for type safety
- SWR for data fetching and caching
- React Hook Form for form validation
- Tailwind CSS for responsive design
- Proper error handling and loading states
- Modular architecture with clear separation of concerns

## Future Enhancements

- Unit testing with Jest
- Dockerization for easier deployment
- Advanced filtering and search capabilities
- Task comments and attachments
- User profile management
- Team collaboration features