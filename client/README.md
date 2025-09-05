# Clubs Management System - Frontend

This is the frontend application for the Clubs Management System built with React and Vite.

## Features

- **Authentication**: Student and admin login/registration
- **Events Management**: View, filter, and register for events
- **Clubs Management**: Browse and join different clubs
- **Calendar View**: See all events in calendar format
- **Responsive Design**: Works on desktop and mobile devices

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp .env.example .env
```

3. Update the API URL in `.env` if needed:
```
VITE_API_URL=http://localhost:5000
```

4. Start the development server:
```bash
npm run dev
```

## API Integration

The frontend is now properly connected to the backend API with the following features:

- **Authentication**: Login/register with JWT tokens
- **Events**: List, view details, and register for events
- **Clubs**: Browse clubs and view club details
- **Calendar**: Display events in calendar format
- **Error Handling**: Proper error messages and loading states

## Project Structure

```
src/
├── components/
│   ├── auth/           # Authentication components
│   ├── events/         # Event-related components
│   ├── clubs/          # Club-related components
│   ├── calendar/       # Calendar components
│   └── layout/         # Layout components
├── context/            # React context providers
├── pages/              # Page components
├── services/           # API service functions
└── utils/              # Utility functions
```

## Backend Connection

The frontend now properly connects to the backend with:

- Correct API endpoints matching the server routes
- Proper error handling for API responses
- JWT token management for authentication
- Loading states and error messages
- Responsive design for all screen sizes

## Development

- The app uses React 18 with modern hooks
- Styling with Tailwind CSS
- Routing with React Router v6
- State management with React Context
- API calls with native fetch API
